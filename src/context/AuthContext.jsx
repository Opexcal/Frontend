import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "@/api/authApi";

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
      setUser(res.data?.user || res.user || res);
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

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const token = res.token || res.data?.token;
    const userData = res.user || res.data?.user;
    if (token) localStorage.setItem("authToken", token);
    setUser(userData || null);
    return userData;
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    const token = res.token || res.data?.token;
    const userData = res.user || res.data?.user;
    if (token) localStorage.setItem("authToken", token);
    setUser(userData || null);
    return userData;
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const hasPermission = (permission) => {
    const permissions = {
      manager: ["all"],
      admin: ["manage_groups", "assign_tasks", "view_team", "create_events"],
      staff: ["view_tasks", "update_own_tasks", "accept_decline_tasks"],
      wanderer: ["view_own_tasks", "create_personal_tasks"],
    };

    if (!user || !user.role) return false;
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
