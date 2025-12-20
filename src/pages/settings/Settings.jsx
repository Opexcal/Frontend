import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save } from "lucide-react";

const UserSettings = () => {
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john.doe@opexcal.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const groupMemberships = [
    { id: "1", name: "Engineering Team", roles: ["Admin", "Staff"] },
    { id: "2", name: "Marketing Department", roles: ["Staff"] },
    { id: "3", name: "Product Design", roles: ["Staff"] },
    { id: "4", name: "Customer Support", roles: ["Staff"] },
    { id: "5", name: "Human Resources", roles: ["Admin", "Staff"] },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    console.log("Saving changes:", formData);
  };

  const handleResetPassword = () => {
    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

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
        <div className="flex justify-center mb-6">
          <Button className="w-full max-w-md bg-primary hover:bg-primary/90">
            Profile Settings
          </Button>
        </div>

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
                />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
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
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleResetPassword}>
                Reset Password
              </Button>
              <Button onClick={handleSaveChanges} className="bg-primary hover:bg-primary/90">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Group Memberships Card */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Group Memberships</h2>

            <div className="space-y-4">
              {groupMemberships.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium text-foreground">{group.name}</p>
                    <div className="flex gap-2 mt-1">
                      {group.roles.map((role) => (
                        <Badge
                          key={role}
                          variant={role === "Admin" ? "default" : "secondary"}
                          className={
                            role === "Admin"
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-primary hover:bg-primary/90 text-primary-foreground"
                          }
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
