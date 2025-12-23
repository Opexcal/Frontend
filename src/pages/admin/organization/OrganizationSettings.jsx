import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { organizationApi } from "@/api/organizationApi";

const OrganizationSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    name: "",
    timezone: "",
    language: "",
    weekStartDay: "monday",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await organizationApi.get();
        const org = res.organization || res.data?.organization || {};
        setSettings((prev) => ({
          ...prev,
          name: org.name || "",
          timezone: org.timezone || "",
          language: org.language || "",
          weekStartDay: org.weekStartDay || "monday",
        }));
      } catch (error) {
        toast({
          title: "Failed to load organization",
          description:
            error?.message ||
            error?.data?.message ||
            "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const save = async () => {
    setLoading(true);
    try {
      await organizationApi.update({
        name: settings.name,
        branding: {
          // Extend if backend stores timezone/language elsewhere
        },
        // weekStartDay/timezone/language would need backend support; send as passthrough if accepted
        timezone: settings.timezone,
        language: settings.language,
        weekStartDay: settings.weekStartDay,
      });
      toast({
        title: "Settings saved",
        description: "Organization settings updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description:
          error?.message ||
          error?.data?.message ||
          "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
          <Button onClick={save} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OrganizationSettings;
