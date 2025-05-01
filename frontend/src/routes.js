import Dashboard from "views/Dashboard.js";
import Surveillance from "views/Surveillance";
import OCR_Detection from "views/OCR_Detection";
import Weather from "views/Weather.js";
import Tasks from "views/Tasks";
import Inventory from "views/Inventory";
import Notifications from "views/Notifications.js";
import User from "views/UserProfile";
import MovementTracker from "views/MovementTracker";

const dashboardRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "fas fa-chart-pie",
    component: Dashboard,
    layout: "/admin",
  },
  {
    path: "/surveillance",
    name: "Surveillance",
    icon: "fas fa-video",
    component: Surveillance,
    layout: "/admin",
  },
  {
    path: "/OCR_Detection",
    name: "OCR Detection",
    icon: "fas fa-camera",
    component: OCR_Detection,
    layout: "/admin",
  },
  {
    path: "/movement-tracker",
    name: "Movement Tracker",
    icon: "far fa-eye",
    component: MovementTracker,
    layout: "/admin",
  },
  {
    path: "/weather",
    name: "Weather",
    icon: "fas fa-cloud-sun",
    component: Weather,
    layout: "/admin",
  },
  {
    path: "/tasks",
    name: "Tasks",
    icon: "fas fa-tasks",
    component: Tasks,
    layout: "/admin",
  },
  {
    path: "/inventory",
    name: "Inventory",
    icon: "fas fa-boxes",
    component: Inventory,
    layout: "/admin",
  },
  {
    path: "/user",
    name: "User",
    icon: "fas fa-user",
    component: User,
    layout: "/admin",
  },
  {
    path: "/notifications",
    name: "Notifications",
    icon: "fas fa-bell",
    component: Notifications,
    layout: "/admin",
  },
];

export default dashboardRoutes;
