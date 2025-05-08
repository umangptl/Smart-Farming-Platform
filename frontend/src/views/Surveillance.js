import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Modal, Form, Spinner } from "react-bootstrap";
import LiveStream from "./LiveStream";
import { API_BASE_URL } from "../config.js";
import Cows_Thumbnail from "../assets/img/survellience/Cows_Thumbnails.png";
import Pigs_Thumbnail from "../assets/img/survellience/Pigs_Thumbnails.png";
import Sheeps_Thumbnail from "../assets/img/survellience/Sheeps_Thumbnails.png";
import Cows_Sheeps_Thumbnail from "../assets/img/survellience/Cows_Sheeps_Thumbnails.png";

const STREAM_API_URL = `${API_BASE_URL}/stream`;

function Surveillance() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStream, setSelectedStream] = useState(null);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamLoading, setStreamLoading] = useState(false);
  const [hlsUrl, setHlsUrl] = useState("");
  const thumbnails = [Sheeps_Thumbnail, Cows_Thumbnail, Pigs_Thumbnail, Cows_Sheeps_Thumbnail];

  const fetchStreams = async () => {
    try {
      const res = await fetch(STREAM_API_URL);
      const data = await res.json();
      setStreams(data);
    } catch (err) {
      console.error("Failed to fetch streams", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, []);

  const handleAdd = async () => {
    try {
      const res = await fetch(STREAM_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), url: newUrl.trim() }),
      });
      const created = await res.json();
      setStreams((prev) => [...prev, created]);
      setShowAddModal(false);
      setNewName("");
      setNewUrl("");
    } catch (err) {
      console.error("Failed to add stream", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${STREAM_API_URL}/${id}`, { method: "DELETE" });
      setStreams((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete stream", err);
    }
  };

  const handleView = (stream) => {
    setSelectedStream(stream);
    setShowViewModal(true);
    setIsStreaming(false);
    setStreamLoading(false);
    setHlsUrl("");
  };

  const handleStartStream = async () => {
    if (!selectedStream) return;
    try {
      setStreamLoading(true);
      const res = await fetch(`${API_BASE_URL}/start_stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: selectedStream.url }),
      });
      const { hls_url } = await res.json();
      setHlsUrl(hls_url);
      setIsStreaming(true);
    } catch (err) {
      console.error("Failed to start stream", err);
    } finally {
      setStreamLoading(false);
    }
  };

  const handleCloseView = () => {
    // stop streaming on modal close
    if (isStreaming && selectedStream) {
      fetch(`${API_BASE_URL}/stop_stream/stream`, {
        method: "POST",
      }).catch((err) => console.error("Failed to stop stream", err));
    }
    setShowViewModal(false);
    setSelectedStream(null);
  };

  return (
    <>
      {/* Top Add Stream Button */}
      <Row className="mb-3">
        <Col className="d-flex justify-content-end">
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            + Add Stream
          </Button>
        </Col>
      </Row>

      <Row>
        {loading ? (
          <Col className="text-center">
            <Spinner animation="border" />
          </Col>
        ) : (
          streams.map((stream, index) => (
            <Col md={4} key={stream.id} className="mb-4">
              <Card>
                <Card.Img variant="top" src={thumbnails[index % thumbnails.length]} />
                <Card.Body>
                  <Card.Title>{stream.name}</Card.Title>
                  <div className="d-flex justify-content-end">
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleView(stream)}
                      className="mr-2"
                    >
                      View
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(stream.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Add Stream Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Stream</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formName">
              <Form.Label>Stream Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="My Farm Cam"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formUrl" className="mt-3">
              <Form.Label>Stream URL</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://example.com/stream"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleAdd}
            disabled={!newName.trim() || !newUrl.trim()}
          >
            Add
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Stream Modal */}
      <Modal
        show={showViewModal}
        onHide={handleCloseView}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedStream?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-end mb-3">
            {!isStreaming && !streamLoading && (
              <Button onClick={handleStartStream}>Start Stream</Button>
            )}
          </div>

          {streamLoading && (
            <div className="text-center my-4">
              <Spinner animation="border" />
              <div className="mt-2">Loading Stream...</div>
            </div>
          )}

          {hlsUrl && !streamLoading && <LiveStream url={hlsUrl} />}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Surveillance;
