import os, time
import shutil

import cv2
import subprocess
import threading
from flask import jsonify, send_from_directory, Blueprint, request, abort
from ultralytics import YOLO
from app.utils.db_util import db
from app.models.stream import Stream

surveillance_bp = Blueprint('surveillance', __name__)

active_streams = {}

# Use YOLOv8 object detection model (not pose model)
model = YOLO("yolov8n.pt")

OUTPUT_DIR = "hls_streams"
os.makedirs(OUTPUT_DIR, exist_ok=True)


def classify_behavior(bbox, frame_height):
    """
    Classifies the behavior of an animal based on its bounding box properties.
    :param bbox: (x1, y1, x2, y2) Bounding box coordinates
    :param frame_height: Height of the video frame
    :return: "Standing" or "Lying Down", otherwise None (no "Unknown" label)
    """
    x1, y1, x2, y2 = bbox
    height = y2 - y1
    width = x2 - x1

    aspect_ratio = height / width  # Ratio of height to width

    lying_threshold = aspect_ratio < 0.8  # Lying animals are wider than they are tall

    if lying_threshold and y2 > frame_height * 0.85:
        return "Lying Down"
    else:
        return "Standing"


def process_video(video_path, stream_id):
    hls_folder = os.path.join(OUTPUT_DIR, stream_id)
    os.makedirs(hls_folder, exist_ok=True)

    ffmpeg_command = [
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
        os.path.join(hls_folder, "stream.m3u8"),
    ]

    ffmpeg_process = subprocess.Popen(ffmpeg_command, stdin=subprocess.PIPE)

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

    stream_id = data.get("stream_id") or f"stream"

    threading.Thread(
        target=process_video,
        args=(video_url, stream_id),
        daemon=True
    ).start()

    # Register as active
    active_streams[stream_id] = {
        "video_url": video_url,
        "hls_url": f"/hls/{stream_id}/stream.m3u8"
    }

    plist = os.path.join(OUTPUT_DIR, stream_id, "stream.m3u8")
    while not os.path.exists(plist):
        time.sleep(0.2)

    return jsonify({
        "stream_id": stream_id,
        "hls_url": f"http://127.0.0.1:5000/hls/{stream_id}/stream.m3u8"
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
    folder = os.path.join(OUTPUT_DIR, stream_id)
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
    directory = os.path.abspath(os.path.join(OUTPUT_DIR, stream_id))
    return send_from_directory(directory, filename)
