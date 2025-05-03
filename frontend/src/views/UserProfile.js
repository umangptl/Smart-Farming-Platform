import React, { useEffect, useState } from "react";
import { Button, Card, Form, Container, Row, Col } from "react-bootstrap";
import apiClient from "../api/APIClient";

function User() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/users/details")
      .then((res) => {
        setUserData(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch user details", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-5">Loading profile...</div>;
  if (!userData) return <div className="text-danger text-center">User not found.</div>;

  return (
    <Container fluid>
      <Row>
        <Col md="8">
          <Card>
            <Card.Header>
              <Card.Title as="h4">Edit Profile</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Col className="pr-1" md="5">
                    <Form.Group>
                      <label>Role (disabled)</label>
                      <Form.Control
                        defaultValue={userData.role}
                        disabled
                        placeholder="Role"
                        type="text"
                      />
                    </Form.Group>
                  </Col>
                  <Col className="px-1" md="3">
                    <Form.Group>
                      <label>Username</label>
                      <Form.Control
                        defaultValue={userData.username}
                        placeholder="Username"
                        type="text"
                        disabled
                      />
                    </Form.Group>
                  </Col>
                  <Col className="pl-1" md="4">
                    <Form.Group>
                      <label>Email address</label>
                      <Form.Control
                        defaultValue={userData.email}
                        placeholder="Email"
                        type="email"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col className="pr-1" md="6">
                    <Form.Group>
                      <label>First Name</label>
                      <Form.Control
                        defaultValue={userData.first_name}
                        placeholder="First Name"
                        type="text"
                      />
                    </Form.Group>
                  </Col>
                  <Col className="pl-1" md="6">
                    <Form.Group>
                      <label>Last Name</label>
                      <Form.Control
                        defaultValue={userData.last_name}
                        placeholder="Last Name"
                        type="text"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <Form.Group>
                      <label>Address</label>
                      <Form.Control
                        defaultValue={userData.address}
                        placeholder="Home Address"
                        type="text"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col className="pr-1" md="4">
                    <Form.Group>
                      <label>City</label>
                      <Form.Control
                        defaultValue={userData.city}
                        placeholder="City"
                        type="text"
                      />
                    </Form.Group>
                  </Col>
                  <Col className="px-1" md="4">
                    <Form.Group>
                      <label>Country</label>
                      <Form.Control
                        defaultValue={userData.country}
                        placeholder="Country"
                        type="text"
                      />
                    </Form.Group>
                  </Col>
                  <Col className="pl-1" md="4">
                    <Form.Group>
                      <label>Postal Code</label>
                      <Form.Control
                        defaultValue={userData.postal_code}
                        placeholder="ZIP Code"
                        type="text"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <Form.Group>
                      <label>About Me</label>
                      <Form.Control
                        defaultValue={userData.about_me}
                        placeholder="Here can be your description"
                        rows="4"
                        as="textarea"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button className="btn-fill pull-right" type="submit" variant="info">
                  Update Profile
                </Button>
                <div className="clearfix"></div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md="4">
          <Card className="card-user">
            <div className="card-image">
              <img alt="..." src={require("assets/img/banner.png")} />
            </div>
            <Card.Body>
              <div className="author">
                <a href="#profile" onClick={(e) => e.preventDefault()}>
                  <img
                    alt="..."
                    className="avatar border-gray"
                    src={require("assets/img/default-avatar.png")}
                  />
                  <h5 className="title">
                    {userData.first_name} {userData.last_name}
                  </h5>
                </a>
                <p className="description">{userData.username}</p>
              </div>
              <p className="description text-center">{userData.about_me}</p>
            </Card.Body>
            <hr />
            <div className="button-container mr-auto ml-auto">
              <Button className="btn-simple btn-icon" variant="link">
                <i className="fab fa-facebook-square"></i>
              </Button>
              <Button className="btn-simple btn-icon" variant="link">
                <i className="fab fa-twitter"></i>
              </Button>
              <Button className="btn-simple btn-icon" variant="link">
                <i className="fab fa-google-plus-square"></i>
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default User;
