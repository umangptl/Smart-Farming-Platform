import React, { useEffect, useRef, useState } from "react";
import NotificationAlert from "react-notification-alert";
import {
  Alert,
  Button,
  Card,
  Modal,
  Container,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";

function Notifications() {
  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const notificationAlertRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:5000/notifications");
      const data = await response.json();

      data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const notify = (notif) => {
    const options = {
      place: "tr",
      message: <div>{notif.note}</div>,
      type: notif.severity.toLowerCase(),
      icon: "nc-icon nc-bell-55",
      autoDismiss: 7,
    };
    notificationAlertRef.current.notificationAlert(options);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Inline style for larger alerts
  const alertStyle = {
    fontSize: "1.15rem",
    padding: "1.25rem 1.5rem",
  };

  return (
    <>
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>
      <Container fluid>
        <Card>
          <Card.Header>
            <Card.Title as="h4">Notifications</Card.Title>
            <p className="card-category">Check what's happening at your farm</p>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md="12">
                {loading ? (
                  <Spinner animation="border" />
                ) : notifications.length === 0 ? (
                  <Alert variant="info">No notifications available</Alert>
                ) : (
                  notifications.map((notif) => (
                    <Alert
                      key={notif.id}
                      variant={notif.severity.toLowerCase()}
                      style={{
                        ...alertStyle,
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <i
                        className="nc-icon nc-bell-55"
                        style={{ fontSize: "1.5rem", flexShrink: 0 }}
                      ></i>
                      <div style={{ flex: 1 }}>
                        <strong>{new Date(notif.timestamp).toLocaleString()}:</strong>{" "}
                        {notif.note}
                      </div>
                    </Alert>
                  ))
                )}
              </Col>
            </Row>
            <hr />
          </Card.Body>
        </Card>

        <Modal
          className="modal-mini modal-primary"
          show={showModal}
          onHide={() => setShowModal(false)}
        >
          <Modal.Header className="justify-content-center">
            <div className="modal-profile">
              <i className="nc-icon nc-bulb-63"></i>
            </div>
          </Modal.Header>
          <Modal.Body className="text-center">
            <p>Always have access to your profile</p>
          </Modal.Body>
          <div className="modal-footer">
            <Button variant="link" onClick={() => setShowModal(false)}>
              Back
            </Button>
            <Button variant="link" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </div>
        </Modal>
      </Container>
    </>
  );
}

export default Notifications;
