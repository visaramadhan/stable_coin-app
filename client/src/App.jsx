// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import useAuth from "./hooks/useAuth";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import Dashboard from "./pages/dashboard.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

function AppRoutes({ currentUser, handleLogout }) {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />
      <Route
        path="/login"
        element={<Login />}
      />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={currentUser}>
            <Dashboard onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const { currentUser, handleLogout, loading } = useAuth();

  if (loading) {
    return <p>Loading auth...</p>; // ❗jangan render router sebelum loading selesai
  }

  return (
    <Router>
      <AppRoutes currentUser={currentUser} handleLogout={handleLogout} />
    </Router>
  );
}

export default App;
