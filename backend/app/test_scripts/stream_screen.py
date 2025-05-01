# On Laptop CPU
from flask import Flask, Response
import cv2
import numpy as np
import pyautogui
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


def generate_frames():
    while True:
        # Capture screen
        screenshot = pyautogui.screenshot()

        # Convert to array and BGR for OpenCV
        frame = cv2.cvtColor(np.array(screenshot), cv2.COLOR_RGB2BGR)

        # Resize frame if you want lower resolution (optional)
        frame = cv2.resize(frame, (852, 480))

        # Encode frame as JPEG
        _, buffer = cv2.imencode(".jpg", frame)
        frame = buffer.tobytes()

        # Streaming bytes
        yield (b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")


@app.route("/video_feed")
def video_feed():
    return Response(
        generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame"
    )


if __name__ == "__main__":
    # Important: host='0.0.0.0' to allow Laptop GPU to connect
    app.run(host="0.0.0.0", port=5050, threaded=True)
