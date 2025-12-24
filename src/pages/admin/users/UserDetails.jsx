import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { usersApi } from "@/api/usersApi";
import { useToast } from "@/hooks/use-toast";
import EditUserModal from "./EditUserModal";

const UserDetails = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit,setShowEdit] = useState(false)

 const load = async () => {
    setLoading(true);
    try {
      const res = await usersApi.get(id);
      const u = res.user || res.data?.user || res.data;
      setUser(u);
    } catch (error) {
      toast({
        title: "Failed to load user",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      load();
    }
  }, [id]);

  const isSelf = currentUser?.id && user?.id && currentUser.id === user.id;


  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <Link to="/admin/users" className="text-sm text-muted-foreground">← Back to Users</Link>
        <h1 className="text-2xl font-semibold mt-2">
  {loading ? "Loading..." : user?.name}
</h1>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="lg:col-span-1">
          <Card className="p-4 space-y-4">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center">
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                    : ""}
                </div>
              </Avatar>
              <h3 className="mt-4 text-lg font-medium">{user?.name}</h3>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
              <div className="mt-3 text-sm text-muted-foreground">Role: {user?.role}</div>
              <div className="text-sm text-muted-foreground">Status: {user?.isActive ? "active" : "archived"}</div>
            </div>
            <div className="mt-4 flex justify-center gap-2">
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEdit(true)}
                >
                  Edit User
                </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isSelf}
                      className={isSelf ? "cursor-not-allowed opacity-60" : ""}
                    >
                      Delete User
                    </Button>
                  </span>
                </TooltipTrigger>
                {isSelf && (
                  <TooltipContent side="top">
                    You cannot delete your own account.
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </Card>
        </aside>

        <main className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <h4 className="text-lg font-medium">Overview</h4>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div>{user?.phone || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Timezone</div>
                <div>{user?.timezone || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Language</div>
                <div>{user?.language || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Joined</div>
                <div>{user?.joinedDate || "—"}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="text-lg font-medium">Activity</h4>
            <div className="mt-3 text-sm text-muted-foreground">
              {user?.lastActive ? `Last active: ${user.lastActive}` : "No recent activity data."}
            </div>
          </Card>
        </main>
      </div>
<EditUserModal
        open={showEdit}
        onOpenChange={setShowEdit}
        userId={id}
        onSuccess={() => {
          setShowEdit(false);
          load(); // ✅ Now this works
        }}
      />
    </div>
  );
};

export default UserDetails;
