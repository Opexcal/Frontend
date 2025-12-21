import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CreateGroupModal = ({ open, onOpenChange = () => {}, onSuccess = () => {} }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (name.trim().length < 2) return;
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
          <DialogTitle>Create Group</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Group Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <textarea className="w-full border rounded p-2" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
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
