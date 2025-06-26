
# Raspberry Pi Camera Setup

This setup allows your React app to display real camera feed from your Raspberry Pi Zero.

## Prerequisites

1. Raspberry Pi Zero W with camera module connected
2. Camera module enabled in raspi-config
3. Python 3 installed (usually pre-installed)

## Setup Steps

1. **Enable the camera module:**
   ```bash
   sudo raspi-config
   # Navigate to: Interface Options → Camera → Enable
   # Reboot when prompted
   ```

2. **Run the setup script:**
   ```bash
   chmod +x setup_camera.sh
   ./setup_camera.sh
   ```

3. **Start the camera stream:**
   ```bash
   python3 camera_stream.py
   ```

4. **Access the stream:**
   - Direct MJPEG stream: `http://your-pi-ip:8000/stream.mjpg`
   - Test in browser: `http://your-pi-ip:8000`

## Integration with React App

To integrate this with your React app, you'll need to modify the CameraFeed component to use the real stream URL instead of the simulated feed.

Replace the simulated camera display with:
```jsx
<img 
  src="http://your-pi-ip:8000/stream.mjpg" 
  alt="Pi Camera Feed"
  className="w-full h-full object-cover"
/>
```

## Troubleshooting

- **Camera not detected:** Check cable connections and ensure camera is enabled
- **Permission denied:** Make sure the script is executable (`chmod +x camera_stream.py`)
- **Port already in use:** Change the port number in the script (default is 8000)
- **Network issues:** Ensure your Pi is connected to WiFi and firewall allows port 8000

## Auto-start on Boot (Optional)

To automatically start the camera stream on boot:

1. Create a systemd service:
   ```bash
   sudo nano /etc/systemd/system/camera-stream.service
   ```

2. Add this content:
   ```ini
   [Unit]
   Description=Pi Camera Stream
   After=network.target

   [Service]
   Type=simple
   User=pi
   WorkingDirectory=/home/pi/your-project-directory
   ExecStart=/usr/bin/python3 /home/pi/your-project-directory/camera_stream.py
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

3. Enable and start the service:
   ```bash
   sudo systemctl enable camera-stream.service
   sudo systemctl start camera-stream.service
   ```
