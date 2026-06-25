import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getUserDetail } from "../api/controller/admin_controller/user_controller";

export default function RequireAdmin({ children }) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    const verifyAdmin = async () => {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");

      if (!token || !userId) {
        if (!active) return;
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      try {
        const res = await getUserDetail(userId);
        const user = res?.data?.data ?? res?.data?.user ?? res?.data ?? res?.user ?? null;
        const userType = user?.user_type ?? res?.data?.user_type ?? res?.user_type;

        if (!active) return;
        setIsAdmin(userType === "admin");
      } catch (error) {
        console.error("Admin guard failed:", error);
        if (!active) return;
        setIsAdmin(false);
      } finally {
        if (active) setChecking(false);
      }
    };

    verifyAdmin();

    return () => {
      active = false;
    };
  }, []);

  if (checking) return null;

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}
