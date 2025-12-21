import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // TODO: replace with real auth/user fetch
    return {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "manager", // 'manager' | 'admin' | 'staff' | 'wanderer'
      groups: ["engineering"],
    };
  });

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
    <AuthContext.Provider value={{ user, setUser, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
