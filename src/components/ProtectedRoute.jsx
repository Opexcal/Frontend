import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();

  // User not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Role not allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const roleRoutes = {
      manager: "/dashboard/manager",
      admin: "/dashboard/admin",
      staff: "/dashboard/staff",
      wanderer: "/dashboard/wanderer",
    };

    const defaultRoute = roleRoutes[user.role] || "/dashboard/staff";
    return <Navigate to={defaultRoute} replace />;
  }

  // Support both direct children and nested routes
  if (children) return children;
  return <Outlet />;
};

export default ProtectedRoute;
