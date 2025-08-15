// API utilities for the Professional Audio Denoising System

const API_BASE_URL = 'http://localhost:8001/api';

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    credentials: 'include', // Include cookies for session management
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = { ...defaultOptions, ...options };

  // Don't set Content-Type for FormData
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses (like file downloads)
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      if (response.ok) {
        return response; // Return the raw response for downloads
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// Upload audio file
export const uploadFile = async (file, onProgress = null) => {
  const formData = new FormData();
  formData.append('file', file); // Use 'file' field name to match backend

  // Create a promise that tracks upload progress
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(percentComplete);
        }
      });
    }

    // Handle response
    xhr.addEventListener('load', () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status === 200) {
          resolve(response);
        } else {
          reject(new Error(response.error || `HTTP ${xhr.status}`));
        }
      } catch (error) {
        reject(new Error('Failed to parse response'));
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });

    // Send the request
    xhr.open('POST', `${API_BASE_URL}/upload`);
    xhr.withCredentials = true; // Include cookies
    xhr.send(formData);
  });
};

// Process uploaded audio
export const processAudio = async () => {
  return await apiRequest('/process', {
    method: 'POST',
  });
};

// Send report to Groq Cloud
export const sendGroqReport = async (apiKey) => {
  return await apiRequest('/report', {
    method: 'POST',
    body: JSON.stringify({ api_key: apiKey }),
  });
};

// Download processed audio file
export const downloadFile = async () => {
  try {
    const response = await apiRequest('/download', {
      method: 'GET',
    });

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'denoised_audio.wav';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true };
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

// Check session status
export const checkStatus = async () => {
  return await apiRequest('/status');
};

// Reset session
export const resetSession = async () => {
  return await apiRequest('/reset', {
    method: 'POST',
  });
};

// Validate file before upload
export const validateAudioFile = (file) => {
  const allowedTypes = [
    'audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/flac', 
    'audio/m4a', 'audio/aac', 'audio/ogg', 'audio/x-wav'
  ];
  
  const allowedExtensions = [
    'wav', 'mp3', 'flac', 'm4a', 'aac', 'ogg', 'wma', 'aiff'
  ];

  const fileExtension = file.name.split('.').pop().toLowerCase();
  const maxSize = 500 * 1024 * 1024; // 500MB

  // Check file type
  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: 'Unsupported file format. Please select an audio file.'
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Maximum size is 500MB.'
    };
  }

  // Check if file is not empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty. Please select a valid audio file.'
    };
  }

  return { valid: true };
};

// Format file size for display
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format duration for display
export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Audio file type detection
export const getAudioFileType = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  const audioTypes = {
    wav: 'WAV Audio',
    mp3: 'MP3 Audio',
    flac: 'FLAC Audio',
    m4a: 'M4A Audio',
    aac: 'AAC Audio',
    ogg: 'OGG Audio',
    wma: 'WMA Audio',
    aiff: 'AIFF Audio'
  };
  
  return audioTypes[extension] || 'Audio File';
};

export default {
  uploadFile,
  processAudio,
  sendGroqReport,
  downloadFile,
  checkStatus,
  resetSession,
  validateAudioFile,
  formatFileSize,
  formatDuration,
  getAudioFileType
};
