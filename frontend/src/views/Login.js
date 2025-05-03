import React, { useState, useContext } from "react";
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
import { Link } from "react-router-dom";
import { AuthContext } from "components/Authentication/AuthProvider";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(credentials);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="content">
      <Row>
        <Col md={4} className="mx-auto">
          <Card>
            <CardHeader>
              <CardTitle tag="h4" className="text-center">
                Login
              </CardTitle>
            </CardHeader>
            <CardBody>
              <Form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                <FormGroup>
                  <Label for="username">Username</Label>
                  <Input
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Enter username"
                    value={credentials.username}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="password">Password</Label>
                  <Input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Enter password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
                <Button color="primary" className="btn-block" type="submit">
                  Sign In
                </Button>
                <div className="text-center mt-3">
                  <Link to="/auth/register">
                    Don't have an account? Register
                  </Link>
                </div>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;