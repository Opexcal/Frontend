import React, { useState, useEffect } from 'react';
import { teamApi } from '../api/teamApi';
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, User } from "lucide-react";

const RecipientSelector = ({ mode = 'task', onSelect, allowOrganizationWide = false }) => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Fetch groups (teams) and members
  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        setLoading(true);
        
        // Fetch teams (groups)
        const teamsResponse = await teamApi.getDashboard();
        const teams = teamsResponse.data?.teams || teamsResponse.teams || [];
        
        // Fetch members
        const membersResponse = await teamApi.getMembers();
        const allMembers = membersResponse.data?.members || membersResponse.members || [];
        
        setGroups(teams.map(t => ({
          id: t.id || t._id,
          name: t.name,
          memberCount: t.members?.length || 0
        })));
        
        setMembers(allMembers.map(m => ({
          id: m.id || m._id,
          name: m.name,
          email: m.email,
          role: m.role
        })));
        
      } catch (error) {
        console.error('Failed to fetch recipients', error);
        toast.error("Failed to load recipients", {
  description: error?.response?.data?.message || "Could not fetch teams and members",
});
      } finally {
        setLoading(false);
      }
    };

    fetchRecipients();
  }, []);

  // Calculate total recipient count
  useEffect(() => {
    let count = 0;
    
    // Count members from selected groups
    selectedGroups.forEach(groupId => {
      const group = groups.find(g => g.id === groupId);
      if (group) count += group.memberCount;
    });
    
    // Add individually selected users
    count += selectedUsers.length;
    
    // Call parent callback
    onSelect({
      groups: selectedGroups.map(id => groups.find(g => g.id === id)),
      users: selectedUsers.map(id => members.find(m => m.id === id)),
      count
    });
  }, [selectedGroups, selectedUsers, groups, members]);

  const handleGroupToggle = (groupId) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-600">Loading recipients...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Teams/Groups Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-gray-500" />
          <h3 className="font-medium text-sm">Select Teams/Groups</h3>
          <Badge variant="outline" className="ml-auto">
            {selectedGroups.length} selected
          </Badge>
        </div>
        
        <ScrollArea className="h-48 border rounded-lg">
          <div className="p-3 space-y-2">
            {groups.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No teams available
              </p>
            ) : (
              groups.map(group => (
                <div 
                  key={group.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => handleGroupToggle(group.id)}
                >
                  <Checkbox 
                    checked={selectedGroups.includes(group.id)}
                    onCheckedChange={() => handleGroupToggle(group.id)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{group.name}</p>
                    <p className="text-xs text-gray-500">
                      {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Individual Members Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <User className="h-4 w-4 text-gray-500" />
          <h3 className="font-medium text-sm">Select Individual Members</h3>
          <Badge variant="outline" className="ml-auto">
            {selectedUsers.length} selected
          </Badge>
        </div>
        
        <ScrollArea className="h-48 border rounded-lg">
          <div className="p-3 space-y-2">
            {members.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No members available
              </p>
            ) : (
              members.map(member => (
                <div 
                  key={member.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => handleUserToggle(member.id)}
                >
                  <Checkbox 
                    checked={selectedUsers.includes(member.id)}
                    onCheckedChange={() => handleUserToggle(member.id)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {member.role}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default RecipientSelector;