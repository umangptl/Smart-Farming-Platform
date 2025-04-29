import React from "react";
import { Form, Button, Card } from "react-bootstrap";

const VideoUpload = ({ onFileChange, onUpload, disabled }) => {
    return (
        <Card className="p-3">
            <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Upload New Video</Form.Label>
                <Form.Control
                    type="file"
                    accept="video/*"
                    onChange={(e) => onFileChange(e.target.files[0])}
                    disabled={disabled}
                />
            </Form.Group>
            <Button onClick={onUpload} disabled={disabled}>Upload Video</Button>
        </Card>
    );
};

export default VideoUpload;
