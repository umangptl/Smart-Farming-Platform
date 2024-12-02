import React from "react";
// react-bootstrap components
import { Card, Container, Row, Col } from "react-bootstrap";

function Surveillance() {
  return (
    <>
      <Row>
        <Col md="6">
          <Card>
            <Card.Header>
              <Card.Title as="h4">Camera 1</Card.Title>
              <p className="card-category">Location (Name)</p>
            </Card.Header>
            <Card.Body>
              <img
                src={require("assets/img/main1.png")}
                alt="..."
                style={{ width: "540px", height: "250px" }}
              />
            </Card.Body>
            <Card.Footer>
              <hr></hr>
              <div className="stats">
                <i className="fas fa-history"></i>
                Updated 3 minutes ago
              </div>
            </Card.Footer>
          </Card>
        </Col>
        <Col md="6">
          <Card>
            <Card.Header>
              <Card.Title as="h4">Camera 2</Card.Title>
              <p className="card-category">Location (name)</p>
            </Card.Header>
            <Card.Body>
              <img
                src={require("assets/img/main2.png")}
                alt="..."
                style={{ width: "540px", height: "250px" }}
              />
            </Card.Body>
            <Card.Footer>
              <hr></hr>
              <div className="stats">
                <i className="fas fa-history"></i>
                Updated 13 minutes ago
              </div>
            </Card.Footer>
          </Card>
        </Col>
        <Col md="6">
          <Card>
            <Card.Header>
              <Card.Title as="h4">Camera 3</Card.Title>
              <p className="card-category">Location (name)</p>
            </Card.Header>
            <Card.Body>
              <img
                src={require("assets/img/main2.png")}
                alt="..."
                style={{ width: "540px", height: "250px" }}
              />
            </Card.Body>
            <Card.Footer>
              <hr></hr>
              <div className="stats">
                <i className="fas fa-history"></i>
                Updated 10 minutes ago
              </div>
            </Card.Footer>
          </Card>
        </Col>
        <Col md="6">
          <Card>
            <Card.Header>
              <Card.Title as="h4">Camera 4</Card.Title>
              <p className="card-category">Location (name)</p>
            </Card.Header>
            <Card.Body>
              <img
                src={require("assets/img/main2.png")}
                alt="..."
                style={{ width: "540px", height: "250px" }}
              />
            </Card.Body>
            <Card.Footer>
              <hr></hr>
              <div className="stats">
                <i className="fas fa-history"></i>
                Updated 5 minutes ago
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default Surveillance;
