import os
from datetime import timedelta
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class Config:
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    RESULT_FOLDER = os.path.join(BASE_DIR, "results")
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
    OUTPUT_DIR = "hls_streams"
    HLS_FOLDER = os.path.join(OUTPUT_DIR, "stream")
    FFMPEG_CONFIG = [
        "ffmpeg",
        "-y",
        "-f", "rawvideo",
        "-pix_fmt", "bgr24",
        "-s", "640x480",
        "-r", "20",
        "-i", "-",
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-g", "30",
        "-hls_time", "2",
        "-hls_list_size", "5",
        "-f", "hls",
        os.path.join(HLS_FOLDER, "stream.m3u8"),
    ]
    