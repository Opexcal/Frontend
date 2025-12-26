import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usersApi } from "@/api/usersApi";
import { useToast } from "@/hooks/use-toast";
import { roleDisplayMap } from "../../constant/roleMapDisplay";


const UserSettings = () => {
const { user: currentUser, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

useEffect(() => {
  if (!currentUser) {
    setLoading(true);
    return;
  }
  
  // Use currentUser from AuthContext - no API call needed
  setUser(currentUser);
  setFormData({
    name: currentUser.name || "",
    email: currentUser.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  setLoading(false);
}, [currentUser]);
  console.log('Current user:', user);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  
const groupMemberships = Array.isArray(user?.groups) && user.groups.length > 0
  ? user.groups.map(group => {
      if (typeof group === 'string') {
        return { id: group, name: 'Loading...', _id: group };
      }
      return {
        id: group._id || group.id,
        name: group.name || 'Unknown Group',
        _id: group._id || group.id,
        memberCount: group.members?.length || 0
      };
    })
  : [];
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSaveChanges = async () => {
  // Validate password fields if user is trying to change password
  if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
    if (!formData.currentPassword) {
      toast({
        title: "Validation Error",
        description: "Current password is required to change password",
        variant: "destructive",
      });
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (formData.newPassword.length < 8) {
      toast({
        title: "Validation Error",
        description: "New password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }
  }

  setSaving(true);
  try {
    const updateData = {
      name: formData.name,
      // Only include password fields if user is changing password
      ...(formData.newPassword && {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })
    };

    await usersApi.update(currentUser.id, updateData);
    
    // ✅ Refresh user data in AuthContext
    await refreshUser();
    
    toast({
      title: "Success",
      description: "Your settings have been updated",
    });

    // Clear password fields after successful save
    if (formData.newPassword) {
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    }
  } catch (error) {
    console.error("Failed to save changes:", error);
    toast({
      title: "Error",
      description: error?.message || error?.data?.message || "Failed to save changes",
      variant: "destructive",
    });
  } finally {
    setSaving(false);
  }
};

  const handleResetPassword = () => {
    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-foreground">User Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile information and application preferences.
        </p>
      </div>

      {/* Profile Settings Tab */}
      {/* <div className="flex justify-center mb-6">
        <Button className="w-full max-w-md bg-primary hover:bg-primary/90">
          Profile Settings
        </Button>
      </div> */}

      {/* Personal Details Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">Personal Details</h2>
            <p className="text-sm text-muted-foreground">
              Update your personal information and manage your password.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john.doe@opexcal.com"
                disabled // Email usually shouldn't be editable
              />
              <p className="text-xs text-muted-foreground">
                Contact your administrator to change your email
              </p>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-md font-medium mb-4">Change Password</h3>
            
            <div className="space-y-2 mb-4">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={handleResetPassword}
              disabled={saving}
            >
              Clear Password Fields
            </Button>
            <Button 
              onClick={handleSaveChanges} 
              disabled={saving}
              className="bg-primary hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Group Memberships Card */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Group Memberships
          </h2>

          {groupMemberships.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                You are not a member of any groups yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupMemberships.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{group.name}</p>
                    {group.memberCount > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {user?.role || 'Member'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Display */}
      {user?.role && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              System Role
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Your current role in the organization
                </p>
              </div>
              <Badge 
  variant={user.role === 'manager' ? 'default' : 'secondary'}
  className={
    user.role === 'manager'
      ? 'bg-purple-600 hover:bg-purple-700'
      : user.role === 'admin'
      ? 'bg-blue-600 hover:bg-blue-700'
      : ''
  }
>
  {roleDisplayMap[user.role] || user.role}  {/* ✅ Use mapped display name */}
</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Links */}
      <div className="flex justify-center gap-8 mt-8 text-sm text-muted-foreground">
        <span className="hover:text-foreground cursor-pointer">Company</span>
        <span className="hover:text-foreground cursor-pointer">Resources</span>
        <span className="hover:text-foreground cursor-pointer">Legal</span>
      </div>
    </div>
  );
};

export default UserSettings;
