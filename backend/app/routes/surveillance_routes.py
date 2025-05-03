import os, time
import shutil

import cv2
import subprocess
import threading
from flask import jsonify, send_from_directory, Blueprint, request, abort
from ultralytics import YOLO

from app.services.classify_behaviour import classify_behavior
from app.utils.db_util import db
from app.models.stream import Stream
from app.config import Config

surveillance_bp = Blueprint('surveillance', __name__)

active_streams = {}

model = YOLO("yolov8n.pt")

os.makedirs(Config.OUTPUT_DIR, exist_ok=True)


def process_video(video_path, streamid):
    os.makedirs(Config.HLS_FOLDER, exist_ok=True)

    ffmpeg_process = subprocess.Popen(Config.FFMPEG_CONFIG, stdin=subprocess.PIPE)

    cap = cv2.VideoCapture(video_path)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.resize(frame, (640, 480))

        results = model(frame)  # Run YOLO object detection

        # Animal Counter
        animal_counter = {"cow": 0, "horse": 0, "sheep": 0, "goat": 0, "pigs": 0}

        for r in results:
            for i in range(len(r.boxes)):
                box = r.boxes[i].xyxy[0].cpu().numpy()  # Bounding box
                conf = r.boxes[i].conf[0].item()  # Confidence
                cls = int(r.boxes[i].cls[0].item())  # Class index
                label = model.names[cls]  # Get class name

                if label in animal_counter:
                    animal_counter[label] += 1

                # Determine behavior based on bbox position
                behavior = classify_behavior(box, frame.shape[0])

                x1, y1, x2, y2 = map(int, box)

                # Draw bounding box
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, f"{label} - {behavior} ({conf:.2f})", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # Format animal count
        count_text = " | ".join([f"{animal}: {count}" for animal, count in animal_counter.items()])

        # Display animal count
        cv2.putText(frame, count_text, (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        try:
            ffmpeg_process.stdin.write(frame.tobytes())
        except BrokenPipeError:
            break

    cap.release()
    ffmpeg_process.stdin.close()
    ffmpeg_process.wait()


@surveillance_bp.route('/stream', methods=['GET'])
def get_streams():
    try:
        streams = Stream.query.all()
        return jsonify([stream.to_dict() for stream in streams]), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch streams: {str(e)}"}), 500


@surveillance_bp.route('/stream', methods=['POST'])
def create_task():
    try:
        data = request.json
        new_stream = Stream(
            name=data.get('name'),
            url=data.get('url')
        )
        db.session.add(new_stream)
        db.session.commit()
        return jsonify(new_stream.to_dict()), 201
    except Exception as e:
        return jsonify({"error": f"Failed to create stream: {str(e)}"}), 500


@surveillance_bp.route("/start_stream", methods=["POST"])
def start_stream():
    data = request.get_json() or {}
    video_url = data.get("url", "").strip()
    if not video_url:
        return jsonify({"error": "No video URL provided"}), 400

    threading.Thread(
        target=process_video,
        args=(video_url, "/tmp/video.mp4"),
        daemon=True
    ).start()

    # Register as active
    active_streams["stream"] = {
        "video_url": video_url,
        "hls_url": f"/hls/stream/stream.m3u8"
    }

    plist = os.path.join(Config.OUTPUT_DIR, "stream", "stream.m3u8")
    while not os.path.exists(plist):
        time.sleep(0.2)

    return jsonify({
        "stream_id": "stream",
        "hls_url": f"http://127.0.0.1:5000/hls/stream/stream.m3u8"
    }), 200


@surveillance_bp.route('/stop_stream/<stream_id>', methods=['POST'])
def stop_stream(stream_id):
    info = active_streams.get(stream_id)
    if not info:
        abort(404, description="Stream not found")
    proc = info.get('process')
    if proc and proc.poll() is None:
        proc.terminate()
        proc.wait(timeout=5)
    info['status'] = 'stopped'
    # Delete HLS files
    folder = os.path.join(Config.OUTPUT_DIR, stream_id)
    if os.path.isdir(folder):
        shutil.rmtree(folder)
    return jsonify({"success": True, "status": info['status']}), 200


@surveillance_bp.route('/stream/<stream_id>', methods=['DELETE'])
def delete_stream(stream_id):
    # Remove from database
    try:
        db_stream = Stream.query.filter_by(id=stream_id).first()
        if db_stream:
            db.session.delete(db_stream)
            db.session.commit()
    except Exception:
        pass
    return jsonify({"success": True}), 200


@surveillance_bp.route('/hls/<stream_id>/<path:filename>', methods=["GET"])
def serve_hls(stream_id, filename):
    directory = os.path.abspath(os.path.join(Config.OUTPUT_DIR, stream_id))
    return send_from_directory(directory, filename)
