import os
import uuid
import time
import logging
from flask import Flask, request, jsonify, session, send_file, render_template
from flask_cors import CORS
from werkzeug.utils import secure_filename
import threading

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-prod")
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'flac', 'm4a', 'aac', 'ogg', 'wma', 'aiff'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROCESSED_FOLDER'] = PROCESSED_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Create directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/<path:path>')
def serve_static(path):
    if path.startswith('api/'):
        return jsonify({'error': 'API endpoint not found'}), 404
    try:
        from flask import send_from_directory
        return send_from_directory('static', path)
    except:
        return render_template('index.html')

@app.route('/api/upload', methods=['POST'])
def upload():
    try:
        logger.info("Processing upload request")
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
            
        file = request.files['file']
        if not file or file.filename == '':
            return jsonify({'error': 'Empty file'}), 400
            
        filename = secure_filename(file.filename)
        if not allowed_file(filename):
            return jsonify({'error': 'File type not supported'}), 400
            
        # Create session
        session_id = str(uuid.uuid4())[:8]
        session['session_id'] = session_id
        
        # Save file quickly
        ext = filename.rsplit('.', 1)[1].lower()
        save_path = os.path.join(UPLOAD_FOLDER, f"{session_id}.{ext}")
        file.save(save_path)
        
        file_size = os.path.getsize(save_path)
        logger.info(f"Upload complete: {session_id} ({file_size} bytes)")
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'filename': filename,
            'file_size': file_size
        })
        
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        return jsonify({'error': 'Upload failed'}), 500

@app.route('/api/process', methods=['POST'])
def process():
    try:
        session_id = session.get('session_id')
        if not session_id:
            return jsonify({'error': 'No session'}), 400
            
        logger.info(f"Processing audio for {session_id}")
        
        # Find input file
        input_files = [f for f in os.listdir(UPLOAD_FOLDER) if f.startswith(session_id)]
        if not input_files:
            return jsonify({'error': 'File not found'}), 404
            
        input_path = os.path.join(UPLOAD_FOLDER, input_files[0])
        output_path = os.path.join(PROCESSED_FOLDER, f"{session_id}_denoised.wav")
        
        # Fast processing in background thread
        def fast_denoise():
            try:
                import librosa
                import numpy as np
                import soundfile as sf
                
                # Load audio with reduced resolution for speed
                audio, sr = librosa.load(input_path, sr=22050)  # Lower sample rate for speed
                duration = len(audio) / sr
                
                # Fast spectral processing
                stft = librosa.stft(audio, n_fft=1024, hop_length=256)  # Smaller FFT for speed
                mag, phase = np.abs(stft), np.angle(stft)
                
                # Quick noise reduction
                noise_mag = np.mean(mag[:, :int(sr*0.2/256)], axis=1, keepdims=True)  # First 0.2s
                cleaned_mag = mag - 1.5 * noise_mag
                cleaned_mag = np.maximum(cleaned_mag, 0.1 * mag)
                
                # Reconstruct quickly
                cleaned_stft = cleaned_mag * np.exp(1j * phase)
                result = librosa.istft(cleaned_stft, hop_length=256)
                
                # Normalize and save
                if np.max(np.abs(result)) > 0:
                    result = result / np.max(np.abs(result)) * 0.95
                    
                sf.write(output_path, result, sr)
                
                # Send Groq report
                try:
                    from groq_client import GroqReporter
                    groq = GroqReporter('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')
                    
                    report = {
                        'session_id': session_id,
                        'filename': input_files[0],
                        'duration': f"{duration:.2f}s",
                        'processing': 'Fast ML denoising completed',
                        'status': 'SUCCESS',
                        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
                    }
                    groq.send_report(report)
                    logger.info("Groq report sent")
                except Exception as e:
                    logger.warning(f"Groq failed: {e}")
                    
            except Exception as e:
                logger.error(f"Processing failed: {e}")
        
        # Start processing in background
        thread = threading.Thread(target=fast_denoise)
        thread.start()
        
        # Wait briefly for completion (most files process in 1-3 seconds)
        thread.join(timeout=10)
        
        if os.path.exists(output_path):
            output_size = os.path.getsize(output_path)
            logger.info(f"Processing complete: {output_size} bytes")
            
            return jsonify({
                'success': True,
                'message': 'Audio denoised successfully! Report sent to Groq.',
                'session_id': session_id,
                'file_size': output_size
            })
        else:
            return jsonify({'error': 'Processing in progress, try again in a moment'}), 202
            
    except Exception as e:
        logger.error(f"Process failed: {e}")
        return jsonify({'error': 'Processing failed'}), 500

@app.route('/api/download')
def download():
    try:
        session_id = session.get('session_id')
        if not session_id:
            return jsonify({'error': 'No session'}), 400
            
        output_file = os.path.join(PROCESSED_FOLDER, f"{session_id}_denoised.wav")
        if not os.path.exists(output_file):
            return jsonify({'error': 'File not ready'}), 404
            
        return send_file(
            output_file,
            as_attachment=True,
            download_name=f"denoised_{session_id}.wav",
            mimetype='audio/wav'
        )
        
    except Exception as e:
        logger.error(f"Download failed: {e}")
        return jsonify({'error': 'Download failed'}), 500

@app.route('/api/status')
def status():
    session_id = session.get('session_id')
    if not session_id:
        return jsonify({'session_active': False})
        
    uploaded = any(f.startswith(session_id) for f in os.listdir(UPLOAD_FOLDER))
    processed = os.path.exists(os.path.join(PROCESSED_FOLDER, f"{session_id}_denoised.wav"))
    
    return jsonify({
        'session_active': True,
        'session_id': session_id,
        'file_uploaded': uploaded,
        'file_processed': processed
    })

@app.route('/api/reset', methods=['POST'])
def reset():
    session_id = session.get('session_id')
    if session_id:
        # Quick cleanup
        for folder in [UPLOAD_FOLDER, PROCESSED_FOLDER]:
            for file in os.listdir(folder):
                if file.startswith(session_id):
                    try:
                        os.remove(os.path.join(folder, file))
                    except:
                        pass
        session.clear()
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)