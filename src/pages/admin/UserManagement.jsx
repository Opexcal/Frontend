import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import AddUserModal from "./users/AddUserModal";
import { useAuth } from "@/context/AuthContext";

const MOCK_USERS = Array.from({ length: 12 }).map((_, i) => {
  const isActive = i % 5 !== 0; // sprinkle some archived users
  return {
    id: String(i + 1),
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i % 3 === 0 ? "admin" : i % 3 === 1 ? "staff" : "wanderer",
    isActive,
    status: isActive ? "active" : "archived",
    groups: ["Engineering", "Product"].slice(0, (i % 2) + 1),
    lastActive: isActive ? "2 hours ago" : "archived",
  };
});

const roleColor = (role) => {
  switch (role) {
    case "manager":
      return "bg-purple-600 text-white";
    case "admin":
      return "bg-green-600 text-white";
    case "staff":
      return "bg-blue-600 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [view, setView] = useState("active");

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setUsers(MOCK_USERS);
      setLoading(false);
    }, 800);
  }, []);

  const filteredUsers = useMemo(() => {
    const bySearch = users.filter(
      (u) =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
    );

    return bySearch.filter((u) =>
      view === "active" ? u.isActive : !u.isActive
    );
  }, [users, query, view]);

  const archiveUser = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, isActive: false, status: "archived" } : u
      )
    );
  };

  const restoreUser = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, isActive: true, status: "active" } : u
      )
    );
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage users, roles, and permissions
          </p>
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
            Viewing{" "}
            <strong>{view === "active" ? "active" : "archived"} accounts</strong>
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
                    <td
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
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
                        <span
                          className={`px-2 py-1 rounded ${roleColor(u.role)}`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="capitalize">
                        {u.isActive ? (
                          <span className="text-emerald-600">active</span>
                        ) : (
                          <span className="text-slate-500">archived</span>
                        )}
                      </td>
                    <td>{u.groups.join(", ")}</td>
                    <td>{u.lastActive}</td>
                    <td>
                      <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/users/${u.id}`}
                            className="text-primary"
                          >
                            View
                          </Link>

                          {view === "active" ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={isSelf}
                                    className={
                                      isSelf
                                        ? "cursor-not-allowed opacity-60"
                                        : ""
                                    }
                                    onClick={() => !isSelf && archiveUser(u.id)}
                                  >
                                    Delete
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {isSelf && (
                                <TooltipContent side="top">
                                  You cannot delete your own account.
                                </TooltipContent>
                              )}
                            </Tooltip>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => restoreUser(u.id)}
                            >
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

      <AddUserModal open={showAddUser} onOpenChange={setShowAddUser} onSuccess={() => setShowAddUser(false)} />
    </div>
  );
};

export default UserManagement;
