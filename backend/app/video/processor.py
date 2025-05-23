import supervision as sv
import numpy as np
import cv2
from tqdm import tqdm
from app.inference.base import InferenceModule

import time
from threading import Lock

import subprocess

def reencode_for_browser(input_path, output_path):
    subprocess.run([
        "ffmpeg", "-y", "-i", input_path,
        "-vcodec", "libx264",
        "-acodec", "aac",
        "-movflags", "+faststart",
        output_path
    ], check=True)

stream_heartbeats = {}  # stream_id -> last_seen_timestamp
heartbeat_lock = Lock()

# Store processed frames in memory
live_processed_frames = {}


def process_video_logic(
    source_path: str,
    target_path: str,
    inference_module: InferenceModule,
    stride: int = 1,
):
    """
    Processes a video using the provided inference module and saves annotated output.
    Only processes every `stride`-th frame for performance.
    """

    # Get original video properties
    cap = cv2.VideoCapture(source_path)
    inference_module.initialize_with_video(cap)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cap.release()
    
    temp_target_path = target_path.replace(".mp4", "_temp.mp4")

    # Setup VideoWriter for saving output
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(temp_target_path, fourcc, fps / stride, (width, height))

    # Setup progress bar
    estimated_processed_frames = total_frames // stride
    progress_bar = tqdm(
        total=estimated_processed_frames, desc="Processing frames", unit="frame"
    )

    # Read, process, and write frames
    for frame in sv.get_video_frames_generator(source_path=source_path, stride=stride):
        annotated = inference_module.detect_and_annotate_crossings(frame)
        writer.write(annotated)
        progress_bar.update(1)

    writer.release()
    reencode_for_browser(temp_target_path, target_path)
    progress_bar.close()


def process_stream_logic(
    stream_url: str, stream_id: str, inference_module: InferenceModule, stride: int = 1
):
    """
    Processes a live stream using the provided inference module.
    Only processes every `stride`-th frame for performance.
    """
    cap = cv2.VideoCapture(stream_url)

    if not cap.isOpened():
        raise Exception(f"Cannot open stream: {stream_url}")

    inference_module.initialize_with_video(cap)

    frame_idx = 0
    print(f"[INFO] Started processing stream {stream_id}")

    stream_heartbeats[stream_id] = time.time()
    isFirstFrame = True
    while True:
        ret, frame = cap.read()
        if isFirstFrame:
            print("Frame was read")
        if not is_stream_active(stream_id):
            print(f"[INFO] No heartbeat for stream {stream_id}. Stopping.")
            break
        if not ret:
            print(f"[INFO] Stream {stream_id} ended or failed.")
            break

        if frame_idx % stride == 0:
            frame = cv2.resize(frame, (852, 480))
            annotated = inference_module.detect_and_annotate_crossings(frame)
            if isFirstFrame:
                print("Annotated frame generated")
                isFirstFrame = False

            # Encode the frame to JPEG for streaming
            success, buffer = cv2.imencode(
                ".jpg", annotated, [int(cv2.IMWRITE_JPEG_QUALITY), 60]
            )
            if success:
                live_processed_frames[stream_id] = buffer.tobytes()

        frame_idx += 1

    cap.release()
    print(f"[INFO] Stream {stream_id} processing ended.")

    return inference_module.get_results()


def is_stream_active(stream_id, timeout=10):
    with heartbeat_lock:
        last_seen = stream_heartbeats.get(stream_id, 0)
    return time.time() - last_seen < timeout
