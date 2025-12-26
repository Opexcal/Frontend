import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import  DashboardSidebar  from "./DashboardSidebar";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Outlet } from "react-router-dom";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import NotificationErrorBoundary from "@/components/notifications/NotificationErrorBoundary";

const DashboardLayout = () => {
 return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-full items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search events, tasks..." 
                    className="pl-9 w-64"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <NotificationErrorBoundary>
  <NotificationDropdown />
</NotificationErrorBoundary>
              </div>
            </div>
 </header>
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;