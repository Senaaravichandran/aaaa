// Professional Audio Denoising System - Frontend JavaScript

class AudioDenoiseApp {
    constructor() {
        this.sessionId = null;
        this.currentFile = null;
        this.isProcessing = false;
        this.apiKey = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.checkStatus();
    }
    
    initializeElements() {
        // Upload elements
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadText = document.getElementById('uploadText');
        
        // Button elements
        this.uploadBtn = document.getElementById('uploadBtn');
        this.processBtn = document.getElementById('processBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // Status and progress elements
        this.statusContainer = document.getElementById('statusContainer');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressBar = document.getElementById('progressBar');
        this.progressText = document.getElementById('progressText');
        this.fileInfo = document.getElementById('fileInfo');
        
        // Modal elements
        this.apiModal = document.getElementById('apiModal');
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.submitApiKeyBtn = document.getElementById('submitApiKey');
        this.closeModalBtn = document.getElementById('closeModal');
    }
    
    attachEventListeners() {
        // File upload events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        
        // Button events
        this.uploadBtn.addEventListener('click', () => this.fileInput.click());
        this.processBtn.addEventListener('click', this.processAudio.bind(this));
        this.downloadBtn.addEventListener('click', this.downloadFile.bind(this));
        this.resetBtn.addEventListener('click', this.resetSession.bind(this));
        
        // Modal events
        this.submitApiKeyBtn.addEventListener('click', this.submitApiKey.bind(this));
        this.closeModalBtn.addEventListener('click', this.closeModal.bind(this));
        this.apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitApiKey();
        });
        
        // Close modal on background click
        this.apiModal.addEventListener('click', (e) => {
            if (e.target === this.apiModal) this.closeModal();
        });
    }
    
    // Drag and drop handlers
    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }
    
    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }
    
    handleFile(file) {
        // Validate file type
        const allowedTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/flac', 'audio/m4a', 'audio/aac', 'audio/ogg', 'audio/x-wav'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const allowedExtensions = ['wav', 'mp3', 'flac', 'm4a', 'aac', 'ogg', 'wma', 'aiff'];
        
        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            this.showStatus('error', 'Unsupported file format. Please select an audio file.');
            return;
        }
        
        // Validate file size (100MB limit)
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showStatus('error', 'File size too large. Maximum size is 100MB.');
            return;
        }
        
        this.currentFile = file;
        this.uploadFile(file);
    }
    
    async uploadFile(file) {
        try {
            this.setLoading(true);
            this.showStatus('info', 'Uploading file...');
            
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.sessionId = result.session_id;
                this.showStatus('success', `File uploaded successfully: ${result.filename}`);
                this.displayFileInfo(file);
                this.updateButtonStates();
            } else {
                this.showStatus('error', result.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showStatus('error', 'Upload failed. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }
    
    async processAudio() {
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            this.setLoading(true);
            this.showProgress(0, 'Starting audio processing...');
            this.updateButtonStates();
            
            // Simulate processing steps with progress updates
            this.showProgress(10, 'Preprocessing audio...');
            
            const response = await fetch('/api/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showProgress(100, 'Processing completed successfully!');
                this.showStatus('success', '✅ Audio denoising completed! Report automatically sent to Groq Cloud.');
                this.showActions(['download', 'new']);
            } else {
                this.showStatus('error', result.error || 'Processing failed');
                this.hideProgress();
            }
        } catch (error) {
            console.error('Processing error:', error);
            this.showStatus('error', 'Processing failed. Please try again.');
            this.hideProgress();
        } finally {
            this.isProcessing = false;
            this.setLoading(false);
            this.updateButtonStates();
        }
    }
    
    showApiModal() {
        this.apiModal.classList.add('show');
        this.apiKeyInput.focus();
    }
    
    closeModal() {
        this.apiModal.classList.remove('show');
        this.apiKeyInput.value = '';
    }
    
    async submitApiKey() {
        const apiKey = this.apiKeyInput.value.trim();
        
        if (!apiKey) {
            this.showStatus('error', 'Please enter a valid Groq API key');
            return;
        }
        
        try {
            this.setLoading(true);
            this.showStatus('info', 'Sending report to Groq Cloud...');
            
            const response = await fetch('/api/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ api_key: apiKey })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showStatus('success', 'Report sent successfully to Groq Cloud!');
                this.closeModal();
                this.updateButtonStates();
            } else {
                this.showStatus('error', result.error || 'Failed to send report');
            }
        } catch (error) {
            console.error('API key submission error:', error);
            this.showStatus('error', 'Failed to send report. Please check your API key.');
        } finally {
            this.setLoading(false);
        }
    }
    
    async downloadFile() {
        try {
            this.setLoading(true);
            this.showStatus('info', 'Preparing download...');
            
            const response = await fetch('/api/download');
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'denoised_audio.wav';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                this.showStatus('success', 'File downloaded successfully!');
            } else {
                const result = await response.json();
                this.showStatus('error', result.error || 'Download failed');
            }
        } catch (error) {
            console.error('Download error:', error);
            this.showStatus('error', 'Download failed. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }
    
    async resetSession() {
        this.sessionId = null;
        this.currentFile = null;
        this.isProcessing = false;
        this.apiKey = null;
        
        this.hideStatus();
        this.hideProgress();
        this.hideFileInfo();
        this.updateButtonStates();
        this.updateUploadText();
        
        // Clear file input
        this.fileInput.value = '';
        
        this.showStatus('info', 'Session reset. Ready for new file.');
    }
    
    async checkStatus() {
        try {
            const response = await fetch('/api/status');
            const status = await response.json();
            
            if (status.session_active) {
                this.sessionId = status.session_id;
                
                if (status.file_uploaded) {
                    this.showStatus('info', 'Previous session restored');
                    this.updateButtonStates();
                }
                
                if (status.file_processed) {
                    this.showStatus('success', 'Audio processing completed in previous session');
                    this.updateButtonStates();
                }
            }
        } catch (error) {
            console.log('No previous session found');
        }
    }
    
    displayFileInfo(file) {
        const fileSize = this.formatFileSize(file.size);
        const fileType = file.type || 'Unknown';
        
        this.fileInfo.innerHTML = `
            <div class="file-info-item">
                <span class="file-info-label">File Name:</span>
                <span class="file-info-value">${file.name}</span>
            </div>
            <div class="file-info-item">
                <span class="file-info-label">File Size:</span>
                <span class="file-info-value">${fileSize}</span>
            </div>
            <div class="file-info-item">
                <span class="file-info-label">File Type:</span>
                <span class="file-info-value">${fileType}</span>
            </div>
        `;
        this.fileInfo.classList.remove('hidden');
    }
    
    hideFileInfo() {
        this.fileInfo.classList.add('hidden');
    }
    
    showProgress(percentage, text) {
        this.progressBar.style.width = `${percentage}%`;
        this.progressText.textContent = text;
        this.progressContainer.classList.remove('hidden');
    }
    
    hideProgress() {
        this.progressContainer.classList.add('hidden');
    }
    
    showStatus(type, message) {
        this.statusContainer.innerHTML = `
            <div class="status-message status-${type}">
                <i data-feather="${this.getStatusIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        this.statusContainer.classList.remove('hidden');
        
        // Re-initialize feather icons
        if (window.feather) {
            feather.replace();
        }
    }
    
    hideStatus() {
        this.statusContainer.classList.add('hidden');
    }
    
    getStatusIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        };
        return icons[type] || 'info';
    }
    
    updateButtonStates() {
        const hasFile = this.sessionId && this.currentFile;
        const isProcessed = this.sessionId && !this.isProcessing;
        
        this.processBtn.disabled = !hasFile || this.isProcessing;
        this.downloadBtn.disabled = !isProcessed;
        this.resetBtn.disabled = this.isProcessing;
        
        // Update button text
        if (this.isProcessing) {
            this.processBtn.innerHTML = '<div class="loading"></div> Processing...';
        } else {
            this.processBtn.innerHTML = '<i data-feather="play"></i> Process Audio';
        }
        
        // Re-initialize feather icons
        if (window.feather) {
            feather.replace();
        }
    }
    
    updateUploadText() {
        this.uploadText.textContent = 'Click to select audio file or drag and drop';
    }
    
    setLoading(loading) {
        if (loading) {
            document.body.style.cursor = 'wait';
        } else {
            document.body.style.cursor = 'default';
        }
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AudioDenoiseApp();
});

// Add some visual effects
document.addEventListener('mousemove', (e) => {
    const cursor = document.querySelector('.cursor');
    if (cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
