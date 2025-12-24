import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import AddUserModal from "./users/AddUserModal";
import { useAuth } from "@/context/AuthContext";
import { usersApi } from "@/api/usersApi";
import { useToast } from "@/hooks/use-toast";
import { roleDisplayMap as roleLabelMap, roleColors } from '../../constant/roleMapDisplay';
import EditUserModal from "./users/EditUserModal"


const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [view, setView] = useState("active");
  const [editingUser, setEditingUser] = useState(null)

  // ✅ FIX #1: Move loadUsers outside useEffect
// In UserManagement.jsx - Update the loadUsers function
const loadUsers = async () => {
  setLoading(true);
  try {
    const res = await usersApi.list(true);
    const list = res.users || res.data?.users || [];
    
    setUsers(
      list.map((u) => ({
        id: u._id || u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        status: u.isActive ? "active" : "archived",
        // ✅ Better groups handling
        groups: Array.isArray(u.groups) 
          ? u.groups.map(g => typeof g === 'object' ? g.name : g).filter(Boolean)
          : [],
        lastActive: u.lastActive || "—",
      }))
    );
  } catch (error) {
    toast({
      title: "Failed to load users",
      description: error?.message || "Please try again later.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    loadUsers();
  }, []);

  // ✅ FIX #2: Add permission check (or remove it)
  const hasPermission = (permission) => {
    if (!currentUser) return false;
    if (currentUser.role === 'SuperAdmin') return true;
    if (currentUser.role === 'Admin' && permission === 'manage_users') return true;
    return false;
  };

  // ✅ Now handleUserCreated can access loadUsers
  const handleUserCreated = (newUser) => {
    loadUsers();
    toast({
      title: "Success!",
      description: `${newUser.name} has been added`,
    });
  };

  const filteredUsers = useMemo(() => {
    const bySearch = users.filter(
      (u) =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
    );
    return bySearch.filter((u) => (view === "active" ? u.isActive : !u.isActive));
  }, [users, query, view]);

  const archiveUser = async (id) => {
    try {
      await usersApi.deactivate(id);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: false, status: "archived" } : u))
      );
      toast({
        title: "User deactivated",
        description: "The user was moved to Archived.",
      });
    } catch (error) {
      toast({
        title: "Failed to deactivate",
        description: error?.message || error?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const restoreUser = async (id) => {
    try {
      await usersApi.reactivate(id);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: true, status: "active" } : u))
      );
      toast({
        title: "User restored",
        description: "The user has been reactivated.",
      });
    } catch (error) {
      toast({
        title: "Failed to restore",
        description: error?.message || error?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search users"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={() => setShowAddUser(true)}>Add User</Button>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Tabs value={view} onValueChange={setView}>
            <TabsList>
              <TabsTrigger value="active">Active Users</TabsTrigger>
              <TabsTrigger value="archived">Archived Users</TabsTrigger>
            </TabsList>
          </Tabs>
          <span className="text-xs text-muted-foreground">
            Viewing <strong>{view === "active" ? "active" : "archived"} accounts</strong>
          </span>
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="h-8 bg-slate-100 rounded" />
            <div className="h-8 bg-slate-100 rounded" />
            <div className="h-8 bg-slate-100 rounded" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Groups</th>
                  <th className="pb-2">Last Active</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No {view === "active" ? "active" : "archived"} users found
                    </td>
                  </tr>
                )}
                {filteredUsers.map((u) => {
                  const isSelf = currentUser && currentUser.id === u.id;

                  return (
                    <tr key={u.id} className="border-t">
                      <td className="py-3">{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`px-2 py-1 rounded ${roleColors[u.role]}`}>
                          {roleLabelMap[u.role] || u.role}
                        </span>
                      </td>
                      <td className="capitalize">
                        {u.isActive ? (
                          <span className="text-emerald-600">active</span>
                        ) : (
                          <span className="text-slate-500">archived</span>
                        )}
                      </td>
                      <td>{u.groups.join(", ") || "—"}</td>
                      <td>{u.lastActive}</td>
                      <td>
                        <div className="flex items-center gap-2">
                           <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingUser(u)}
                            >
                              Edit
                            </Button>
                          <Link to={`/admin/users/${u.id}`} className="text-primary">
                            View
                          </Link>

                          {view === "active" ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  {hasPermission('manage_users') && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      disabled={isSelf}
                                      onClick={() => !isSelf && archiveUser(u.id)}
                                    >
                                      Delete
                                    </Button>
                                  )}
                                </span>
                              </TooltipTrigger>
                              {isSelf && (
                                <TooltipContent side="top">
                                  You cannot delete your own account.
                                </TooltipContent>
                              )}
                            </Tooltip>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => restoreUser(u.id)}>
                              Restore
                            </Button>
                          )}
                        </div>
                      </td>
                      
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AddUserModal open={showAddUser} onOpenChange={setShowAddUser} onSuccess={handleUserCreated} />
      <EditUserModal
  open={!!editingUser}
  onOpenChange={(open) => !open && setEditingUser(null)}
  userId={editingUser?.id}
  onSuccess={() => {
    loadUsers();
    setEditingUser(null);
    toast({ title: "User updated successfully" });
  }}
/>
    </div>
    
  );
};

export default UserManagement;

