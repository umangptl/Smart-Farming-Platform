# 🌾 Smart Cloud Platform for Livestock Farms 🐄
An integrated, full-stack smart farming solution designed to digitize livestock farm operations using computer vision, surveillance systems, animal tracking, real-time dashboards, and cloud-based automation. Developed as a Master's thesis project, this platform empowers farm managers to monitor livestock, manage operations, and enhance productivity with data-driven insights.

## 🧠 Overview
The Smart Cloud Platform for Livestock Farms provides an end-to-end intelligent monitoring system for modern farms. Through a combination of machine learning, Optical Character Recognition, camera surveillance, and real-time environmental monitoring, the system aims to automate livestock tracking, improve animal welfare management, and enhance decision-making at scale.

### This platform includes:
- Computer vision using Machine learning models for livestock counting and detection
- Real-time camera feeds and smart surveillance.
- Animal tracking through virtual boundary detection.
- An AI-driven OCR system for identifying cow ear tags from videos.
- A cloud-ready React dashboard for real-time visualization.
- Surveillance integration to monitor livestock and detect anomalies.
- Modules for task scheduling, weather tracking, and livestock inventory.
- Backend APIs that serve as the middleware for ML inference and database operations.

## Key Features

📹 Live Camera Surveillance
- View active camera feeds across paddocks.
- Planned: schedule recordings and alerts for movement detection.

🐄 Animal Movement Tracking (Cow Line-Crossing)
- Define virtual boundaries (lines/zones) within the farm.
- Detect when cows cross boundaries using video analysis.
- Log crossing events with timestamps and animal ID.
- Foundation for behavior tracking and geofencing alerts.

🔍 Livestock OCR Detection
- Upload or stream video to detect cow ear tags using OCR.
- Extract animal ID for records.

🐮 Livestock Inventory
- Manage livestock profiles including ID, breed, paddock location, and health status.
- Create, edit, and delete livestock data entries.

📍 Location & Paddock Management
- Assign animals to specific paddocks or zones.
- Track movement and paddock usage.

✅ Task Management
- Create and assign farm tasks (e.g., feeding, vaccination, cleaning).
- Mark task completion and track statuses.

🌦️ Weather Dashboard
- Display current weather metrics from an external API.
- Adapt farm schedules based on weather forecasts.

👤 User Profile & Access
- Profile management for farm operators.
- Planned: Role-based access control for task assignments.

## 🧰 Technology Stack
- Frontend	React, SCSS, Light Bootstrap Dashboard Template
- Backend	Flask, Python, Flask-Restful
- ML	OpenCV, EasyOCR (Planned YOLOv8 for video tracking)
- Media	MP4/PNG uploads, surveillance camera streams
- Deployment	Docker, AWS

## 🔮 Future Enhancements
- 🧠 Integrate smarter models for cow detection & movement pattern prediction
- 📡 RTSP camera integration for live IP feeds
- 🧾 Add historical logs for tracking and analytics
- 🔔 Real-time alerts for restricted zone crossing
- 🔐 Role-based authentication (Admin, Farmhand, Vet)
- 📱 Mobile app version for remote monitoring
- ☁️ Cloud deployment with Firebase or AWS (media + DB)
