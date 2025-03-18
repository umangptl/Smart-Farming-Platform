import React, { useState } from "react";

import { API_BASE_URL } from "../config.js";
const PARKING_MODEL_API_URL = `${API_BASE_URL}/predict_parking`;

const VideoUploader = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [processedFrames, setProcessedFrames] = useState([]);

  const handleFileChange = (event) => {
    setVideoFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!videoFile) {
      alert("Please select a video file.");
      return;
    }

    const formData = new FormData();
    formData.append("video", videoFile);

    const saveVideo = fetch(PARKING_MODEL_API_URL, {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to upload video");
        }
        return response.json(); // Extract JSON from the response
    })
    .then(data => setProcessedFrames(data.frames))
    .catch(err => console.error("Error uploading video:", err));

    return saveVideo;
}

  return (
    <div className="container">
      <h2>Parking Lot Occupancy Detection</h2>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload & Process</button>

      <div className="frames-container">
        {processedFrames.map((frame, index) => (
          <img key={index} src={`data:image/jpeg;base64,${frame.image_base64}`} alt={`Frame ${index}`} />
        ))}
      </div>
    </div>
  );
};

export default VideoUploader;
