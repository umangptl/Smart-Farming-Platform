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
