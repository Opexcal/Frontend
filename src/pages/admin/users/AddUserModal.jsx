import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AddUserModal = ({ open, onOpenChange = () => {}, onSuccess = () => {} }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = () => {
    setError(null);
    if (name.trim().length < 2) return setError("Name must be at least 2 characters");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError("Invalid email");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Full name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Role</Label>
            <select className="w-full border rounded p-2" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="wanderer">Wanderer</option>
            </select>
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={loading}>{loading ? "Adding..." : "Add User"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;
