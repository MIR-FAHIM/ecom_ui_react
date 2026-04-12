import React from "react";
import { Navigate } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  const userType =
    localStorage.getItem("userType") || sessionStorage.getItem("userType");

  if (!token || userType !== "admin") {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}
