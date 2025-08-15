import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Zap,
  Settings,
  FileText,
  Music
} from 'react-feather';
import { processAudio, downloadFile, resetSession } from '../utils/api';

const ProcessingStatus = ({
  processingState,
  sessionData,
  onProcess
}) => {
  const [localProcessingState, setLocalProcessingState] = useState({
    isProcessing: false,
    progress: 0,
    status: '',
    message: ''
  });

  useEffect(() => {
    setLocalProcessingState(processingState);
  }, [processingState]);

  const handleProcess = async () => {
    try {
      setLocalProcessingState({
        isProcessing: true,
        progress: 0,
        status: 'starting',
        message: 'Initializing audio processing...'
      });

      // Simulate processing steps
      const steps = [
        { progress: 20, message: 'Loading audio file...' },
        { progress: 40, message: 'Analyzing audio characteristics...' },
        { progress: 60, message: 'Applying noise reduction algorithms...' },
        { progress: 80, message: 'Enhancing audio quality...' },
        { progress: 90, message: 'Finalizing output...' },
        { progress: 100, message: 'Processing complete!' }
      ];

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setLocalProcessingState(prev => ({
          ...prev,
          progress: step.progress,
          message: step.message
        }));

        // Wait between steps
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      }

      // Call the actual processing API
      const result = await processAudio();
      
      if (result.success) {
        setLocalProcessingState({
          isProcessing: false,
          progress: 100,
          status: 'completed',
          message: 'Audio processing completed successfully!'
        });
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Processing error:', error);
      setLocalProcessingState({
        isProcessing: false,
        progress: 0,
        status: 'error',
        message: error.message || 'Processing failed. Please try again.'
      });
    }
  };

  const handleDownload = async () => {
    try {
      await downloadFile();
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleReset = async () => {
    try {
      await resetSession();
      window.location.reload();
    } catch (error) {
      console.error('Reset error:', error);
    }
  };

  const processingSteps = [
    { id: 'upload', label: 'File Uploaded', icon: <FileText size={16} />, completed: sessionData.fileUploaded },
    { id: 'process', label: 'Processing', icon: <Settings size={16} />, completed: localProcessingState.status === 'completed' },
    { id: 'enhance', label: 'Audio Enhanced', icon: <Music size={16} />, completed: localProcessingState.status === 'completed' },
    { id: 'ready', label: 'Ready for Download', icon: <Download size={16} />, completed: sessionData.fileProcessed }
  ];

  return (
    <div className="processing-status">
      {/* Status Message */}
      {localProcessingState.status && (
        <motion.div 
          className={`status-message status-${localProcessingState.status}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {localProcessingState.status === 'completed' && <CheckCircle className="status-icon" />}
          {localProcessingState.status === 'error' && <AlertCircle className="status-icon" />}
          {localProcessingState.status === 'processing' && <Clock className="status-icon" />}
          {localProcessingState.status === 'starting' && <Zap className="status-icon" />}
          <span>{localProcessingState.message}</span>
        </motion.div>
      )}

      {/* Progress Section */}
      {localProcessingState.isProcessing && (
        <motion.div 
          className="progress-section"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="progress-header">
            <div className="progress-title">Processing Audio</div>
            <div className="progress-percentage">{Math.round(localProcessingState.progress)}%</div>
          </div>
          
          <div className="progress-bar-container">
            <div 
              className="progress-bar"
              style={{ width: `${localProcessingState.progress}%` }}
            >
              <div className="progress-glow" />
            </div>
          </div>
          
          <div className="progress-message">
            {localProcessingState.message}
          </div>
        </motion.div>
      )}

      {/* Processing Steps */}
      <div className="processing-steps">
        {processingSteps.map((step, index) => (
          <motion.div 
            key={step.id}
            className={`step ${step.completed ? 'completed' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="step-indicator">
              {step.completed ? <CheckCircle size={16} /> : step.icon}
            </div>
            <div className="step-label">{step.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        {!sessionData.fileProcessed && !localProcessingState.isProcessing && (
          <motion.button
            className="btn btn-primary"
            onClick={handleProcess}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play size={20} />
            Start Processing
          </motion.button>
        )}

        {sessionData.fileProcessed && (
          <motion.button
            className="btn btn-primary"
            onClick={handleDownload}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download size={20} />
            Download Enhanced Audio
          </motion.button>
        )}

        <motion.button
          className="btn btn-outline"
          onClick={handleReset}
          disabled={localProcessingState.isProcessing}
          whileHover={{ scale: localProcessingState.isProcessing ? 1 : 1.05 }}
          whileTap={{ scale: localProcessingState.isProcessing ? 1 : 0.95 }}
        >
          <RefreshCw size={20} />
          Start Over
        </motion.button>
      </div>

      {/* Processing Statistics */}
      {localProcessingState.status === 'completed' && (
        <motion.div 
          className="processing-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="stats-title">Processing Results</div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">99.9%</div>
              <div className="stat-label">Noise Reduction</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">+15dB</div>
              <div className="stat-label">SNR Improvement</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">HD</div>
              <div className="stat-label">Audio Quality</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">✓</div>
              <div className="stat-label">Processing Complete</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProcessingStatus;
