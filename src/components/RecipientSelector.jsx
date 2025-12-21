import React, { useState, useEffect, useMemo } from 'react';
import { massOpsApi } from '../api/massOperationsApi';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Users, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const RecipientSelector = ({ mode, onSelect, allowOrganizationWide }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ groups: [], users: [] });
  const [selectedGroupIds, setSelectedGroupIds] = useState(new Set());
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await massOpsApi.getRecipients();
        // Expecting response.data to have { groups: [], users: [] }
        setData(response.data || { groups: [], users: [] });
      } catch (error) {
        console.error("Failed to fetch recipients", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate unique recipients count and prepare return object
  const calculation = useMemo(() => {
    const selectedGroups = data.groups.filter(g => selectedGroupIds.has(g.id));
    const selectedUsers = data.users.filter(u => selectedUserIds.has(u.id));
    
    // Calculate unique count (naive implementation assuming we want to show an estimate)
    // In a real app, you might map users to groups to dedup, or rely on backend for exact count.
    // Here we sum group members + individual users, which is an upper bound.
    let count = selectedUsers.length;
    
    // If we have member counts on groups, add them (ignoring overlap for simple estimation)
    // Or if we have user-group mapping in data.users, we can be precise.
    const uniqueUserIds = new Set(selectedUserIds);
    
    // Attempt to find users belonging to selected groups if data is available
    selectedGroups.forEach(group => {
        const groupMembers = data.users.filter(u => u.groupIds && u.groupIds.includes(group.id));
        if (groupMembers.length > 0) {
            groupMembers.forEach(m => uniqueUserIds.add(m.id));
        } else {
            // Fallback to adding memberCount if we can't resolve individual users
            // This makes the count an estimate if there are overlaps we can't see
        }
    });
    
    // If we resolved users, use that size, otherwise sum counts
    if (uniqueUserIds.size > selectedUsers.length) {
        count = uniqueUserIds.size;
    } else {
        count = selectedUsers.length + selectedGroups.reduce((acc, g) => acc + (g.memberCount || 0), 0);
    }

    return {
        groups: selectedGroups,
        users: selectedUsers,
        count: count
    };
  }, [selectedGroupIds, selectedUserIds, data]);

  useEffect(() => {
    onSelect(calculation);
  }, [calculation, onSelect]);

  const toggleGroup = (id) => {
    const newSet = new Set(selectedGroupIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedGroupIds(newSet);
  };

  const toggleUser = (id) => {
    const newSet = new Set(selectedUserIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedUserIds(newSet);
  };

  const filteredGroups = data.groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredUsers = data.users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-40 w-full" /></div>;
  }

  return (
    <div className="w-full border rounded-md p-4 bg-white">
      <div className="mb-4 relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input 
          placeholder="Search groups or users..." 
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="users">Individual Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="groups">
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            {filteredGroups.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">No groups found.</p> : (
                <div className="space-y-2">
                {filteredGroups.map(group => (
                    <div key={group.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                    <Checkbox id={`group-${group.id}`} checked={selectedGroupIds.has(group.id)} onCheckedChange={() => toggleGroup(group.id)} />
                    <label htmlFor={`group-${group.id}`} className="flex-1 text-sm font-medium cursor-pointer flex justify-between">
                        <span className="flex items-center gap-2"><Users className="h-4 w-4 text-blue-500"/> {group.name}</span>
                        <span className="text-xs text-gray-400">{group.memberCount || 0} members</span>
                    </label>
                    </div>
                ))}
                </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="users">
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
             {filteredUsers.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">No users found.</p> : (
                <div className="space-y-2">
                {filteredUsers.map(user => (
                    <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                    <Checkbox id={`user-${user.id}`} checked={selectedUserIds.has(user.id)} onCheckedChange={() => toggleUser(user.id)} />
                    <label htmlFor={`user-${user.id}`} className="flex-1 text-sm font-medium cursor-pointer">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500"/>
                            <div><div>{user.name}</div><div className="text-xs text-gray-400">{user.email}</div></div>
                        </div>
                    </label>
                    </div>
                ))}
                </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 text-xs text-gray-500 flex justify-between items-center">
        <span>Selected: {selectedGroupIds.size} groups, {selectedUserIds.size} users</span>
        {allowOrganizationWide && <span className="text-blue-600 font-semibold">Org-wide enabled</span>}
      </div>
    </div>
  );
};

export default RecipientSelector;
