import React from "react";
// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import  HelpCenter  from "@/pages/help/HelpCenter";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
