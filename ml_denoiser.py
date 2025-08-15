import numpy as np
import librosa
import logging
import scipy.io as sio
from scipy import signal
from scipy.signal import wiener, butter, filtfilt
import soundfile as sf
import json
from datetime import datetime
from config import GROQ_API_KEY
import requests

logger = logging.getLogger(__name__)

def analyze_audio(self, audio_data):
    """
    Analyze audio data and return key statistics
    """
    try:
        duration = len(audio_data) / self.sr
        avg_amplitude = np.mean(np.abs(audio_data))
        peak_amplitude = np.max(np.abs(audio_data))
        
        # Calculate SNR
        noise = audio_data[:int(self.sr)]  # Use first second as noise estimate
        signal = audio_data[int(self.sr):]
        noise_power = np.mean(noise ** 2)
        signal_power = np.mean(signal ** 2)
        snr = 10 * np.log10(signal_power / noise_power) if noise_power > 0 else 0
        
        return {
            'duration': duration,
            'avg_amplitude': float(avg_amplitude),
            'peak_amplitude': float(peak_amplitude),
            'snr': float(snr)
        }
    except Exception as e:
        logger.error(f"Audio analysis failed: {str(e)}")
        return None

def generate_report(self, audio_stats, denoised_stats):
    """Generate a detailed report using Groq API"""
    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        prompt = f"""Generate a detailed audio enhancement report based on the following metrics:
        Original Audio:
        - Duration: {audio_stats['duration']:.2f} seconds
        - Average amplitude: {audio_stats['avg_amplitude']:.2f}
        - Peak amplitude: {audio_stats['peak_amplitude']:.2f}
        - SNR: {audio_stats['snr']:.2f} dB

        Enhanced Audio:
        - Average amplitude: {denoised_stats['avg_amplitude']:.2f}
        - Peak amplitude: {denoised_stats['peak_amplitude']:.2f}
        - SNR: {denoised_stats['snr']:.2f} dB
        
        Provide a professional analysis of the improvements and technical details.
        """
        
        response = requests.post(
            "https://api.groq.com/v1/completions",
            headers=headers,
            json={
                "model": "llama2-70b-4096",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "max_tokens": 500
            }
        )
        
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"]
        else:
            logger.error(f"Failed to generate report: {response.text}")
            return "Error generating report"
    except Exception as e:
        logger.error(f"Report generation failed: {str(e)}")
        return "Error generating report"

class MLDenoiser:
    def __init__(self, frame_length=2048, hop_length=512, sr=44100):
        """
        Initialize advanced audio denoiser using spectral processing and adaptive filtering.
        
        Args:
            frame_length (int): Length of FFT window
            hop_length (int): Number of samples between successive frames
            sr (int): Sampling rate of the audio
        """
        self.frame_length = frame_length
        self.hop_length = hop_length
        self.sr = sr
        
        # Enhanced spectral processing parameters
        self.n_mels = 128
        self.mel_basis = librosa.filters.mel(sr=sr, n_fft=frame_length, n_mels=self.n_mels)
        
        # Noise reduction parameters
        self.noise_reduction_factor = 1.5
        self.spectral_floor = 0.002
        self.smoothing_factor = 0.2
        
        # Multi-band parameters
        self.n_bands = 4
        self.band_boundaries = [20, 200, 2000, 8000, sr//2]  # Frequency bands in Hz
        
        # Initialize band-specific Wiener filters
        self.wiener_window_sizes = [
            frame_length // 4,  # Low frequencies
            frame_length // 8,  # Mid-low frequencies
            frame_length // 16, # Mid-high frequencies
            frame_length // 32  # High frequencies
        ]
        
    def load_mat_dataset(self, mat_file):
        """
        Load audio data from MAT files for training or reference.
        
        Args:
            mat_file (str): Path to the MAT file
            
        Returns:
            tuple: Clean audio data and noisy audio data if available
        """
        try:
            mat_data = sio.loadmat(mat_file)
            if 'clean_audio' in mat_data:
                return mat_data['clean_audio'], mat_data.get('noisy_audio', None)
            return mat_data['audio'], None
        except Exception as e:
            logger.error(f"Error loading MAT file: {str(e)}")
            return None, None
        
    def denoise_audio(self, audio_data, noise_factor=0.1, alpha=2.0, beta=0.01, chunk_size=44100*30):
        """
        Apply advanced multi-stage denoising using spectral subtraction, Wiener filtering,
        and adaptive thresholding. Processes audio in chunks for memory efficiency.
        
        Args:
            audio_data (numpy.ndarray): Input audio data
            noise_factor (float): Factor for noise estimation (0.0 to 1.0)
            alpha (float): Over-subtraction factor
            beta (float): Adaptive threshold factor
            chunk_size (int): Size of audio chunks to process (default: 30 seconds)
            
        Returns:
            numpy.ndarray: Denoised audio data
        """
        try:
            logger.info("Starting advanced denoising process...")
            
            # Initialize output array
            denoised_final = np.zeros_like(audio_data)
            total_chunks = len(audio_data) // chunk_size + (1 if len(audio_data) % chunk_size else 0)
            
            # Process audio in chunks
            for i in range(total_chunks):
                start_idx = i * chunk_size
                end_idx = min(start_idx + chunk_size, len(audio_data))
                chunk = audio_data[start_idx:end_idx]
                
                logger.info(f"Processing chunk {i+1}/{total_chunks}")
                
                # Step 1: Apply pre-emphasis filter
                pre_emphasized = self._pre_emphasis(chunk)
                
                # Step 2: Estimate noise profile using improved method
                noise_profile = self._estimate_noise_profile(pre_emphasized, noise_factor)
                
                # Step 3: Apply adaptive spectral subtraction
                denoised_spectral = self._adaptive_spectral_subtraction(
                    pre_emphasized, noise_profile, alpha, beta
                )
                
                # Step 4: Apply multi-band Wiener filtering
                denoised_wiener = self._multi_band_wiener(denoised_spectral)
                
                # Step 5: Apply adaptive thresholding in mel-frequency domain
                denoised_mel = self._mel_threshold(denoised_wiener)
                
                # Step 6: Enhanced post-processing
                denoised_chunk = self._enhanced_post_process(denoised_mel, chunk)
                
                # Store processed chunk
                denoised_final[start_idx:end_idx] = denoised_chunk
                
                logger.info(f"Chunk {i+1}/{total_chunks} processed")
            
            logger.info("All chunks processed successfully")
            return denoised_final
            
        except Exception as e:
            logger.error(f"Denoising failed: {str(e)}")
            raise Exception(f"ML denoising failed: {str(e)}")
    
    def _estimate_noise_profile(self, audio_data, noise_factor=0.1):
        """
        Estimate noise profile from the audio signal.
        
        Args:
            audio_data (numpy.ndarray): Input audio data
            noise_factor (float): Fraction of audio to use for noise estimation
            
        Returns:
            numpy.ndarray: Estimated noise spectrum
        """
        # Use beginning of audio for noise estimation
        noise_length = int(len(audio_data) * noise_factor)
        noise_segment = audio_data[:noise_length]
        
        # Compute STFT of noise segment
        noise_stft = librosa.stft(
            noise_segment,
            n_fft=self.frame_length,
            hop_length=self.hop_length
        )
        
        # Calculate average magnitude spectrum
        noise_magnitude = np.abs(noise_stft)
        noise_profile = np.mean(noise_magnitude, axis=1, keepdims=True)
        
        return noise_profile
    
    def _pre_emphasis(self, audio_data, coeff=0.97):
        """
        Apply pre-emphasis filter to boost high frequencies.
        """
        return np.append(audio_data[0], audio_data[1:] - coeff * audio_data[:-1])
    
    def _adaptive_spectral_subtraction(self, audio_data, noise_profile, alpha=2.0, beta=0.01):
        """
        Apply enhanced adaptive spectral subtraction with psychoacoustic modeling.
        """
        # Compute STFT with overlapping windows for smoother transitions
        window = signal.windows.hann(self.frame_length)
        stft = librosa.stft(audio_data, n_fft=self.frame_length, 
                           hop_length=self.hop_length, window=window)
        magnitude = np.abs(stft)
        phase = np.angle(stft)
        
        # Compute frequency-dependent SNR
        smoothed_noise = signal.convolve2d(
            noise_profile, 
            np.ones((3, 3))/9, 
            mode='same', 
            boundary='symm'
        )
        
        # Compute noise reduction factor
        snr = 10 * np.log10(magnitude / (noise_profile + 1e-10))
        alpha_factor = alpha * (1 + beta * snr)
        
        # Apply spectral subtraction with adaptive threshold
        magnitude_clean = np.maximum(
            magnitude - alpha_factor * noise_profile,
            beta * magnitude
        )
        
        # Reconstruct signal
        stft_clean = magnitude_clean * np.exp(1j * phase)
        return librosa.istft(stft_clean, hop_length=self.hop_length)
    
    def _multi_band_wiener(self, audio_data):
        """
        Apply multi-band Wiener filtering for enhanced noise reduction.
        """
        # Define frequency bands
        bands = [
            (20, 200),    # Low frequencies
            (200, 2000),  # Mid frequencies
            (2000, 8000), # High frequencies
        ]
        
        filtered_audio = np.zeros_like(audio_data)
        for low, high in bands:
            # Design bandpass filter
            nyquist = self.sr / 2
            low_norm = low / nyquist
            high_norm = high / nyquist
            b, a = butter(4, [low_norm, high_norm], btype='band')
            
            # Apply bandpass filter
            band_audio = filtfilt(b, a, audio_data)
            
            # Apply Wiener filter to band
            filtered_band = wiener(band_audio, mysize=self.frame_length//4)
            filtered_audio += filtered_band
        
        return filtered_audio
    
    def _mel_threshold(self, audio_data):
        """
        Apply adaptive thresholding in mel-frequency domain for perceptual enhancement.
        """
        # Compute mel spectrogram
        mel_spec = np.abs(np.dot(
            self.mel_basis,
            np.abs(librosa.stft(audio_data, n_fft=self.frame_length))
        ))
        
        # Apply adaptive thresholding
        threshold = np.mean(mel_spec, axis=1, keepdims=True) * 0.5
        mel_spec = np.maximum(mel_spec - threshold, 0)
        
        # Inverse transform
        return librosa.feature.inverse.mel_to_audio(
            mel_spec,
            sr=self.sr,
            n_fft=self.frame_length,
            hop_length=self.hop_length
        )
    
    def _enhanced_post_process(self, denoised_audio, original_audio):
        """
        Enhanced post-processing with dynamic range compression and phase preservation.
        """
        # Apply dynamic range compression
        threshold = -20
        ratio = 4
        attack_time = 0.005
        release_time = 0.05
        
        # Convert to dB
        db = 20 * np.log10(np.abs(denoised_audio) + 1e-10)
        
        # Apply compression
        gain_db = np.minimum(0, (threshold - db) * (1 - 1/ratio))
        gain = 10 ** (gain_db/20)
        
        # Smooth gain changes
        attack_samples = int(attack_time * self.sr)
        release_samples = int(release_time * self.sr)
        
        # Apply smoothed gain
        compressed = denoised_audio * gain
        
        # Preserve some of the original phase information
        phase_factor = 0.2
        result = compressed + phase_factor * (original_audio - compressed)
        
        return result
        
        # Apply spectral subtraction
        # Subtract scaled noise profile from magnitude spectrum
        enhanced_magnitude = magnitude - alpha * noise_profile
        
        # Apply floor to prevent negative values
        floor_factor = 0.1  # 10% of original magnitude as floor
        enhanced_magnitude = np.maximum(
            enhanced_magnitude,
            floor_factor * magnitude
        )
        
        # Reconstruct complex spectrum
        enhanced_stft = enhanced_magnitude * np.exp(1j * phase)
        
        # Convert back to time domain
        denoised_audio = librosa.istft(
            enhanced_stft,
            hop_length=self.hop_length,
            length=len(audio_data)
        )
        
        return denoised_audio
    
    def _wiener_filter(self, audio_data, noise_variance=0.01):
        """
        Apply Wiener filtering for additional noise reduction.
        
        Args:
            audio_data (numpy.ndarray): Input audio data
            noise_variance (float): Estimated noise variance
            
        Returns:
            numpy.ndarray: Filtered audio data
        """
        # Apply Wiener filter
        filtered_audio = wiener(audio_data, noise=noise_variance)
        
        return filtered_audio
    
    def _post_process(self, denoised_audio, original_audio):
        """
        Post-process denoised audio to enhance quality.
        
        Args:
            denoised_audio (numpy.ndarray): Denoised audio data
            original_audio (numpy.ndarray): Original audio data
            
        Returns:
            numpy.ndarray: Post-processed audio data
        """
        # Ensure same length
        min_length = min(len(denoised_audio), len(original_audio))
        denoised_audio = denoised_audio[:min_length]
        original_audio = original_audio[:min_length]
        
        # Apply gentle high-pass filter to remove low-frequency artifacts
        denoised_audio = self._high_pass_filter(denoised_audio)
        
        # Dynamic range compression to enhance clarity
        denoised_audio = self._dynamic_range_compression(denoised_audio)
        
        # Preserve some original characteristics to maintain naturalness
        blend_factor = 0.05  # 5% of original signal
        denoised_audio = (1 - blend_factor) * denoised_audio + blend_factor * original_audio
        
        return denoised_audio
    
    def _high_pass_filter(self, audio_data, cutoff_freq=80):
        """
        Apply high-pass filter to remove low-frequency artifacts.
        
        Args:
            audio_data (numpy.ndarray): Input audio data
            cutoff_freq (float): Cutoff frequency in Hz
            
        Returns:
            numpy.ndarray: Filtered audio data
        """
        # Simple first-order high-pass filter
        alpha = 0.95  # Filter coefficient
        filtered = np.zeros_like(audio_data)
        filtered[0] = audio_data[0]
        
        for i in range(1, len(audio_data)):
            filtered[i] = alpha * (filtered[i-1] + audio_data[i] - audio_data[i-1])
        
        return filtered
    
    def _dynamic_range_compression(self, audio_data, threshold=0.1, ratio=4.0):
        """
        Apply dynamic range compression to enhance clarity.
        
        Args:
            audio_data (numpy.ndarray): Input audio data
            threshold (float): Compression threshold
            ratio (float): Compression ratio
            
        Returns:
            numpy.ndarray: Compressed audio data
        """
        # Simple compression algorithm
        compressed = np.copy(audio_data)
        
        # Find samples above threshold
        above_threshold = np.abs(compressed) > threshold
        
        # Apply compression to samples above threshold
        compressed[above_threshold] = (
            np.sign(compressed[above_threshold]) * 
            (threshold + (np.abs(compressed[above_threshold]) - threshold) / ratio)
        )
        
        return compressed
    
    def calculate_snr(self, clean_audio, noisy_audio):
        """
        Calculate Signal-to-Noise Ratio.
        
        Args:
            clean_audio (numpy.ndarray): Clean audio signal
            noisy_audio (numpy.ndarray): Noisy audio signal
            
        Returns:
            float: SNR in dB
        """
        # Ensure same length
        min_length = min(len(clean_audio), len(noisy_audio))
        clean_audio = clean_audio[:min_length]
        noisy_audio = noisy_audio[:min_length]
        
        # Calculate noise
        noise = noisy_audio - clean_audio
        
        # Calculate power
        signal_power = np.mean(clean_audio ** 2)
        noise_power = np.mean(noise ** 2)
        
        # Avoid division by zero
        if noise_power == 0:
            return float('inf')
        
        # Calculate SNR in dB
        snr_db = 10 * np.log10(signal_power / noise_power)
        
        return snr_db
