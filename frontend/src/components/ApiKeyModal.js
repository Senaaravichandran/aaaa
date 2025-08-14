import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Send, X, AlertTriangle, CheckCircle } from 'react-feather';
import { sendGroqReport } from '../utils/api';

const ApiKeyModal = ({ isOpen, onClose, onSubmit, sessionId }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey('');
      setError('');
      setSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('Please enter a valid Groq API key');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const result = await sendGroqReport(apiKey);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onSubmit();
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Failed to send report');
      }
    } catch (err) {
      console.error('API submission error:', err);
      setError('Failed to send report. Please check your API key and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleClose}
        >
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-title">
                <Key className="modal-icon" />
                <span>Groq Cloud Integration</span>
              </div>
              <button 
                className="modal-close"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {!success ? (
                <>
                  <div className="modal-description">
                    <p>
                      🎉 Audio processing completed successfully! 
                    </p>
                    <p>
                      Please provide your Groq Cloud API key to send a detailed processing report 
                      to the cloud for analytics and monitoring.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="api-form">
                    <div className="form-group">
                      <label htmlFor="apiKey" className="form-label">
                        Groq Cloud API Key
                      </label>
                      <div className="input-group">
                        <input
                          id="apiKey"
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="form-input"
                          placeholder="Enter your Groq API key..."
                          disabled={isSubmitting}
                          autoComplete="off"
                        />
                        <Key className="input-icon" />
                      </div>
                    </div>

                    {error && (
                      <motion.div 
                        className="error-message"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AlertTriangle className="error-icon" />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    <div className="form-actions">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting || !apiKey.trim()}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="loading-spinner small" />
                            Sending Report...
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            Send Report
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                      >
                        Skip for Now
                      </button>
                    </div>
                  </form>

                  <div className="modal-footer">
                    <p className="footer-text">
                      Your API key is transmitted securely and not stored on our servers.
                    </p>
                  </div>
                </>
              ) : (
                <motion.div 
                  className="success-state"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle className="success-icon large" />
                  <h3 className="success-title">Report Sent Successfully!</h3>
                  <p className="success-message">
                    Your processing report has been sent to Groq Cloud for analysis.
                    Thank you for using our professional audio denoising system!
                  </p>
                </motion.div>
              )}
            </div>

            {/* Processing Info */}
            {sessionId && (
              <div className="session-info">
                <span className="session-label">Session ID:</span>
                <code className="session-id">{sessionId.substring(0, 8)}...</code>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ApiKeyModal;
