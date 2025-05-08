import React, { useContext, useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Navbar, Container, Nav, Dropdown, Button } from "react-bootstrap";
import routes from "routes.js";
import { AuthContext } from "components/Authentication/AuthProvider";

function Header() {
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith("/auth");
  const { logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  const mobileSidebarToggle = (e) => {
    e.preventDefault();
    document.documentElement.classList.toggle("nav-open");
    const node = document.createElement("div");
    node.id = "bodyClick";
    node.onclick = function () {
      this.parentElement.removeChild(this);
      document.documentElement.classList.toggle("nav-open");
    };
    document.body.appendChild(node);
  };

  const getBrandText = () => {
    for (let i = 0; i < routes.length; i++) {
      if (
        location.pathname.indexOf(routes[i].layout + routes[i].path) !== -1
      ) {
        return routes[i].name;
      }
    }
    return "HERD VISION";
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("http://localhost:5000/notifications/recent");
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <Navbar bg="light" expand="lg">
      <Container fluid>
        <div className="d-flex justify-content-center align-items-center ml-2 ml-lg-0">
          {!isAuthPage && (
            <Button
              variant="dark"
              className="d-lg-none btn-fill d-flex justify-content-center align-items-center rounded-circle p-2"
              onClick={mobileSidebarToggle}
            >
              <i className="fas fa-ellipsis-v"></i>
            </Button>
          )}
          <Navbar.Brand
            href="#home"
            onClick={(e) => e.preventDefault()}
            className="mr-2"
          >
            {getBrandText()}
          </Navbar.Brand>
        </div>
        {!isAuthPage && (
          <>
            <Navbar.Toggle aria-controls="basic-navbar-nav" className="mr-2">
              <span className="navbar-toggler-bar burger-lines"></span>
              <span className="navbar-toggler-bar burger-lines"></span>
              <span className="navbar-toggler-bar burger-lines"></span>
            </Navbar.Toggle>
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="nav mr-auto" navbar>
                <Nav.Item>
                  <Nav.Link
                    className="m-0"
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                  >
                    <i className="nc-icon nc-zoom-split"></i>
                    <span className="d-lg-block"> Search</span>
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              <Nav className="ml-auto" navbar>
                <Dropdown as={Nav.Item}>
                  <Dropdown.Toggle
                    as={Nav.Link}
                    data-toggle="dropdown"
                    id="dropdown-67443507"
                    variant="default"
                    className="m-0"
                  >
                    <i className="nc-icon nc-notification-70"></i>
                    <span className="notification">{notifications.length}</span>
                    <span className="d-lg-none ml-1">Notifications</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    align="end"
                    style={{
                      minWidth: "350px",
                      maxWidth: "400px",
                      maxHeight: "300px",
                      overflowY: "auto",
                      padding: "10px",
                      borderRadius: "8px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      position: "absolute",
                      right: 0,
                      left: "auto",
                      zIndex: 1050,
                    }}
                  >
                    {notifications.length === 0 ? (
                      <div className="text-muted px-2 py-1">No new notifications</div>
                    ) : (
                      notifications.map((notif) => (
                        <Dropdown.Item
                          key={notif.id}
                          onClick={(e) => e.preventDefault()}
                          style={{
                            whiteSpace: "normal",
                            fontSize: "0.95rem",
                            lineHeight: "1.4",
                            padding: "10px 12px",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          {notif.note}
                        </Dropdown.Item>
                      ))
                    )}
                  </Dropdown.Menu>
                </Dropdown>

                <Nav.Item>
                  <Nav.Link as={Link} to="/admin/user" className="m-0">
                    <span className="no-icon">Account</span>
                  </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                  <Nav.Link
                    className="m-0"
                    onClick={logout}
                    style={{ cursor: "pointer" }}
                  >
                    <span className="no-icon">Log out</span>
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Navbar.Collapse>
          </>
        )}
      </Container>
    </Navbar>
  );
}

export default Header;
