
#!/bin/bash
# Setup script for Raspberry Pi camera streaming

echo "Setting up Raspberry Pi camera streaming..."

# Update package list
echo "Updating package list..."
sudo apt update

# Install required system packages
echo "Installing required system packages..."
sudo apt install -y python3-pip python3-picamera2 python3-numpy python3-libcamera python3-kms++

# Install picamera2 via pip as well (in case the apt version has issues)
echo "Installing picamera2 via pip..."
pip3 install picamera2 --break-system-packages

# Alternative installation method if the above fails
echo "Installing additional dependencies..."
sudo apt install -y libcamera-apps-lite

# Make the camera script executable
chmod +x camera_stream.py

echo "Setup complete!"
echo ""
echo "To test if picamera2 is installed correctly, run:"
echo "python3 -c 'import picamera2; print(\"picamera2 installed successfully\")'"
echo ""
echo "To start the camera stream, run: python3 camera_stream.py"
echo "The stream will be available at http://your-pi-ip:8000/stream.mjpg"
