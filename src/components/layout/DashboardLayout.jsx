import React, {useState, Suspense} from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import  DashboardSidebar  from "./DashboardSidebar";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Outlet } from "react-router-dom";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import NotificationErrorBoundary from "@/components/notifications/NotificationErrorBoundary";
import { useNavigate,useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { RouteLoadingScreen } from '../RouteLoadingScreen';


const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbNameMap = {
    dashboard: "Dashboard",
    tasks: "Tasks",
    "my-tasks": "My Tasks",
    "assigned-to-me": "Assigned To Me",
    "assigned-by-me": "Assigned By Me",
    calendar: "Calendar",
    personal: "Personal",
    admin: "Admin",
    users: "Users",
    groups: "Groups",
    settings: "Settings",
  };

  if (pathnames.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link to="/dashboard" className="hover:text-foreground transition-colors">
        Home
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const displayName = breadcrumbNameMap[name] || name;

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-foreground">{displayName}</span>
            ) : (
              <Link to={routeTo} className="hover:text-foreground transition-colors">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to a search results page or implement search logic
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      // Or you could implement live search with a dropdown
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-full items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <Breadcrumbs />
                
                <div className="relative hidden md:block">
                  <form onSubmit={handleSearch} className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input 
          placeholder="Search events, tasks..." 
          className="pl-9 w-64"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>
                </div>
              </div>
              <div className="flex items-center gap-2">
  {/* Mobile Search Toggle */}
  <Button 
    variant="ghost" 
    size="icon" 
    className="md:hidden"
    onClick={() => {/* Toggle mobile search modal/drawer */}}
  >
    <Search className="h-4 w-4" />
  </Button>

  <NotificationErrorBoundary>
    <NotificationDropdown />
  </NotificationErrorBoundary>
</div>
            </div>
 </header>
          <main className="flex-1 overflow-auto p-6">
            <Suspense fallback={<RouteLoadingScreen />}>
            <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;