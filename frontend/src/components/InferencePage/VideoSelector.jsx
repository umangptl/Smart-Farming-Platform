import React from "react";
import { Form, Card } from "react-bootstrap";

const VideoSelector = ({ uploadedVideos, onSelect }) => {
    return (
        <Card className="p-3">
            <Form.Group controlId="selectPreuploaded">
                <Form.Label>Select Pre-Uploaded Video</Form.Label>
                <Form.Select
                    onChange={(e) => onSelect(e.target.value)}
                >
                    <option value="">-- Select --</option>
                    {uploadedVideos.map((video) => (
                        <option key={video} value={video}>
                            {video}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>
        </Card>
    );
};

export default VideoSelector;
