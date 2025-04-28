import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import VideoUpload from "../components/InferencePage/VideoUpload";
import VideoSelector from "../components/InferencePage/VideoSelector";
import FrameLineDrawer from "../components/InferencePage/FrameLineDrawer";
import DirectionSelector from "components/InferencePage/DirectionSelector";
import { uploadVideo, saveVideoConfig, fetchPreuploadedVideos, processVideo } from "../api/inferenceApi";

const MovementTracker = () => {
    const [videoFile, setVideoFile] = useState(null);
    const [uploadedVideos, setUploadedVideos] = useState([]);
    const [selectedVideoName, setSelectedVideoName] = useState("");
    const [frameURL, setFrameURL] = useState("");
    const [lineStart, setLineStart] = useState(null);
    const [lineEnd, setLineEnd] = useState(null);
    const [direction, setDirection] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedVideoURL, setProcessedVideoURL] = useState("");

    useEffect(() => {
        loadPreuploadedVideos();
    }, []);

    const loadPreuploadedVideos = async () => {
        try {
            const videos = await fetchPreuploadedVideos();
            setUploadedVideos(videos);
        } catch (error) {
            console.error("Failed to fetch preuploaded videos", error);
        }
    };

    const handleFileChange = (file) => {
        setVideoFile(file);
        const localVideoURL = URL.createObjectURL(file);
        extractFirstFrame(localVideoURL);
    };

    const handleUpload = async () => {
        try {
            const data = await uploadVideo(videoFile);
            setSelectedVideoName(data.video_name);
        } catch (error) {
            console.error("Video upload failed", error);
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
    

    const handleVideoSelect = (videoName) => {
        setSelectedVideoName(videoName);
        setVideoURL(fetchProcessedVideo(videoName)); // Load processed if exists
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
            alert("Configuration saved! Now you can process the video.");
        } catch (error) {
            console.error("Failed to save configuration", error);
        }
    };

    const handleProcessVideo = async () => {
        if (!selectedVideoName) {
            alert("No video selected!");
            return;
        }

        try {
            console.log(selectedVideoName)
            setIsProcessing(true);
            const result = await processVideo(selectedVideoName);
            console.log("Processing results:", result.results);
            setProcessedVideoURL(fetchProcessedVideo(selectedVideoName)); // After processing, set processed video URL
        } catch (error) {
            console.error("Failed to process video", error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4">Movement Tracker Setup</h2>

            {/* Section 1: Upload or Select */}
            <Row className="mb-5">
                <Col md={6}>
                    <VideoUpload onFileChange={handleFileChange} onUpload={handleUpload} />
                </Col>
                <Col md={6}>
                    <VideoSelector uploadedVideos={uploadedVideos} onSelect={handleVideoSelect} />
                </Col>
            </Row>

            {/* Section 2: Draw Line */}
            <Row className="mb-5">
                <Col>
                    {frameURL && (
                        <FrameLineDrawer frameURL={frameURL} onLineDrawn={handleLineDrawn} />
                    )}
                    <Button className="mt-3 me-2" onClick={handleSaveConfig}>
                        Save Line Configuration
                    </Button>
                    <Button className="mt-3" variant="success" onClick={handleProcessVideo}>
                        Process Video
                    </Button>
                </Col>
            </Row>

            {/* Section 3: Select direction of moving objects */}
            <Row className="mb-5">
                <Col>
                    <DirectionSelector
                        selectedDirection={direction} 
                        onSelect={setDirection}/>
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

            {processedVideoURL && (
                <Row>
                    <Col>
                        <h4>Processed Video:</h4>
                        <video
                            controls
                            width="100%"
                            src={processedVideoURL}
                        />
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default MovementTracker;