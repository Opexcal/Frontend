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
  const publicRoutes = ['/login', '/register', '/forgot-password', '/signup', '/reset-password'];
  
  // ✅ Fix: Use startsWith() to match routes with parameters
  const isPublicRoute = publicRoutes.some(route => 
    window.location.pathname.startsWith(route)
  );
  
  if (isPublicRoute) {
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
    if (import.meta.env.DEV) {
      console.error('loadCurrentUser error:', err);
    }
    
    // ✅ Only clear token if not on a public route
    if (!isPublicRoute) {
      localStorage.removeItem('authToken');
    }
    setUser(null);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const login = async (credentials) => {
    try {
      const res = await authApi.login(credentials);
      
      console.log('Full API response:', res);
      
      // ✅ Extract both token and user data
      const token = res.data?.token || res.token;
      const userData = res.data?.user || res.user;
      
      if (!userData) {
        throw new Error('No user data received');
      }
      
      // ✅ Store token if provided (fallback for mobile when cookies fail)
      if (token) {
        localStorage.setItem('authToken', token);
        if (import.meta.env.DEV) {
          console.log('✅ Token stored in localStorage');
        }
      } else if (import.meta.env.DEV) {
        console.log('ℹ️ No token in response, using cookies only');
      }
      
      const normalizedUser = {
        ...userData,
        role: backendToFrontendRole[userData.role] || "wanderer",
      };
      setUser(normalizedUser);
      
      return normalizedUser;
    } catch (error) {
      // Clear any stale token
      localStorage.removeItem('authToken');
      throw error;
    }
  };

  const register = async (data) => {
    try {
      const res = await authApi.register(data);
      
      const token = res.data?.token || res.token;
      const userData = res.data?.user || res.user;
      
      if (!userData) {
        throw new Error('No user data received');
      }
      
      // ✅ Store token if provided
      if (token) {
        localStorage.setItem('authToken', token);
      }
      
      const normalizedUser = {
        ...userData,
        role: backendToFrontendRole[userData.role] || "wanderer",
      };
      setUser(normalizedUser);
      
      return normalizedUser;
    } catch (error) {
      localStorage.removeItem('authToken');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Logout error:', error);
      }
    } finally {
      // ✅ Always clear token and user state
      localStorage.removeItem('authToken');
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