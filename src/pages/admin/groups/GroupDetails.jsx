import React from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";

const mockGroup = {
  id: "1",
  name: "Engineering Team",
  description: "Software development team",
  memberCount: 24,
};

const GroupDetails = () => {
  const { id } = useParams();
  const group = mockGroup;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <Link to="/admin/groups" className="text-sm text-muted-foreground">← Back to Groups</Link>
        <h1 className="text-2xl font-semibold mt-2">{group.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="lg:col-span-1">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Members</div>
            <div className="text-2xl font-semibold">{group.memberCount}</div>
            <div className="mt-3 text-sm text-muted-foreground">{group.description}</div>
          </Card>
        </aside>

        <main className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <h4 className="text-lg font-medium">Members</h4>
            <div className="mt-3 text-sm text-muted-foreground">Member list is not populated in mock.</div>
          </Card>

          <Card className="p-4">
            <h4 className="text-lg font-medium">Settings</h4>
            <div className="mt-3 text-sm text-muted-foreground">Group settings placeholder.</div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default GroupDetails;
