import React from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";

function Sidebar({ color, image, routes }) {
  const location = useLocation();
  const activeRoute = (routeName) =>
    location.pathname.indexOf(routeName) > -1 ? "active" : "";

  return (
    <div className="sidebar" data-image={image} data-color={color}>
      <div
        className="sidebar-background"
        style={{
          backgroundImage: "url(" + image + ")",
        }}
      />
      <div className="sidebar-wrapper">
        <div className="logo d-flex align-items-center justify-content-start">
          <a href="/admin/dashboard" className="simple-text logo-mini mx-1">
            <div className="logo-img">
              <img src={require("assets/img/Herd-Vision.png")} alt="..." />
            </div>
          </a>
          <a className="simple-text" href="/admin/dashboard">
            Herd Vision
          </a>
        </div>
        <Nav>
          {routes
            .filter((prop) => prop.layout !== "/auth")
            .map((prop, key) => {
              if (!prop.redirect) {
                return (
                  <li
                    className={
                      prop.upgrade
                        ? "active active-pro"
                        : activeRoute(prop.layout + prop.path)
                    }
                    key={key}
                  >
                    <NavLink
                      to={prop.layout + prop.path}
                      className="nav-link"
                      activeClassName="active"
                    >
                      <i className={prop.icon} />
                      <p>{prop.name}</p>
                    </NavLink>
                  </li>
                );
              }
              return null;
            })}
        </Nav>
      </div>
    </div>
  );
}

export default Sidebar;
