import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import AddUserModal from "./users/AddUserModal";

const MOCK_USERS = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i + 1),
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? "admin" : i % 3 === 1 ? "staff" : "wanderer",
  status: "active",
  groups: ["Engineering", "Product"].slice(0, (i % 2) + 1),
  lastActive: "2 hours ago",
}));

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
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setUsers(MOCK_USERS);
      setLoading(false);
    }, 800);
  }, []);

  const filtered = users.filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search users" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button onClick={() => setShowAddUser(true)}>Add User</Button>
        </div>
      </div>

      <Card className="p-4">
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
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">No users found</td>
                  </tr>
                )}
                {filtered.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="py-3">{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`px-2 py-1 rounded ${roleColor(u.role)}`}>{u.role}</span></td>
                    <td>{u.status}</td>
                    <td>{u.groups.join(", ")}</td>
                    <td>{u.lastActive}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/users/${u.id}`} className="text-primary">View</Link>
                      </div>
                    </td>
                  </tr>
                ))}
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
