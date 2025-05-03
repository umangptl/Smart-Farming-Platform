import React, { useState, useContext } from "react";
import { AuthContext } from "components/Authentication/AuthProvider";

import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Button
} from "reactstrap";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "Staff",
    first_name: "",
    last_name: "",
    address: "",
    city: "",
    country: "",
    postal_code: "",
    phone: "",
    about_me: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const { register } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
    } catch (err) {
      alert(err.message); 
    }
  }

  return (
    <div className="content">
      <Row>
        <Col md={8} className="mx-auto">
          <Card>
            <CardHeader>
              <CardTitle tag="h4">User Registration</CardTitle>
            </CardHeader>
            <CardBody>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="username">Username</Label>
                      <Input
                        type="text"
                        name="username"
                        id="username"
                        placeholder="Enter username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="email">Email</Label>
                      <Input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="password">Password</Label>
                      <Input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="role">Role</Label>
                      <Input
                        type="select"
                        name="role"
                        id="role"
                        value={formData.role}
                        onChange={handleChange}
                      >
                        <option>Staff</option>
                        <option>Admin</option>
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="first_name">First Name</Label>
                      <Input
                        type="text"
                        name="first_name"
                        id="first_name"
                        placeholder="Enter first name"
                        value={formData.first_name}
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="last_name">Last Name</Label>
                      <Input
                        type="text"
                        name="last_name"
                        id="last_name"
                        placeholder="Enter last name"
                        value={formData.last_name}
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <FormGroup>
                      <Label for="address">Address</Label>
                      <Input
                        type="text"
                        name="address"
                        id="address"
                        placeholder="Enter address"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="city">City</Label>
                      <Input
                        type="text"
                        name="city"
                        id="city"
                        placeholder="Enter city"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="country">Country</Label>
                      <Input
                        type="text"
                        name="country"
                        id="country"
                        placeholder="Enter country"
                        value={formData.country}
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="postal_code">Postal Code</Label>
                      <Input
                        type="text"
                        name="postal_code"
                        id="postal_code"
                        placeholder="Enter postal code"
                        value={formData.postal_code}
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="phone">Phone</Label>
                      <Input
                        type="text"
                        name="phone"
                        id="phone"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <FormGroup>
                      <Label for="about_me">About Me</Label>
                      <Input
                        type="textarea"
                        name="about_me"
                        id="about_me"
                        rows="4"
                        placeholder="Tell us about yourself"
                        value={formData.about_me}
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Button className="btn-fill" color="primary" type="submit">
                  Register
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Register;