# app/config.py
import os

SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_default_secret_key'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MASK_IMAGE_PATH = os.path.join(BASE_DIR, '..', 'data', 'mask.png')
MODEL_PATH = os.path.join(BASE_DIR, 'model_normalized_30_30.keras')
TEMP_VIDEO_PATH = os.path.join(BASE_DIR, 'temp_video.mp4')