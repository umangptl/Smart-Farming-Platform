import os

class Config:
    UPLOAD_FOLDER = os.path.join(os.getcwd(), "app/uploads")
    STATIC_FOLDER = os.path.join(os.getcwd(), "app/static")
    IMAGE_MODELS = {
        'parking_detector': os.path.join(os.getcwd(), "app/ai_models/model_normalized_30_30.keras")
    } 
    ALLOWED_EXTENSIONS = {"mp4", "avi", "mov"}
    