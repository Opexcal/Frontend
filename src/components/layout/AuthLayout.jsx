import { Outlet } from "react-router-dom";
import { PublicNavbar } from "./PublicNavbar";

 const AuthLayout = ({ showSignUp = true, showLogin = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar showSignUp={showSignUp} showLogin={showLogin} />
      <main className="flex-1 flex items-center justify-center p-4">
        <Outlet />
      </main>
    </div>
  );
};
export default AuthLayout;