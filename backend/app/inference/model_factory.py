from app.inference.config.cow_line_counter import get_cow_line_counter


def build_model_from_config(config: dict):
    model_name = config["model_name"]

    if model_name == "cow_line_count":
        return get_cow_line_counter(
            normalized_line_start=config["line_start"],
            normalized_line_end=config["line_end"],
            triggering_anchors=directionToAnchor.get(config.get("direction")),
        )

    raise ValueError(f"Unsupported model: {model_name}")


directionToAnchor = {
    "UP_LEFT": ["TOP_LEFT"],
    "UP": ["TOP_LEFT", "TOP_RIGHT"],
    "UP_RIGHT": ["TOP_RIGHT"],
    "LEFT": ["TOP_LEFT", "BOTTOM_LEFT"],
    "CENTER": [],
    "RIGHT": ["TOP_RIGHT", "BOTTOM_RIGHT"],
    "DOWN_LEFT": ["BOTTOM_LEFT"],
    "DOWN": ["BOTTOM_LEFT", "BOTTOM_RIGHT"],
    "DOWN_RIGHT": ["BOTTOM_RIGHT"],
}
