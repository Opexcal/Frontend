import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const roleRoutes = {
    manager: "/dashboard/manager",
    admin: "/dashboard/admin",
    staff: "/dashboard/staff",
    wanderer: "/dashboard/wanderer",
  };

  const defaultRoute = roleRoutes[user.role] || "/dashboard/wanderer";

  return <Navigate to={defaultRoute} replace />;
};

export default Dashboard;
