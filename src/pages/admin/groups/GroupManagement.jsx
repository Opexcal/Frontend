import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const MOCK_GROUPS = [
  { id: "1", name: "Engineering Team", description: "Software development and technical infrastructure", memberCount: 24, color: "blue" },
  { id: "2", name: "Marketing Department", description: "Brand strategy and campaigns", memberCount: 12, color: "purple" },
  { id: "3", name: "Customer Success", description: "Support and onboarding", memberCount: 8, color: "green" },
];

const GroupCard = ({ group }) => (
  <Card className="p-4 hover:shadow-md transition">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-lg font-medium">{group.name}</h3>
        <div className="text-sm text-muted-foreground mt-1">{group.description}</div>
        <div className="mt-2 text-sm">Members: <span className="font-medium">{group.memberCount}</span></div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Link to={`/admin/groups/${group.id}`} className="text-primary">Manage</Link>
        <Button variant="ghost" size="sm">Edit</Button>
      </div>
    </div>
  </Card>
);

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    setTimeout(() => setGroups(MOCK_GROUPS), 600);
  }, []);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Group Management</h1>
          <p className="text-sm text-muted-foreground">Manage departments and teams</p>
        </div>
        <div>
          <Button asChild>
            <Link to="#">Create Group</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((g) => (
          <GroupCard key={g.id} group={g} />
        ))}
      </div>
    </div>
  );
};

export default GroupManagement;
