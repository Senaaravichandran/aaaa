import os
import subprocess
import threading
import time
import signal
import sys
import logging
from app import app

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def start_react_dev_server():
    """Start the React development server"""
    try:
        frontend_path = os.path.join(os.getcwd(), 'frontend')
        
        if not os.path.exists(frontend_path):
            logger.error("Frontend directory not found!")
            return None
        
        if not os.path.exists(os.path.join(frontend_path, 'package.json')):
            logger.error("package.json not found in frontend directory!")
            return None
        
        # Install dependencies if node_modules doesn't exist
        if not os.path.exists(os.path.join(frontend_path, 'node_modules')):
            logger.info("Installing React dependencies...")
            subprocess.run(['npm', 'install'], cwd=frontend_path, check=True)
        
        # Start React development server
        logger.info("Starting React development server on port 3000...")
        react_process = subprocess.Popen(
            ['npm', 'start'],
            cwd=frontend_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env={**os.environ, 'BROWSER': 'none', 'PORT': '3000'}
        )
        
        return react_process
        
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to start React server: {e}")
        return None
    except Exception as e:
        logger.error(f"Error starting React server: {str(e)}")
        return None

def start_flask_server():
    """Start the Flask backend server"""
    try:
        logger.info("Starting Flask backend server on port 8001...")
        app.run(host='0.0.0.0', port=8001, debug=False, use_reloader=False)
    except Exception as e:
        logger.error(f"Failed to start Flask server: {str(e)}")

def signal_handler(signum, frame, react_process=None):
    """Handle shutdown signals"""
    logger.info("Shutting down servers...")
    
    if react_process:
        try:
            react_process.terminate()
            react_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            react_process.kill()
        except Exception as e:
            logger.error(f"Error stopping React server: {str(e)}")
    
    sys.exit(0)

def main():
    """Main function to start both servers"""
    logger.info("Professional Audio Denoising System - Starting...")
    
    # Start React development server
    react_process = start_react_dev_server()
    
    if not react_process:
        logger.warning("React server failed to start. Only Flask backend will be available.")
        logger.info("You can manually start the React frontend by running 'npm start' in the frontend directory")
    
    # Set up signal handlers
    if react_process:
        signal.signal(signal.SIGINT, lambda s, f: signal_handler(s, f, react_process))
        signal.signal(signal.SIGTERM, lambda s, f: signal_handler(s, f, react_process))
    
    # Wait a moment for React to start
    if react_process:
        time.sleep(3)
        logger.info("✅ React frontend available at: http://localhost:3000")
    
    logger.info("✅ Flask backend available at: http://localhost:8001")
    logger.info("🎵 Professional Audio Denoising System is ready!")
    logger.info("📝 Upload audio files, process with ML denoising, and download clean results")
    
    # Start Flask server in main thread
    try:
        start_flask_server()
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None, react_process)
    except Exception as e:
        logger.error(f"Flask server error: {str(e)}")
        signal_handler(signal.SIGTERM, None, react_process)

if __name__ == '__main__':
    # Check if we have the required dependencies
    try:
        import flask_cors
        import librosa
        import soundfile
        import pydub
        import requests
    except ImportError as e:
        logger.error(f"Missing required dependency: {e}")
        logger.error("Please install the required packages and try again")
        sys.exit(1)
    
    main()
