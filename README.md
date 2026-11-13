# RescueTrack – Intelligent Accident Detection and Emergency Response System

**RescueTrack** is an intelligent accident detection and emergency response system designed to improve road safety by helping monitor accident incidents, identify their locations and support emergency responders in providing timely assistance.

The project provides a web-based platform for administrators and authorized emergency responders to monitor and manage accident-related information.

## Project Overview

RescueTrack currently consists of two main components:

1. **Web Application:** A React-based dashboard for administrators and authorized emergency responders to monitor incidents, view accident locations, manage responders and track emergency response activities.
2. **Backend and Database:** A Node.js and Express.js backend connected to MongoDB Atlas for authentication, data management and application services.

**Future Mobile Application:** A Flutter-based mobile application is planned to collect accelerometer, gyroscope and GPS data, detect possible accidents and send emergency alerts with location details to the backend.

## Key Features

- User authentication and authorization.
- Admin and responder dashboards.
- Incident monitoring and management.
- Live map for viewing accident locations.
- Emergency responder management.
- Incident history and reports.
- Dashboard analytics and statistics.
- Responsive web interface.

## Technologies Used

| Component | Technologies |
|---|---|
| Frontend | React.js, Vite, TypeScript |
| UI and Styling | Tailwind CSS, Lucide React |
| Maps | Leaflet |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JSON Web Token (JWT) |
| Password Security | bcryptjs |
| Future Mobile App | Flutter, Dart |

## Project Structure

```text
RescueTrack/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── rescuetrack-backend-stage1/
    └── rescuetrack-backend/
        ├── server.js
        ├── app.js
        ├── config/
        ├── models/
        ├── controllers/
        ├── routes/
        ├── middleware/
        ├── scripts/
        └── package.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm
- MongoDB Atlas account
- Visual Studio Code

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Start the Frontend

Open a terminal in the main project folder:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

### 3. Start the Backend

Open another terminal in the main project folder:

```bash
cd rescuetrack-backend-stage1/rescuetrack-backend
npm install
```

Create a `.env` file using `.env.example` and configure the MongoDB connection and JWT secret.

Start the backend:

```bash
npm run dev
```

Backend health endpoint:

```text
http://localhost:5000/api/health
```

## System Architecture

```text
       React Web Application
                 |
                 v
          Node.js Backend
                 |
                 v
           MongoDB Atlas
                 |
                 v
      Admins and Responders

       Future Enhancement
                 |
                 v
       Flutter Mobile App
                 |
                 v
       Accident Detection
       GPS Location Capture
       Emergency Alerts
```

## Future Enhancements

- Develop and integrate the Flutter mobile application.
- Implement automatic accident detection using mobile sensors.
- Capture accident locations using GPS.
- Send emergency alerts to the backend.
- Implement automatic responder assignment.
- Enable real-time emergency response tracking.
- Generate detailed incident reports.
- Integrate with emergency services.

## Development Status

The React web application and Stage 1 backend are under development. The Flutter mobile application and its accident detection and emergency alert features are planned for future development.

Some dashboard information may use simulated development data and should not be considered real emergency information.

## Project Objective

To develop an intelligent accident detection and emergency response system that helps identify road accidents, capture their locations and support faster emergency assistance.

---

**Project Name:** RescueTrack

**Project Title:** Intelligent Accident Detection and Emergency Response System

**Developed by:** Poosapati Harshini
