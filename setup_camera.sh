
#!/bin/bash
# Setup script for Raspberry Pi camera streaming

echo "Setting up Raspberry Pi camera streaming..."

# Update package list
sudo apt update

# Install required packages
echo "Installing required packages..."
sudo apt install -y python3-pip python3-picamera2 python3-numpy

# Install additional Python packages if needed
pip3 install --upgrade pip

# Make the camera script executable
chmod +x camera_stream.py

echo "Setup complete!"
echo "To start the camera stream, run: python3 camera_stream.py"
echo "The stream will be available at http://your-pi-ip:8000/stream.mjpg"
