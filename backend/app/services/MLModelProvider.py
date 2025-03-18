from app.config import Config
from app.services.MLModels import LocalModel, YOLOModel  # Import model strategies

class MLModelProvider:
    """Provides ML models and handles dynamic loading."""

    def __init__(self):
        self.models = {}  # Dictionary to store model instances

        # Load models dynamically from configuration
        for model_name, model_info in Config.IMAGE_MODELS.items():
            if model_info["type"] == "local":
                self.models[model_name] = LocalModel(model_info["local_path"])
            elif model_info["type"] == "yolo":
                self.models[model_name] = YOLOModel(model_info["model_name"])

    def get_model(self, model_name):
        """Returns an instance of the requested ML model."""
        if model_name not in self.models:
            raise ValueError(f"Model '{model_name}' not found. Available models: {list(self.models.keys())}")
        return self.models[model_name]
