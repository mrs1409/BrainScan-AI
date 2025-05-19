from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image, ImageStat
import os
import logging
import datetime

# ―――――――――――――――――――――――――――――――
# 1) MODEL ARCHITECTURE (must match training!)
# ―――――――――――――――――――――――――――――――
class CNNModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.cnv1 = nn.Conv2d(3, 16, 5)
        self.pool = nn.MaxPool2d(2)
        self.cnv2 = nn.Conv2d(16, 32, 5)
        self.cnv3 = nn.Conv2d(32, 64, 5)
        self.cnv4 = nn.Conv2d(64, 128, 5)
        self.leaky = nn.LeakyReLU()
        self.fc1 = nn.Linear(128 * 4 * 4, 1024)
        self.fc2 = nn.Linear(1024, 2)

    def forward(self, x):
        x = self.leaky(self.pool(self.cnv1(x)))
        x = self.leaky(self.pool(self.cnv2(x)))
        x = self.leaky(self.pool(self.cnv3(x)))
        x = self.leaky(self.pool(self.cnv4(x)))
        x = x.view(x.size(0), -1)
        x = self.leaky(self.fc1(x))
        return self.fc2(x)

# ―――――――――――――――――――――――――――――――
# 2) FLASK SETUP
# ―――――――――――――――――――――――――――――――
app = Flask(__name__)
# ensure uploads directory exists under project_root/static/uploads
UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

CORS(app, resources={r"/api/*": {"origins": "*"}})

# ―――――――――――――――――――――――――――――――
# 3) LOAD MODEL
# ―――――――――――――――――――――――――――――――
model = CNNModel()
model_path = os.path.join(app.root_path, "model", "model.pth")
model_ready = False

try:
    state = torch.load(model_path, map_location="cpu")
    model.load_state_dict(state)
    model.eval()
    model_ready = True
    logging.info(f"✅ Model loaded from {model_path}")
except Exception as e:
    logging.error(f"❌ Failed to load model: {e}", exc_info=True)

# ―――――――――――――――――――――――――――――――
# 4) TRANSFORMS & LABELS
# ―――――――――――――――――――――――――――――――
transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])
class_names = ["No Tumor", "Tumor"]

def is_mri_like(img: Image.Image) -> bool:
    if img.mode != "RGB":
        return False
    stat = ImageStat.Stat(img)
    r, g, b = stat.stddev
    return abs(r - g) + abs(g - b) <= 10

# ―――――――――――――――――――――――――――――――
# 5) HEALTH CHECK
# ―――――――――――――――――――――――――――――――
@app.route("/api/health", methods=["GET"])
def health():
    torch_status = {
        "version": torch.__version__,
        "cuda_available": torch.cuda.is_available()
    }
    model_status = {
        "loaded": model_ready,
        "type": type(model).__name__
    }
    return jsonify({
        "status": "healthy" if model_ready else "error",
        "model_loaded": model_ready,
        "model_status": model_status,
        "torch": torch_status,
        "upload_folder": UPLOAD_FOLDER,
        "server_time": datetime.datetime.now().isoformat()
    }), (200 if model_ready else 500)

# ―――――――――――――――――――――――――――――――
# 6) ANALYZE ENDPOINT
# ―――――――――――――――――――――――――――――――
@app.route("/api/analyze", methods=["POST"])
def analyze():
    logging.info("📥 Received image analysis request")

    if not model_ready:
        logging.error("❌ Model not loaded, cannot process request")
        return jsonify({"error": "Model not loaded"}), 500

    if "image" not in request.files:
        logging.warning("❌ No image file in request")
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]
    if not file.filename:
        logging.warning("❌ Empty filename in request")
        return jsonify({"error": "Empty filename"}), 400

    # Save with timestamp prefix
    timestamp = int(datetime.datetime.now(datetime.timezone.utc).timestamp())
    safe_name = f"{timestamp}-{file.filename}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], safe_name)
    try:
        file.save(filepath)
        logging.info(f"✅ Uploaded file saved to: static/uploads\\{safe_name}")
    except Exception as e:
        logging.error(f"❌ Save failed: {e}", exc_info=True)
        return jsonify({"error": f"Could not save file: {e}"}), 500

    # Load & validate
    try:
        logging.info(f"🔍 Loading and validating image: {safe_name}")
        img = Image.open(filepath).convert("RGB")
    except Exception as e:
        logging.error(f"❌ Invalid image: {e}")
        return jsonify({"error": f"Invalid image: {e}"}), 400

    if img.size[0] < 50 or img.size[1] < 50:
        logging.warning(f"❌ Image too small: {img.size}")
        return jsonify({"error": "Image too small"}), 400
    if not is_mri_like(img):
        logging.warning(f"❌ Not a valid MRI scan: {safe_name}")
        return jsonify({"error": "Not a valid MRI scan"}), 400

    # Preprocess + inference
    logging.info(f"🧠 Starting model prediction for: {safe_name}")
    img_t = transform(img).unsqueeze(0)
    with torch.no_grad():
        out = model(img_t)
        probs = F.softmax(out, dim=1)[0]
        pred = int(torch.argmax(probs))
        conf = float(probs[pred].item())

    result = {
        "hasTumor": pred == 1,
        "tumorType": class_names[pred] if pred == 1 else None,
        "confidence": round(conf, 3),
        "uploadedPath": f"/static/uploads/{safe_name}"
    }

    logging.info(f"✅ Analysis complete for {safe_name}: {'Tumor detected' if pred == 1 else 'No tumor'} with {round(conf * 100)}% confidence")
    return jsonify(result), 200

# ―――――――――――――――――――――――――――――――
# 7) DEBUG ENDPOINTS
# ―――――――――――――――――――――――――――――――
@app.route("/api/test", methods=["GET", "POST"])
def test_endpoint():
    logging.info("Test endpoint called")
    return jsonify({
        "success": True,
        "message": "Test endpoint working correctly",
        "method": request.method,
        "time": datetime.datetime.now().isoformat()
    })

@app.route("/api/debug/uploads", methods=["GET"])
def list_uploads():
    try:
        files = os.listdir(app.config['UPLOAD_FOLDER'])
        file_info = []
        for fn in files:
            fp = os.path.join(app.config['UPLOAD_FOLDER'], fn)
            if os.path.isfile(fp):
                file_info.append({
                    "name": fn,
                    "size": os.path.getsize(fp),
                    "created": os.path.getctime(fp)
                })
        return jsonify({
            "upload_folder": app.config['UPLOAD_FOLDER'],
            "file_count": len(file_info),
            "files": file_info
        })
    except Exception as e:
        return jsonify({"error": f"Error listing uploads: {e}"}), 500

# ―――――――――――――――――――――――――――――――
# 8) RUN
# ―――――――――――――――――――――――――――――――
if __name__ == "__main__":
    # Configure logging with more detailed format
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    logging.info("Starting server at http://0.0.0.0:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)
