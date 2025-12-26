import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {toast } from 'sonner';
import { organizationApi } from "@/api/organizationApi";

const OrganizationSettings = () => {
const [settings, setSettings] = useState({
  name: "",
  primaryColor: "#3B82F6",
  logoUrl: "",
});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await organizationApi.get();
       // apiClient returns response.data, which contains { organization: {...} }
const org = res.data?.organization || res.organization || {};
        setSettings({
  name: org.name || "",
  primaryColor: org.branding?.primaryColor || "#3B82F6",
  logoUrl: org.branding?.logoUrl || "",
});
      } catch (error) {
        toast.error( "Failed to load organization",{
          description:
            error?.message ||
            error?.data?.message ||
            "Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

const save = async () => {
  setLoading(true);
  try {
    await organizationApi.update({
      name: settings.name,
      branding: {
        primaryColor: settings.primaryColor,
        logoUrl: settings.logoUrl || null
      }
    });
    toast.success("Settings saved", {
  description: "Organization settings updated successfully.",
});
  } catch (error) {
    toast.error("Save failed", {
  description: error?.message || error?.data?.message || "Please try again later.",
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
  <div className="space-y-4">
    <div>
      <Label>Organization Name</Label>
      <Input 
        value={settings.name} 
        onChange={(e) => setSettings({ ...settings, name: e.target.value })} 
        placeholder="Enter organization name"
      />
    </div>
    
    <div>
      <Label>Primary Color</Label>
      <div className="flex items-center gap-2">
        <Input 
          type="color"
          value={settings.primaryColor} 
          onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })} 
          className="w-20 h-10 p-1"
        />
        <Input 
          value={settings.primaryColor} 
          onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })} 
          placeholder="#3B82F6"
          className="flex-1"
        />
      </div>
    </div>
    
    <div>
      <Label>Logo URL (optional)</Label>
      <Input 
        value={settings.logoUrl} 
        onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })} 
        placeholder="https://example.com/logo.png"
      />
      {settings.logoUrl && (
        <div className="mt-2">
          <img 
            src={settings.logoUrl} 
            alt="Organization logo preview" 
            className="h-16 object-contain"
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
      )}
    </div>
  </div>
  
  <div className="mt-6 flex justify-end">
    <Button onClick={save} disabled={loading}>
      {loading ? "Saving..." : "Save Changes"}
    </Button>
  </div>
</Card>
    </div>
  );
};

export default OrganizationSettings;
