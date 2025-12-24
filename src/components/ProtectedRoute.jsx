import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // User not logged in - redirect to login with return URL
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permissions if specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const roleRoutes = {
      manager: "/dashboard/manager",
      admin: "/dashboard/admin",
      staff: "/dashboard/staff",
      wanderer: "/dashboard/wanderer",
    };

    const defaultRoute = roleRoutes[user.role] || "/dashboard/wanderer";
    return <Navigate to={defaultRoute} replace />;
  }

  // Support both direct children and nested routes
  if (children) return children;
  return <Outlet />;
};

export default ProtectedRoute;