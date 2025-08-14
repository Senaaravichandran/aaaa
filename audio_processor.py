import numpy as np
import librosa
import soundfile as sf
from pydub import AudioSegment
import os
import logging

logger = logging.getLogger(__name__)

class AudioProcessor:
    def __init__(self, target_sr=22050, chunk_duration=2.0):
        """
        Initialize audio processor with target sample rate and chunk duration.
        
        Args:
            target_sr (int): Target sample rate for processing
            chunk_duration (float): Duration of each chunk in seconds
        """
        self.target_sr = target_sr
        self.chunk_duration = chunk_duration
        self.chunk_samples = int(target_sr * chunk_duration)
        
    def preprocess_audio(self, input_path):
        """
        Preprocess audio file: convert to WAV, normalize, and prepare for ML processing.
        
        Args:
            input_path (str): Path to input audio file
            
        Returns:
            tuple: (audio_data, sample_rate, original_duration)
        """
        try:
            logger.info(f"Starting preprocessing for: {input_path}")
            
            # Step 1: Convert to WAV format using pydub (handles multiple formats)
            logger.info("Converting audio to WAV format...")
            audio_segment = AudioSegment.from_file(input_path)
            
            # Convert to mono if stereo
            if audio_segment.channels > 1:
                logger.info("Converting stereo to mono...")
                audio_segment = audio_segment.set_channels(1)
            
            # Export to temporary WAV file for librosa processing
            temp_wav = input_path + "_temp.wav"
            audio_segment.export(temp_wav, format="wav")
            
            # Step 2: Load with librosa for advanced processing
            logger.info("Loading audio with librosa...")
            audio_data, sr = librosa.load(temp_wav, sr=self.target_sr, mono=True)
            
            # Clean up temporary file
            os.remove(temp_wav)
            
            # Step 3: Normalize audio
            logger.info("Normalizing audio...")
            audio_data = self._normalize_audio(audio_data)
            
            # Step 4: Pad audio if necessary for chunk processing
            logger.info("Preparing audio for chunk processing...")
            audio_data = self._prepare_for_chunking(audio_data)
            
            original_duration = len(audio_data) / self.target_sr
            logger.info(f"Preprocessing completed. Duration: {original_duration:.2f}s, Sample rate: {self.target_sr}Hz")
            
            return audio_data, self.target_sr, original_duration
            
        except Exception as e:
            logger.error(f"Preprocessing failed: {str(e)}")
            raise Exception(f"Audio preprocessing failed: {str(e)}")
    
    def _normalize_audio(self, audio_data):
        """
        Normalize audio to prevent clipping and ensure consistent volume.
        
        Args:
            audio_data (numpy.ndarray): Input audio data
            
        Returns:
            numpy.ndarray: Normalized audio data
        """
        # RMS normalization
        rms = np.sqrt(np.mean(audio_data**2))
        if rms > 0:
            target_rms = 0.1  # Target RMS level
            audio_data = audio_data * (target_rms / rms)
        
        # Peak normalization to prevent clipping
        max_val = np.max(np.abs(audio_data))
        if max_val > 0.95:
            audio_data = audio_data * (0.95 / max_val)
            
        return audio_data
    
    def _prepare_for_chunking(self, audio_data):
        """
        Prepare audio for chunk-based processing by padding if necessary.
        
        Args:
            audio_data (numpy.ndarray): Input audio data
            
        Returns:
            numpy.ndarray: Audio data ready for chunking
        """
        # Calculate required padding
        total_samples = len(audio_data)
        if total_samples % self.chunk_samples != 0:
            padding_needed = self.chunk_samples - (total_samples % self.chunk_samples)
            audio_data = np.pad(audio_data, (0, padding_needed), mode='constant', constant_values=0)
            
        return audio_data
    
    def split_into_chunks(self, audio_data):
        """
        Split audio data into fixed-length chunks for processing.
        
        Args:
            audio_data (numpy.ndarray): Input audio data
            
        Returns:
            list: List of audio chunks
        """
        chunks = []
        total_samples = len(audio_data)
        
        for i in range(0, total_samples, self.chunk_samples):
            chunk = audio_data[i:i + self.chunk_samples]
            if len(chunk) == self.chunk_samples:  # Only include complete chunks
                chunks.append(chunk)
                
        logger.info(f"Split audio into {len(chunks)} chunks of {self.chunk_duration}s each")
        return chunks
    
    def reconstruct_from_chunks(self, processed_chunks):
        """
        Reconstruct full audio from processed chunks.
        
        Args:
            processed_chunks (list): List of processed audio chunks
            
        Returns:
            numpy.ndarray: Reconstructed audio data
        """
        if not processed_chunks:
            raise ValueError("No chunks provided for reconstruction")
            
        reconstructed = np.concatenate(processed_chunks)
        logger.info(f"Reconstructed audio from {len(processed_chunks)} chunks")
        
        return reconstructed
    
    def save_audio(self, audio_data, output_path, sample_rate=None):
        """
        Save processed audio to file.
        
        Args:
            audio_data (numpy.ndarray): Audio data to save
            output_path (str): Output file path
            sample_rate (int): Sample rate (uses default if None)
        """
        try:
            if sample_rate is None:
                sample_rate = self.target_sr
                
            # Ensure audio is in valid range
            audio_data = np.clip(audio_data, -1.0, 1.0)
            
            # Save as WAV file
            sf.write(output_path, audio_data, sample_rate)
            logger.info(f"Audio saved successfully to: {output_path}")
            
        except Exception as e:
            logger.error(f"Failed to save audio: {str(e)}")
            raise Exception(f"Audio saving failed: {str(e)}")
    
    def get_audio_info(self, file_path):
        """
        Get information about an audio file.
        
        Args:
            file_path (str): Path to audio file
            
        Returns:
            dict: Audio file information
        """
        try:
            audio_segment = AudioSegment.from_file(file_path)
            
            return {
                'duration': len(audio_segment) / 1000.0,  # Convert to seconds
                'channels': audio_segment.channels,
                'sample_rate': audio_segment.frame_rate,
                'format': file_path.split('.')[-1].upper(),
                'file_size': os.path.getsize(file_path)
            }
            
        except Exception as e:
            logger.error(f"Failed to get audio info: {str(e)}")
            raise Exception(f"Failed to analyze audio file: {str(e)}")
