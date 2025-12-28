import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, TrendingUp, Download } from "lucide-react";
import { Link } from "react-router-dom";

const Reports = () => {
  const reportSections = [
    {
      title: "Task Reports",
      description: "Task completion analytics and insights",
      icon: BarChart3,
      url: "/reports/tasks",
      color: "bg-blue-500"
    },
    {
      title: "Team Productivity",
      description: "Team performance metrics",
      icon: Users,
      url: "/reports/productivity",
      color: "bg-green-500"
    },
    {
      title: "Event Attendance",
      description: "RSVP and attendance tracking",
      icon: TrendingUp,
      url: "/reports/attendance",
      color: "bg-purple-500"
    },
    {
      title: "Export Data",
      description: "Export data in various formats",
      icon: Download,
      url: "/reports/export",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-semibold">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">Comprehensive insights and data exports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportSections.map((section) => (
          <Link key={section.url} to={section.url}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-4">
                 <div className={`${section.color} p-3 rounded-lg`}>
                    <section.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {section.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Reports;