import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Upload, Settings, Info, Zap, Shield, Download, Play, RefreshCw, CheckCircle, AlertCircle } from 'react-feather';
import AudioUploader from './components/AudioUploader';
import ProcessingStatus from './components/ProcessingStatus';
import ApiKeyModal from './components/ApiKeyModal';
import { checkStatus } from './utils/api';
import './styles/App.css';

function App() {
  const [sessionData, setSessionData] = useState({
    sessionId: null,
    fileUploaded: false,
    fileProcessed: false,
    fileName: '',
    fileInfo: null
  });
  
  const [processingState, setProcessingState] = useState({
    isProcessing: false,
    progress: 0,
    status: '',
    message: ''
  });
  
  const [showApiModal, setShowApiModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    checkExistingSession();
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  const checkExistingSession = async () => {
    try {
      const status = await checkStatus();
      if (status.session_active) {
        setSessionData({
          sessionId: status.session_id,
          fileUploaded: status.file_uploaded,
          fileProcessed: status.file_processed,
          fileName: 'Previous session file',
          fileInfo: null
        });
        
        if (status.file_uploaded && !status.file_processed) {
          addNotification('info', 'Previous session restored. File is ready for processing.');
        } else if (status.file_processed) {
          addNotification('success', 'Previous session restored. Processed file is ready for download.');
        }
      }
    } catch (error) {
      console.log('No existing session found');
    }
  };

  const addNotification = (type, message, duration = 5000) => {
    const id = Date.now();
    const notification = { id, type, message };
    
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleFileUpload = (data) => {
    setSessionData({
      sessionId: data.session_id,
      fileUploaded: true,
      fileProcessed: false,
      fileName: data.filename,
      fileInfo: data.file_info
    });
    addNotification('success', `File uploaded successfully: ${data.filename}`);
  };

  const handleProcessingStart = () => {
    setProcessingState({
      isProcessing: true,
      progress: 0,
      status: 'starting',
      message: 'Initializing audio processing...'
    });
  };

  const handleProcessingProgress = (progress, message) => {
    setProcessingState(prev => ({
      ...prev,
      progress,
      message
    }));
  };

  const handleProcessingComplete = (data) => {
    setProcessingState({
      isProcessing: false,
      progress: 100,
      status: 'completed',
      message: 'Audio processing completed successfully!'
    });
    
    setSessionData(prev => ({
      ...prev,
      fileProcessed: true
    }));
    
    setShowApiModal(true);
    addNotification('success', 'Audio processing completed! Please provide your Groq API key to send the report.');
  };

  const handleProcessingError = (error) => {
    setProcessingState({
      isProcessing: false,
      progress: 0,
      status: 'error',
      message: error
    });
    addNotification('error', `Processing failed: ${error}`);
  };

  const handleApiKeySubmit = () => {
    setShowApiModal(false);
    addNotification('success', 'Report sent successfully to Groq Cloud!');
  };

  const handleReset = () => {
    setSessionData({
      sessionId: null,
      fileUploaded: false,
      fileProcessed: false,
      fileName: '',
      fileInfo: null
    });
    
    setProcessingState({
      isProcessing: false,
      progress: 0,
      status: '',
      message: ''
    });
    
    setShowApiModal(false);
    addNotification('info', 'Session reset. Ready for new file.');
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <motion.div 
          className="loading-content"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="loading-logo"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Music size={48} />
          </motion.div>
          <h2>AudioDenoiseAI</h2>
          <p>Professional Audio Processing</p>
          <div className="loading-spinner"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="particles"></div>
      </div>

      {/* Header */}
      <motion.header 
        className="app-header"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="header-content">
          <motion.div 
            className="logo"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="logo-icon-wrapper">
              <Music className="logo-icon" />
            </div>
            <span className="logo-text">AudioDenoiseAI</span>
          </motion.div>
          
          <nav className="nav-links">
            <motion.a 
              href="#features" 
              className="nav-link"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              Features
            </motion.a>
            <motion.a 
              href="#about" 
              className="nav-link"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              About
            </motion.a>
            <motion.button 
              className="nav-button"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Settings size={18} />
            </motion.button>
          </nav>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
        <motion.section 
          className="hero"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <motion.div
            className="hero-badge"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
          >
            <Zap size={16} />
            <span>AI-Powered</span>
          </motion.div>
          
          <h1 className="hero-title">
            Professional Audio
            <span className="gradient-text"> Denoising</span>
          </h1>
          
          <p className="hero-subtitle">
            Transform your audio with cutting-edge machine learning technology. 
            Remove noise, enhance clarity, and achieve studio-quality results in seconds.
          </p>
          
          <div className="hero-stats">
            <motion.div 
              className="stat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Noise Reduction</div>
            </motion.div>
            <motion.div 
              className="stat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <div className="stat-number">8+</div>
              <div className="stat-label">Audio Formats</div>
            </motion.div>
            <motion.div 
              className="stat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <div className="stat-number">ML</div>
              <div className="stat-label">Powered</div>
            </motion.div>
          </div>
        </motion.section>

        {/* Processing Card */}
        <motion.div 
          className="processing-card"
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
          whileHover={{ y: -5 }}
        >
          <div className="card-header">
            <h2>Audio Processing</h2>
            <p>Upload your audio file and let our AI work its magic</p>
          </div>
          
          <AudioUploader 
            onFileUpload={handleFileUpload}
            onProcessingStart={handleProcessingStart}
            onProcessingProgress={handleProcessingProgress}
            onProcessingComplete={handleProcessingComplete}
            onProcessingError={handleProcessingError}
            onReset={handleReset}
            sessionData={sessionData}
            processingState={processingState}
          />
          
          <ProcessingStatus 
            processingState={processingState}
            sessionData={sessionData}
          />
        </motion.div>

        {/* Features Section */}
        <motion.section 
          id="features" 
          className="features-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Advanced Features</h2>
            <p className="section-subtitle">
              Professional-grade audio processing powered by cutting-edge AI technology
            </p>
          </motion.div>
          
          <div className="features-grid">
            {[
              {
                icon: <Zap />,
                title: "AI-Powered Processing",
                description: "Advanced neural networks and spectral algorithms for superior noise reduction and audio enhancement.",
                color: "var(--primary)"
              },
              {
                icon: <Upload />,
                title: "Universal Format Support",
                description: "Supports all major audio formats with automatic conversion, normalization, and quality preservation.",
                color: "var(--secondary)"
              },
              {
                icon: <Play />,
                title: "Real-time Processing",
                description: "Lightning-fast processing with live progress tracking and instant results delivery.",
                color: "var(--accent)"
              },
              {
                icon: <Shield />,
                title: "Professional Grade",
                description: "Enterprise-level audio processing suitable for professional studios and broadcast applications.",
                color: "var(--success)"
              },
              {
                icon: <Download />,
                title: "High-Quality Output",
                description: "Lossless processing with customizable output formats and quality settings.",
                color: "var(--warning)"
              },
              {
                icon: <CheckCircle />,
                title: "Quality Assurance",
                description: "Built-in quality checks and validation to ensure optimal results every time.",
                color: "var(--error)"
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="feature-icon" style={{ background: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* About Section */}
        <motion.section 
          id="about" 
          className="about-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="about-content">
            <motion.div
              className="about-text"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2>About AudioDenoiseAI</h2>
              <p>
                AudioDenoiseAI is a cutting-edge audio processing platform that leverages 
                advanced machine learning algorithms to deliver professional-grade noise 
                reduction and audio enhancement capabilities.
              </p>
              <p>
                Our technology combines spectral subtraction, adaptive filtering, and 
                neural network processing to achieve unprecedented levels of audio clarity 
                while preserving the original quality and character of your recordings.
              </p>
              <div className="tech-stack">
                <span className="tech-tag">Machine Learning</span>
                <span className="tech-tag">Spectral Processing</span>
                <span className="tech-tag">Neural Networks</span>
                <span className="tech-tag">Real-time Processing</span>
              </div>
            </motion.div>
            
            <motion.div
              className="about-visual"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="visual-element">
                <div className="waveform">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="wave-bar"
                      animate={{
                        height: [20, 60, 20],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer 
        className="app-footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="footer-content">
          <div className="footer-section">
            <h3>AudioDenoiseAI</h3>
            <p>Professional audio processing powered by AI</p>
          </div>
          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li>Noise Reduction</li>
              <li>Audio Enhancement</li>
              <li>Format Conversion</li>
              <li>Quality Analysis</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li>Documentation</li>
              <li>API Reference</li>
              <li>Contact Support</li>
              <li>Status Page</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 AudioDenoiseAI. All rights reserved.</p>
        </div>
      </motion.footer>

      {/* Notifications */}
      <div className="notifications-container">
        <AnimatePresence>
          {notifications.map(notification => (
            <motion.div
              key={notification.id}
              className={`notification notification-${notification.type}`}
              initial={{ x: 300, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 300, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, type: "spring" }}
              onClick={() => removeNotification(notification.id)}
            >
              <div className="notification-icon">
                {notification.type === 'success' && <CheckCircle size={16} />}
                {notification.type === 'error' && <AlertCircle size={16} />}
                {notification.type === 'info' && <Info size={16} />}
              </div>
              <div className="notification-content">
                {notification.message}
              </div>
              <button className="notification-close">×</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal 
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        onSubmit={handleApiKeySubmit}
        sessionId={sessionData.sessionId}
      />
    </div>
  );
}

export default App;
