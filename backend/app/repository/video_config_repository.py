import json
import os

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "video_configs.json")

def get_config_for_video_source(video_name: str):
    if not os.path.exists(CONFIG_PATH):
        return None
    with open(CONFIG_PATH, "r") as f:
        configs = json.load(f)
    return configs.get(video_name)

def save_config_for_video_inference(video_name: str, config: dict):
    configs = {}
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, "r") as f:
            configs = json.load(f)

    configs[video_name] = config

    with open(CONFIG_PATH, "w") as f:
        json.dump(configs, f, indent=2)
