from flask import Flask, request, jsonify
import os
from models.ml_model_loader import model
from utils.video_processor import process_video
from config import TEMP_VIDEO_PATH

app = Flask(__name__)

@app.route('/predict_parking', methods=['POST'])
def predict():
    """Handles video file uploads and returns parking occupancy results."""
    if 'video' not in request.files:
        return jsonify({"error": "No video file provided"}), 400

    video_file = request.files['video']
    video_file.save(TEMP_VIDEO_PATH)

    results = process_video(TEMP_VIDEO_PATH, model)

    return jsonify({"frames_processed": len(results), "status": "success"})

if __name__ == '__main__':
    app.run(debug=True)
