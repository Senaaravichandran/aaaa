# AudioDenoiseAI - Professional Audio Denoising System

A cutting-edge audio processing platform that leverages advanced machine learning algorithms to deliver professional-grade noise reduction and audio enhancement capabilities.

## 🚀 Features

- **AI-Powered Processing**: Advanced neural networks and spectral algorithms for superior noise reduction
- **Universal Format Support**: Supports all major audio formats (WAV, MP3, FLAC, M4A, AAC, OGG, WMA, AIFF)
- **Real-time Processing**: Lightning-fast processing with live progress tracking
- **Professional Grade**: Enterprise-level audio processing suitable for professional studios
- **High-Quality Output**: Lossless processing with customizable output formats
- **Quality Assurance**: Built-in quality checks and validation

## 🛠️ Technology Stack

- **Frontend**: React.js with Framer Motion animations
- **Backend**: Flask (Python) with advanced ML processing
- **Audio Processing**: Librosa, SciPy, NumPy
- **AI Integration**: Groq Cloud API for intelligent reporting
- **Styling**: Modern CSS with dark theme and gradients

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd audio-denoise-ai
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 4. Start the Application
```bash
python start_app.py
```

The application will start both the backend (port 8000) and frontend (port 3000) servers automatically.

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000

## 📁 Project Structure

```
audio-denoise-ai/
├── backend.py              # Flask backend server
├── ml_denoiser.py          # ML audio processing logic
├── groq_client.py          # Groq API integration
├── start_app.py            # Application launcher
├── requirements.txt        # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── styles/         # CSS styles
│   │   └── utils/          # API utilities
│   └── package.json
├── uploads/                # Uploaded audio files
└── processed/              # Processed audio files
```

## 🎵 Usage

1. **Upload Audio**: Drag and drop or click to select an audio file (max 500MB)
2. **Process**: Click "Process Audio" to apply AI-powered noise reduction
3. **Download**: Download the enhanced audio file
4. **Reports**: Get detailed processing reports via Groq Cloud integration

## 🔧 Configuration

### Environment Variables
- `SESSION_SECRET`: Secret key for Flask sessions (optional)
- `GROQ_API_KEY`: Groq Cloud API key for intelligent reporting

### Audio Processing Settings
- Maximum file size: 500MB
- Supported formats: WAV, MP3, FLAC, M4A, AAC, OGG, WMA, AIFF
- Processing time: Typically 1-3 seconds for most files

## 🎨 UI Features

- **Modern Dark Theme**: Professional dark interface with gradient accents
- **Smooth Animations**: Framer Motion powered animations throughout
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Real-time Progress**: Live progress tracking during processing
- **Interactive Elements**: Hover effects and micro-interactions

## 🔍 API Endpoints

- `POST /api/upload` - Upload audio file
- `POST /api/process` - Process uploaded audio
- `GET /api/download` - Download processed audio
- `GET /api/status` - Check processing status
- `POST /api/reset` - Reset session

## 🛡️ Error Handling

- Comprehensive error handling for file uploads
- Validation for file types and sizes
- Graceful handling of processing failures
- User-friendly error messages

## 🚀 Performance

- Optimized audio processing algorithms
- Efficient file handling and storage
- Fast response times for all operations
- Minimal memory footprint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

## 🔮 Future Enhancements

- Batch processing capabilities
- Advanced audio visualization
- Custom processing presets
- Cloud storage integration
- Real-time collaboration features

---

**AudioDenoiseAI** - Professional audio processing powered by AI 🎵✨