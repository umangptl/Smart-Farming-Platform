from tensorflow.keras.models import load_model
from config import MODEL_PATH

def load_parking_model():
    """Loads and returns the trained ML model."""
    model = load_model(MODEL_PATH)
    return model

# Load model globally to avoid reloading it on every request
parking_model = load_parking_model()
