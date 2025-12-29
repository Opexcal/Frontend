import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Lock, CheckCircle, XCircle } from "lucide-react";
import { authApi } from "@/api/authApi";

const ResetPassword = () => {
  const { resettoken } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState("idle");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMessage("");

  // Validation
  if (password.length < 8) {
    setErrorMessage("Password must be at least 8 characters long.");
    return;
  }

  if (password !== confirmPassword) {
    setErrorMessage("Passwords do not match.");
    return;
  }

  setStatus("loading");
  
  try {
    console.log('🔄 Attempting password reset');
    console.log('🔑 Token:', resettoken);
    console.log('📦 Sending password'); // Don't log the actual password
    
    const response = await authApi.resetPassword(resettoken, { password });
    
    console.log('✅ Reset successful:', response);
    setStatus("success");
    toast({
      title: "Password reset successful",
      description: "You can now log in with your new password.",
    });
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  } catch (error) {
    console.error('❌ Reset failed:', error);
    console.error('Error response:', error.response?.data);
    
    setStatus("error");
    setErrorMessage(
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      "Invalid or expired reset token. Please request a new one."
    );
  }
};

  return (
    <div className="w-full max-w-md animate-fade-in">
      <Card className="border-border shadow-sm">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-display">Reset your password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={status === "loading" || status === "success"}
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={status === "loading" || status === "success"}
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={status === "loading" || status === "success"}
            >
              {status === "loading" ? "Resetting..." : status === "success" ? "Success!" : "Reset password"}
            </Button>
          </form>

          {status === "success" && (
            <Alert className="mt-4 border-success/30 bg-success/10">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                Password reset successful! Redirecting to login...
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert className="mt-4 border-destructive/30 bg-destructive/10">
              <XCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;