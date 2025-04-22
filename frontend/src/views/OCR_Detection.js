import React, { useState } from "react";
import { Card, Container, Row, Col, Image, Button } from "react-bootstrap";

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

  const handleSelect = (data) => {
    setSelected(data);
    setShowResult(false);
  };

  const handleVideoEnded = () => {
    setShowResult(true);
  };

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card>
            <Card.Header>
              <Card.Title as="h4">Cattle Ear-Tag Detection</Card.Title>
              <p className="card-category">
                Using Optical Character Recognition OCR to Delect Number on
                Cattle Tags
              </p>
            </Card.Header>

            <Card.Body>
              {/* Sample Image Thumbnails */}
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

              {/* Video and Result Area */}
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
                    }}
                  >
                    {selected ? (
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
                    ) : (
                      <div
                        style={{
                          color: "#fff",
                          textAlign: "center",
                          paddingTop: "150px",
                        }}
                      >
                        Select sample above to play the video
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
                    {showResult && selected ? (
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
