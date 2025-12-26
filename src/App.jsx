import React from "react";
// import { Toaster } from "@/components/ui/toaster";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import WandererDashboard from "./pages/dashboard/WandererDashboard";
import StaffDashboard from "./pages/dashboard/StaffDashboard";
import ManagerDashboard from "./pages/dashboard/ManagerDashboard";
import PersonalCalendar from "./pages/calendar/PersonalCalendar";
import GroupCalendar from "./pages/calendar/GroupCalendar";
import DayView from "./pages/calendar/DayView";
import MyTasks from "./pages/tasks/MyTasks";
import AssignedToMe from "./pages/tasks/AssignedToMe";
import AssignedByMe from "./pages/tasks/AssignedByMe";
import TaskDetails from "./pages/tasks/TaskDetails";
import TaskTimeline from "./pages/tasks/TaskTimeline";
import EventDetails from "./pages/events/EventDetails";
import EventRSVP from "./pages/events/EventRSVP";
import RecurringEvents from "./pages/events/RecurringEvents";
import TaskReports from "./pages/reports/TaskReports";
import TeamProductivity from "./pages/reports/TeamProductivity";
import EventAttendance from "./pages/reports/EventAttendance";
import ExportData from "./pages/reports/ExportData";

const queryClient = new QueryClient()


function App () {
  return (
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* <Toaster /> */}
      <Toaster position="top-right" richColors />
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
          {/* Dashboard Routes - ALL PROTECTED */}
<Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
  {/* Redirect /dashboard/admin to admin dashboard - must be before /dashboard */}
  <Route path="/dashboard/admin" element={<Navigate to="/admin/dashboard" replace />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/dashboard/wanderer" element={<WandererDashboard />} />
  <Route path="/dashboard/staff" element={<StaffDashboard />} />
  <Route path="/dashboard/manager" element={<ManagerDashboard />} />
  <Route path="/calendar" element={<CalendarOverview />} />
  <Route path="/calendar/personal" element={<PersonalCalendar />} />
  <Route path="/calendar/group/:id" element={<GroupCalendar />} />
  <Route path="/calendar/day" element={<DayView />} />
  <Route path="/tasks" element={<TaskLists />} />
  <Route path="/tasks/my-tasks" element={<MyTasks />} />
  <Route path="/tasks/assigned-to-me" element={<AssignedToMe />} />
  <Route path="/tasks/assigned-by-me" element={<AssignedByMe />} />
  <Route path="/tasks/:id" element={<TaskDetails />} />
  <Route path="/tasks/:id/timeline" element={<TaskTimeline />} />
  <Route path="/events/:id" element={<EventDetails />} />
  <Route path="/events/:id/rsvp" element={<EventRSVP />} />
  <Route path="/events/recurring/:id" element={<RecurringEvents />} />
  <Route path="/reports/tasks" element={<TaskReports />} />
  <Route path="/reports/productivity" element={<TeamProductivity />} />
  <Route path="/reports/attendance" element={<EventAttendance />} />
  <Route path="/reports/export" element={<ExportData />} />
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
    </TooltipProvider>
  </QueryClientProvider>
  )
}

export default App;
