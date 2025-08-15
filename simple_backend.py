#!/usr/bin/env python3
"""
Simple backend test for the Audio Denoising System
"""

from flask import Flask, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Create directories
os.makedirs('uploads', exist_ok=True)
os.makedirs('processed', exist_ok=True)

@app.route('/')
def home():
    return jsonify({'message': 'Audio Denoising Backend is running!'})

@app.route('/api/status')
def status():
    return jsonify({'session_active': False})

@app.route('/api/upload', methods=['POST'])
def upload():
    return jsonify({
        'success': True,
        'message': 'Upload endpoint working'
    })

@app.route('/api/process', methods=['POST'])
def process():
    return jsonify({
        'success': True,
        'message': 'Process endpoint working'
    })

if __name__ == '__main__':
    print("🚀 Starting simple backend test on port 8000...")
    print("📡 Backend will be available at: http://localhost:8000")
    print("🔧 API endpoints:")
    print("   - GET  /api/status")
    print("   - POST /api/upload")
    print("   - POST /api/process")
    print("⏹️  Press Ctrl+C to stop")
    
    app.run(host='0.0.0.0', port=8000, debug=True)