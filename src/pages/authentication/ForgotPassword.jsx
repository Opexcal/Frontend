import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle, XCircle } from "lucide-react";

const ForgotPassword = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState("idle");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    
    // Simulate API call - replace with actual password reset integration
    setTimeout(() => {
      // Simulate success/error based on email
      if (email.includes("notfound")) {
        setStatus("error");
        setErrorMessage("User credentials not found.");
      } else {
        setStatus("success");
        toast({
          title: "Reset link sent",
          description: "Check your email for the password reset link.",
        });
      }
    }, 1500);
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <Card className="border-border shadow-sm">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-display">Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="your@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === "loading" || status === "success"}
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={status === "loading" || status === "success"}
            >
              {status === "loading" ? "Sending..." : status === "success" ? "Link Sent" : "Send reset link"}
            </Button>
          </form>

          {status === "success" && (
            <Alert className="mt-4 border-success/30 bg-success/10">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                Password reset details sent to your email.
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert className="mt-4 border-destructive/30 bg-destructive/10">
              <XCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                Error! {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By proceeding, you agree to the{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
