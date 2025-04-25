from flask import Blueprint, request, jsonify, send_from_directory
import os
from werkzeug.utils import secure_filename
from app.config import Config
from app.video.processor import process_video_logic
from app.repository.video_config_repository import save_config_for_video_inference, get_config_for_video_inference
from app.inference.model_factory import build_model_from_config

video_bp = Blueprint("videos", __name__)


# Allowed extensions
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in Config.ALLOWED_EXTENSIONS

# Upload Video API
@video_bp.route("/upload", methods=["POST"])
def upload_video():
    if "video" not in request.files:
        return jsonify({"error": "Missing video file"}), 400

    video_file = request.files["video"]
    if not video_file or video_file.filename == "":
        return jsonify({"error": "Empty video filename"}), 400
    if not allowed_file(video_file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    # Save video
    filename = secure_filename(video_file.filename)
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    video_path = os.path.join(Config.UPLOAD_FOLDER, filename)
    video_file.save(video_path)

    return jsonify({"message": "Video uploaded successfully", "video_name": filename}), 200

# === Route 2: Link config to video ===
@video_bp.route("/configure", methods=["POST"])
def configure_video():
    data = request.get_json()
    video_name = data.get("video_name")
    config = data.get("config")

    if not video_name or not config:
        return jsonify({"error": "Missing video_name or config"}), 400

    try:
        save_config_for_video_inference(video_name, config)
        return jsonify({"message": f"Config saved for video '{video_name}'"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to save config: {e}"}), 500

# Process Video with ML Model API
@video_bp.route("/process", methods=["POST"])
def process():
    data = request.get_json()
    video_name = data.get("video_name")
    
    if not video_name:
        return jsonify({"error": "No video name provided"}), 400
    
    # Paths
    video_path = os.path.join(Config.UPLOAD_FOLDER, video_name)
    target_path = os.path.join(Config.RESULT_FOLDER, video_name)
    
    # Load saved config
    config = get_config_for_video_inference(video_name)
    if not config:
        return jsonify({"error": f"No config found for video '{video_name}'"}), 404
    
    try:
        # Build model and process
        model = build_model_from_config(config)
        process_video_logic(video_path, target_path, model, stride=1)
        return jsonify({
            "message": f"Video '{video_name}' processed successfully",
            "results": model.get_results()
        })
    except Exception as e:
        return jsonify({"error": f"Failed to process video: {str(e)}"}), 500
    

# Serve Processed Video
@video_bp.route("/processed/<filename>", methods=["GET"])
def get_processed_video(filename):
    return send_from_directory(Config.RESULT_FOLDER, filename)
