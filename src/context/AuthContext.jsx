import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "@/api/authApi";
import { roleDisplayMap, backendToFrontendRole } from '@/constant/roleMapDisplay';
import apiClient from '@/api/client';
import { LoadingScreen } from '@/components/LoadingScreen';

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
    const publicRoutes = ['/login', '/register', '/forgot-password'];
  if (publicRoutes.includes(window.location.pathname)) {
    setLoading(false);
    return;
  }
  try {
    const res = await authApi.getMe();
    const apiUser = res.data?.user || res.user || res.data || res;
    
    if (!apiUser || !apiUser.email) {
      throw new Error('Invalid user data received');
    }
    
    const normalizedUser = {
      ...apiUser,
      role: backendToFrontendRole[apiUser.role] || "wanderer",
    };
    
    setUser(normalizedUser);
  } catch (err) {
    // Silently handle - user not logged in is expected on initial load
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
  
  console.log('Full API response:', res);
  
  // ✅ If using cookies, you don't need the token in the response
  const userData = res.data?.user || res.user;
  
  if (!userData) {
    throw new Error('No user data received');
  }
  
  // ❌ REMOVE THESE LINES if using cookie-based auth:
  // const token = res.data?.token || res.token;
  // if (!token) {
  //   throw new Error('No authentication token received');
  // }
  // localStorage.setItem('authToken', token);
  
  const normalizedUser = {
    ...userData,
    role: backendToFrontendRole[userData.role] || "wanderer",
  };
  setUser(normalizedUser);
  
  return normalizedUser;
};
const register = async (data) => {
  const res = await authApi.register(data);
  
  const userData = res.data?.user || res.user;
  
  if (!userData) {
    throw new Error('No user data received');
  }
  
  const normalizedUser = {
    ...userData,
    role: backendToFrontendRole[userData.role] || "wanderer",
  };
  setUser(normalizedUser);
  
  return normalizedUser;
};


const logout = async () => {
  try {
    await authApi.logout();
    setUser(null);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Logout error:', error);
    }
    setUser(null);
  }
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
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
