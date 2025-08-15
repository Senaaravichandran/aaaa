import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, Play, Download, RefreshCw, File, AlertCircle, CheckCircle } from 'react-feather';
import { uploadFile, processAudio, downloadFile, resetSession } from '../utils/api';

const AudioUploader = ({
  onFileUpload,
  onProcessingStart,
  onProcessingProgress,
  onProcessingComplete,
  onProcessingError,
  onReset,
  sessionData,
  processingState
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file) => {
    const maxSize = 500 * 1024 * 1024; // 500MB (matches backend)
    const allowedTypes = [
      'audio/wav', 'audio/wave', 'audio/x-wav',
      'audio/mp3', 'audio/mpeg', 'audio/mp4',
      'audio/flac', 'audio/x-flac',
      'audio/m4a', 'audio/mp4a-latm',
      'audio/aac', 'audio/aacp',
      'audio/ogg', 'audio/vorbis',
      'audio/x-ms-wma',
      'audio/aiff', 'audio/x-aiff'
    ];

    if (file.size > maxSize) {
      throw new Error('File is too large. Maximum size is 500MB.');
    }

    if (!allowedTypes.some(type => file.type.includes(type.split('/')[1]) || file.type === type)) {
      throw new Error('Unsupported file format. Please upload WAV, MP3, FLAC, M4A, AAC, OGG, WMA, or AIFF files.');
    }

    return true;
  };

  const handleFileUpload = useCallback(async (file) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      onProcessingProgress?.(10, 'Uploading file...');

      const result = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
        onProcessingProgress?.(progress * 0.3, `Uploading... ${Math.round(progress)}%`);
      });

      if (result.success) {
        onFileUpload?.(result);
        setUploadProgress(100);
        onProcessingProgress?.(30, 'File uploaded successfully!');
      } else {
        onProcessingError?.(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      onProcessingError?.('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onFileUpload, onProcessingProgress, onProcessingError]);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    try {
      validateFile(file);
      await handleFileUpload(file);
    } catch (error) {
      onProcessingError?.(error.message);
    }
  }, [handleFileUpload, onProcessingError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'audio/*': ['.wav', '.mp3', '.flac', '.m4a', '.aac', '.ogg', '.wma', '.aiff']
    },
    multiple: false,
    disabled: isUploading || processingState.isProcessing
  });

  const handleProcess = async () => {
    try {
      onProcessingStart?.();
      
      // Simulate processing steps with progress updates
      onProcessingProgress?.(40, 'Preprocessing audio...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onProcessingProgress?.(60, 'Applying noise reduction...');
      const result = await processAudio();
      
      if (result.success) {
        onProcessingProgress?.(80, 'Finalizing output...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        onProcessingComplete?.(result);
      } else {
        onProcessingError?.(result.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Processing error:', error);
      onProcessingError?.('Processing failed. Please try again.');
    }
  };

  const handleDownload = async () => {
    try {
      await downloadFile();
    } catch (error) {
      console.error('Download error:', error);
      onProcessingError?.('Download failed. Please try again.');
    }
  };

  const handleReset = async () => {
    try {
      await resetSession();
      onReset?.();
      setUploadProgress(0);
      setIsUploading(false);
    } catch (error) {
      console.error('Reset error:', error);
      onProcessingError?.('Reset failed. Please try again.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Default values to prevent errors
  const safeSessionData = {
    fileInfo: null,
    fileName: '',
    fileUploaded: false,
    fileProcessed: false,
    ...sessionData
  };

  const safeProcessingState = {
    isProcessing: false,
    status: '',
    message: '',
    ...processingState
  };

  return (
    <div className="audio-uploader">
      {/* Upload Area */}
      <motion.div
        {...getRootProps()}
        className={`upload-area ${isDragActive ? 'drag-active' : ''} ${isUploading ? 'uploading' : ''}`}
        whileHover={{ scale: isUploading ? 1 : 1.01 }}
        whileTap={{ scale: isUploading ? 1 : 0.99 }}
      >
        <input {...getInputProps()} />
        
        <div className="upload-content">
          <motion.div 
            className="upload-icon"
            animate={{ 
              scale: isDragActive ? 1.2 : 1,
              rotate: isUploading ? 360 : 0 
            }}
            transition={{ duration: 0.3 }}
          >
            {isUploading ? (
              <div className="loading-spinner" />
            ) : (
              <Upload size={48} />
            )}
          </motion.div>
          
          <div className="upload-text">
            {isUploading 
              ? "Uploading your audio file..." 
              : isDragActive 
                ? "Drop your audio file here..." 
                : "Click to select audio file or drag and drop"
            }
          </div>
          
          <div className="upload-hint">
            Supports WAV, MP3, FLAC, M4A, AAC, OGG, WMA, AIFF (Max: 500MB)
          </div>
          
          {uploadProgress > 0 && uploadProgress < 100 && (
            <motion.div 
              className="upload-progress"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="progress-text">{Math.round(uploadProgress)}% uploaded</div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* File Information */}
      {safeSessionData.fileInfo && (
        <motion.div 
          className="file-info"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="file-info-header">
            <File className="file-icon" />
            <div className="file-details">
              <div className="file-name">{safeSessionData.fileName}</div>
              <div className="file-stats">
                {formatFileSize(safeSessionData.fileInfo.file_size)} • 
                {safeSessionData.fileInfo.format} • 
                {safeSessionData.fileInfo.duration?.toFixed(1)}s
              </div>
            </div>
            <motion.div
              className="upload-status"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <CheckCircle size={20} color="var(--success)" />
            </motion.div>
          </div>
          
          <div className="file-info-grid">
            <div className="info-item">
              <span className="info-label">Duration:</span>
              <span className="info-value">{safeSessionData.fileInfo.duration?.toFixed(2)}s</span>
            </div>
            <div className="info-item">
              <span className="info-label">Sample Rate:</span>
              <span className="info-value">{safeSessionData.fileInfo.sample_rate} Hz</span>
            </div>
            <div className="info-item">
              <span className="info-label">Channels:</span>
              <span className="info-value">{safeSessionData.fileInfo.channels}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Format:</span>
              <span className="info-value">{safeSessionData.fileInfo.format}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div 
        className="action-buttons"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.button
          className="btn btn-primary"
          disabled={!safeSessionData.fileUploaded || safeProcessingState.isProcessing || isUploading}
          onClick={handleProcess}
          whileHover={{ scale: (safeProcessingState.isProcessing || isUploading) ? 1 : 1.05 }}
          whileTap={{ scale: (safeProcessingState.isProcessing || isUploading) ? 1 : 0.95 }}
        >
          {safeProcessingState.isProcessing ? (
            <>
              <div className="loading-spinner" />
              Processing...
            </>
          ) : (
            <>
              <Play size={20} />
              Process Audio
            </>
          )}
        </motion.button>

        <motion.button
          className="btn btn-secondary"
          disabled={!safeSessionData.fileProcessed}
          onClick={handleDownload}
          whileHover={{ scale: safeSessionData.fileProcessed ? 1.05 : 1 }}
          whileTap={{ scale: safeSessionData.fileProcessed ? 0.95 : 1 }}
        >
          <Download size={20} />
          Download
        </motion.button>

        <motion.button
          className="btn btn-outline"
          onClick={handleReset}
          disabled={safeProcessingState.isProcessing || isUploading}
          whileHover={{ scale: (safeProcessingState.isProcessing || isUploading) ? 1 : 1.05 }}
          whileTap={{ scale: (safeProcessingState.isProcessing || isUploading) ? 1 : 0.95 }}
        >
          <RefreshCw size={20} />
          Reset
        </motion.button>
      </motion.div>

      {/* Processing Errors */}
      {safeProcessingState.status === 'error' && (
        <motion.div 
          className="error-message"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AlertCircle className="error-icon" />
          <span>{safeProcessingState.message}</span>
        </motion.div>
      )}
    </div>
  );
};

export default AudioUploader;