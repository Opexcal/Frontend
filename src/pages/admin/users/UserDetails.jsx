import React from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

const mockUser = {
  id: "1",
  name: "Alice Johnson",
  email: "alice.j@example.com",
  role: "admin",
  status: "active",
  phone: "+1 (555) 123-4567",
  timezone: "America/New_York",
  language: "English",
  joinedDate: "2024-01-15",
  lastActive: "2 hours ago",
};

const UserDetails = () => {
  const { id } = useParams();

  // In real app fetch by id
  const user = mockUser;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <Link to="/admin/users" className="text-sm text-muted-foreground">← Back to Users</Link>
        <h1 className="text-2xl font-semibold mt-2">{user.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="lg:col-span-1">
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center">{user.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
              </Avatar>
              <h3 className="mt-4 text-lg font-medium">{user.name}</h3>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              <div className="mt-3 text-sm text-muted-foreground">Role: {user.role}</div>
              <div className="text-sm text-muted-foreground">Status: {user.status}</div>
            </div>
          </Card>
        </aside>

        <main className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <h4 className="text-lg font-medium">Overview</h4>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div>{user.phone}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Timezone</div>
                <div>{user.timezone}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Language</div>
                <div>{user.language}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Joined</div>
                <div>{user.joinedDate}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="text-lg font-medium">Activity</h4>
            <div className="mt-3 text-sm text-muted-foreground">No recent activity in mock data.</div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default UserDetails;
