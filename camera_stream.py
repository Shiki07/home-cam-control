
#!/usr/bin/env python3
"""
Simple MJPEG streaming server for Raspberry Pi Camera Module
This script captures video from the Pi camera and serves it over HTTP
so the React app can display the real camera feed.
"""

import io
import logging
import socketserver
from http import server
from threading import Condition
from picamera2 import Picamera2
from picamera2.encoders import MJPEGEncoder
from picamera2.outputs import FileOutput
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StreamingOutput(io.BufferedIOBase):
    def __init__(self):
        self.frame = None
        self.condition = Condition()

    def write(self, buf):
        with self.condition:
            self.frame = buf
            self.condition.notify_all()

class StreamingHandler(server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_HEAD(self):
        """Handle HEAD requests for connection testing"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        if self.path == '/health':
            self.send_header('Content-Type', 'application/json')
        elif self.path == '/stream.mjpg':
            self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=FRAME')
        else:
            self.send_header('Content-Type', 'text/html')
        
        self.end_headers()

    def do_GET(self):
        # Send CORS headers for all GET requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        if self.path == '/':
            self.send_response(301)
            self.send_header('Location', '/stream.mjpg')
            self.end_headers()
        elif self.path == '/stream.mjpg':
            self.send_header('Age', 0)
            self.send_header('Cache-Control', 'no-cache, private')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=FRAME')
            self.end_headers()
            try:
                while True:
                    with output.condition:
                        output.condition.wait()
                        frame = output.frame
                    self.wfile.write(b'--FRAME\r\n')
                    self.send_header('Content-Type', 'image/jpeg')
                    self.send_header('Content-Length', len(frame))
                    self.end_headers()
                    self.wfile.write(frame)
                    self.wfile.write(b'\r\n')
            except Exception as e:
                logger.warning('Removed streaming client %s: %s', self.client_address, str(e))
        elif self.path == '/health':
            # Health check endpoint
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "ok", "camera": "active"}')
        else:
            self.send_error(404)
            self.end_headers()

    def log_message(self, format, *args):
        """Override to reduce log spam"""
        if not self.path.endswith('/stream.mjpg'):
            logger.info("%s - - [%s] %s\n" %
                       (self.address_string(),
                        self.log_date_time_string(),
                        format%args))

class StreamingServer(socketserver.ThreadingMixIn, server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True

# Initialize camera
picam2 = Picamera2()
picam2.configure(picam2.create_video_configuration(main={"size": (640, 480)}))
output = StreamingOutput()
encoder = MJPEGEncoder(10000000)  # 10Mbps bitrate

try:
    logger.info("Starting camera...")
    picam2.start_recording(encoder, FileOutput(output))
    
    logger.info("Starting streaming server on port 8000...")
    address = ('', 8000)
    server = StreamingServer(address, StreamingHandler)
    
    logger.info("Stream available at http://your-pi-ip:8000/stream.mjpg")
    logger.info("Health check at http://your-pi-ip:8000/health")
    logger.info("Press Ctrl+C to stop")
    
    server.serve_forever()
    
except KeyboardInterrupt:
    logger.info("Stopping stream...")
finally:
    picam2.stop_recording()
    logger.info("Camera stopped")
