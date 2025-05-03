def classify_behavior(bbox, frame_height):
    """
    Classifies the behavior of an animal based on its bounding box properties.
    :param bbox: (x1, y1, x2, y2) Bounding box coordinates
    :param frame_height: Height of the video frame
    :return: "Standing" or "Lying Down", otherwise None (no "Unknown" label)
    """
    x1, y1, x2, y2 = bbox
    height = y2 - y1
    width = x2 - x1

    aspect_ratio = height / width  # Ratio of height to width

    lying_threshold = aspect_ratio < 0.8  # Lying animals are wider than they are tall

    if lying_threshold and y2 > frame_height * 0.85:
        return "Lying Down"
    else:
        return "Standing"
