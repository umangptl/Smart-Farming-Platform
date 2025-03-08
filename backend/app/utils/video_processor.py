import os
import cv2
from config import MASK_IMAGE_PATH
from parking_utils import get_bboxes, draw_predicted_occupancy

# Load mask once
mask = cv2.imread(MASK_IMAGE_PATH, cv2.IMREAD_GRAYSCALE)

def process_video(video_path, model):
    """
    Processes the input video file, extracts frames, 
    applies the ML model, and returns processed frame data.
    """
    cap = cv2.VideoCapture(video_path)
    frame_results = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        bboxes = get_bboxes(frame, mask)
        frame_with_predictions = draw_predicted_occupancy(frame, bboxes, model)

        # Store frame information (could be stored as Base64 if needed)
        frame_results.append({"frame_id": len(frame_results), "status": "processed"})

    cap.release()
    os.remove(video_path)  # Clean up temp file

    return frame_results
