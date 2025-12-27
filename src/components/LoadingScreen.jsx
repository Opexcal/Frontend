// components/LoadingScreen.jsx
import { Loader2 } from "lucide-react";

export const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50 animate-in fade-in duration-200">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-lg font-medium text-foreground">Authenticating...</p>
      <p className="text-sm text-muted-foreground">Please wait</p>
    </div>
  </div>
);