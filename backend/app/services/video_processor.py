import cv2
import os
from app.config import Config
from app.services.MLModelProvider import MLModelProvider

# Load ML model service
model_provider = MLModelProvider()

def process_video(model_name, video_path, mask_path):
    """
    Processes a video for parking occupancy detection.
    
    - If the selected model requires a mask, extract ROIs from it.
    - If the model is YOLO-based, use its own detection capabilities.
    
    Args:
        video_path (str): Path to the input video.
        model_name (str): ML model to use.

    Returns:
        str: Path to the processed video.
    """
    model = model_provider.get_model(model_name)

    # Open the video
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video file: {video_path}")

    fps = int(cap.get(cv2.CAP_PROP_FPS))
    processed_frames = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break  # End of video

        # Process individual frame
        processed_frame = process_frame(frame, model, mask_path)
        processed_frames.append(processed_frame)

    cap.release()
    

    # Save processed video
    return save_video(processed_frames, fps, video_path, model_name)


def process_frame(frame, model, mask_name=None):
    """Processes a single frame using the given model."""
    rois_bbox, cropped_rois = get_rois_for_model(frame, model, mask_name)
    predictions = model.predict_batch(cropped_rois)

    # Draw bounding boxes and return processed frame
    return draw_predicted_boxes(frame, rois_bbox, predictions)


def get_rois_for_model(frame, model, mask_name=None):
    """Extracts ROIs for the model (from a mask if required, otherwise uses YOLO detection)."""
    if model.requires_mask:
        if not mask_name:
            raise ValueError("Mask name not provided")
        
        mask_path = os.path.join(Config.UPLOAD_FOLDER, mask_name)
        if not os.path.exists(mask_path):
            raise ValueError(f"Mask '{mask_name}' not found")

        rois_bbox = extract_rois_from_mask(mask_path)
        cropped_rois = [frame[y:y+h, x:x+w] for (x, y, w, h) in rois_bbox]
    else:
        # YOLO model detects objects and returns bounding boxes directly
        detections = model.predict(frame)
        rois_bbox = [bbox for bbox, _ in detections]
        cropped_rois = [frame[y:y+h, x:x+w] for (x, y, w, h) in rois_bbox]

    return rois_bbox, cropped_rois


def draw_predicted_boxes(frame, parking_spot_rois, predictions):
    """
    Draws bounding boxes on the frame based on ML predictions.
    Supports both binary classification (Local Model) and object detection (YOLO).
    """
    for (bbox, predicted_class) in zip(parking_spot_rois, predictions):
        x, y, w, h = bbox
        color = (0, 255, 0) if predicted_class == 0 else (0, 0, 255)  # Green = vacant, Red = occupied
        cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)

    return frame


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


def save_video(frames, fps, video_path, model_name):
    """Saves the processed frames as a video."""
    
    video_name = os.path.basename(video_path)
    video_name_no_extension, video_extension = os.path.splitext(video_name)
    processed_video_name = f'{video_name_no_extension}_processed_with_{model_name}{video_extension}'
    processed_video_path = os.path.join(Config.STATIC_FOLDER, processed_video_name)
    
    merge_frames_to_video(frames, processed_video_path, fps=fps)
    return processed_video_path

def merge_frames_to_video(frames, output_video_path, fps=30):
    """
    Merges processed frames into a video using OpenCV.

    Args:
        frames (list): List of processed frames (numpy arrays).
        output_video_path (str): Path where the final video should be saved.
        fps (int): Frames per second for the output video.
    
    Returns:
        None
    """
    if not frames:
        raise ValueError("No frames were provided for merging")

    # Get frame dimensions
    height, width, _ = frames[0].shape

    # Define the codec and create VideoWriter object
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Codec for .mp4 files
    out = cv2.VideoWriter(output_video_path, fourcc, fps, (width, height))

    # Write each frame to the video file
    for frame in frames:
        out.write(frame)

    # Release the video writer
    out.release()