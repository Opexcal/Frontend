import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { groupsApi } from "../../../api/groupsApi";
import CreateGroupModal from "./CreateGroupModal"; // Add this import


const GroupCard = ({ group }) => {
  // Calculate member count safely
  const memberCount = group.members?.length || 0;
  
  return (
    <Card className="p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium">{group.name}</h3>
          <div className="mt-2 text-sm">
            Members: <span className="font-medium">{memberCount}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Created {new Date(group.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Link to={`/admin/groups/${group._id}`} className="text-primary hover:underline">
            Manage
          </Link>
        </div>
      </div>
    </Card>
  );
};

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [error, setError] = useState(null);

const fetchGroups = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await groupsApi.getGroups();
    
    // Backend returns: { success: true, count: X, data: [...groups] }
    // After interceptor: response = { success: true, count: X, data: [...groups] }
    const groupsData = response.data || response || [];
    
    console.log('✅ Groups loaded:', groupsData.length);
    setGroups(Array.isArray(groupsData) ? groupsData : []);
    
  } catch (err) {
    console.error('❌ Fetch error:', err);
    setError(err.message || 'Failed to load groups');
    setGroups([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
    fetchGroups();
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Group Management</h1>
          <p className="text-sm text-muted-foreground">Manage departments and teams</p>
        </div>
        <div>
          <Button onClick={() => setCreateModalOpen(true)}>
            Create Group
          </Button>
        </div>
      </div>

      {loading && <div className="text-center py-8">Loading groups...</div>}
      {error && <div className="text-red-500 text-sm">{error}</div>}

      {/* Empty state */}
      {!loading && !error && groups.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-2">No groups found</p>
          <p className="text-sm text-muted-foreground">Create your first group to get started</p>
        </div>
      )}

      {/* Groups grid */}
      {!loading && groups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <GroupCard key={g._id} group={g} />
          ))}
        </div>
      )}

      <CreateGroupModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default GroupManagement;
