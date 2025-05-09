import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner, Card, InputGroup, Form } from "react-bootstrap";
import VideoUpload from "../components/InferencePage/VideoUpload";
import FrameLineDrawer from "../components/InferencePage/FrameLineDrawer";
import DirectionSelector from "components/InferencePage/DirectionSelector";
import { uploadVideo, saveVideoConfig, fetchProcessedVideo, processVideo, processStream } from "../api/inferenceApi";
import { API_BASE_URL } from "config";

const MovementTracker = () => {
    const [streamNameInput, setStreamNameInput] = useState("");
    const [streamURLInput, setStreamURLInput] = useState("");
    const [processedStreamURL, setProcessedStreamURL] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [uploadedVideos, setUploadedVideos] = useState([]);
    const [selectedVideoName, setSelectedVideoName] = useState("");
    const [frameURL, setFrameURL] = useState("");
    const [lineStart, setLineStart] = useState(null);
    const [lineEnd, setLineEnd] = useState(null);
    const [direction, setDirection] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedVideoURL, setProcessedVideoURL] = useState("");
    const [processedStreamID, setProcessedStreamID] = useState("");
    const [streamPreviewLoaded, setStreamPreviewLoaded] = useState(false);
    const [readyToProcess, setReadyToProcess] = useState(false);


    useEffect(() => {
        if (!processedStreamID) return;

        const interval = setInterval(() => {
          fetch(`${API_BASE_URL}/api/videos/heartbeat/${processedStreamID}`, { method: "POST" });
        }, 3000); // every 3 seconds
      
        return () => clearInterval(interval); // cleanup on unmount
      }, [processedStreamID]);

    const handleFileChange = (file) => {
        setVideoFile(file);
        setStreamURLInput("");    // Clear stream URL if user picks a file
        const localVideoURL = URL.createObjectURL(file);
        extractFirstFrame(localVideoURL);
    };
    
    const handleStreamNameChange = (e) => {
        setStreamNameInput(e.target.value);
        setVideoFile(null);       // Clear uploaded file
        setSelectedVideoName(""); // Clear selected pre-uploaded video
        setFrameURL("");          // Clear frame preview (cannot extract frame from stream easily)
    };

    const handleStreamURLChange = (e) => {
        setStreamURLInput(e.target.value);
        setVideoFile(null);       // Clear uploaded file
        setSelectedVideoName(""); // Clear selected pre-uploaded video
        setFrameURL("");          // Clear frame preview (cannot extract frame from stream easily)
    };

    const handleUploadVideo = async () => {
        try {
            const data = await uploadVideo(videoFile);
            setSelectedVideoName(data.video_name);
            const localVideoURL = URL.createObjectURL(videoFile);
            extractFirstFrame(localVideoURL);
        } catch (error) {
            console.error("Video upload failed", error);
        }
    };

    const handleLoadStream = async () => {
        if (!streamURLInput) {
            alert("Please enter a stream URL first!");
            return;
        }
    
        try {
            const timestamp = new Date().getTime();
            const fakeVideoName = `stream_${timestamp}.mp4`;
    
            console.log(streamURLInput)
            setSelectedVideoName(fakeVideoName);
            setFrameURL(streamURLInput);
            setStreamPreviewLoaded(true);
        } catch (error) {
            console.error("Failed to load stream preview", error);
        }
    };

    const extractFirstFrame = (videoSrc) => {
        const video = document.createElement('video');
        video.src = videoSrc;
        video.crossOrigin = "anonymous";
        video.muted = true;
        video.playsInline = true;
    
        video.addEventListener('loadeddata', () => {
            video.currentTime = 0; // Force video to be at 0 seconds
        });
    
        video.addEventListener('seeked', () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frameDataUrl = canvas.toDataURL('image/jpeg');
            setFrameURL(frameDataUrl);
        });
    };

    const handleLineDrawn = (start, end) => {
        setLineStart(start);
        setLineEnd(end);
    };

    const handleSaveConfig = async () => {
        if (!lineStart || !lineEnd) {
            alert("Please draw a line first!");
            return;
        } else if (!direction) {
            alert("Please select a direction for cow movement!");
            return;
        } else if (!selectedVideoName) {
            alert("Please select a video!");
            return;
        }

        try {
            const config = { 
                model_name: "cow_line_count",
                line_start: lineStart, 
                line_end: lineEnd,
                direction: direction,
                direction: direction,
            };
            await saveVideoConfig(selectedVideoName, config);
            setReadyToProcess(true);
            alert("Configuration saved! Now you can process the video.");

        } catch (error) {
            console.error("Failed to save configuration", error);
        }
    };

    const handleProcessVideo = async () => {
        if (!selectedVideoName && !streamURLInput) {
            alert("No video selected or stream URL provided!");
            return;
        }

        try {
            setIsProcessing(true);
    
            if (streamURLInput) {
                // Processing a live stream
                const result = await processStream(streamURLInput, selectedVideoName);
                console.log("Processing stream results:", result.results);

                if (result.processed_stream_url) {
                    setProcessedStreamURL(`${API_BASE_URL}${result.processed_stream_url}`)
                    setProcessedStreamID(result.stream_id)
                }
            } else {
                // Processing uploaded video
                const result = await processVideo(selectedVideoName);
                console.log("Processing video results:", result.results);
                setProcessedVideoURL(fetchProcessedVideo(selectedVideoName)); 
            }
        } catch (error) {
            console.error("Failed to process:", error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Container>
            <Card>
                <Card.Header>
                    <Card.Title as="h4">Cattle Movement Tracker & Counter</Card.Title>
                    <p className="card-category">
                    Setup a new movement tracker video feed
                    </p>
                </Card.Header>
                <Card.Body>
                    {/* Section 1: Upload or Select */}
                    <Row>
                        <Col md={6}>
                            <VideoUpload
                                onFileChange={handleFileChange}
                                onUpload={handleUploadVideo}
                                disabled={streamURLInput.length > 0 || streamNameInput.length > 0}/>
                        </Col>
                        <Col md={6}>
                            <Card className="p-3">
                                <label className="form-label">Or enter a Stream URL:</label>
                                <InputGroup className="mb-3">
                                    <InputGroup.Text id="basic-addon2">
                                    Name
                                    </InputGroup.Text>
                                    <Form.Control
                                        placeholder="Enter a name for the stream"
                                        id="stream-name" 
                                        aria-describedby="basic-addon2"
                                        value={streamNameInput}
                                        onChange={handleStreamNameChange}
                                        disabled={videoFile !== null}
                                    />
                                </InputGroup>
                                <InputGroup className="mb-3">
                                    <InputGroup.Text id="basic-addon3">
                                    URL
                                    </InputGroup.Text>
                                    <Form.Control
                                        placeholder="Enter stream URL"
                                        id="stream-url" 
                                        aria-describedby="basic-addon3"
                                        value={streamURLInput}
                                        onChange={handleStreamURLChange}
                                        disabled={videoFile !== null}
                                    />
                                </InputGroup>
                                <Button onClick={handleLoadStream} disabled={!streamURLInput}>
                                    Load Stream
                                </Button>
                            </Card>
                        </Col>
                    </Row>
                    {/* Section 2: Draw Line */}
                    <Row>
                        <Col>
                            <Card className="p-3">
                                <label className="form-label">
                                    Draw a line where the cattle are crossing and choose the move direction
                                </label>
                                <Row>
                                    <Col md={3}>
                                        <DirectionSelector
                                            selectedDirection={direction}
                                            onSelect={setDirection}/>
                                        <Button className="mt-3 me-2 w-100" onClick={handleSaveConfig} disabled={!direction || !lineStart || !lineEnd}>
                                            Save Line Configuration
                                        </Button>
                                        <Button className="mt-3 w-100" variant="success" onClick={handleProcessVideo} disabled={!readyToProcess}>
                                            Process Video
                                        </Button>
                                    </Col>
                                    <Col md={9}>
                                        {frameURL && (
                                            <FrameLineDrawer frameURL={frameURL} onLineDrawn={handleLineDrawn} />
                                        )}
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                    {/* Section 3: Processed Result */}
                    {isProcessing && (
                        <Row className="mb-5">
                            <Col className="text-center">
                                <Spinner animation="border" />
                                <div>Processing video... Please wait.</div>
                            </Col>
                        </Row>
                    )}
                    <Row>
                        <Col>
                            <Card className="p-3">
                                {processedVideoURL && (
                                    <div>
                                        <h4>Processed Video:</h4>
                                        <video
                                            controls
                                            width="100%"
                                            src={processedVideoURL}
                                        />
                                    </div>
                                )}
                                {processedStreamURL && (
                                    <div>
                                        <h4>Processed Live Stream:</h4>
                                        <img
                                            src={processedStreamURL}
                                            alt="Processed Stream"
                                            style={{ width: "100%", border: "2px solid black" }}
                                        />
                                    </div>
                                )}
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default MovementTracker;