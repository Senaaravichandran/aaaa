# 🎵 Professional Audio Denoising System

A cutting-edge AI-powered audio denoising application that transforms noisy audio into crystal-clear, professional-quality sound using advanced machine learning algorithms.

## ✨ Features

- **AI-Powered Processing**: Advanced neural networks and spectral analysis for superior noise reduction
- **Universal Format Support**: Supports WAV, MP3, FLAC, M4A, AAC, OGG, WMA, AIFF formats
- **Real-time Processing**: Lightning-fast processing with live progress tracking
- **Professional Grade**: Enterprise-level audio processing suitable for professional studios
- **Modern UI**: Beautiful, responsive interface with smooth animations
- **Cloud Integration**: Groq AI integration for detailed processing reports

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd audio-denoising-system
   ```

2. **Install Python dependencies**
   ```bash
   pip install flask flask-cors librosa soundfile pydub requests numpy scipy
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   python backend.py
   ```
   The backend will be available at `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

3. **Or use the combined start script**
   ```bash
   python start_app.py
   ```

## 🎯 Usage

1. **Upload Audio**: Drag and drop or click to select an audio file (max 100MB)
2. **Process**: Click "Process Audio" to start AI-powered denoising
3. **Monitor**: Watch real-time progress and processing steps
4. **Download**: Get your enhanced, noise-free audio file

## 🏗️ Architecture

### Backend (Flask)
- **File Upload**: Secure file handling with validation
- **Audio Processing**: ML-powered denoising algorithms
- **Session Management**: User session tracking
- **API Endpoints**: RESTful API for frontend communication

### Frontend (React)
- **Modern UI**: Built with React and Framer Motion
- **File Upload**: Drag-and-drop interface with progress tracking
- **Real-time Updates**: Live processing status and progress
- **Responsive Design**: Works on desktop and mobile devices

### AI Processing
- **Spectral Analysis**: Advanced frequency domain processing
- **Noise Reduction**: Adaptive filtering algorithms
- **Quality Enhancement**: Signal-to-noise ratio improvement
- **Format Conversion**: Automatic audio format handling

## 📁 Project Structure

```
audio-denoising-system/
├── backend.py              # Flask backend server
├── ml_denoiser.py          # AI audio processing engine
├── groq_client.py          # Groq AI integration
├── config.py               # Configuration settings
├── start_app.py            # Combined startup script
├── test_system.py          # System testing script
├── uploads/                # Uploaded audio files
├── processed/              # Processed audio files
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── styles/         # CSS styles
│   │   └── utils/          # API utilities
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key_here
SESSION_SECRET=your_session_secret_here
```

### Audio Processing Settings

Edit `config.py` to customize processing parameters:

```python
SAMPLE_RATE = 44100          # Audio sample rate
MAX_AUDIO_LENGTH = 600       # Maximum audio length (seconds)
MIN_AUDIO_LENGTH = 1         # Minimum audio length (seconds)
```

## 🧪 Testing

Run the system test to verify everything is working:

```bash
python test_system.py
```

This will check:
- ✅ Backend connectivity
- ✅ Frontend accessibility
- ✅ Required directories
- ✅ Python dependencies

## 🎨 UI Features

### Modern Design
- **Dark Theme**: Professional dark interface
- **Gradient Accents**: Beautiful color gradients
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive Layout**: Works on all screen sizes

### User Experience
- **Tab Navigation**: Organized workflow steps
- **Progress Tracking**: Real-time processing updates
- **File Information**: Detailed audio file stats
- **Error Handling**: Clear error messages and recovery

### Interactive Elements
- **Drag & Drop**: Intuitive file upload
- **Progress Bars**: Visual processing feedback
- **Status Indicators**: Clear processing states
- **Action Buttons**: Responsive button interactions

## 🔒 Security

- **File Validation**: Comprehensive file type and size checking
- **Session Management**: Secure user session handling
- **Error Handling**: Graceful error recovery
- **Input Sanitization**: Protection against malicious inputs

## 📊 Performance

- **Fast Processing**: Optimized algorithms for quick results
- **Memory Efficient**: Streamlined audio processing
- **Scalable Architecture**: Ready for production deployment
- **Caching**: Intelligent file caching for better performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the test script: `python test_system.py`
2. Verify all dependencies are installed
3. Ensure both backend and frontend are running
4. Check the browser console for errors
5. Review the backend logs for issues

## 🎵 Audio Formats Supported

| Format | Extension | Description |
|--------|-----------|-------------|
| WAV | .wav | Uncompressed audio |
| MP3 | .mp3 | Compressed audio |
| FLAC | .flac | Lossless compression |
| M4A | .m4a | Apple audio format |
| AAC | .aac | Advanced audio coding |
| OGG | .ogg | Open source format |
| WMA | .wma | Windows media audio |
| AIFF | .aiff | Apple audio format |

## 🔮 Future Enhancements

- [ ] Batch processing support
- [ ] Advanced audio visualization
- [ ] Custom denoising presets
- [ ] Cloud storage integration
- [ ] Mobile app development
- [ ] Real-time streaming support

---

**Made with ❤️ for professional audio processing**