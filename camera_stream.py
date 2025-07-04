
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
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Max-Age', '86400')
        self.end_headers()

    def do_HEAD(self):
        """Handle HEAD requests for connection testing"""
        logger.info(f"HEAD request to {self.path}")
        
        if self.path == '/' or self.path == '':
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
        elif self.path == '/health':
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', '32')
            self.end_headers()
        elif self.path == '/stream.mjpg':
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=FRAME')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            self.end_headers()
        else:
            self.send_response(404)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

    def do_GET(self):
        logger.info(f"GET request to {self.path} from {self.client_address}")
        
        if self.path == '/' or self.path == '':
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(b'<html><body><h1>Pi Camera Server</h1><p>Stream: <a href="/stream.mjpg">/stream.mjpg</a></p><p>Health: <a href="/health">/health</a></p></body></html>')
        elif self.path == '/stream.mjpg':
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=FRAME')
            self.end_headers()
            try:
                logger.info(f"Starting MJPEG stream for {self.client_address}")
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
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            health_status = {
                "status": "ok", 
                "camera": "active",
                "timestamp": int(time.time()),
                "server": "pi-camera-stream"
            }
            import json
            self.wfile.write(json.dumps(health_status).encode())
        else:
            self.send_response(404)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b'404 - Not Found')

    def log_message(self, format, *args):
        """Override to reduce log spam but keep important info"""
        # Check if path exists before accessing it to avoid AttributeError
        if not hasattr(self, 'path') or not self.path.endswith('/stream.mjpg') or 'Starting MJPEG stream' in str(args):
            logger.info("%s - - [%s] %s" %
                       (self.address_string(),
                        self.log_date_time_string(),
                        format % args))

class StreamingServer(socketserver.ThreadingMixIn, server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True

# Initialize camera
try:
    picam2 = Picamera2()
    picam2.configure(picam2.create_video_configuration(main={"size": (640, 480)}))
    output = StreamingOutput()
    encoder = MJPEGEncoder(10000000)  # 10Mbps bitrate

    logger.info("Starting camera...")
    picam2.start_recording(encoder, FileOutput(output))
    
    logger.info("Starting streaming server on port 8000...")
    address = ('', 8000)
    server = StreamingServer(address, StreamingHandler)
    
    logger.info("Stream available at http://your-pi-ip:8000/stream.mjpg")
    logger.info("Health check at http://your-pi-ip:8000/health")
    logger.info("CORS enabled for web app access")
    logger.info("Press Ctrl+C to stop")
    
    server.serve_forever()
    
except KeyboardInterrupt:
    logger.info("Stopping stream...")
except Exception as e:
    logger.error(f"Failed to start camera server: {e}")
finally:
    try:
        picam2.stop_recording()
        logger.info("Camera stopped")
    except:
        pass
