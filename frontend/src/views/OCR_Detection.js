import React, { useState, useRef, useEffect } from "react";
import { Card, Container, Row, Col, Image } from "react-bootstrap";

const sampleData = [
  {
    id: 1,
    img: require("assets/img/ocr/A.png"),
    video: process.env.PUBLIC_URL + "/videos/annotated-A.mp4",
    result: "Ear Tag #: 1316, 1318, 1325, 1314, 1315 ",
  },
  {
    id: 2,
    img: require("assets/img/ocr/B.png"),
    video: process.env.PUBLIC_URL + "/videos/annotated-B.mp4",
    result: "Ear Tag #: 9097, 0518, 1412",
  },
  {
    id: 3,
    img: require("assets/img/ocr/C.png"),
    video: process.env.PUBLIC_URL + "/videos/annotated-C.mp4",
    result: "Ear Tag #: 1187,1206, 1196, 1195, 1198",
  },
  {
    id: 4,
    img: require("assets/img/ocr/D.png"),
    video: process.env.PUBLIC_URL + "/videos/annotated-D.mp4",
    result: "Ear Tag #: 9504, 9447",
  },
  {
    id: 5,
    img: require("assets/img/ocr/E.png"),
    video: process.env.PUBLIC_URL + "/videos/annotated-E.mp4",
    result: "Ear Tag #: 04215, 03759, 04259, 04064, 03358",
  },
  {
    id: 6,
    img: require("assets/img/ocr/F.png"),
    video: process.env.PUBLIC_URL + "/videos/annotated-F.mp4",
    result: "Ear Tag #: 183, 190, 192",
  },
  {
    id: 7,
    img: require("assets/img/ocr/G.png"),
    video: process.env.PUBLIC_URL + "/videos/annotated-G.mp4",
    result: "Ear Tag #: 88 901",
  },
  {
    id: 8,
    img: require("assets/img/ocr/H.png"),
    video: process.env.PUBLIC_URL + "/videos/annotated-H.mp4",
    result: "Ear Tag #: 0750, 07501",
  },
  {
    id: 9,
    img: require("assets/img/ocr/I.png"),
    video: process.env.PUBLIC_URL + "/videos/annotated-I.mp4",
    result: "Ear Tag #: 7615, 7618, 7617, 7224",
  },
];

function OCR_Detection() {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [frameNumber, setFrameNumber] = useState(0);
  const [frameUrl, setFrameUrl] = useState(null);
  const fileInputRef = useRef();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const handleSelect = async (data) => {
    await cancelPreviousVideo();
    if (uploadMode && videoId) {
      try {
        await fetch(`http://127.0.0.1:5000/ocr/cancel/${videoId}`, {
          method: "POST",
        });
        console.log("Cancelled previous upload:", videoId);
      } catch (err) {
        console.error("Error cancelling previous video:", err);
      }
    }
    setSelected(data);
    setUploadMode(false);
    setShowResult(false);
    setFrameUrl(null);
    setVideoId(null);
  };

  const handleVideoEnded = () => {
    setShowResult(true);
  };

  const handleEmptyClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    await cancelPreviousVideo();
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        setLoading(true); // Start showing loading spinner
        const response = await fetch(`http://127.0.0.1:5000/ocr/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (data.video_id) {
          setUploadMode(true);
          setVideoId(data.video_id);
          setFrameNumber(0);

          // Instead of starting immediately, check readiness
          setTimeout(() => {
            checkIfReady(data.video_id);
          }, 3000); // buffer time
        }
      } catch (error) {
        console.error("Error uploading video:", error);
        setLoading(false);
      }
    }
  };
  const checkIfReady = async (videoId) => {
    let readyCount = 0;
    let frameCheck = 0;

    while (readyCount < 10) {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/ocr/frame/${videoId}/${frameCheck}`
        );
        if (response.status === 200) {
          readyCount++;
        } else {
          // Frame not ready, wait and try again
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error("Error checking frame:", error);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      frameCheck++;
    }

    // Once at least 10 frames exist:
    setLoading(false);
    setReady(true);
    fetchNextFrame(videoId, 0);
  };

  const fetchNextFrame = async (videoId, frameNum) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/ocr/frame/${videoId}/${frameNum}`
      );
      if (response.status === 200) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setFrameUrl(url);
        setFrameNumber(frameNum + 1);

        setTimeout(() => {
          fetchNextFrame(videoId, frameNum + 1);
        }, 100);
      } else if (response.status === 202) {
        setTimeout(() => {
          fetchNextFrame(videoId, frameNum);
        }, 500);
        setShowResult(true);
      }
    } catch (error) {
      console.error("Error fetching frame:", error);
    }
  };

  const cancelPreviousVideo = async () => {
    if (videoId) {
      try {
        await fetch(`http://127.0.0.1:5000/ocr/cancel/${videoId}`, {
          method: "POST",
        });
      } catch (err) {
        console.error("Failed to cancel video:", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      cancelPreviousVideo(); // Cleanup on unmount
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      cancelPreviousVideo();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <Container fluid>
      <input
        type="file"
        accept="video/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <Row>
        <Col md="12">
          <Card>
            <Card.Header>
              <Card.Title as="h4">Cattle Ear-Tag Detection</Card.Title>
              <p className="card-category">
                Using Optical Character Recognition OCR to Detect Numbers on
                Cattle Tags
              </p>
            </Card.Header>

            <Card.Body>
              <div
                style={{
                  display: "flex",
                  overflowX: "auto",
                  padding: "0.5rem 0",
                  gap: "0.5rem",
                }}
              >
                {sampleData.map((item) => (
                  <div key={item.id} style={{ flex: "0 0 auto" }}>
                    <Image
                      src={item.img}
                      thumbnail
                      onClick={() => handleSelect(item)}
                      style={{
                        height: "120px",
                        cursor: "pointer",
                        border:
                          selected?.id === item.id
                            ? "3px solid #007bff"
                            : "1px solid #ddd",
                        borderRadius: "5px",
                      }}
                    />
                  </div>
                ))}
              </div>

              <Row>
                <Col md="7">
                  <div
                    style={{
                      marginTop: "1rem",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      padding: "0.1rem",
                      height: "360px",
                      background: "#000",
                      marginBottom: "1rem",
                      position: "relative",
                    }}
                  >
                    {loading ? (
                      <div
                        style={{
                          color: "#fff",
                          textAlign: "center",
                          paddingTop: "150px",
                          fontSize: "1.2rem",
                        }}
                      >
                        Loading frames... Please wait.
                      </div>
                    ) : selected && !uploadMode ? (
                      <video
                        src={selected.video}
                        controls
                        autoPlay
                        onEnded={handleVideoEnded}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : uploadMode && ready && frameUrl ? (
                      <img
                        src={frameUrl}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                        alt="Processed Frame"
                      />
                    ) : (
                      <div
                        style={{
                          color: "#fff",
                          textAlign: "center",
                          paddingTop: "150px",
                          cursor: "pointer",
                        }}
                        onClick={handleEmptyClick}
                      >
                        Select sample above or click here to upload a video
                      </div>
                    )}
                  </div>
                </Col>

                <Col md="5">
                  <div
                    style={{
                      marginTop: "1rem",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "1rem",
                      height: "360px",
                      background: "#f9f9f9",
                      marginBottom: "1rem",
                    }}
                  >
                    <h5>Detection Result:</h5>

                    {uploadMode && showResult ? (
                      <p>
                        ❗ Sorry, ear tags could not be clearly detected in this
                        video. Please ensure the video is clear and properly
                        framed.
                      </p>
                    ) : !uploadMode && showResult && selected ? (
                      <p>{selected.result}</p>
                    ) : (
                      <p style={{ color: "#999" }}>
                        Result will appear after video ends.
                      </p>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default OCR_Detection;
