import cv2
import os
import numpy as np
from moviepy.editor import ImageSequenceClip
from app.config import Config
from app.services.ml_image_service import MLModelService

# Load ML model service
model_service = MLModelService()

def extract_rois_from_mask(mask_path):
    """
    Extract parking spot ROIs from the provided mask image.
    
    The mask image should have white (255) regions indicating parking spots,
    while black (0) regions indicate background.

    Returns:
        List of bounding boxes [(x, y, w, h), ...]
    """
    mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
    if mask is None:
        raise ValueError(f"Could not read mask image from {mask_path}")

    # Find contours of the parking spots in the mask
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Extract bounding boxes
    rois = [cv2.boundingRect(contour) for contour in contours]

    return rois

def process_video(video_path, mask_path, model_name="parking_detector"):
    """
    Processes the video by:
    1. Extracting frames
    2. Cropping parking spots using the provided mask
    3. Running ML inference in batches
    4. Drawing bounding boxes on original frames
    5. Merging processed frames into a new video

    Args:
        video_path (str): Path to the input video file
        mask_path (str): Path to the parking spot mask image
        model_name (str): The ML model to use for classification

    Returns:
        str: Path to the processed video with overlays
    """
    if model_name not in model_service.models:
        raise ValueError(f"Model '{model_name}' not found. Available models: {list(model_service.models.keys())}")

    # Extract ROIs (parking spot locations) from the mask
    rois_bbox = extract_rois_from_mask(mask_path)

    # Open the input video
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video file: {video_path}")
    
    fps = int(cap.get(cv2.CAP_PROP_FPS))

    # Output storage
    processed_frames = []
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break  # End of video

        # Extract parking spot ROIs from the current frame
        cropped_rois = [frame[y:y+h, x:x+w] for (x, y, w, h) in rois_bbox]

        # Run batch inference
        predictions = model_service.predict_batch(cropped_rois, model_name)

        # Draw bounding boxes on the original frame
        processed_frame = draw_predicted_boxes(frame, rois_bbox, predictions)

        # Store processed frame
        processed_frames.append(processed_frame)
        frame_count += 1

    cap.release()

    # Merge processed frames into a video
    processed_video_path = os.path.join(Config.STATIC_FOLDER, "processed_video.mp4")
    merge_frames_to_video(processed_frames, processed_video_path, fps=fps)

    return processed_video_path

def draw_predicted_boxes(frame, parking_spot_rois, predictions):
    """
    Draws bounding boxes on the frame based on ML predictions.

    Args:
        frame (numpy.ndarray): Original frame
        parking_spot_rois (list): List of bounding boxes [(x, y, w, h)]
        predictions (list): List of binary predictions (0 = vacant, 1 = occupied)

    Returns:
        numpy.ndarray: Frame with bounding boxes drawn
    """
    for (bbox, predicted_class) in zip(parking_spot_rois, predictions):
        x, y, w, h = bbox
        color = (0, 255, 0) if predicted_class == 0 else (0, 0, 255)  # Green = vacant, Red = occupied
        cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)

    return frame

def merge_frames_to_video(frames, output_video_path, fps=30):
    """
    Merges processed frames into a new video.

    Args:
        frames (list): List of processed frames (numpy arrays)
        output_video_path (str): Path where the final video should be saved
        fps (int): Frames per second for the output video
    """
    if not frames:
        raise ValueError("No frames were provided for merging")

    height, width, _ = frames[0].shape

    # Use moviepy to create a video from frames
    clip = ImageSequenceClip([cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) for frame in frames], fps=fps)
    clip.write_videofile(output_video_path, codec="libx264")

