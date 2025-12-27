import {lazy, Suspense} from "react";
import { LoadingScreen } from './components/LoadingScreen';
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// Layouts
import AuthLayout from "./components/layout/AuthLayout";
import  DashboardLayout  from './components/layout/DashboardLayout';

// Keep these as regular imports (small, always needed, or public routes)
import Landing from "@/pages/Home/Landing";
import Login from "@/pages/authentication/Login";
import Signup from './pages/authentication/Signup';
import ForgotPassword from './pages/authentication/ForgotPassword';
import HelpCenter from "@/pages/help/HelpCenter";
import NotFound from "./pages/NotFound";

// Lazy load dashboard components
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const WandererDashboard = lazy(() => import("./pages/dashboard/WandererDashboard"));
const StaffDashboard = lazy(() => import("./pages/dashboard/StaffDashboard"));
const ManagerDashboard = lazy(() => import("./pages/dashboard/ManagerDashboard"));

// Lazy load calendar components
const CalendarOverview = lazy(() => import("@/pages/dashboard/CalendarOverview"));
const PersonalCalendar = lazy(() => import("./pages/calendar/PersonalCalendar"));
const GroupCalendar = lazy(() => import("./pages/calendar/GroupCalendar"));
const DayView = lazy(() => import("./pages/calendar/DayView"));

// Lazy load task components
const TaskLists = lazy(() => import("@/pages/dashboard/TaskLists"));
const MyTasks = lazy(() => import("./pages/tasks/MyTasks"));
const AssignedToMe = lazy(() => import("./pages/tasks/AssignedToMe"));
const AssignedByMe = lazy(() => import("./pages/tasks/AssignedByMe"));
const TaskDetails = lazy(() => import("./pages/tasks/TaskDetails"));
const TaskTimeline = lazy(() => import("./pages/tasks/TaskTimeline"));

// Lazy load event components
const EventDetails = lazy(() => import("./pages/events/EventDetails"));
const EventRSVP = lazy(() => import("./pages/events/EventRSVP"));
const RecurringEvents = lazy(() => import("./pages/events/RecurringEvents"));

// Lazy load admin components
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const UserManagement = lazy(() => import("./pages/admin/users/UserManagement"));
const UserDetails = lazy(() => import("./pages/admin/users/UserDetails"));
const GroupManagement = lazy(() => import("./pages/admin/groups/GroupManagement"));
const GroupDetails = lazy(() => import("./pages/admin/groups/GroupDetails"));
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const OrganizationSettings = lazy(() => import("./pages/admin/organization/OrganizationSettings"));

// Lazy load team components
const TeamDashboard = lazy(() => import("./pages/team/TeamDashboard"));
const TeamCalendar = lazy(() => import("./pages/team/TeamCalendar"));
const TeamTasks = lazy(() => import("./pages/team/TeamTasks"));
const TeamReports = lazy(() => import("./pages/team/TeamReports"));

// Lazy load assignment components
const TaskDelegation = lazy(() => import("./pages/assignments/TaskDelegation"));
const PendingAssignments = lazy(() => import("./pages/assignments/PendingAssignments"));

// Lazy load mass operation components
const MassMessaging = lazy(() => import("./pages/mass-operations/MassMessaging"));
const MassTaskCreation = lazy(() => import("./pages/mass-operations/MassTaskCreation"));
const MassEventCreation = lazy(() => import("./pages/mass-operations/MassEventCreation"));

// Lazy load report components
const TaskReports = lazy(() => import("./pages/reports/TaskReports"));
const TeamProductivity = lazy(() => import("./pages/reports/TeamProductivity"));
const EventAttendance = lazy(() => import("./pages/reports/EventAttendance"));
const ExportData = lazy(() => import("./pages/reports/ExportData"));

// Lazy load notification and settings components
const NotificationCenter = lazy(() => import("./pages/notifications/NotificationCenter"));
const NotificationSettings = lazy(() => import("./pages/notifications/NotificationSettings"));
const Settings = lazy(() => import('./pages/settings/Settings'));



function AppRoutes() {
  return (
    <>
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
    </>
  )
}

export default AppRoutes
