import numpy as np
import librosa
import logging
from scipy.signal import wiener

logger = logging.getLogger(__name__)

class MLDenoiser:
    def __init__(self, frame_length=2048, hop_length=512):
        """
        Initialize ML-based denoiser using advanced spectral processing techniques.
        
        Args:
            frame_length (int): Length of FFT window
            hop_length (int): Number of samples between successive frames
        """
        self.frame_length = frame_length
        self.hop_length = hop_length
        
    def denoise_audio(self, audio_data, noise_factor=0.1, alpha=2.0):
        """
        Apply ML-inspired denoising using spectral subtraction and Wiener filtering.
        
        Args:
            audio_data (numpy.ndarray): Input audio data
            noise_factor (float): Factor for noise estimation (0.0 to 1.0)
            alpha (float): Over-subtraction factor
            
        Returns:
            numpy.ndarray: Denoised audio data
        """
        try:
            logger.info("Starting ML denoising process...")
            
            # Step 1: Estimate noise profile from the beginning of the audio
            noise_profile = self._estimate_noise_profile(audio_data, noise_factor)
            logger.info("Noise profile estimated")
            
            # Step 2: Apply spectral subtraction
            denoised_spectral = self._spectral_subtraction(audio_data, noise_profile, alpha)
            logger.info("Spectral subtraction applied")
            
            # Step 3: Apply Wiener filtering for additional smoothing
            denoised_final = self._wiener_filter(denoised_spectral)
            logger.info("Wiener filtering applied")
            
            # Step 4: Post-processing to enhance quality
            denoised_final = self._post_process(denoised_final, audio_data)
            logger.info("Post-processing completed")
            
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
    
    def _spectral_subtraction(self, audio_data, noise_profile, alpha=2.0):
        """
        Apply spectral subtraction denoising.
        
        Args:
            audio_data (numpy.ndarray): Input audio data
            noise_profile (numpy.ndarray): Estimated noise spectrum
            alpha (float): Over-subtraction factor
            
        Returns:
            numpy.ndarray: Denoised audio data
        """
        # Compute STFT of input audio
        stft = librosa.stft(
            audio_data,
            n_fft=self.frame_length,
            hop_length=self.hop_length
        )
        
        magnitude = np.abs(stft)
        phase = np.angle(stft)
        
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
