from .base import InferenceModule
import supervision as sv
import numpy as np
import cv2

class LineCrossCounter(InferenceModule):
    def __init__(self, model, tracker, trace_annotator, box_annotator, label_annotator, normalized_start, normalized_end, line_zone_annotator, selected_class_ids):
        self.model = model
        self.byte_tracker = tracker
        self.trace_annotator = trace_annotator
        self.box_annotator = box_annotator
        self.label_annotator = label_annotator
        self.normalized_start = normalized_start
        self.normalized_end = normalized_end
        self.line_zone = None
        self.line_zone_annotator = line_zone_annotator
        self.selected_class_ids = selected_class_ids


    def name(self):
        return "line_cross_counter"


    def initialize_with_video(self, video_capture: cv2.VideoCapture):
        width = int(video_capture.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(video_capture.get(cv2.CAP_PROP_FRAME_HEIGHT))

        start = sv.Point(
            self.normalized_start["x"] * width,
            self.normalized_start["y"] * height,
        )
        end = sv.Point(
            self.normalized_end["x"] * width,
            self.normalized_end["y"] * height,
        )
        self.line_zone = sv.LineZone(start=start, end=end)


    def detect_and_annotate_crossings(self, frame: np.ndarray) -> np.ndarray:
        # frame = cv2.resize(frame, (532, 300)) # !!! testing
        frame_height, frame_width, frame_channels = frame.shape
        results = self.model(frame, verbose=False)[0]
        detections = sv.Detections.from_ultralytics(results)
        detections = detections[np.isin(detections.class_id, self.selected_class_ids)]
        detections = self.byte_tracker.update_with_detections(detections)

        labels = [
            f"#{tracker_id} {self.model.model.names[class_id]} {confidence:0.2f}"
            for confidence, class_id, tracker_id
            in zip(detections.confidence, detections.class_id, detections.tracker_id)
        ]

        annotated_frame = frame.copy()
        annotated_frame = self.trace_annotator.annotate(scene=annotated_frame, detections=detections)
        annotated_frame = self.box_annotator.annotate(scene=annotated_frame, detections=detections)
        annotated_frame = self.label_annotator.annotate(scene=annotated_frame, detections=detections, labels=labels)

        self.line_zone.trigger(detections)
        net_count = abs(self.line_zone.in_count - self.line_zone.out_count)

        annotated_frame = self.line_zone_annotator.annotate(annotated_frame, line_counter=self.line_zone)
        text_anchor = sv.Point(frame_width / 2, 10)
        annotated_frame = sv.draw_text(
            scene=annotated_frame,
            text=f"Count: {net_count}",
            text_anchor=text_anchor,
            background_color=sv.Color.WHITE
        )
        return annotated_frame
    
    
    def get_results(self) -> dict:   
        return {
            "in": self.line_zone.in_count,
            "out": self.line_zone.out_count,
            "net": abs(self.line_zone.in_count - self.line_zone.out_count)
        }