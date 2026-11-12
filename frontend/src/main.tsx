
import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "leaflet/dist/leaflet.css";
import "./index.css";

// Layout
import Layout from "./components/Layout";

// UI Components
import { Toasts } from "./components/ui";

// Authentication Pages
import { Login, Signup } from "./pages/Auth";

// Operations Pages
import {
  Dashboard,
  LiveMap,
  IncidentDetails,
} from "./pages/Ops";

// Administration Pages
import {
  Responders,
  History,
  Reports,
  SettingsPage,
  Profile,
} from "./pages/Admin";

function App() {
  return (
    <BrowserRouter>
      <Toasts>
        <Routes>
          {/* Default Route */}
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Main Application */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/live-map" element={<LiveMap />} />
            <Route
              path="/incident-details/:id"
              element={<IncidentDetails />}
            />
            <Route path="/responders" element={<Responders />} />
            <Route path="/history" element={<History />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Unknown Routes */}
          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
        </Routes>
      </Toasts>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
