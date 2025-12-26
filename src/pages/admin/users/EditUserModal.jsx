import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { usersApi } from "@/api/usersApi";
import { groupsApi } from "@/api/groupsApi";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const EditUserModal = ({ open, onOpenChange, userId, onSuccess }) => {
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
    const userData = res.data?.user || res.user || res.data || res;
    
    console.log('👤 Loaded user data:', userData);
    
    setName(userData.name || "");
    setRole(userData.role || "Staff");
    
    // Extract group IDs whether they're objects or strings
    const groupIds = (userData.groups || []).map(g => {
      if (typeof g === 'object') {
        return g._id || g.id;
      }
      return g;
    }).filter(Boolean); // Remove any undefined/null values
    
    console.log('📋 User group IDs:', groupIds);
    setSelectedGroups(groupIds);
    
  } catch (err) {
    console.error('❌ Failed to load user:', err);
    toast.error("Failed to load user", {
  description: err?.message || "Please try again",
});
  } finally {
    setLoadingUser(false);
  }
};

  const loadGroups = async () => {
  try {
    const res = await groupsApi.getGroups();
    // Handle the response structure properly
    const groupsData = res.data || res || [];
    console.log('✅ Loaded groups for edit modal:', groupsData);
    setGroups(Array.isArray(groupsData) ? groupsData : []);
  } catch (err) {
    console.error("Failed to load groups:", err);
    setGroups([]);
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

      toast.success("User updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const errorMsg = err?.message || err?.data?.message || "Failed to update user";
      setError(errorMsg);
      toast.error("Failed to update user", {
  description: errorMsg,
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
    <option value="Unassigned">Unassigned (Wanderer)</option>
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
      {groups.map((group) => {
        const groupId = group._id || group.id;
        const isChecked = selectedGroups.includes(groupId);
        
        return (
          <div key={groupId} className="flex items-center space-x-2">
            <Checkbox
              id={`group-${groupId}`}
              checked={isChecked}
              onCheckedChange={() => handleGroupToggle(groupId)}
              disabled={loading}
            />
            <Label 
              htmlFor={`group-${groupId}`} 
              className="text-sm font-normal cursor-pointer flex-1"
            >
              <div className="flex items-center justify-between">
                <span>{group.name}</span>
                <span className="text-xs text-muted-foreground">
                  {group.members?.length || 0} members
                </span>
              </div>
            </Label>
          </div>
        );
      })}
    </div>
    <p className="text-xs text-muted-foreground mt-2">
      {selectedGroups.length} group(s) selected
    </p>
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