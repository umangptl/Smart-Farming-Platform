from flask import Blueprint, request, jsonify, send_from_directory
import os
from werkzeug.utils import secure_filename
from app.config import Config
from app.services.video_processor import process_video

video_bp = Blueprint("videos", __name__)

# Allowed extensions
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in Config.ALLOWED_EXTENSIONS

# Upload Video API
@video_bp.route("/upload", methods=["POST"])
def upload_video():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # if not allowed_file(file.filename):
    #     return jsonify({"error": "Invalid file type"}), 400
        
    filename = secure_filename(file.filename)
    input_video_path = os.path.join(Config.UPLOAD_FOLDER, filename)
    file.save(input_video_path)

    return jsonify({"message": "File uploaded successfully", "file_path": input_video_path}), 200

# Process Video with ML Model API
@video_bp.route("/process", methods=["POST"])
def process():
    data = request.get_json()
    video_name = data.get("video_name")
    mask_name = data.get("mask_name")
    model_name = data.get("model_name")  # Default to "parking_detector"
    
    if not video_name:
        return jsonify({"error": "No video name provided"}), 400
    
    if not model_name:
        return jsonify({"error": "No model name provided"}), 400
    
    video_path = os.path.join(Config.UPLOAD_FOLDER, video_name)
    mask_path = None if mask_name == None else os.path.join(Config.UPLOAD_FOLDER, mask_name)

    # Process the video using the selected model
    try:
        processed_video_path = process_video(model_name, video_path, mask_path)
        return jsonify({
            "message": "Processing complete",
            "video_url": f"/api/videos/processed/{os.path.basename(processed_video_path)}",
            "model_used": model_name
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

# Serve Processed Video
@video_bp.route("/processed/<filename>", methods=["GET"])
def get_processed_video(filename):
    return send_from_directory(Config.STATIC_FOLDER, filename)
