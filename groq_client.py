import requests
import logging
import json
from datetime import datetime

logger = logging.getLogger(__name__)

class GroqReporter:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.groq.com/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def send_report(self, report_data):
        """Send a report to Groq Cloud"""
        try:
            # Create a detailed prompt for the report
            prompt = f"""
            Generate a professional audio processing report based on the following data:
            
            Session ID: {report_data.get('session_id', 'N/A')}
            Filename: {report_data.get('filename', 'N/A')}
            Duration: {report_data.get('duration', 'N/A')}
            Processing: {report_data.get('processing', 'N/A')}
            Status: {report_data.get('status', 'N/A')}
            Timestamp: {report_data.get('timestamp', 'N/A')}
            
            Please provide:
            1. A summary of the processing results
            2. Technical analysis of the audio enhancement
            3. Quality metrics and improvements
            4. Recommendations for further processing if needed
            
            Format the response as a professional technical report.
            """
            
            payload = {
                "model": "llama2-70b-4096",
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 1000
            }
            
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                report_content = result["choices"][0]["message"]["content"]
                
                # Log the successful report
                logger.info(f"Groq report sent successfully for session {report_data.get('session_id')}")
                
                return {
                    "success": True,
                    "report": report_content,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                logger.error(f"Groq API error: {response.status_code} - {response.text}")
                return {
                    "success": False,
                    "error": f"API Error: {response.status_code}"
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error sending Groq report: {str(e)}")
            return {
                "success": False,
                "error": f"Network Error: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Error sending Groq report: {str(e)}")
            return {
                "success": False,
                "error": f"General Error: {str(e)}"
            }
    
    def validate_api_key(self):
        """Validate the API key by making a simple request"""
        try:
            payload = {
                "model": "llama2-70b-4096",
                "messages": [
                    {
                        "role": "user",
                        "content": "Hello"
                    }
                ],
                "max_tokens": 10
            }
            
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=payload,
                timeout=10
            )
            
            return response.status_code == 200
            
        except Exception as e:
            logger.error(f"API key validation failed: {str(e)}")
            return False