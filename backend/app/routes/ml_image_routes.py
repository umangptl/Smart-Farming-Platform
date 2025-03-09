from flask import Blueprint, request, jsonify
import cv2
import numpy as np
from app.services.ml_image_service import MLModelService

ml_bp = Blueprint("ml", __name__)
model_service = MLModelService()

@ml_bp.route("/predict", methods=["POST"])
def predict():
    file = request.files.get("image")
    model_name = request.form.get("model_name", "parking_detector")  # Default model

    if not file:
        return jsonify({"error": "No image provided"}), 400

    # Convert the uploaded image into an OpenCV format
    image = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)

    try:
        prediction = model_service.predict(image, model_name)
        return jsonify({"occupied": bool(prediction), "model_used": model_name})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
