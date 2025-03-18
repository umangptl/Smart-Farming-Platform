import React from "react";
// react-bootstrap components
import { Card, Container, Row, Col } from "react-bootstrap";
import LiveStream from "./LiveStream.js";

function Surveillance() {
  return (
    <>
      <Row>
      <Col md="12">
          <Card>
            <Card.Header>
              <Card.Title as="h4">Farm Camera Stream</Card.Title>
              <p className="card-category">Live Surveillance</p>
            </Card.Header>
            <Card.Body>
              <LiveStream />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default Surveillance;