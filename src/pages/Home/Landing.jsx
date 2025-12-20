import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { 
  Calendar, 
  CheckSquare, 
  Users, 
  Bell, 
  BarChart3, 
  Shield,
  ArrowRight
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Unified Calendar",
    description: "Day, week, and month views with 24-hour daily breakdowns. See everything at a glance.",
  },
  {
    icon: CheckSquare,
    title: "Task Management",
    description: "Create, assign, and track tasks with priority levels, due dates, and progress status.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Group events, mass messaging, and delegation flows for seamless teamwork.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Configurable in-app and email reminders to never miss an important deadline.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Visual dashboards and reports to monitor team workload and completion rates.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Fine-grained permissions for Super Admin, Admin, Staff, and Viewer roles.",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar showLogin showSignUp />

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto animate-slide-up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold text-foreground leading-tight">
            Your organization's heartbeat,
            <br />
            <span className="text-foreground">on one calendar</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage tasks, track progress, and stay aligned — from meetings to milestones.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <p className="text-sm text-muted-foreground">
              No credit card needed • Unlimited time on Free plan
            </p>
          </div>

          <div className="mt-6">
            <Button size="lg" asChild className="h-12 px-8 text-base">
              <Link to="/signup">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground">
              Solutions for every team.
              <br />
              Powered by one platform.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Everything you need to keep your organization running smoothly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="card-hover border-border/50"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground">
            Ready to get started?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join thousands of teams already using OpexCal to stay organized.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link to="/signup">
                Create Your Organization <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/help" className="hover:text-foreground transition-colors">
              Help Center
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} OpexCal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
