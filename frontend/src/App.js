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
  Sparkles,
  Waveform,
  Headphones,
  Mic,
  Volume2
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

  return (
    <div className="app">
      {/* Animated Background */}
      <div className="background-animation">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
        <div className="floating-orb orb-4"></div>
        <div className="wave-container">
          <div className="wave wave-1"></div>
          <div className="wave wave-2"></div>
          <div className="wave wave-3"></div>
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
            <div className="logo-icon-container">
              <Music className="logo-icon" />
              <Sparkles className="logo-sparkle" />
            </div>
            <div className="logo-text">
              <span className="logo-title">AudioDenoise</span>
              <span className="logo-subtitle">AI</span>
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
          <div className="hero-content">
            <h1 className="hero-title">
              Professional Audio Denoising
              <span className="hero-highlight">Powered by AI</span>
            </h1>
            <p className="hero-subtitle">
              Transform your audio with advanced machine learning algorithms. 
              Remove noise, enhance clarity, and achieve studio-quality results in seconds.
            </p>
            
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-icon">
                  <Zap size={24} />
                </div>
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Noise Reduction</div>
              </div>
              <div className="stat">
                <div className="stat-icon">
                  <Headphones size={24} />
                </div>
                <div className="stat-number">8+</div>
                <div className="stat-label">Audio Formats</div>
              </div>
              <div className="stat">
                <div className="stat-icon">
                  <Shield size={24} />
                </div>
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
              Upload & Process
            </button>
            <button 
              className={`tab-button ${activeTab === 'status' ? 'active' : ''}`}
              onClick={() => setActiveTab('status')}
            >
              <Clock size={20} />
              Status
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'upload' && (
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
            )}
            
            {activeTab === 'status' && (
              <ProcessingStatus 
                processingState={processingState}
                sessionData={sessionData}
              />
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
            <p className="section-subtitle">Professional-grade audio processing capabilities</p>
          </div>
          
          <div className="features-grid">
            {[
              {
                icon: <Waveform />,
                title: "ML-Powered Processing",
                description: "Advanced spectral subtraction and Wiener filtering algorithms for superior noise reduction.",
                color: "var(--primary)"
              },
              {
                icon: <Upload />,
                title: "Universal Format Support",
                description: "Supports all major audio formats with automatic conversion and normalization.",
                color: "var(--secondary)"
              },
              {
                icon: <Zap />,
                title: "Real-time Processing",
                description: "Fast, efficient processing with live progress tracking and status updates.",
                color: "var(--accent)"
              },
              {
                icon: <Shield />,
                title: "Professional Grade",
                description: "Enterprise-level audio processing suitable for professional audio production.",
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

        {/* How It Works Section */}
        <motion.section 
          className="how-it-works"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Simple three-step process to professional audio</p>
          </div>
          
          <div className="steps-container">
            {[
              {
                step: "01",
                icon: <Upload />,
                title: "Upload Audio",
                description: "Drag and drop your audio file or click to browse. Supports all major formats."
              },
              {
                step: "02",
                icon: <Settings />,
                title: "AI Processing",
                description: "Our advanced ML algorithms analyze and remove noise while preserving audio quality."
              },
              {
                step: "03",
                icon: <Download />,
                title: "Download Result",
                description: "Get your professionally denoised audio file ready for use."
              }
            ].map((step, index) => (
              <motion.div 
                key={index}
                className="step-card"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="step-number">{step.step}</div>
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
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
                {notification.type === 'success' && <CheckCircle size={16} />}
                {notification.type === 'error' && <AlertCircle size={16} />}
                {notification.type === 'info' && <Info size={16} />}
                <span>{notification.message}</span>
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
