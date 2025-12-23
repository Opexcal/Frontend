import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/common/Logo";
import {
  Calendar,
  CheckSquare,
  LayoutDashboard,
  Users,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  Plus,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "../../context/AuthContext";
import { roleDisplayMap } from '@/constant/roleMapDisplay';

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "My Tasks", url: "/tasks", icon: CheckSquare },
];

const adminNavItems = [
  { title: "Admin Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Groups", url: "/admin/groups", icon: Users },
  { title: "Organization", url: "/admin/settings", icon: Settings },
];

export const DashboardSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, hasPermission } = useAuth();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  // Role display mapping and helpers

  const formatRole = (role) => {
  if (!role) return "User";
  return roleDisplayMap[role] ?? "User";
};

  const isSuperAdmin = (role) => ["manager", "SuperAdmin"].includes(role);
  const isUnassigned = (role) => ["wanderer", "Unassigned"].includes(role);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Logo size={collapsed ? "sm" : "md"} showText={!collapsed} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-3 pb-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size={collapsed ? "icon" : "default"}
                    className={collapsed ? "w-10 h-10" : "w-full justify-between"}
                  >
                    {collapsed ? <Plus className="h-4 w-4" /> : (
                      <>
                        <span className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Create New
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/calendar?create=event">
                      <Calendar className="mr-2 h-4 w-4" />
                      New Event
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/tasks?create=task">
                      <CheckSquare className="mr-2 h-4 w-4" />
                      New Task
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Calendar</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/calendar/personal")}
                  tooltip="Personal Calendar"
                >
                  <Link to="/calendar/personal">
                    <Calendar className="h-4 w-4" />
                    <span>Personal</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {!isUnassigned(user?.role) && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/calendar/day")}
                    tooltip="Day View"
                  >
                    <Link to="/calendar/day">
                      <Clock className="h-4 w-4" />
                      <span>Day View</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
              
        {(hasPermission("manage_groups") || isSuperAdmin(user?.role)) && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {isSuperAdmin(user?.role) && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/admin/audit-logs")} tooltip="Audit Logs">
                      <Link to="/admin/audit-logs">Audit Logs</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user?.name ? user.name.split(" ").map(n => n[0]).slice(0,2).join("") : "JD"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-sidebar-foreground">{user?.name ?? "John Doe"}</p>
                  <p className="text-xs text-muted-foreground">{formatRole(user?.role)}</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" asChild>
              <Link to="/login">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
