import cv2
import numpy as np
from tensorflow.keras.models import load_model
from ultralytics import YOLO

MODEL_INPUT_DIMENTIONS = (30, 30)
MAX_COLOR_VALUE = 255
PROBABILITY_BOUNDARY = 0.5

class BaseMLModel:
    """Abstract class defining the interface for ML models"""
    def __init__(self, requires_mask=False):
        self.requires_mask = requires_mask  # Determines if a mask is needed

    def predict(self, image):
        raise NotImplementedError("Subclasses must implement this method.")

    def predict_batch(self, images):
        raise NotImplementedError("Subclasses must implement this method.")

    def format_output(self, results):
        raise NotImplementedError("Subclasses must implement this method.")

# Local Model (Needs Mask)
class LocalModel(BaseMLModel):
    def __init__(self, model_path):
        super().__init__(requires_mask=True)  # This model requires a mask
        self.model = load_model(model_path)

    def predict(self, image):
        image_processed = self.preprocess_image(image)
        prediction = self.model.predict(image_processed, verbose=0)
        return int(prediction[0] > PROBABILITY_BOUNDARY)

    def predict_batch(self, images):
        images_processed = np.array([self.preprocess_image(img) for img in images])
        predictions = self.model.predict(images_processed, verbose=0)
        return (predictions[:, 0] > PROBABILITY_BOUNDARY).astype(int).tolist()

    def preprocess_image(self, image):
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        resized = cv2.resize(gray, MODEL_INPUT_DIMENTIONS)
        normalized = resized / MAX_COLOR_VALUE
        return np.expand_dims(normalized, axis=-1)  # (30, 30, 1)

    def format_output(self, results):
        return results  # Just return binary list

# YOLO Model (Does NOT Need Mask)
class YOLOModel(BaseMLModel):
    def __init__(self, model_name):
        super().__init__(requires_mask=False)  # No mask required
        self.model = YOLO(model_name)

    def predict(self, image):
        results = self.model(image)[0]  
        return self.format_output(results)

    def predict_batch(self, images):
        results = self.model(images)
        return [self.format_output(res) for res in results]

    def format_output(self, results):
        """
        Converts YOLO object detection results into (bbox, class) format.
        """
        parsed_results = []
        for box in results.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy.tolist()[0])
            cls = int(box.cls.tolist()[0])
            parsed_results.append(((x1, y1, x2 - x1, y2 - y1), 1 if cls == 0 else 0))  # Assume class 0 = occupied
        return parsed_results
