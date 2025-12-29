// src/components/RecipientSelector.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { groupsApi } from '../api/groupsApi';
import { usersApi } from '../api/usersApi';
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";



const RecipientSelector = ({ mode = 'task', onSelect, allowOrganizationWide = false }) => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        setLoading(true);
        
        // Fetch groups using groupsApi
        const groupsResponse = await groupsApi.getGroups();
        const groupsData = groupsResponse.data || groupsResponse || [];
        
        // Fetch users using usersApi
        const usersResponse = await usersApi.getUsers();
        
        // ✅ FIX: Handle different response formats
        let usersData;
        if (usersResponse.users) {
          usersData = usersResponse.users; // Format: { count, users }
        } else if (usersResponse.data?.users) {
          usersData = usersResponse.data.users;
        } else if (Array.isArray(usersResponse.data)) {
          usersData = usersResponse.data; // Format: [users]
        } else if (Array.isArray(usersResponse)) {
          usersData = usersResponse;
        } else {
          usersData = [];
        }
        
        console.log('📦 Groups loaded:', groupsData);
        console.log('👥 Users loaded:', usersData);
        
        // Map groups with proper structure
        setGroups(groupsData.map(g => ({
          id: g._id || g.id,
          name: g.name,
          memberCount: g.members?.length || 0,
          members: g.members || []
        })));
        
        // Map members with proper structure
        setMembers(usersData.map(m => ({
          id: m._id || m.id,
          name: m.name,
          email: m.email,
          role: m.role
        })));
        
      } catch (error) {
        console.error('❌ Failed to fetch recipients:', error);
        toast.error("Failed to load recipients", {
          description: error?.message || "Could not fetch teams and members",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipients();
  }, []); 

useEffect(() => {
  const groupMemberIds = new Set();
  selectedGroups.forEach(groupId => {
    const group = groups.find(g => g.id === groupId);
    if (group && group.members) {
      group.members.forEach(member => {
        const memberId = member._id || member.id || member;
        groupMemberIds.add(memberId);
      });
    }
  });
  
  // Combine group members with individually selected users (avoiding duplicates)
  const allSelectedUserIds = new Set([...groupMemberIds, ...selectedUsers]);
  const count = allSelectedUserIds.size;
  
  console.log('📊 Recipient count:', count);
  
  // Build result object
  const result = {
    groups: selectedGroups.map(id => {
      const group = groups.find(g => g.id === id);
      return group ? { id: group.id, name: group.name } : null;
    }).filter(Boolean),
    users: selectedUsers.map(id => {
      const user = members.find(m => m.id === id);
      return user ? { id: user.id, name: user.name, email: user.email } : null;
    }).filter(Boolean),
    count
  };
  
  // ✅ Call parent callback
  onSelect(result);
  
}, [selectedGroups, selectedUsers, groups, members]);

// In RecipientSelector.jsx, update handleGroupToggle:
const handleGroupToggle = (groupId) => {
  setSelectedGroups(prev => {
    const isRemoving = prev.includes(groupId);
    
    if (isRemoving) {
      // ✅ Unselect group and remove its members from selectedUsers
      const group = groups.find(g => g.id === groupId);
      const memberIds = group?.members?.map(m => m._id || m.id || m) || [];
      
      setSelectedUsers(prevUsers => 
        prevUsers.filter(userId => !memberIds.includes(userId))
      );
      
      return prev.filter(id => id !== groupId);
    } else {
      // ✅ Select group and add its members to selectedUsers
      const group = groups.find(g => g.id === groupId);
      const memberIds = group?.members?.map(m => m._id || m.id || m) || [];
      
      setSelectedUsers(prevUsers => {
        const newUsers = memberIds.filter(id => !prevUsers.includes(id));
        return [...prevUsers, ...newUsers];
      });
      
      return [...prev, groupId];
    }
  });
};

  // In RecipientSelector.jsx, update handleUserToggle:
const handleUserToggle = (userId) => {
  setSelectedUsers(prev => {
    const isRemoving = prev.includes(userId);
    
    if (isRemoving) {
      // ✅ Check if this user belongs to any selected group
      const groupsToUnselect = selectedGroups.filter(groupId => {
        const group = groups.find(g => g.id === groupId);
        const memberIds = group?.members?.map(m => m._id || m.id || m) || [];
        return memberIds.includes(userId);
      });
      
      // ✅ Unselect those groups
      if (groupsToUnselect.length > 0) {
        setSelectedGroups(prevGroups => 
          prevGroups.filter(gId => !groupsToUnselect.includes(gId))
        );
      }
      
      return prev.filter(id => id !== userId);
    } else {
      return [...prev, userId];
    }
  });
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
    <Users className="h-4 w-4 text-gray-500" />
    <h3 className="font-medium text-sm">Select Teams/Groups</h3>
    <Badge variant="outline" className="ml-auto">
      {selectedGroups.length} selected
    </Badge>
    <Button
      variant="ghost"
      size="sm"
      className="h-6 text-xs"
      onClick={() => {
        if (selectedGroups.length === groups.length) {
          setSelectedGroups([]);
          setSelectedUsers([]);
        } else {
          const allGroupIds = groups.map(g => g.id);
          const allMemberIds = groups.flatMap(g => 
            g.members?.map(m => m._id || m.id || m) || []
          );
          setSelectedGroups(allGroupIds);
          setSelectedUsers(Array.from(new Set(allMemberIds)));
        }
      }}
    >
      {selectedGroups.length === groups.length ? 'Clear All' : 'Select All'}
    </Button>
  </div>
  
  <ScrollArea className="h-48 border rounded-lg">
    <div className="p-3 space-y-2">
      {members.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          No members available
        </p>
      ) : (
        members.map(member => {
          const belongsToSelectedGroup = selectedGroups.some(groupId => {
            const group = groups.find(g => g.id === groupId);
            const memberIds = group?.members?.map(m => m._id || m.id || m) || [];
            return memberIds.includes(member.id);
          });
          
          return (
            <div 
              key={member.id}
              className={`flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer ${
                belongsToSelectedGroup ? 'bg-blue-50 border-l-2 border-blue-500' : ''
              }`}
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
              {belongsToSelectedGroup && (
                <Badge variant="outline" className="text-xs text-blue-600">
                  via team
                </Badge>
              )}
            </div>
          );
        })
      )}
    </div>
  </ScrollArea>
</div>
    </div>
  );
};

export default RecipientSelector;