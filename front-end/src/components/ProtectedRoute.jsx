import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("admin_token");

  // Check if the token exists, otherwise redirect to login
  return token ? <Outlet /> : <Navigate to="/admin-login" replace />;
};

export default ProtectedRoute;
