from flask import Blueprint, request, jsonify, send_file
import os
import uuid
import threading
import time
import cv2
import tempfile
import shutil
from roboflow import Roboflow

ocr_bp = Blueprint('ocr', __name__)

processing_threads = {}
cancel_flags = {}


# Get path to the project root (i.e., "backend/")
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))

# Define static folders relative to backend/ not app/
UPLOAD_DIR = os.path.join(PROJECT_ROOT, "static", "uploads")
FRAME_DIR = os.path.join(PROJECT_ROOT, "static", "frames")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(FRAME_DIR, exist_ok=True)

# Read API key from .env
ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")

rf = Roboflow(api_key=ROBOFLOW_API_KEY)
model = rf.workspace().project("cattle-ocr").version(1).model


@ocr_bp.route('/ocr/upload', methods=['POST'])
def upload_video():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']
        video_id = str(uuid.uuid4())
        input_path = os.path.join(UPLOAD_DIR, f"{video_id}.mp4")
        file.save(input_path)

        # Set up cancellation flag
        cancel_flags[video_id] = False

        # Start background processing with cancellation support
        thread = threading.Thread(target=process_video_frames, args=(input_path, video_id))
        thread.start()
        processing_threads[video_id] = thread

        return jsonify({"video_id": video_id})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ocr_bp.route('/ocr/cancel/<video_id>', methods=['POST'])
def cancel_processing(video_id):
    if video_id in cancel_flags:
        cancel_flags[video_id] = True
        return jsonify({"status": "cancelled"}), 200
    return jsonify({"error": "No active processing found"}), 404

@ocr_bp.route('/ocr/frame/<video_id>/<int:frame_number>', methods=['GET'])
def get_frame(video_id, frame_number):
    frame_path = os.path.join(FRAME_DIR, video_id, f"{frame_number}.jpg")

    wait_time = 0
    max_wait = 10

    # Wait up to 10 seconds for frame to appear
    while not os.path.exists(frame_path) and wait_time < max_wait:
        time.sleep(0.5)
        wait_time += 0.5

    if not os.path.exists(frame_path):
        print(f"⚠️ Frame {frame_number} not ready after {max_wait}s.")
        return jsonify({"status": "processing"}), 202

    try:
        print(f"✅ Frame {frame_number} ready after waiting {wait_time}s.")
        return send_file(frame_path, mimetype='image/jpeg')
    except Exception as e:
        print(f"❌ Failed to send frame {frame_number}: {e}")
        return jsonify({"error": "internal server error"}), 500


def process_video_frames(video_path, video_id):
    frame_dir = os.path.join(FRAME_DIR, video_id)
    os.makedirs(frame_dir, exist_ok=True)
    cap = cv2.VideoCapture(video_path)
    frame_count = 0

    try:
        while cap.isOpened():
            if cancel_flags.get(video_id):
                print(f"❌ Video processing for {video_id} was cancelled.")
                break

            ret, frame = cap.read()
            if not ret:
                break

            temp_path = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False).name
            cv2.imwrite(temp_path, frame)

            try:
                result = model.predict(temp_path).json()
                for pred in result['predictions']:
                    x, y, width, height = int(pred['x']), int(pred['y']), int(pred['width']), int(pred['height'])
                    tag = pred['class']
                    cv2.rectangle(frame, (x - width // 2, y - height // 2), (x + width // 2, y + height // 2), (0, 255, 0), 2)
                    cv2.putText(frame, tag, (x - width // 2, y - height // 2 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
            except Exception as e:
                print(f"Error processing frame {frame_count}:", e)
            finally:
                os.remove(temp_path)

            save_path = os.path.join(frame_dir, f"{frame_count}.jpg")
            cv2.imwrite(save_path, frame)
            frame_count += 1

    finally:
        cap.release()
        cleanup_video(video_id, video_path, frame_dir)



def cleanup_video(video_id, video_path, frame_dir):
    try:
        # Delete uploaded video
        if os.path.exists(video_path):
            os.remove(video_path)

        # Delete frames directory
        if os.path.exists(frame_dir):
            shutil.rmtree(frame_dir)

        # Clean up flags
        cancel_flags.pop(video_id, None)
        processing_threads.pop(video_id, None)

        print(f"🧹 Cleaned up resources for video_id: {video_id}")
    except Exception as e:
        print(f"⚠️ Cleanup failed for {video_id}: {e}")