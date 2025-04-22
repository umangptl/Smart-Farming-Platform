import Dashboard from "views/Dashboard.js";
import Surveillance from "views/Surveillance";
import OCR_Detection from "views/OCR_Detection";
import Weather from "views/Weather.js";
import Tasks from "views/Tasks";
import Inventory from "views/Inventory";
import Notifications from "views/Notifications.js";
import User from "views/UserProfile";
import ModelTestPage from "views/ModelTestPage";

const dashboardRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-chart-pie-35",
    component: Dashboard,
    layout: "/admin",
  },
  {
    path: "/surveillance",
    name: "Surveillance",
    icon: "nc-icon nc-cctv",
    component: Surveillance,
    layout: "/admin",
  },
  {
    path: "/OCR_Detection",
    name: "OCR_Detection",
    icon: "nc-icon nc-camera-20",
    component: OCR_Detection,
    layout: "/admin",
  },
  {
    path: "/weather",
    name: "Weather",
    icon: "nc-icon nc-sun-fog-29",
    component: Weather,
    layout: "/admin",
  },
  {
    path: "/tasks",
    name: "Tasks",
    icon: "nc-icon nc-notes",
    component: Tasks,
    layout: "/admin",
  },
  {
    path: "/inventory",
    name: "Inventory",
    icon: "nc-icon nc-grid-45",
    component: Inventory,
    layout: "/admin",
  },
  {
    path: "/user",
    name: "User",
    icon: "nc-icon nc-circle-09",
    component: User,
    layout: "/admin",
  },
  {
    path: "/notifications",
    name: "Notifications",
    icon: "nc-icon nc-bell-55",
    component: Notifications,
    layout: "/admin",
  },
  {
    path: "/ml_models",
    name: "ML Models",
    icon: "nc-icon nc-vector ",
    component: ModelTestPage,
    layout: "/admin",
  },
];

export default dashboardRoutes;
