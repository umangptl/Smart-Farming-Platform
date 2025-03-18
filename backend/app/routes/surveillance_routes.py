import os
import cv2
import subprocess
import threading
from flask import jsonify, send_from_directory, Blueprint
from ultralytics import YOLO

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


@surveillance_bp.route("/start_stream", methods=["POST"])
def start_stream():
    video_url = os.getenv("STREAM_URL", "")
    if not video_url:
        return jsonify({"error": "No video URL provided"}), 400

    stream_id = "Stream-1"
    threading.Thread(target=process_video, args=(video_url, stream_id), daemon=True).start()
    active_streams[stream_id] = {"video_url": video_url, "hls_url": f"/hls/{stream_id}/stream.m3u8"}
    return jsonify({"stream_id": stream_id, "hls_url": f"http://localhost:5000/hls/{stream_id}/stream.m3u8"}), 200


@surveillance_bp.route('/hls/<stream_id>/<path:filename>', methods=["GET"])
def serve_hls(stream_id, filename):
    directory = os.path.abspath(os.path.join(OUTPUT_DIR, stream_id))
    return send_from_directory(directory, filename)


@surveillance_bp.route("/list_streams", methods=["GET"])
def list_streams():
    return jsonify(active_streams)
