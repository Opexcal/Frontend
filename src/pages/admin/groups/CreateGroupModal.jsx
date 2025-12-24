import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { groupsApi } from "../../../api/groupsApi";

const CreateGroupModal = ({ open, onOpenChange, onSuccess }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

const submit = async () => {
  if (name.trim().length < 2) {
    setError('Group name must be at least 2 characters');
    return;
  }

  try {
    setLoading(true);
    setError(null);
    
    const response = await groupsApi.createGroup({ name: name.trim() });
    console.log('Create response:', response); // { success: true, message: '...', data: {...group} }
    
    setName("");
    onSuccess();
  } catch (err) {
    setError(err.message || 'Failed to create group');
    console.error('Error creating group:', err);
  } finally {
    setLoading(false);
  }
};

  // Add this to reset form when modal closes
  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setName("");
      setError(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
        </DialogHeader>

       <div className="space-y-4">
        <div>
          <Label>Group Name</Label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Engineering Team"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        {/* Remove description field - backend doesn't support it */}
      </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={loading}>{loading ? "Creating..." : "Create Group"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
