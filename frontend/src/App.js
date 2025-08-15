import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, 
  Upload, 
  Settings, 
  Info, 
  Zap, 
  Shield, 
  Clock, 
  Download,
  Play,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles
} from 'react-feather';
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
  const [activeTab, setActiveTab] = useState('upload');

  useEffect(() => {
    checkExistingSession();
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
    setActiveTab('process');
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
    setActiveTab('upload');
    addNotification('info', 'Session reset. Ready for new file.');
  };

  return (
    <div className="app">
      {/* Animated Background */}
      <div className="background-animation">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="particles">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${20 + Math.random() * 10}s`
            }}></div>
          ))}
        </div>
      </div>

      {/* Header */}
      <motion.header 
        className="app-header"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon-wrapper">
              <Music className="logo-icon" />
              <Sparkles className="logo-sparkle" />
            </div>
            <div className="logo-text">
              <span className="logo-primary">Audio</span>
              <span className="logo-secondary">Denoise</span>
              <span className="logo-ai">AI</span>
            </div>
          </div>
          
          <nav className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
            <button className="nav-button">
              <Settings size={18} />
            </button>
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
          <div className="hero-badge">
            <Zap size={16} />
            <span>AI-Powered Audio Enhancement</span>
          </div>
          
          <h1 className="hero-title">
            Professional Audio
            <span className="hero-highlight"> Denoising</span>
          </h1>
          
          <p className="hero-subtitle">
            Transform your audio with cutting-edge machine learning technology. 
            Remove noise, enhance clarity, and achieve studio-quality results in seconds.
          </p>
          
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-icon">
                <Shield size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Noise Reduction</div>
              </div>
            </div>
            <div className="stat">
              <div className="stat-icon">
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">8+</div>
                <div className="stat-label">Audio Formats</div>
              </div>
            </div>
            <div className="stat">
              <div className="stat-icon">
                <Zap size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">ML</div>
                <div className="stat-label">Powered</div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Main Processing Interface */}
        <motion.div 
          className="processing-interface"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <Upload size={20} />
              <span>Upload Audio</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'process' ? 'active' : ''}`}
              onClick={() => setActiveTab('process')}
              disabled={!sessionData.fileUploaded}
            >
              <Play size={20} />
              <span>Process</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'download' ? 'active' : ''}`}
              onClick={() => setActiveTab('download')}
              disabled={!sessionData.fileProcessed}
            >
              <Download size={20} />
              <span>Download</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            )}
            
            {activeTab === 'process' && (
              <motion.div
                key="process"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <ProcessingStatus 
                  processingState={processingState}
                  sessionData={sessionData}
                  onProcess={() => {
                    // Trigger processing
                    const processButton = document.querySelector('.btn-primary');
                    if (processButton && !processButton.disabled) {
                      processButton.click();
                    }
                  }}
                />
              </motion.div>
            )}
            
            {activeTab === 'download' && (
              <motion.div
                key="download"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="download-section"
              >
                <div className="download-content">
                  <div className="download-icon">
                    <CheckCircle size={64} />
                  </div>
                  <h3 className="download-title">Processing Complete!</h3>
                  <p className="download-description">
                    Your audio has been successfully denoised and enhanced. 
                    Download the processed file below.
                  </p>
                  <button 
                    className="btn btn-primary btn-large"
                    onClick={() => {
                      const downloadButton = document.querySelector('.btn-secondary');
                      if (downloadButton && !downloadButton.disabled) {
                        downloadButton.click();
                      }
                    }}
                  >
                    <Download size={24} />
                    Download Enhanced Audio
                  </button>
                </div>
              </motion.div>
            )}
          </div>
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
          <div className="section-header">
            <h2 className="section-title">Advanced Features</h2>
            <p className="section-subtitle">
              Powered by cutting-edge AI technology for professional audio enhancement
            </p>
          </div>
          
          <div className="features-grid">
            {[
              {
                icon: <Zap />,
                title: "AI-Powered Processing",
                description: "Advanced neural networks and spectral analysis for superior noise reduction and audio enhancement.",
                color: "var(--primary)"
              },
              {
                icon: <Upload />,
                title: "Universal Format Support",
                description: "Supports all major audio formats with automatic conversion and intelligent format detection.",
                color: "var(--secondary)"
              },
              {
                icon: <Clock />,
                title: "Real-time Processing",
                description: "Lightning-fast processing with live progress tracking and instant results delivery.",
                color: "var(--accent)"
              },
              {
                icon: <Shield />,
                title: "Professional Grade",
                description: "Enterprise-level audio processing suitable for professional studios and broadcast applications.",
                color: "var(--success)"
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="feature-icon" style={{ color: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>

      {/* Notifications */}
      <div className="notifications-container">
        <AnimatePresence>
          {notifications.map(notification => (
            <motion.div
              key={notification.id}
              className={`notification notification-${notification.type}`}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="notification-content">
                {notification.message}
              </div>
              <button 
                className="notification-close"
                onClick={() => removeNotification(notification.id)}
              >
                <X size={16} />
              </button>
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
