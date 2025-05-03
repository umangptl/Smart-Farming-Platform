# On Laptop CPU
from flask import Flask, Response, make_response, request
import cv2
import numpy as np
import pyautogui
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


def capture_frame(resize_to=(852, 480)):
    screenshot = pyautogui.screenshot()
    frame = cv2.cvtColor(np.array(screenshot), cv2.COLOR_RGB2BGR)
    frame = cv2.resize(frame, resize_to)
    _, buffer = cv2.imencode(".jpg", frame)
    return buffer.tobytes()


def generate_frames():
    while True:
        frame = capture_frame()
        yield (b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")


@app.route("/video_feed")
def video_feed():
    # If the client asks explicitly for a single frame
    if request.args.get("preview") == "1":
        frame = capture_frame()
        response = make_response(frame)
        response.headers.set("Content-Type", "image/jpeg")
        return response

    # Otherwise stream
    return Response(
        generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame"
    )


if __name__ == "__main__":
    # Important: host='0.0.0.0' to allow Laptop GPU to connect
    app.run(host="0.0.0.0", port=5050, threaded=True)
