import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, Play, Download, RefreshCw, File, AlertCircle } from 'react-feather';
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
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    setIsDragging(false);
    
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      onProcessingError(`File rejected: ${error.message}`);
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      await handleFileUpload(file);
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    accept: {
      'audio/*': ['.wav', '.mp3', '.flac', '.m4a', '.aac', '.ogg', '.wma', '.aiff']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false
  });

  const handleFileUpload = async (file) => {
    try {
      setUploadProgress(0);
      onProcessingProgress(10, 'Uploading file...');

      const result = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
        onProcessingProgress(progress * 0.3, `Uploading... ${Math.round(progress)}%`);
      });

      if (result.success) {
        onFileUpload(result);
        setUploadProgress(100);
      } else {
        onProcessingError(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      onProcessingError('Upload failed. Please try again.');
    }
  };

  const handleProcess = async () => {
    try {
      onProcessingStart();
      
      // Simulate processing steps with progress updates
      onProcessingProgress(20, 'Preprocessing audio...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onProcessingProgress(40, 'Applying noise reduction...');
      const result = await processAudio();
      
      if (result.success) {
        onProcessingProgress(80, 'Finalizing output...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        onProcessingComplete(result);
      } else {
        onProcessingError(result.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Processing error:', error);
      onProcessingError('Processing failed. Please try again.');
    }
  };

  const handleDownload = async () => {
    try {
      await downloadFile();
    } catch (error) {
      console.error('Download error:', error);
      onProcessingError('Download failed. Please try again.');
    }
  };

  const handleReset = async () => {
    try {
      await resetSession();
      onReset();
      setUploadProgress(0);
    } catch (error) {
      console.error('Reset error:', error);
      onProcessingError('Reset failed. Please try again.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="audio-uploader">
      {/* Upload Area */}
      <motion.div
        {...getRootProps()}
        className={`upload-area ${isDragActive || isDragging ? 'drag-active' : ''}`}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input {...getInputProps()} />
        
        <div className="upload-content">
          <motion.div 
            className="upload-icon"
            animate={{ 
              scale: isDragActive ? 1.2 : 1,
              rotate: isDragActive ? 360 : 0 
            }}
            transition={{ duration: 0.3 }}
          >
            <Upload size={48} />
          </motion.div>
          
          <div className="upload-text">
            {isDragActive 
              ? "Drop your audio file here..." 
              : "Click to select audio file or drag and drop"
            }
          </div>
          
          <div className="upload-hint">
            Supports WAV, MP3, FLAC, M4A, AAC, OGG, WMA, AIFF (Max: 100MB)
          </div>
          
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="progress-text">{Math.round(uploadProgress)}% uploaded</div>
            </div>
          )}
        </div>
      </motion.div>

      {/* File Information */}
      {sessionData.fileInfo && (
        <motion.div 
          className="file-info"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="file-info-header">
            <File className="file-icon" />
            <div className="file-details">
              <div className="file-name">{sessionData.fileName}</div>
              <div className="file-stats">
                {formatFileSize(sessionData.fileInfo.file_size)} • 
                {sessionData.fileInfo.format} • 
                {sessionData.fileInfo.duration?.toFixed(1)}s
              </div>
            </div>
          </div>
          
          <div className="file-info-grid">
            <div className="info-item">
              <span className="info-label">Duration:</span>
              <span className="info-value">{sessionData.fileInfo.duration?.toFixed(2)}s</span>
            </div>
            <div className="info-item">
              <span className="info-label">Sample Rate:</span>
              <span className="info-value">{sessionData.fileInfo.sample_rate} Hz</span>
            </div>
            <div className="info-item">
              <span className="info-label">Channels:</span>
              <span className="info-value">{sessionData.fileInfo.channels}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Format:</span>
              <span className="info-value">{sessionData.fileInfo.format}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <motion.button
          className="btn btn-primary"
          disabled={!sessionData.fileUploaded || processingState.isProcessing}
          onClick={handleProcess}
          whileHover={{ scale: processingState.isProcessing ? 1 : 1.05 }}
          whileTap={{ scale: processingState.isProcessing ? 1 : 0.95 }}
        >
          {processingState.isProcessing ? (
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
          disabled={!sessionData.fileProcessed}
          onClick={handleDownload}
          whileHover={{ scale: sessionData.fileProcessed ? 1.05 : 1 }}
          whileTap={{ scale: sessionData.fileProcessed ? 0.95 : 1 }}
        >
          <Download size={20} />
          Download
        </motion.button>

        <motion.button
          className="btn btn-outline"
          onClick={handleReset}
          disabled={processingState.isProcessing}
          whileHover={{ scale: processingState.isProcessing ? 1 : 1.05 }}
          whileTap={{ scale: processingState.isProcessing ? 1 : 0.95 }}
        >
          <RefreshCw size={20} />
          Reset
        </motion.button>
      </div>

      {/* Processing Errors */}
      {processingState.status === 'error' && (
        <motion.div 
          className="error-message"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AlertCircle className="error-icon" />
          <span>{processingState.message}</span>
        </motion.div>
      )}
    </div>
  );
};

export default AudioUploader;
