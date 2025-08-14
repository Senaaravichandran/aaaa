import requests
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class GroqReporter:
    def __init__(self, api_key):
        """
        Initialize Groq reporter for sending processing reports.
        
        Args:
            api_key (str): Groq Cloud API key
        """
        self.api_key = api_key
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
    def send_report(self, report_data):
        """
        Send processing report to Groq Cloud.
        
        Args:
            report_data (dict): Report data containing processing information
            
        Returns:
            dict: Response from Groq API
        """
        try:
            logger.info("Sending report to Groq Cloud...")
            
            # Format report message
            report_message = self._format_report_message(report_data)
            
            # Prepare request payload
            payload = {
                "model": "llama-3.1-70b-versatile",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a professional audio processing system reporter. Acknowledge the completion of audio denoising tasks and provide a brief summary."
                    },
                    {
                        "role": "user",
                        "content": f"Please acknowledge this audio denoising report: {report_message}"
                    }
                ],
                "max_tokens": 150,
                "temperature": 0.1
            }
            
            # Send request to Groq API
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info("Report sent successfully to Groq Cloud")
                
                return {
                    'success': True,
                    'id': result.get('id', 'N/A'),
                    'response': result.get('choices', [{}])[0].get('message', {}).get('content', ''),
                    'timestamp': datetime.now().isoformat()
                }
            else:
                logger.error(f"Groq API error: {response.status_code} - {response.text}")
                raise Exception(f"Groq API request failed: {response.status_code}")
                
        except requests.exceptions.Timeout:
            logger.error("Groq API request timed out")
            raise Exception("Groq API request timed out")
        except requests.exceptions.ConnectionError:
            logger.error("Failed to connect to Groq API")
            raise Exception("Failed to connect to Groq API")
        except Exception as e:
            logger.error(f"Groq report failed: {str(e)}")
            raise Exception(f"Failed to send report to Groq: {str(e)}")
    
    def _format_report_message(self, report_data):
        """
        Format report data into a readable message.
        
        Args:
            report_data (dict): Report data
            
        Returns:
            str: Formatted report message
        """
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        message = f"""
        Audio Denoising Process Report
        ==============================
        Timestamp: {timestamp}
        Session ID: {report_data.get('session_id', 'N/A')}
        
        Processing Steps:
        1. Preprocessing: {report_data.get('preprocessing', 'Unknown')}
        2. ML Inference: {report_data.get('ml_inference', 'Unknown')}
        3. Post-processing: {report_data.get('postprocessing', 'Unknown')}
        
        Overall Status: {report_data.get('status', 'Unknown')}
        
        The audio denoising system has completed processing using advanced spectral subtraction
        and Wiener filtering techniques for professional-grade noise reduction.
        """
        
        return message.strip()
    
    def validate_api_key(self):
        """
        Validate the Groq API key by making a test request.
        
        Returns:
            bool: True if API key is valid, False otherwise
        """
        try:
            test_payload = {
                "model": "mixtral-8x7b-32768",
                "messages": [
                    {
                        "role": "user",
                        "content": "Test connection"
                    }
                ],
                "max_tokens": 10
            }
            
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=test_payload,
                timeout=10
            )
            
            return response.status_code == 200
            
        except Exception as e:
            logger.error(f"API key validation failed: {str(e)}")
            return False
