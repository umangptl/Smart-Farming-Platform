from app.inference.config.cow_line_counter import get_cow_line_counter

def build_model_from_config(config: dict):
    model_name = config["model_name"]
    
    if model_name == "cow_line_count":
        return get_cow_line_counter(
            normalized_line_start=config["line_start"],
            normalized_line_end=config["line_end"],
            triggering_anchors=config.get("triggering_anchors")
        )
    
    raise ValueError(f"Unsupported model: {model_name}")
