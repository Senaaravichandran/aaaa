import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock, Zap } from 'react-feather';

const ProcessingStatus = ({ processingState, sessionData }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="status-icon success" />;
      case 'error':
        return <AlertCircle className="status-icon error" />;
      case 'starting':
      case 'processing':
        return <Clock className="status-icon processing" />;
      default:
        return <Zap className="status-icon info" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'error':
        return 'error';
      case 'starting':
      case 'processing':
        return 'processing';
      default:
        return 'info';
    }
  };

  return (
    <div className="processing-status">
      {/* Progress Bar */}
      <AnimatePresence>
        {processingState.isProcessing && (
          <motion.div 
            className="progress-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="progress-header">
              <span className="progress-title">Processing Audio</span>
              <span className="progress-percentage">{Math.round(processingState.progress)}%</span>
            </div>
            
            <div className="progress-bar-container">
              <motion.div 
                className="progress-bar"
                initial={{ width: 0 }}
                animate={{ width: `${processingState.progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
              <div className="progress-glow" />
            </div>
            
            <div className="progress-message">
              {processingState.message}
            </div>
            
            {/* Processing Steps Visualization */}
            <div className="processing-steps">
              {[
                { step: 'Preprocessing', threshold: 20 },
                { step: 'Noise Analysis', threshold: 40 },
                { step: 'ML Denoising', threshold: 70 },
                { step: 'Output Generation', threshold: 90 }
              ].map((item, index) => (
                <div 
                  key={index}
                  className={`step ${processingState.progress >= item.threshold ? 'completed' : ''}`}
                >
                  <div className="step-indicator">
                    {processingState.progress >= item.threshold ? (
                      <CheckCircle size={16} />
                    ) : (
                      <div className="step-number">{index + 1}</div>
                    )}
                  </div>
                  <div className="step-label">{item.step}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Messages */}
      <AnimatePresence>
        {processingState.status && !processingState.isProcessing && (
          <motion.div 
            className={`status-message status-${getStatusColor(processingState.status)}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {getStatusIcon(processingState.status)}
            <span>{processingState.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Statistics */}
      {sessionData.fileProcessed && (
        <motion.div 
          className="processing-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="stats-title">Processing Results</div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">100%</div>
              <div className="stat-label">Completion</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">ML</div>
              <div className="stat-label">Algorithm</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">WAV</div>
              <div className="stat-label">Output</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">HD</div>
              <div className="stat-label">Quality</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Real-time Audio Visualization (Placeholder) */}
      {processingState.isProcessing && (
        <motion.div 
          className="audio-visualizer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="visualizer-bars">
            {[...Array(20)].map((_, index) => (
              <motion.div
                key={index}
                className="visualizer-bar"
                animate={{
                  height: [
                    Math.random() * 30 + 10,
                    Math.random() * 50 + 20,
                    Math.random() * 30 + 10
                  ]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: index * 0.05
                }}
              />
            ))}
          </div>
          <div className="visualizer-label">Real-time Processing</div>
        </motion.div>
      )}
    </div>
  );
};

export default ProcessingStatus;
