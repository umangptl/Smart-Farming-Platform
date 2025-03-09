import cv2
import numpy as np
from tensorflow.keras.models import load_model
from app.config import Config

MODEL_INPUT_DIMENTIONS = (30, 30)
MAX_COLOR_VALUE = 255
PROBABILITY_BOUNDARY = 0.5

class MLModelService:
    def __init__(self):
        self.models = {}  # Store multiple models

        # Load all models dynamically
        for model_name, model_path in Config.IMAGE_MODELS.items():
            self.models[model_name] = load_model(model_path)
            
    def predict_single(self, image, model_name="parking_detector"):
        """Predict occupancy using the selected model."""
        if model_name not in self.models:
            raise ValueError(f"Model '{model_name}' not found. Available models: {list(self.models.keys())}")

        # Preprocess image
        roi_expanded = self.preprocess_image(image)

        # Make prediction using the chosen model
        prediction = self.models[model_name].predict(roi_expanded, verbose=0)
        
        return int(prediction[0] > PROBABILITY_BOUNDARY)  # 1 for occupied, 0 for vacant
    
    def predict_batch(self, images, model_name="parking_detector"):
        """Predict occupancy for a batch of images using the selected model."""
        if model_name not in self.models:
            raise ValueError(f"Model '{model_name}' not found. Available models: {list(self.models.keys())}")
        
        preprocessed_images = []
        for image in images:
            roi_expanded = self.preprocess_image(image)
            preprocessed_images.append(roi_expanded)
        
        # Convert to NumPy array and expand dims to match batch input shape
        batch_input = np.array(preprocessed_images)
        batch_input = np.expand_dims(batch_input, axis=0) if len(batch_input.shape) == 3 else batch_input  # Ensure batch dimension
        
        # Make batch prediction
        predictions = self.models[model_name].predict(batch_input, verbose=0)
        
        return (predictions[:, 0] > PROBABILITY_BOUNDARY).astype(int).tolist()  # Convert to list of 0s and 1s
    
    def preprocess_image(self, image):
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        roi_resized = cv2.resize(gray, MODEL_INPUT_DIMENTIONS)  # Adjust size based on the model input
        roi_normalized = roi_resized / MAX_COLOR_VALUE
        roi_expanded = np.expand_dims(roi_normalized, axis=-1)  # (30, 30, 1)
        
        return roi_expanded