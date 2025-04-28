import supervision as sv
import numpy as np
import cv2
from tqdm import tqdm
from app.inference.base import InferenceModule


def process_video_logic(source_path: str, target_path: str, inference_module: InferenceModule, stride: int = 1):
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

    # Setup VideoWriter for saving output
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    writer = cv2.VideoWriter(target_path, fourcc, fps / stride, (width, height))

    # Setup progress bar
    estimated_processed_frames = total_frames // stride
    progress_bar = tqdm(total=estimated_processed_frames, desc="Processing frames", unit="frame")

    # Read, process, and write frames
    for frame in sv.get_video_frames_generator(source_path=source_path, stride=stride):
        annotated = inference_module.detect_and_annotate_crossings(frame)
        writer.write(annotated)
        progress_bar.update(1)

    writer.release()
    progress_bar.close()

def process_stream_logic(stream_url: str, inference_module: InferenceModule, stride: int = 1):
    """
    Processes a live stream using the provided inference module.
    Only processes every `stride`-th frame for performance.
    """

    cap = cv2.VideoCapture(stream_url)

    if not cap.isOpened():
        raise Exception(f"Cannot open stream: {stream_url}")

    inference_module.initialize_with_video(cap)

    frame_idx = 0
    progress_bar = tqdm(desc="Processing live stream", unit="frame")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Stream ended or error occurred.")
            break

        if frame_idx % stride == 0:
            annotated = inference_module.detect_and_annotate_crossings(frame)
            # Optional: display result
            cv2.imshow('Inference on Stream', annotated)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                print("Interrupted by user.")
                break

        frame_idx += 1
        progress_bar.update(1)

    cap.release()
    cv2.destroyAllWindows()
    progress_bar.close()

    return inference_module.get_results()