import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const mockSettings = {
  name: "Acme Corporation",
  timezone: "America/New_York",
  language: "English",
  weekStartDay: "monday",
};

const OrganizationSettings = () => {
  const [settings, setSettings] = useState(mockSettings);

  const save = () => {
    // Simulate save
    console.log("Saved", settings);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold">Organization Settings</h1>
        <p className="text-sm text-muted-foreground">Company-wide configuration</p>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Organization name</Label>
            <Input value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} />
          </div>
          <div>
            <Label>Timezone</Label>
            <Input value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} />
          </div>
          <div>
            <Label>Language</Label>
            <Input value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })} />
          </div>
          <div>
            <Label>Week start day</Label>
            <select className="w-full border rounded p-2" value={settings.weekStartDay} onChange={(e) => setSettings({ ...settings, weekStartDay: e.target.value })}>
              <option value="sunday">Sunday</option>
              <option value="monday">Monday</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={save}>Save Changes</Button>
        </div>
      </Card>
    </div>
  );
};

export default OrganizationSettings;
