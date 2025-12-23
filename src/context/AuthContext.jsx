import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "@/api/authApi";
import { roleDisplayMap, backendToFrontendRole } from '@/constant/roleMapDisplay';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      const apiUser = res.data?.user || res.user || res;
// In loadCurrentUser:
const normalizedUser = {
  ...apiUser,
  role: backendToFrontendRole[apiUser.role] || "wanderer",
};
setUser(normalizedUser);

    } catch (err) {
      // Token invalid/expired; clear it
      localStorage.removeItem("authToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  // In AuthContext.jsx
const login = async (credentials) => {
  const res = await authApi.login(credentials);
  // res is already the response.data from interceptor
  // so it's { success: true, message: '...', data: { token, user } }
  const token = res.data?.token;
  const userData = res.data?.user;
  
  if (token) localStorage.setItem("authToken", token);
  // In login:
const normalizedUser = {
  ...userData,
  role: backendToFrontendRole[userData.role] || "wanderer",
};
setUser(normalizedUser);

  return userData;
};

const register = async (data) => {
  const res = await authApi.register(data);
  const token = res.data?.token;
  const userData = res.data?.user;
  
  if (token) localStorage.setItem("authToken", token);
  const normalizedUser = {
  ...userData,
  role: backendToFrontendRole[userData.role] || "wanderer",
};
setUser(normalizedUser);

  return userData;
};
  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const hasPermission = (permission) => {
  if (!user?.role) return false;

  const permissions = {
    manager: ["all"],
    admin: ["manage_groups", "assign_tasks", "view_team", "create_events"],
    staff: ["view_tasks", "update_own_tasks", "accept_decline_tasks"],
    wanderer: ["view_own_tasks", "create_personal_tasks"],
  };

  if (user.role === "manager") return true;
  return permissions[user.role]?.includes(permission) ?? false;
};

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        refreshUser: loadCurrentUser,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
