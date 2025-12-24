// src/pages/authentication/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    console.log('🔐 Attempting login with:', formData.email);
    
    await login({
      email: formData.email,
      password: formData.password,
    });
    
    console.log('✅ Login successful, token stored');
    
    toast({
      title: "Login successful",
      description: "Welcome back! Redirecting...",
    });
    
    setTimeout(() => {
      navigate("/dashboard");
    }, 500);
    
  } catch (error) {
    console.error("❌ Login error:", error);
    
    const errorMessage = 
      error?.message || 
      error?.data?.message || 
      error?.error ||
      "Invalid email or password. Please try again.";
    
    toast({
      title: "Login failed",
      description: errorMessage,
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="w-full max-w-md animate-fade-in">
      <Card className="border-none shadow-none">
        <CardHeader className="text-center space-y-3">
          <CardTitle className="text-2xl font-display">Log in to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
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
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2 text-md font-normal text-foreground">
            <p>
              Don't have an account yet?{" "}
              <Link to="/signup" className="hover:underline font-medium">
                Sign up
              </Link>
            </p>
            <p className="text-md text-foreground">
              Can't log in?{" "}
              <Link to="/forgot-password" className="hover:underline">
                Reset password
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;