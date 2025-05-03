// src/layouts/Auth.js
import React from "react";
import { useLocation, Route, Switch } from "react-router-dom";

import AdminNavbar from "components/Navbars/AdminNavbar";
import Footer from "components/Footer/Footer";
import routes from "routes.js";

function Auth() {
  const location = useLocation();
  const mainPanel = React.useRef(null);

  // Scroll to top on route change
  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop   = 0;
    if (mainPanel.current) mainPanel.current.scrollTop = 0;
  }, [location]);

  // Render only the /auth routes
  const getAuthRoutes = (routes) =>
    routes.map((prop, key) => {
      if (prop.layout === "/auth") {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      }
      return null;
    });

  return (
    <div className="wrapper wrapper-full-page">
      <AdminNavbar />

      <div className="full-page" ref={mainPanel}>
        <Switch>{getAuthRoutes(routes)}</Switch>
        <Footer />
      </div>
    </div>
  );
}

export default Auth;