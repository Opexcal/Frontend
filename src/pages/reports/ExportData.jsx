import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download, FileText, Calendar, CheckSquare, Users, 
  Mail, Database, Filter, Loader2
} from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

const ExportData = () => {
  const [exportType, setExportType] = useState("csv");
  const [dataType, setDataType] = useState("all");
  const [dateRange, setDateRange] = useState("month");
  const [selectedFields, setSelectedFields] = useState({
    tasks: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      dueDate: true,
      assignee: true,
      createdAt: true,
    },
    events: {
      id: true,
      title: true,
      description: true,
      start: true,
      end: true,
      location: true,
      organizer: true,
      attendees: true,
    },
    users: {
      id: true,
      name: true,
      email: true,
      role: true,
      groups: true,
      createdAt: true,
    },
  });
  const [isExporting, setIsExporting] = useState(false);

  const dataTypes = [
    { value: "all", label: "All Data", icon: Database },
    { value: "tasks", label: "Tasks", icon: CheckSquare },
    { value: "events", label: "Events", icon: Calendar },
    { value: "users", label: "Users", icon: Users },
  ];

  const exportFormats = [
    { value: "csv", label: "CSV", description: "Comma-separated values" },
    { value: "xlsx", label: "Excel", description: "Microsoft Excel format" },
    { value: "json", label: "JSON", description: "JavaScript Object Notation" },
  ];

  const handleFieldToggle = (dataType, field) => {
    setSelectedFields(prev => ({
      ...prev,
      [dataType]: {
        ...prev[dataType],
        [field]: !prev[dataType][field]
      }
    }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExporting(false);
    
    // In real app, trigger download
    console.log("Exporting:", {
      type: exportType,
      dataType,
      dateRange,
      fields: selectedFields[dataType] || selectedFields,
    });
    
    alert(`Export started! File will be downloaded as ${exportType.toUpperCase()}`);
  };

  const getCurrentFields = () => {
    if (dataType === "all") return {};
    return selectedFields[dataType] || {};
  };

  const getFieldLabels = (type) => {
    const labels = {
      tasks: {
        id: "Task ID",
        title: "Title",
        description: "Description",
        status: "Status",
        priority: "Priority",
        dueDate: "Due Date",
        assignee: "Assignee",
        createdAt: "Created At",
      },
      events: {
        id: "Event ID",
        title: "Title",
        description: "Description",
        start: "Start Date/Time",
        end: "End Date/Time",
        location: "Location",
        organizer: "Organizer",
        attendees: "Attendees",
      },
      users: {
        id: "User ID",
        name: "Name",
        email: "Email",
        role: "Role",
        groups: "Groups",
        createdAt: "Created At",
      },
    };
    return labels[type] || {};
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-semibold text-foreground">Export Data</h1>
        <p className="text-muted-foreground mt-1">Export your data in various formats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-6">
        {/* Configuration */}
        <div className="space-y-6">
          {/* Data Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Data Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dataTypes.map(type => (
                <div
                  key={type.value}
                  onClick={() => setDataType(type.value)}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    dataType === type.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent/50"
                  }`}
                >
                  <type.icon className={`h-5 w-5 ${dataType === type.value ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`font-medium ${dataType === type.value ? "text-primary" : ""}`}>
                    {type.label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Export Format */}
          <Card>
            <CardHeader>
              <CardTitle>Export Format</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {exportFormats.map(format => (
                <div
                  key={format.value}
                  onClick={() => setExportType(format.value)}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    exportType === format.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent/50"
                  }`}
                >
                  <div className="flex-1">
                    <p className={`font-medium ${exportType === format.value ? "text-primary" : ""}`}>
                      {format.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{format.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle>Date Range</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Export Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </>
            )}
          </Button>
        </div>

        {/* Field Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Select Fields to Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dataType === "all" ? (
              <div className="text-center py-12 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a specific data type to choose fields</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(getCurrentFields()).map(([field, selected]) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={selected}
                      onCheckedChange={() => handleFieldToggle(dataType, field)}
                    />
                    <Label
                      htmlFor={field}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {getFieldLabels(dataType)[field] || field}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">tasks_export_2025-12-22.csv</p>
                  <p className="text-xs text-muted-foreground">
                    Exported {format(new Date(), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportData;

