from abc import ABC, abstractmethod
import numpy as np

class InferenceModule(ABC):
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def detect_and_annotate_crossings(self, frame: np.ndarray) -> np.ndarray:
        pass

    @abstractmethod
    def get_results(self) -> dict:
        pass

    def initialize_with_video(self, video_capture):
        """Optional: Models may override if they need video-specific information."""
        pass
    