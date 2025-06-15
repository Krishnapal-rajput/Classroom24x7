import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminPanel from "./Admin";
import AdminLogin from "./AdminLogin";
import Employee from "./Employee";
import Home from "./Home";
import { auth } from "./firebaseConfig";

const PrivateRoute = ({ children }) => {
  return auth.currentUser ? children : <Navigate to="/admin-login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/employee" element={<Employee/>} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminPanel />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
