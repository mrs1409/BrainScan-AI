import requests
import os
from pathlib import Path

# Test the backend server
BASE_URL = "http://localhost:5001"

def test_health():
    """Test the health endpoint"""
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"Health check status: {response.status_code}")
    if response.ok:
        print(f"Health check response: {response.json()}")
    else:
        print(f"Health check failed: {response.text}")

def test_test_endpoint():
    """Test the test endpoint"""
    response = requests.get(f"{BASE_URL}/api/test")
    print(f"Test endpoint status: {response.status_code}")
    if response.ok:
        print(f"Test endpoint response: {response.json()}")
    else:
        print(f"Test endpoint failed: {response.text}")

def test_uploads_endpoint():
    """Test the uploads endpoint"""
    response = requests.get(f"{BASE_URL}/api/debug/uploads")
    print(f"Uploads endpoint status: {response.status_code}")
    if response.ok:
        print(f"Uploads endpoint response: {response.json()}")
    else:
        print(f"Uploads endpoint failed: {response.text}")

def test_predict_endpoint():
    """Test the predict endpoint with a sample image"""
    # Create a valid test image
    from PIL import Image
    import numpy as np

    # Create a 128x128 grayscale-like image (all channels same value)
    # This will pass the is_mri_like check
    img_array = np.ones((128, 128, 3), dtype=np.uint8) * 128
    img = Image.fromarray(img_array)
    sample_image_path = 'test_mri.jpg'
    img.save(sample_image_path)
    print(f"Created test MRI-like image: {sample_image_path}")

    # Send the image to the predict endpoint
    with open(sample_image_path, 'rb') as f:
        files = {'image': (os.path.basename(sample_image_path), f, 'image/jpeg')}
        response = requests.post(f"{BASE_URL}/predict", files=files)

    print(f"Predict endpoint status: {response.status_code}")
    if response.ok:
        print(f"Predict endpoint response: {response.json()}")
    else:
        print(f"Predict endpoint failed: {response.text}")

if __name__ == "__main__":
    print("Testing backend server...")
    test_health()
    print("\n")
    test_test_endpoint()
    print("\n")
    test_uploads_endpoint()
    print("\n")
    test_predict_endpoint()
