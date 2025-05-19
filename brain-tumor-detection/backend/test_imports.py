# Test script to verify all dependencies are correctly installed
import flask
import flask_cors
import torch
import torchvision
import numpy as np
import PIL

print("Flask version:", flask.__version__)
print("Flask-CORS version:", flask_cors.__version__)
print("PyTorch version:", torch.__version__)
print("Torchvision version:", torchvision.__version__)
print("NumPy version:", np.__version__)
print("PIL version:", PIL.__version__)
print("CUDA available:", torch.cuda.is_available())

print("\nAll imports successful!")
