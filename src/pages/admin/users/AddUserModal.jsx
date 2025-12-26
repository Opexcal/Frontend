import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { usersApi } from "@/api/usersApi";
import { groupsApi } from "@/api/groupsApi";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AddUserModal = ({ open, onOpenChange, onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Staff");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Track if user wants to create "Unassigned" (Wanderer)
  const [isUnassigned, setIsUnassigned] = useState(false);

  useEffect(() => {
    if (open) {
      loadGroups();
      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setRole("Staff");
      setSelectedGroups([]);
      setSendWelcomeEmail(true);
      setIsUnassigned(false);
      setError(null);
    }
  }, [open]);

  const loadGroups = async () => {
    setLoadingGroups(true);
    try {
      const res = await groupsApi.getGroups();
      const groupsData = res.data || res || [];
      setGroups(Array.isArray(groupsData) ? groupsData : []);
    } catch (err) {
      console.error("Failed to load groups:", err);
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleGroupToggle = (groupId) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    
    // If changing to "Unassigned", clear all groups
    if (newRole === "Unassigned") {
      setIsUnassigned(true);
      setSelectedGroups([]);
    } else {
      setIsUnassigned(false);
    }
  };

  const submit = async () => {
    setError(null);

    // Validation
    if (name.trim().length < 2) {
      return setError("Name must be at least 2 characters");
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return setError("Invalid email format");
    }
    if (password.length < 8) {
      return setError("Password must be at least 8 characters");
    }

    // Warn if creating unassigned user
    if (isUnassigned && selectedGroups.length > 0) {
      return setError("Unassigned users cannot be in groups. Please deselect all groups.");
    }

    setLoading(true);
    try {
      const userData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        // ✅ Always send backend-compatible role
        role: isUnassigned ? "Staff" : role, // Backend will auto-assign "Unassigned" if no groups
        groups: isUnassigned ? [] : selectedGroups, // Empty groups for wanderers
        sendWelcomeEmail
      };

      const response = await usersApi.create(userData);

     toast.success("User created successfully", {
  description: isUnassigned 
    ? `${name} has been added as an unassigned user (Wanderer)`
    : `${name} has been added to your organization`,
});

      onSuccess(response.data || response.user);
      onOpenChange(false);
    } catch (err) {
      console.error("Create user error:", err);
      const errorMsg = err?.message || err?.data?.message || "Failed to create user";
      setError(errorMsg);
      
      toast.error("Failed to create user", {
  description: errorMsg,
});
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Full name</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="John Doe"
              disabled={loading}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              type="email"
              placeholder="john.doe@company.com"
              disabled={loading}
            />
          </div>
          <div>
            <Label>Temporary Password</Label>
            <div className="relative">
              <Input 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              User will change this on first login
            </p>
          </div>
          
          {/* Role Selection */}
          <div>
            <Label>Role</Label>
            <select 
              className="w-full border rounded p-2" 
              value={isUnassigned ? "Unassigned" : role} 
              onChange={(e) => handleRoleChange(e.target.value)}
              disabled={loading}
            >
              <option value="Unassigned">Unassigned (Wanderer)</option>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
              <option value="SuperAdmin">SuperAdmin</option>
            </select>
            {isUnassigned && (
              <Alert className="mt-2">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Unassigned users can only manage personal tasks until assigned to a group.
                  They will not have access to team features.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Groups - Disabled for Unassigned users */}
          {groups.length > 0 && (
            <div>
              <Label className={isUnassigned ? "text-muted-foreground" : ""}>
                Assign to Groups {isUnassigned && "(Disabled for Unassigned)"}
              </Label>
              {loadingGroups ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading groups...
                </div>
              ) : (
                <div className={`border rounded p-3 space-y-2 max-h-40 overflow-y-auto ${isUnassigned ? 'opacity-50 pointer-events-none' : ''}`}>
                  {groups.map((group) => {
                    const groupId = group._id || group.id;
                    return (
                      <div key={groupId} className="flex items-center space-x-2">
                        <Checkbox
                          id={`group-${groupId}`}
                          checked={selectedGroups.includes(groupId)}
                          onCheckedChange={() => handleGroupToggle(groupId)}
                          disabled={loading || isUnassigned}
                        />
                        <Label
                          htmlFor={`group-${groupId}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {group.name}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
              {isUnassigned && (
                <p className="text-xs text-muted-foreground mt-2">
                  Unassigned users cannot be in groups
                </p>
              )}
            </div>
          )}

          {/* Welcome Email */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="welcomeEmail"
              checked={sendWelcomeEmail}
              onCheckedChange={setSendWelcomeEmail}
              disabled={loading}
            />
            <Label htmlFor="welcomeEmail" className="text-sm font-normal cursor-pointer">
              Send welcome email
            </Label>
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;