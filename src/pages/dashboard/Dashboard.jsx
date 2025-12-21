import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  
  const roleRoutes = {
    manager: "/dashboard/manager",
    admin: "/dashboard/staff",
    staff: "/dashboard/staff",
    wanderer: "/dashboard/wanderer"
  };
  
  const defaultRoute = roleRoutes[user?.role] || "/dashboard/staff";
  
  return <Navigate to={defaultRoute} replace />;
};

export default Dashboard;
