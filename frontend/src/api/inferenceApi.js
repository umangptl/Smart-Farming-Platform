import { API_BASE_URL } from "../config.js";

const VIDEO_API_URL = `${API_BASE_URL}/api/videos`;

// Upload a new video
export const uploadVideo = async (videoFile) => {
  try {
    const formData = new FormData();
    formData.append("video", videoFile);

    const response = await fetch(`${VIDEO_API_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to upload video");

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Fetch preuploaded videos (assuming backend provides it)
export const fetchPreuploadedVideos = async () => {
  try {
    const response = await fetch(`${VIDEO_API_URL}/list`);
    if (!response.ok) throw new Error("Failed to fetch videos list");

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Save configuration (line coordinates) for a video
export const saveVideoConfig = async (videoName, config) => {
  try {
    const response = await fetch(`${VIDEO_API_URL}/configure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        video_name: videoName,
        config: config,
      }),
    });

    if (!response.ok) throw new Error("Failed to save video configuration");

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Process video using the saved config
export const processVideo = async (videoName) => {
  try {
    const response = await fetch(`${VIDEO_API_URL}/process_video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ video_name: videoName }),
    });

    if (!response.ok) throw new Error("Failed to process video");

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Fetch the processed video file
export const fetchProcessedVideo = (filename) => {
  return `${VIDEO_API_URL}/processed/${filename}`;
};


// Process live stream using the given stream URL
export const processStream = async (streamURL, videoName) => {
  try {
    const response = await fetch(`${VIDEO_API_URL}/process_stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        stream_url: streamURL,
        video_name: videoName 
      }),
    });

    if (!response.ok) throw new Error("Failed to process stream");

    return await response.json();
  } catch (error) {
    throw error;
  }
};
