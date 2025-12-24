import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { usersApi } from "@/api/usersApi"; // You'll need this
import { groupsApi } from "@/api/groupsApi";

const AddMembersModal = ({ open, onOpenChange, groupId, existingMemberIds = [], onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      fetchUsers();
      setSelectedUsers([]);
    }
  }, [open]);

const fetchUsers = async () => {
  try {
    const response = await usersApi.getUsers();
    
    // Fix: The users array is in response.data.users, not response.data.data
    const usersArray = response.data?.users || response.users || [];
    
    const availableUsers = usersArray.filter(
      user => !existingMemberIds.includes(user._id)
    );

    console.log('✅ Available users:', availableUsers); // Debug log
    setUsers(availableUsers);
  } catch (err) {
    console.error('Error fetching users:', err);
    setError('Failed to load users');
  }
};


  const toggleUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await groupsApi.manageMembers(groupId, 'add', selectedUsers);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to add members');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Members to Group</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No available users to add</p>
          ) : (
            users.map(user => (
              <div key={user._id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                <Checkbox
                  id={user._id}
                  checked={selectedUsers.includes(user._id)}
                  onCheckedChange={() => toggleUser(user._id)}
                />
                <label htmlFor={user._id} className="flex-1 cursor-pointer">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </label>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{user.role}</span>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || selectedUsers.length === 0}
          >
            {loading ? 'Adding...' : `Add ${selectedUsers.length} Member(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMembersModal;