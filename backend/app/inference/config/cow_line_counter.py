from app.inference.line_cross_counter import LineCrossCounter
from ultralytics import YOLO
import supervision as sv
import torch


def get_cow_line_counter(line_start, line_end, triggering_anchors=None):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Load object detection model
    model = YOLO("yolov8x.pt")
    model.to(device)

    # Setup Annotators
    box_annotator = sv.BoxAnnotator(thickness=2)
    label_annotator = sv.LabelAnnotator(
        text_thickness=1, text_scale=0.5, text_color=sv.Color.BLACK
    )
    trace_annotator = sv.TraceAnnotator(thickness=2, trace_length=20)
    line_zone_annotator = sv.LineZoneAnnotator(
        display_in_count=False,
        display_out_count=False,
        display_text_box=False,
    )

    # Initialize object tracker
    byte_tracker = sv.ByteTrack(
        track_activation_threshold=0.25,
        lost_track_buffer=30,
        minimum_matching_threshold=0.8,
        frame_rate=30,
        minimum_consecutive_frames=3,
    )

    byte_tracker.reset()

    # Prepare optional kwargs
    line_zone_kwargs = {}
    if triggering_anchors is not None:
        anchor_dict = {
            "TOP_LEFT": sv.Position.TOP_LEFT,
            "TOP_RIGHT": sv.Position.TOP_RIGHT,
            "BOTTOM_LEFT": sv.Position.BOTTOM_LEFT,
            "BOTTOM_RIGHT": sv.Position.BOTTOM_RIGHT,
        }
        line_zone_kwargs["triggering_anchors"] = [
            anchor_dict[anchor] for anchor in triggering_anchors
        ]

    # Define virtual line counter
    line_zone = sv.LineZone(
        start=sv.Point(*line_start),
        end=sv.Point(*line_end),
        minimum_crossing_threshold=3,
        **line_zone_kwargs
    )

    # the class names we have chosen
    SELECTED_CLASS_NAMES = ["cow", "person"]

    # class ids matching the class names we have chosen
    CLASS_NAMES_DICT = model.names
    SELECTED_CLASS_IDS = [
        {value: key for key, value in CLASS_NAMES_DICT.items()}[class_name]
        for class_name in SELECTED_CLASS_NAMES
    ]

    return LineCrossCounter(
        model=model,
        tracker=byte_tracker,
        trace_annotator=trace_annotator,
        box_annotator=box_annotator,
        label_annotator=label_annotator,
        line_zone=line_zone,
        line_zone_annotator=line_zone_annotator,
        selected_class_ids=SELECTED_CLASS_IDS,
    )
