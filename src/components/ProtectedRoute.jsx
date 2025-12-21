import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to role-appropriate dashboard instead of generic /dashboard
    const roleRoutes = {
      manager: "/dashboard/manager",
      admin: "/dashboard/staff",
      staff: "/dashboard/staff",
      wanderer: "/dashboard/wanderer"
    };
    const defaultRoute = roleRoutes[user?.role] || "/dashboard/staff";
    return <Navigate to={defaultRoute} replace />;
  }

  // Support both direct children and nested routes (Outlet)
  if (children) return children;
  return <Outlet />;
};

export default ProtectedRoute;
