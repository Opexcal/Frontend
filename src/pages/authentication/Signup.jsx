// src/pages/authentication/Signup.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { register ,user, loading} = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);
 if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
const validateForm = () => {
  if (formData.password.length < 8) {
    toast.error("Password Too Short", {
        description: "Password must be at least 8 characters long.",
      });
    return false;
  }

  if (formData.password !== formData.confirmPassword) {
     toast.error("Passwords Don't Match", {
        description: "Please make sure both password fields match.",
      });
    return false;
  }

  // ✅ Optional: Check password strength
  if (!/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
    toast.warning("Weak Password", {
        description: "For better security, include at least one uppercase letter and one number.",
      });
    return false;
  }

  return true;
};

// src/pages/authentication/Signup.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setIsLoading(true);
  
  try {
    const userData = await register({
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      orgName: formData.organizationName,
    });
    
    // ✅ SUCCESS - Show toast
   toast.success("Welcome to OpexCal! 🎉", {
        description: `Account created for ${userData.name}`,
      });
    
    setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 500);
    
  } catch (error) {
    // ✅ ERROR - Show toast
    console.error("Signup error:", error);
    
    let errorMessage = "Failed to create account";
    
    if (error?.message?.includes("exists")) {
      errorMessage = "This email is already registered. Try logging in.";
    } else if (error?.message?.includes("organization")) {
      errorMessage = "Organization name is already taken.";
    } else {
      errorMessage = error?.message || "An unexpected error occurred";
    }
    
     toast.error("Sign Up Failed", {
        description: errorMessage,
      });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="w-full max-w-md animate-fade-in py-8">
      <Card className="border-none shadow-none">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-4xl font-display">Welcome to OpexCal</CardTitle>
          <CardDescription className="text-foreground text-md">
            Get started - it's free. No credit card needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input
                id="organizationName"
                type="text"
                placeholder="Acme Corp"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                required
                disabled={isLoading}
                minLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                disabled={isLoading}
                minLength={2}
                autoComplete="name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={8}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating organization...
                </>
              ) : (
                "Create Organization"
              )}
            </Button>
          </form>

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

export default Signup;