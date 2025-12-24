import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { usersApi } from "@/api/usersApi";
import { groupsApi } from "@/api/groupsApi";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const EditUserModal = ({ open, onOpenChange, userId, onSuccess }) => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [name, setName] = useState("");
  const [role, setRole] = useState("Staff");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);

  const isEditingSelf = currentUser && userId === currentUser.id;

  useEffect(() => {
    if (open && userId) {
      loadUserData();
      loadGroups();
    }
  }, [open, userId]);

  const loadUserData = async () => {
    setLoadingUser(true);
    try {
      const res = await usersApi.get(userId);
      const userData = res.data?.user || res.user;
      setName(userData.name || "");
      setRole(userData.role || "Staff");
      const groupIds = (userData.groups || []).map(g => 
        typeof g === 'object' ? (g._id || g.id) : g
      );
      setSelectedGroups(groupIds);
    } catch (err) {
      toast({
        title: "Failed to load user",
        description: err?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoadingUser(false);
    }
  };

  const loadGroups = async () => {
    try {
      const res = await groupsApi.getGroups();
      setGroups(res.data || res.groups || []);
    } catch (err) {
      console.error("Failed to load groups:", err);
    }
  };

  const handleGroupToggle = (groupId) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const submit = async () => {
    setError(null);
    if (name.trim().length < 2) {
      return setError("Name must be at least 2 characters");
    }

    setLoading(true);
    try {
      await usersApi.update(userId, {
        name: name.trim(),
        role: isEditingSelf ? undefined : role, // Can't change own role
        groups: selectedGroups,
      });

      toast({ title: "User updated successfully" });
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const errorMsg = err?.message || err?.data?.message || "Failed to update user";
      setError(errorMsg);
      toast({
        title: "Failed to update user",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        {loadingUser ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
            </div>

            <div>
              <Label>Role</Label>
              <select 
                className="w-full border rounded p-2" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                disabled={loading || isEditingSelf}
              >
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
                <option value="SuperAdmin">SuperAdmin</option>
              </select>
              {isEditingSelf && (
                <p className="text-xs text-muted-foreground mt-1">
                  You cannot change your own role
                </p>
              )}
            </div>

            {groups.length > 0 && (
              <div>
                <Label>Groups</Label>
                <div className="border rounded p-3 space-y-2 max-h-40 overflow-y-auto">
                  {groups.map((group) => (
                    <div key={group.id || group._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`group-${group.id || group._id}`}
                        checked={selectedGroups.includes(group.id || group._id)}
                        onCheckedChange={() => handleGroupToggle(group.id || group._id)}
                        disabled={loading}
                      />
                      <Label htmlFor={`group-${group.id || group._id}`} className="text-sm font-normal cursor-pointer">
                        {group.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <div className="text-sm text-destructive">{error}</div>}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={loading || loadingUser}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;