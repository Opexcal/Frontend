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
    console.log('🔄 Loading current user...');
    const res = await authApi.getMe();
    
    // After interceptor unwraps: res = { success: true, data: { user: {...} } }
    console.log('📦 getMe response:', res);
    
    const apiUser = res.data?.user || res.user || res.data || res;
    
    if (!apiUser || !apiUser.email) {
      throw new Error('Invalid user data received');
    }
    
    const normalizedUser = {
      ...apiUser,
      role: backendToFrontendRole[apiUser.role] || "wanderer",
    };
    
    console.log('✅ User loaded:', normalizedUser);
    setUser(normalizedUser);
    
  } catch (err) {
    console.error('❌ Failed to load user:', err);
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
// src/context/AuthContext.jsx
const login = async (credentials) => {
  try {
    const res = await authApi.login(credentials);
    
    const token = res.data?.token || res.token;
    const userData = res.data?.user || res.user;
    
    if (!token) {
      throw new Error('No authentication token received');
    }
    
    localStorage.setItem("authToken", token);
    
    const normalizedUser = {
      ...userData,
      role: backendToFrontendRole[userData.role] || "wanderer",
    };
    setUser(normalizedUser);
    
    return normalizedUser; // ✅ Return user on success
  } catch (error) {
    // ❌ DON'T show toast here
    // ✅ Just re-throw the error to Login.jsx
    throw error;
  }
};

const register = async (data) => {
  try {
    const res = await authApi.register(data);
    
    const token = res.data?.token || res.token;
    const userData = res.data?.user || res.user;
    
    if (!token) {
      throw new Error('No authentication token received');
    }
    
    localStorage.setItem("authToken", token);
    
    const normalizedUser = {
      ...userData,
      role: backendToFrontendRole[userData.role] || "wanderer",
    };
    setUser(normalizedUser);
    
    return normalizedUser; // ✅ Return user on success
  } catch (error) {
    // ✅ Re-throw to Signup.jsx
    throw error;
  }
};
const refreshToken = async () => {
  try {
    const res = await authApi.post('/auth/refresh');
    const newToken = res.data?.token;
    
    if (newToken) {
      localStorage.setItem('authToken', newToken);
      return true;
    }
    return false;
  } catch (err) {
    localStorage.removeItem('authToken');
    setUser(null);
    return false;
  }
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
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
