import requests
import logging

logger = logging.getLogger(__name__)

class GroqReporter:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.groq.com/v1/chat/completions"
        
    def send_report(self, report_data):
        """Send processing report to Groq API"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            prompt = f"""Generate a professional audio processing report based on the following data:
            
            Session ID: {report_data.get('session_id', 'N/A')}
            Filename: {report_data.get('filename', 'N/A')}
            Duration: {report_data.get('duration', 'N/A')}
            Processing: {report_data.get('processing', 'N/A')}
            Status: {report_data.get('status', 'N/A')}
            Timestamp: {report_data.get('timestamp', 'N/A')}
            
            Please provide a detailed analysis of the audio processing results, including:
            1. Processing summary
            2. Quality improvements achieved
            3. Technical specifications
            4. Recommendations for further enhancement
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
                "max_tokens": 500
            }
            
            response = requests.post(self.base_url, headers=headers, json=payload)
            
            if response.status_code == 200:
                result = response.json()
                logger.info("Groq report sent successfully")
                return result
            else:
                logger.error(f"Failed to send Groq report: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error sending Groq report: {str(e)}")
            return None