from flask import Flask, render_template, request, jsonify
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image, ImageStat
import os
import webbrowser
import threading
import io
from flask_cors import CORS
import logging

# Setup logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = Flask(__name__)
# Enable CORS for all routes
CORS(app, resources={r"/api/*": {"origins": "*"}})

UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# CNN Model Definition (should match training model)
class CNNModel(nn.Module):
    def __init__(self):
        super(CNNModel, self).__init__()
        self.cnv1 = nn.Conv2d(3, 16, 5)
        self.maxpool1 = nn.MaxPool2d(2)
        self.cnv2 = nn.Conv2d(16, 32, 5)
        self.maxpool2 = nn.MaxPool2d(2)
        self.cnv3 = nn.Conv2d(32, 64, 5)
        self.maxpool3 = nn.MaxPool2d(2)
        self.cnv4 = nn.Conv2d(64, 128, 5)
        self.maxpool4 = nn.MaxPool2d(2)
        self.leakyRelu = nn.LeakyReLU()
        self.fc1 = nn.Linear(128 * 4 * 4, 1024)
        self.fc2 = nn.Linear(1024, 2)

    def forward(self, x):
        x = self.leakyRelu(self.maxpool1(self.cnv1(x)))
        x = self.leakyRelu(self.maxpool2(self.cnv2(x)))
        x = self.leakyRelu(self.maxpool3(self.cnv3(x)))
        x = self.leakyRelu(self.maxpool4(self.cnv4(x)))
        x = x.view(x.size(0), -1)
        x = self.leakyRelu(self.fc1(x))
        x = self.fc2(x)
        return x

# Load Trained Model
model = CNNModel()
try:
    model.load_state_dict(torch.load("model/model.pth", map_location=torch.device('cpu')))
    model.eval()
    print("Model loaded successfully")
except Exception as e:
    print(f"Failed to load model: {e}")

# Image Transformations
transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

class_names = ['No Tumor', 'Tumor']

# MRI Check Function

def is_mri_like(img):
    stat = ImageStat.Stat(img)
    if img.mode != 'RGB':
        return False
    r_std, g_std, b_std = stat.stddev
    grayscale_diff = abs(r_std - g_std) + abs(g_std - b_std)
    return grayscale_diff <= 10

# Home Route
@app.route('/')
def home():
    return render_template('index.html')

# Original Prediction Route (keeping for compatibility)
@app.route('/predict', methods=['POST'])
def predict():
    try:
        file = request.files['image']
        if not file:
            return jsonify({"success": False, "error": "No file uploaded"})

        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)
        logging.info(f"Uploaded file saved to: {filepath}")

        # Load and validate the image
        img = Image.open(filepath).convert('RGB')

        if img.size[0] < 50 or img.size[1] < 50:
            return jsonify({"success": False, "error": "Uploaded image is too small or invalid."})

        if not is_mri_like(img):
            return jsonify({"success": False, "error": "Uploaded image is not a valid brain MRI scan."})

        img_tensor = transform(img).unsqueeze(0)

        if img_tensor.shape[1:] != torch.Size([3, 128, 128]):
            return jsonify({"success": False, "error": "Uploaded image format not supported."})

        with torch.no_grad():
            output = model(img_tensor)
            _, pred = torch.max(output, 1)
            prediction = class_names[pred.item()]

        confidence = torch.nn.functional.softmax(output, dim=1)[0][pred.item()].item()
        if confidence < 0.5:
            return jsonify({"success": False, "error": "Image is unclear or invalid. Please upload a valid brain MRI."})

        return jsonify({"success": True, "prediction": prediction})

    except Exception as e:
        logging.error(f"Prediction failed: {e}")
        return jsonify({"success": False, "error": "An error occurred. Please upload a valid brain MRI image."})

# API Endpoint for React Frontend
@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    logging.info("Received POST request for /api/analyze")

    try:
        if 'image' not in request.files:
            logging.warning("No image in request")
            return jsonify({'error': 'No image provided'}), 400

        file = request.files['image']
        if file.filename == '':
            logging.warning("Empty filename")
            return jsonify({'error': 'No image selected'}), 400

        # Read image data
        image_data = file.read()
        logging.info(f"Read image data, size: {len(image_data)} bytes")

        # Save the file temporarily
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        with open(filepath, 'wb') as f:
            f.write(image_data)

        # Load and validate the image
        img = Image.open(filepath).convert('RGB')

        if img.size[0] < 50 or img.size[1] < 50:
            return jsonify({"error": "Uploaded image is too small or invalid."}), 400

        if not is_mri_like(img):
            return jsonify({"error": "Uploaded image is not a valid brain MRI scan."}), 400

        # Process the image
        img_tensor = transform(img).unsqueeze(0)

        if img_tensor.shape[1:] != torch.Size([3, 128, 128]):
            return jsonify({"error": "Uploaded image format not supported."}), 400

        # Make prediction
        with torch.no_grad():
            output = model(img_tensor)
            _, pred = torch.max(output, 1)
            prediction = class_names[pred.item()]

        # Calculate confidence
        confidence = torch.nn.functional.softmax(output, dim=1)[0][pred.item()].item()

        if confidence < 0.5:
            return jsonify({"error": "Image is unclear or invalid. Please upload a valid brain MRI."}), 400

        # Format response to match what frontend expects
        if prediction == "No Tumor":
            result = {
                'hasTumor': False,
                'confidence': confidence
            }
        else:
            result = {
                'hasTumor': True,
                'confidence': confidence,
                'tumorType': 'Glioblastoma'  # Default type since your model only detects tumor/no tumor
            }

        logging.info(f"Returning result: {result}")
        return jsonify(result)

    except Exception as e:
        logging.error(f"Error processing image: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

# Health check endpoint for the frontend
@app.route('/api/health', methods=['GET'])
def health_check():
    logging.info("Received health check request")
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

# Auto-open browser (optional, can be commented out)
def open_browser():
    webbrowser.open_new('http://127.0.0.1:5000')

if __name__ == "__main__":
    # Comment out the next line if you don't want the browser to open automatically
    # threading.Timer(1.5, open_browser).start()

    # Run the Flask app on all network interfaces (0.0.0.0) so it's accessible from other machines
    logging.info("Starting Flask server on http://0.0.0.0:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
