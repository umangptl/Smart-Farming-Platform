import os

class Config:
    UPLOAD_FOLDER = os.path.join(os.getcwd(), "app/uploads")
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
    