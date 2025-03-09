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
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
        file.save(file_path)

        return jsonify({"message": "File uploaded successfully", "file_path": file_path}), 200

    return jsonify({"error": "Invalid file type"}), 400

# Process Video with ML Model API
@video_bp.route("/process", methods=["POST"])
def process():
    data = request.get_json()
    video_name = data.get("video_name")
    video_path = os.path.join(Config.UPLOAD_FOLDER, video_name)
    mask_name = data.get("mask_name")
    mask_path = os.path.join(Config.UPLOAD_FOLDER, mask_name)
    model_name = data.get("model_name", "parking_detector")  # Default to "parking_detector"
    print(video_name)
    print(mask_name)

    if not video_path:
        return jsonify({"error": "No video path provided"}), 400

    # Process the video using the selected model
    try:
        processed_video_path = process_video(video_path, mask_path, model_name)
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
