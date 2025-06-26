
#!/usr/bin/env python3
"""
Test script to verify picamera2 installation and camera functionality
"""

import sys

def test_picamera2_import():
    """Test if picamera2 can be imported"""
    try:
        from picamera2 import Picamera2
        print("✓ picamera2 imported successfully")
        return True
    except ImportError as e:
        print(f"✗ Failed to import picamera2: {e}")
        return False

def test_camera_detection():
    """Test if camera is detected"""
    try:
        from picamera2 import Picamera2
        picam2 = Picamera2()
        print("✓ Camera detected and initialized")
        picam2.close()
        return True
    except Exception as e:
        print(f"✗ Camera detection failed: {e}")
        return False

def main():
    print("Testing Pi Camera setup...")
    print("-" * 30)
    
    # Test import
    import_ok = test_picamera2_import()
    
    if import_ok:
        # Test camera detection
        camera_ok = test_camera_detection()
        
        if camera_ok:
            print("\n✓ All tests passed! Camera is ready to use.")
            print("You can now run: python3 camera_stream.py")
        else:
            print("\n✗ Camera detection failed. Check camera connection and enable camera in raspi-config.")
    else:
        print("\n✗ picamera2 not installed. Run the setup script: ./setup_camera.sh")
        print("\nAlternative installation commands:")
        print("sudo apt install python3-picamera2")
        print("pip3 install picamera2 --break-system-packages")

if __name__ == "__main__":
    main()
