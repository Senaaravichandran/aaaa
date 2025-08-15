#!/usr/bin/env python3
"""
Test script for the Professional Audio Denoising System
"""

import os
import sys
import requests
import time

def test_backend():
    """Test if the backend is running and responding"""
    try:
        response = requests.get('http://localhost:8000/api/status', timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running and responding")
            return True
        else:
            print(f"❌ Backend responded with status code: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend is not running: {e}")
        return False

def test_frontend():
    """Test if the frontend is running and responding"""
    try:
        response = requests.get('http://localhost:3000', timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is running and responding")
            return True
        else:
            print(f"❌ Frontend responded with status code: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Frontend is not running: {e}")
        return False

def test_directories():
    """Test if required directories exist"""
    required_dirs = ['uploads', 'processed']
    for dir_name in required_dirs:
        if os.path.exists(dir_name):
            print(f"✅ Directory '{dir_name}' exists")
        else:
            print(f"❌ Directory '{dir_name}' is missing")
            try:
                os.makedirs(dir_name)
                print(f"✅ Created directory '{dir_name}'")
            except Exception as e:
                print(f"❌ Failed to create directory '{dir_name}': {e}")

def test_dependencies():
    """Test if required Python packages are installed"""
    required_packages = [
        'flask', 'flask_cors', 'librosa', 'soundfile', 
        'pydub', 'requests', 'numpy', 'scipy'
    ]
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ Package '{package}' is installed")
        except ImportError:
            print(f"❌ Package '{package}' is missing")

def main():
    print("🔍 Testing Professional Audio Denoising System...")
    print("=" * 50)
    
    # Test directories
    print("\n📁 Testing directories...")
    test_directories()
    
    # Test dependencies
    print("\n📦 Testing dependencies...")
    test_dependencies()
    
    # Test backend
    print("\n🔧 Testing backend...")
    backend_ok = test_backend()
    
    # Test frontend
    print("\n🎨 Testing frontend...")
    frontend_ok = test_frontend()
    
    print("\n" + "=" * 50)
    if backend_ok and frontend_ok:
        print("🎉 All tests passed! The system is ready to use.")
        print("\n📋 Next steps:")
        print("1. Open http://localhost:3000 in your browser")
        print("2. Upload an audio file")
        print("3. Process it with the AI denoising system")
        print("4. Download the enhanced audio")
    else:
        print("⚠️  Some tests failed. Please check the issues above.")
        if not backend_ok:
            print("\n💡 To start the backend, run: python backend.py")
        if not frontend_ok:
            print("\n💡 To start the frontend, run: cd frontend && npm start")

if __name__ == "__main__":
    main()