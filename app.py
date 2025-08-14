import os
import logging
from flask import Flask, request, jsonify, send_file, session, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.middleware.proxy_fix import ProxyFix
import uuid
import traceback
import subprocess
import threading
import time
from audio_processor import AudioProcessor
from ml_denoiser import MLDenoiser
from groq_client import GroqReporter

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Enable CORS for React frontend
CORS(app, supports_credentials=True)

# Configuration
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'flac', 'm4a', 'aac', 'ogg', 'wma', 'aiff'}

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROCESSED_FOLDER'] = PROCESSED_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Initialize processors
audio_processor = AudioProcessor()
ml_denoiser = MLDenoiser()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def start_react_app():
    """Start the React development server"""
    try:
        logger.info("Starting React development server...")
        # Check if frontend directory exists and has package.json
        frontend_path = os.path.join(os.getcwd(), 'frontend')
        if os.path.exists(os.path.join(frontend_path, 'package.json')):
            # Install dependencies if node_modules doesn't exist
            if not os.path.exists(os.path.join(frontend_path, 'node_modules')):
                logger.info("Installing React dependencies...")
                subprocess.run(['npm', 'install'], cwd=frontend_path, check=True)
            
            # Start React dev server
            subprocess.Popen(['npm', 'start'], cwd=frontend_path)
            logger.info("React development server started successfully")
        else:
            logger.warning("Frontend directory not found or missing package.json")
    except Exception as e:
        logger.error(f"Failed to start React app: {str(e)}")

# Serve the HTML template directly
@app.route('/')
def serve_app():
    """Serve the main application"""
    from flask import render_template
    return render_template('index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    """Serve static files or handle non-API routes"""
    # Check if it's an API route
    if path.startswith('api/'):
        return jsonify({'error': 'API endpoint not found'}), 404
    
    # Try to serve static files
    try:
        return send_from_directory('static', path)
    except:
        # For any other route, serve the main app
        from flask import render_template
        return render_template('index.html')

@app.route('/api/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file selected'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': f'Unsupported file format. Supported formats: {", ".join(ALLOWED_EXTENSIONS)}'}), 400
        
        # Generate unique session ID
        session_id = str(uuid.uuid4())
        session['session_id'] = session_id
        
        # Save uploaded file
        original_filename = file.filename or 'uploaded_file'
        filename = secure_filename(original_filename)
        file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'wav'
        unique_filename = f"{session_id}.{file_extension}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        file.save(filepath)
        
        # Get file information
        file_info = audio_processor.get_audio_info(filepath)
        
        logger.info(f"File uploaded successfully: {unique_filename}")
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'filename': filename,
            'file_info': file_info,
            'message': 'File uploaded successfully'
        })
        
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/api/process', methods=['POST'])
def process_audio():
    try:
        session_id = session.get('session_id')
        if not session_id:
            return jsonify({'error': 'No active session. Please upload a file first.'}), 400
        
        # Find uploaded file
        uploaded_files = [f for f in os.listdir(app.config['UPLOAD_FOLDER']) if f.startswith(session_id)]
        if not uploaded_files:
            return jsonify({'error': 'Uploaded file not found. Please upload again.'}), 404
        
        input_file = os.path.join(app.config['UPLOAD_FOLDER'], uploaded_files[0])
        output_file = os.path.join(app.config['PROCESSED_FOLDER'], f"{session_id}_denoised.wav")
        
        logger.info(f"Starting audio processing for session: {session_id}")
        
        # Step 1: Preprocessing
        logger.info("Step 1: Preprocessing audio...")
        processed_audio, sample_rate, duration = audio_processor.preprocess_audio(input_file)
        
        # Step 2: ML Denoising
        logger.info("Step 2: Applying ML denoising...")
        denoised_audio = ml_denoiser.denoise_audio(processed_audio)
        
        # Step 3: Save processed audio
        logger.info("Step 3: Saving processed audio...")
        audio_processor.save_audio(denoised_audio, output_file, sample_rate)
        
        logger.info(f"Audio processing completed for session: {session_id}")
        
        # Automatically send report to Groq after processing is complete
        try:
            from groq_client import GroqReporter
            
            # Set the API key in environment
            os.environ['GROQ_API_KEY'] = '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'
            
            groq_client = GroqReporter('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')
            
            # Create processing report
            report_data = {
                'session_id': session_id,
                'preprocessing': 'Completed - Audio converted to WAV, normalized, and chunked',
                'ml_inference': 'Completed - Spectral subtraction and Wiener filtering applied', 
                'postprocessing': 'Completed - Audio reconstructed and saved as high-quality WAV',
                'status': 'Success',
                'filename': uploaded_files[0],
                'duration': duration,
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
            }
            
            # Send report to Groq
            groq_response = groq_client.send_report(report_data)
            logger.info(f"Automatic report sent to Groq: {groq_response}")
            
        except Exception as e:
            logger.warning(f"Failed to send automatic report to Groq: {str(e)}")
        
        return jsonify({
            'success': True,
            'message': 'Audio processing completed successfully',
            'session_id': session_id,
            'output_info': {
                'duration': duration,
                'sample_rate': sample_rate,
                'file_size': os.path.getsize(output_file)
            }
        })
        
    except Exception as e:
        logger.error(f"Processing error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

@app.route('/api/report', methods=['POST'])
def send_groq_report():
    try:
        data = request.get_json()
        api_key = data.get('api_key')
        session_id = session.get('session_id')
        
        if not api_key:
            return jsonify({'error': 'Groq API key is required'}), 400
        
        if not session_id:
            return jsonify({'error': 'No active session found'}), 400
        
        # Initialize Groq reporter
        groq_reporter = GroqReporter(api_key)
        
        # Send processing report
        report_data = {
            'session_id': session_id,
            'preprocessing': 'Completed - Audio converted to WAV, normalized, and chunked',
            'ml_inference': 'Completed - Spectral subtraction and Wiener filtering applied',
            'postprocessing': 'Completed - Audio reconstructed and saved as high-quality WAV',
            'status': 'Success',
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        result = groq_reporter.send_report(report_data)
        
        return jsonify({
            'success': True,
            'message': 'Report sent successfully to Groq Cloud',
            'report_response': result.get('response', 'Report acknowledged')
        })
        
    except Exception as e:
        logger.error(f"Groq report error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': f'Failed to send report: {str(e)}'}), 500

@app.route('/api/download')
def download_file():
    try:
        session_id = session.get('session_id')
        if not session_id:
            return jsonify({'error': 'No active session found'}), 400
        
        output_file = os.path.join(app.config['PROCESSED_FOLDER'], f"{session_id}_denoised.wav")
        
        if not os.path.exists(output_file):
            return jsonify({'error': 'Processed file not found. Please process audio first.'}), 404
        
        return send_file(
            output_file,
            as_attachment=True,
            download_name='denoised_audio.wav',
            mimetype='audio/wav'
        )
        
    except Exception as e:
        logger.error(f"Download error: {str(e)}")
        return jsonify({'error': f'Download failed: {str(e)}'}), 500

@app.route('/api/status')
def get_status():
    try:
        session_id = session.get('session_id')
        if not session_id:
            return jsonify({'session_active': False})
        
        # Check if files exist
        uploaded_files = [f for f in os.listdir(app.config['UPLOAD_FOLDER']) if f.startswith(session_id)]
        processed_file = os.path.join(app.config['PROCESSED_FOLDER'], f"{session_id}_denoised.wav")
        
        return jsonify({
            'session_active': True,
            'session_id': session_id,
            'file_uploaded': len(uploaded_files) > 0,
            'file_processed': os.path.exists(processed_file)
        })
        
    except Exception as e:
        logger.error(f"Status check error: {str(e)}")
        return jsonify({'error': 'Status check failed'}), 500

@app.route('/api/reset', methods=['POST'])
def reset_session():
    try:
        session_id = session.get('session_id')
        if session_id:
            # Clean up files
            for folder in [app.config['UPLOAD_FOLDER'], app.config['PROCESSED_FOLDER']]:
                for file in os.listdir(folder):
                    if file.startswith(session_id):
                        try:
                            os.remove(os.path.join(folder, file))
                        except Exception as e:
                            logger.warning(f"Could not remove file {file}: {str(e)}")
        
        session.clear()
        
        return jsonify({
            'success': True,
            'message': 'Session reset successfully'
        })
        
    except Exception as e:
        logger.error(f"Reset error: {str(e)}")
        return jsonify({'error': f'Reset failed: {str(e)}'}), 500

if __name__ == '__main__':
    # Start React app in development mode
    if os.environ.get('FLASK_ENV') == 'development':
        threading.Thread(target=start_react_app, daemon=True).start()
        time.sleep(2)  # Give React time to start
    
    app.run(host='0.0.0.0', port=8000, debug=True)
