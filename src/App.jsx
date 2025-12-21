import React from "react";
// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Layouts
import AuthLayout from "./components/layout/AuthLayout";
import  DashboardLayout  from './components/layout/DashboardLayout';

// Pages
import  Landing  from "@/pages/Home/Landing";
import  Login from "@/pages/authentication/Login";
import Signup from './pages/authentication/Signup';
import ForgotPassword from './pages/authentication/ForgotPassword';
import  Dashboard  from "@/pages/dashboard/Dashboard";
import  CalendarOverview  from "@/pages/dashboard/CalendarOverview";
import  TaskLists  from "@/pages/dashboard/TaskLists";
import Settings from './pages/settings/Settings';
import  HelpCenter  from "@/pages/help/HelpCenter";
import NotFound from "./pages/NotFound";
import UserManagement from "./pages/admin/users/UserManagement";
import UserDetails from "./pages/admin/users/UserDetails";
import GroupManagement from "./pages/admin/groups/GroupManagement";
import GroupDetails from "./pages/admin/groups/GroupDetails";
import AuditLogs from "./pages/admin/AuditLogs";
import NotificationCenter from "./pages/notifications/NotificationCenter";
import NotificationSettings from "./pages/notifications/NotificationSettings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import OrganizationSettings from "./pages/admin/organization/OrganizationSettings";
// import NotificationCenter from "./pages/notifications/NotificationCenter";
// import NotificationSettings from "./pages/notifications/NotificationSettings";
// import AdminDashboard from "./pages/admin/AdminDashboard";
// import OrganizationSettings from "./pages/admin/organization/OrganizationSettings";
import TeamDashboard from "./pages/team/TeamDashboard";
import TeamCalendar from "./pages/team/TeamCalendar";
import TeamTasks from "./pages/team/TeamTasks";
import TeamReports from "./pages/team/TeamReports";
import TaskDelegation from "./pages/assignments/TaskDelegation";
import PendingAssignments from "./pages/assignments/PendingAssignments";
import MassMessaging from "./pages/mass-operations/MassMessaging";
import MassTaskCreation from "./pages/mass-operations/MassTaskCreation";
import MassEventCreation from "./pages/mass-operations/MassEventCreation";

const queryClient = new QueryClient()


function App () {
  return (
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* <Toaster /> */}
      <Sonner />
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/help/login" element={<HelpCenter />} />

          {/* Auth Routes */}
          <Route element={<AuthLayout showSignUp showLogin={false} />}>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>
          <Route element={<AuthLayout showSignUp={false} showLogin />}>
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarOverview />} />
            <Route path="/tasks" element={<TaskLists />} />
            <Route path="/settings" element={<Settings />} />

            {/* Notifications (all authenticated users) */}
            <Route path="/notifications" element={<NotificationCenter />} />
            <Route path="/notifications/settings" element={<NotificationSettings />} />

            {/* Team Management (Admin/Manager only) */}
            <Route path="/team/dashboard" element={<ProtectedRoute allowedRoles={["admin", "manager"]}><TeamDashboard /></ProtectedRoute>} />
            <Route path="/team/calendar" element={<ProtectedRoute allowedRoles={["admin", "manager"]}><TeamCalendar /></ProtectedRoute>} />
            <Route path="/team/tasks" element={<ProtectedRoute allowedRoles={["admin", "manager"]}><TeamTasks /></ProtectedRoute>} />
            <Route path="/team/reports" element={<ProtectedRoute allowedRoles={["admin", "manager"]}><TeamReports /></ProtectedRoute>} />

            {/* Task Assignments (all authenticated users) */}
            <Route path="/assignments" element={<TaskDelegation />} />
            <Route path="/assignments/pending" element={<PendingAssignments />} />

            {/* Mass Operations (Admin/Manager only) */}
            <Route path="/mass/message" element={<ProtectedRoute allowedRoles={["admin", "manager"]}><MassMessaging /></ProtectedRoute>} />
            <Route path="/mass/task" element={<ProtectedRoute allowedRoles={["admin", "manager"]}><MassTaskCreation /></ProtectedRoute>} />
            <Route path="/mass/event" element={<ProtectedRoute allowedRoles={["admin", "manager"]}><MassEventCreation /></ProtectedRoute>} />

            {/* Admin routes grouped under /admin and protected */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["manager", "admin"]} />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="users/:id" element={<UserDetails />} />
              <Route path="groups" element={<GroupManagement />} />
              <Route path="groups/:id" element={<GroupDetails />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="settings" element={<OrganizationSettings />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  )
}

export default App;
