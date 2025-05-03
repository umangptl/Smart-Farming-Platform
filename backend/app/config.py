import os
from datetime import timedelta


class Config:
    UPLOAD_FOLDER = os.path.join(os.getcwd(), "app/uploads")
    SECRET_KEY = "smartlivestockplatform"
    JWT_SECRET_KEY = "smartlivestockplatform"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    RESULT_FOLDER = os.path.join(os.getcwd(), "app/results")
    IMAGE_MODELS = {
        'parking_detector': {
            'type':'local',
            'local_path': os.path.join(os.getcwd(), "app/ai_models/model_normalized_30_30.keras")
        },
        'animal_detector': {
            'type': 'yolo',
            'model_name': 'yolov8n.pt'
        }
    } 
    ALLOWED_EXTENSIONS = {"mp4", "avi", "mov"}
    