import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { groupsApi } from "../../../api/groupsApi";
import AddMembersModal from "./AddMembersModal"; // Import the new modal

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addMembersModalOpen, setAddMembersModalOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("Invalid group ID");
      setLoading(false);
      return;
    }
    fetchGroup();
  }, [id]);

const fetchGroup = async () => {
  try {
    setLoading(true);
    const response = await groupsApi.getGroup(id);
    
    // Backend returns: { success: true, data: {...group} }
    // After interceptor: response = { success: true, data: {...group} }
    const groupData = response.data || response;
    
    console.log('✅ Group loaded:', groupData.name, 'Members:', groupData.members?.length || 0);
    setGroup(groupData);
    
  } catch (err) {
    setError(err.message || "Failed to load group");
    console.error("❌ Error fetching group:", err);
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    
    try {
      await groupsApi.deleteGroup(id);
      navigate('/admin/groups');
    } catch (err) {
      alert(err.message || 'Failed to delete group');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member from the group?')) return;
    
    try {
      await groupsApi.manageMembers(id, 'remove', [userId]);
      fetchGroup(); // Refresh the group data
    } catch (err) {
      alert(err.message || 'Failed to remove member');
    }
  };

  const handleAddMembersSuccess = () => {
    setAddMembersModalOpen(false);
    fetchGroup(); // Refresh to show new members
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!group) return <div className="p-6">Group not found</div>;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/groups" className="text-sm text-muted-foreground">
            ← Back to Groups
          </Link>
          <h1 className="text-2xl font-semibold mt-2">{group.name}</h1>
        </div>
        <Button variant="destructive" onClick={handleDelete}>
          Delete Group
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="lg:col-span-1">
<Card className="p-4">
  <div className="flex items-center justify-between mb-4">
    <div>
      <h4 className="text-lg font-medium">Members</h4>
      <p className="text-sm text-muted-foreground">
        {group.members?.length || 0} total member{group.members?.length !== 1 ? 's' : ''}
      </p>
    </div>
    <Button onClick={() => setAddMembersModalOpen(true)}>
      Add Members
    </Button>
  </div>
  
  <div className="space-y-2">
    {group.members?.length > 0 ? (
      group.members.map(member => (
        <div key={member._id} className="flex items-center justify-between py-3 px-2 border-b hover:bg-accent/50 rounded">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{member.name}</div>
              <div className="text-sm text-muted-foreground">{member.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-100 px-2 py-1 rounded">
              {member.role}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleRemoveMember(member._id)}
            >
              Remove
            </Button>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground mb-3">No members yet</p>
        <Button onClick={() => setAddMembersModalOpen(true)}>
          Add First Member
        </Button>
      </div>
    )}
  </div>
</Card>
        </aside>

        <main className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium">Members</h4>
              <Button onClick={() => setAddMembersModalOpen(true)}>
                Add Members
              </Button>
            </div>
            
            <div className="space-y-2">
              {group.members?.length > 0 ? (
                group.members.map(member => (
                  <div key={member._id} className="flex items-center justify-between py-2 border-b">
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">{member.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {member.role}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveMember(member._id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-3">No members yet</p>
                  <Button onClick={() => setAddMembersModalOpen(true)}>
                    Add First Member
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </main>
      </div>

      <AddMembersModal
        open={addMembersModalOpen}
        onOpenChange={setAddMembersModalOpen}
        groupId={id}
        existingMemberIds={group.members?.map(m => m._id) || []}
        onSuccess={handleAddMembersSuccess}
      />
    </div>
  );
};

export default GroupDetails;