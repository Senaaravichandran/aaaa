from flask import Flask
from flask_cors import CORS
import os

# Create the main Flask app
app = Flask(__name__)

# Configure CORS for the main app
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
}, supports_credentials=True)

# Configure app settings
app.config['SECRET_KEY'] = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-prod")
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB

# Import routes after app creation
from backend import *

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)