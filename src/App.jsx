import React, {Suspense} from "react";
// import { Toaster } from "@/components/ui/toaster";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { LoadingScreen } from './components/LoadingScreen';
import AppRoutes from "./AppRoutes";
const queryClient = new QueryClient()


function App () {
  return (
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* <Toaster /> */}
      <Toaster position="top-right" richColors />
       <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
        <AppRoutes />
         </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  )
}

export default App;
