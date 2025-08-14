# Professional Audio Denoising System

## Overview

This is a professional-grade audio denoising system that uses machine learning techniques to remove noise from audio files. The system accepts various audio formats, processes them using advanced spectral analysis and filtering algorithms, and provides high-quality denoised output. It features a modern React frontend for user interaction and a Flask backend for audio processing, with integration to Groq Cloud for processing reports.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with modern hooks and functional components
- **Styling**: CSS modules with custom CSS variables for theming
- **UI Components**: Custom components for file upload, processing status, and API key management
- **Animations**: Framer Motion for smooth transitions and visual feedback
- **File Handling**: React Dropzone for drag-and-drop file uploads
- **State Management**: React hooks (useState, useEffect) for local state management
- **Communication**: Axios and Fetch API for backend communication with session-based authentication

### Backend Architecture
- **Framework**: Flask with CORS enabled for cross-origin requests
- **Session Management**: Flask sessions with secure session keys
- **File Processing Pipeline**:
  - Audio format conversion using PyDub
  - Spectral analysis with LibROSA
  - ML-based denoising using custom algorithms
  - Post-processing for quality enhancement
- **Audio Processing**: Chunked processing for large files with configurable parameters
- **API Design**: RESTful endpoints for upload, processing, download, and status tracking

### Audio Processing Engine
- **Preprocessing**: Automatic format conversion, mono conversion, and volume normalization
- **Denoising Algorithm**: 
  - Spectral subtraction for initial noise reduction
  - Wiener filtering for additional smoothing
  - Noise profile estimation from audio samples
  - Post-processing for quality enhancement
- **Format Support**: WAV, MP3, FLAC, M4A, AAC, OGG, WMA, AIFF
- **Performance**: Chunked processing with configurable chunk duration and sample rates

### File Management
- **Upload Storage**: Temporary storage in `uploads/` directory
- **Processed Storage**: Output files in `processed/` directory
- **Security**: Secure filename handling and file type validation
- **Size Limits**: 100MB maximum file size with proper error handling

## External Dependencies

### Core Processing Libraries
- **LibROSA**: Advanced audio analysis and feature extraction
- **PyDub**: Multi-format audio file conversion and manipulation
- **SoundFile**: High-quality audio file I/O operations
- **NumPy**: Numerical computing for audio signal processing
- **SciPy**: Scientific computing for signal processing algorithms

### Web Framework Dependencies
- **Flask**: Python web framework for backend API
- **Flask-CORS**: Cross-origin resource sharing for React integration
- **Werkzeug**: WSGI utilities and secure file handling

### Frontend Dependencies
- **React**: Modern JavaScript framework for user interface
- **React-Dropzone**: File upload component with drag-and-drop support
- **Framer-Motion**: Animation library for smooth UI transitions
- **React-Feather**: Icon library for consistent visual elements
- **Axios**: HTTP client for API communication

### External Services
- **Groq Cloud API**: Integration for processing reports and notifications
  - Uses mixtral-8x7b-32768 model for report acknowledgment
  - Requires API key configuration for external reporting
  - Optional service for enhanced workflow tracking

### Development Tools
- **Create React App**: React development environment and build tools
- **npm/Node.js**: Package management and development server
- **Python**: Backend runtime environment with pip package management