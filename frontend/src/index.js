import React from "react";
import ReactDOM from "react-dom";

import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/animate.min.css";
import "./assets/scss/light-bootstrap-dashboard-react.scss?v=2.0.0";
import "./assets/css/demo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import AdminLayout from "layouts/Admin.js";
import Auth from "layouts/Auth.js";
import { EnumsProvider } from "./context/EnumsContext";
import { AuthProvider } from "components/Authentication/AuthProvider";
import ProtectedRoute from "components/Authentication/ProtectedRoutes";


ReactDOM.render(
  <EnumsProvider>
    <BrowserRouter>
      <AuthProvider>
        <Switch>
          <ProtectedRoute path="/admin" component={AdminLayout} />
          <Route path="/auth" component={Auth} />
          <Redirect from="/" to="/admin/dashboard" />
        </Switch>
      </AuthProvider>
    </BrowserRouter>
  </EnumsProvider>,
  document.getElementById("root")
);
