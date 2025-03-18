import React, { useEffect, useState } from "react";
import Hls from "hls.js";

const LiveStream = () => {
  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const videoRef = React.useRef(null);

  useEffect(() => {
    fetch("http://localhost:5000/list_streams")
      .then((res) => res.json())
      .then((data) => setStreams(Object.entries(data)))
      .catch((err) => console.error("Error fetching streams:", err));
  }, []);

  useEffect(() => {
    if (selectedStream && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(selectedStream);
      hls.attachMedia(videoRef.current);
    }
  }, [selectedStream]);

  return (
    <div>
        <div>
      <select onChange={(e) => setSelectedStream(e.target.value)} defaultValue="">
        <option value="" disabled>Select a Stream</option>
        {streams.map(([id, data]) => (
          <option key={id} value={"http://localhost:5000"+data.hls_url}>
            {id}
          </option>
        ))}
      </select>
      </div>
      {selectedStream && (
        <video ref={videoRef} controls autoPlay muted style={{ width: "100%" }} />
      )}
    </div>
  );
};

export default LiveStream;
