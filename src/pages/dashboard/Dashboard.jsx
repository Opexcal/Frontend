import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckSquare, Users, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PriorityBadge} from "@/components/common/PriorityBadge";
import StatusBadge from "@/components/common/StatusBadge";

// Mock data - replace with actual data from API
const upcomingEvents = [
  { id: 1, title: "Team Sync Meeting", time: "10:00 AM", type: "meeting" },
  { id: 2, title: "Product Launch Strategy", time: "2:00 PM", type: "event" },
  { id: 3, title: "Client Demo: Project Alpha", time: "4:30 PM", type: "meeting" },
];

const upcomingTasks = [
  { id: 1, title: "Prepare Q3 Financial Report", priority: "high", status: "in-progress" },
  { id: 2, title: "Review Marketing Campaign Results", priority: "medium", status: "not-started" },
  { id: 3, title: "Onboard new team member", priority: "medium", status: "in-progress" },
  { id: 4, title: "Update Project Documentation", priority: "low", status: "not-started" },
];

const stats = [
  { label: "Total Events", value: "24", icon: Calendar, change: "+12%" },
  { label: "Tasks Due", value: "9", icon: CheckSquare, change: "-5%" },
  { label: "Team Members", value: "16", icon: Users, change: "+2" },
  { label: "Completion Rate", value: "87%", icon: TrendingUp, change: "+8%" },
];

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your overview for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                  <p className="text-xs text-success mt-1">{stat.change} from last week</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/calendar">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Upcoming Tasks</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/tasks">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                    <CheckSquare className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
