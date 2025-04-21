import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

const LiveStream = ({ url }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!url || !videoRef.current) return;

    let hls;
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = url;
      videoRef.current.load();
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
      // clear video source
      if (videoRef.current) {
        videoRef.current.src = "";
      }
    };
  }, [url]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      muted
      crossOrigin="anonymous"
      style={{ width: "100%", height: "auto" }}
    />
  );
};

export default LiveStream;
