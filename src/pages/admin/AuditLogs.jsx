import React, { useState, useEffect } from "react";
import { getAuditLogs, getAuditStats, exportAuditLogs } from "../../api/auditApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Calendar } from "../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Download, Search, Calendar as CalendarIcon, TrendingUp, Users, Activity } from "lucide-react";
import { format } from "date-fns";
import { toast } from 'sonner';
const AuditLogs = () => {
  // State Management
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // Filter States
  const [filters, setFilters] = useState({
    action: "",
    actor: "",
    startDate: null,
    endDate: null,
    page: 1,
    limit: 50
  });
  
  // Pagination State
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Fetch Logs
const fetchLogs = async () => {
  try {
    setLoading(true);
    const params = {
      ...filters,
      startDate: filters.startDate ? filters.startDate.toISOString() : undefined,
      endDate: filters.endDate ? filters.endDate.toISOString() : undefined
    };
    
    const response = await getAuditLogs(params);
    const responseData = response.data?.data || response.data || response;
    
    if (responseData.logs && responseData.pagination) {
      setLogs(responseData.logs);
      setPagination(responseData.pagination);
    } else {
      setLogs([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
    }
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    setLogs([]);
    toast.error("Failed to load audit logs", {
      description: error.message || "Please try again later",
      variant: "destructive"
    });
  } finally {
    setLoading(false);
  }
};

 // Fetch Statistics
const fetchStats = async () => {
  try {
    const response = await getAuditStats(30);
    
    // Handle different response structures
    const responseData = response.data?.data || response.data || response;
    
    console.log("Stats Response:", response);
    console.log("Extracted Stats:", responseData);
    
    // ✅ ADD: Set stats only if we have valid data
    if (responseData && typeof responseData === 'object') {
      setStats(responseData);
    } else {
      setStats(null);
    }
  } catch (error) {
    console.error("Failed to fetch audit stats:", error);
    setStats(null);
  }
};

  // Handle Export
  const handleExport = async () => {
    try {
      setExporting(true);
      await exportAuditLogs({
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
        action: filters.action,
        actor: filters.actor
      });
    } catch (error) {
      console.error("Failed to export audit logs:", error);
    } finally {
      setExporting(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filters.page, filters.limit]);

  // Handle Filter Apply
  const applyFilters = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchLogs();
  };

  // Handle Filter Reset
  const resetFilters = () => {
    setFilters({
      action: "",
      actor: "",
      startDate: null,
      endDate: null,
      page: 1,
      limit: 50
    });
  };

  // Action Badge Color
// Action Badge Color
// Action Badge Color
const getActionColor = (action) => {
  const actionUpper = action.toUpperCase();
  
  if (actionUpper.includes('CREATE')) return 'default';
  if (actionUpper.includes('UPDATE') || actionUpper.includes('EDIT')) return 'secondary';
  if (actionUpper.includes('DELETE') || actionUpper.includes('REMOVE')) return 'destructive';
  if (actionUpper.includes('LOGIN') || actionUpper.includes('LOGOUT')) return 'outline';
  if (actionUpper.includes('SENT') || actionUpper.includes('SEND')) return 'default';
  if (actionUpper.includes('MASS_')) return 'secondary';
  
  return 'default';
};

// ✅ ADD: Get icon for action type
const getActionIcon = (action) => {
  const actionUpper = action.toUpperCase();
  
  if (actionUpper.includes('CREATE')) return '✨';
  if (actionUpper.includes('UPDATE')) return '✏️';
  if (actionUpper.includes('DELETE')) return '🗑️';
  if (actionUpper.includes('LOGIN')) return '🔐';
  if (actionUpper.includes('LOGOUT')) return '👋';
  if (actionUpper.includes('SENT') || actionUpper.includes('SEND')) return '📤';
  if (actionUpper.includes('MASS_')) return '📊';
  
  return '📝';
};
  return (
    <div className="p-6 space-y-6">
     {/* Header */}
<div className="flex justify-between items-center">
  <div>
    <h1 className="text-3xl font-bold">Audit Logs</h1>
    <p className="text-muted-foreground">
      System-wide activity trail and security monitoring
    </p>
  </div>
  <div className="flex gap-2">
    <Button 
      variant="outline" 
      onClick={() => {
        fetchLogs();
        fetchStats();
      }}
      disabled={loading}
    >
      {loading ? (
        <>
          <div className="h-4 w-4 mr-2 rounded-full border-2 border-muted border-t-primary animate-spin" />
          Refreshing...
        </>
      ) : (
        <>
          <Activity className="mr-2 h-4 w-4" />
          Refresh
        </>
      )}
    </Button>
    <Button onClick={handleExport} disabled={exporting || logs.length === 0}>
      <Download className="mr-2 h-4 w-4" />
      {exporting ? "Exporting..." : "Export CSV"}
    </Button>
  </div>
</div>

{/* Statistics Cards */}
{loading ? (
  <div className="grid gap-4 md:grid-cols-3">
    {[1, 2, 3].map((i) => (
      <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-muted animate-pulse rounded w-24" />
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted animate-pulse rounded w-16 mb-2" />
          <div className="h-3 bg-muted animate-pulse rounded w-24" />
        </CardContent>
      </Card>
    ))}
  </div>
) : stats ? (
  <div className="grid gap-4 md:grid-cols-3">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.totalActions || 0}</div>
        <p className="text-xs text-muted-foreground">{stats.period || 'Last 30 days'}</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Unique Actors</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.uniqueActors || 0}</div>
        <p className="text-xs text-muted-foreground">Active users</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Most Active</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {stats.topActors && stats.topActors.length > 0 && stats.topActors[0] ? (
          <>
            <div className="text-2xl font-bold">{stats.topActors[0].actionCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.topActors[0].user?.name || 'Unknown User'}
            </p>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No activity yet</p>
          </>
        )}
      </CardContent>
    </Card>
  </div>
) : (
  <Card>
    <CardContent className="py-8">
      <div className="text-center text-muted-foreground">
        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No statistics available</p>
        <p className="text-sm mt-2">Audit data will appear here once system activity begins</p>
      </div>
    </CardContent>
  </Card>
)}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Logs</CardTitle>
          <CardDescription>Narrow down your search with filters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Action Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Action Type</label>
              <Input
                placeholder="e.g., USER_CREATED"
                value={filters.action}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
              />
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? format(filters.startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? format(filters.endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.endDate}
                    onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <div className="flex gap-2">
                <Button onClick={applyFilters} className="flex-1">
                  <Search className="mr-2 h-4 w-4" />
                  Apply
                </Button>
                <Button onClick={resetFilters} variant="outline">
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
          <CardDescription>
            Showing {logs.length} of {pagination.totalCount} total records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
  <div className="flex flex-col justify-center items-center h-64 space-y-4">
    <div className="relative">
      <div className="h-12 w-12 rounded-full border-4 border-muted border-t-primary animate-spin" />
    </div>
    <div className="text-center space-y-2">
      <p className="text-sm font-medium">Loading audit logs...</p>
      <p className="text-xs text-muted-foreground">Fetching system activity data</p>
    </div>
  </div>
) : logs.length === 0 ? (
  <div className="flex flex-col justify-center items-center h-64 space-y-4">
    <Activity className="h-16 w-16 text-muted-foreground/50" />
    <div className="text-center space-y-2">
      <p className="font-medium">No audit logs found</p>
      <p className="text-sm text-muted-foreground">
        {filters.action || filters.startDate || filters.endDate 
          ? "Try adjusting your filters" 
          : "System activity will appear here"}
      </p>
    </div>
  </div>
) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="font-mono text-xs">
                        {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.actor?.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{log.actor?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
  <Badge variant={getActionColor(log.action)} className="font-mono text-xs">
    <span className="mr-1">{getActionIcon(log.action)}</span>
    {log.action}
  </Badge>
</TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.target?.toString().slice(0, 8)}...
                      </TableCell>
                      <TableCell className="max-w-xs">
  {log.details && Object.keys(log.details).length > 0 ? (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-auto px-2 py-1 font-mono text-xs hover:bg-accent hover:text-accent-foreground"
        >
          <Activity className="h-3 w-3 mr-1" />
          View ({Object.keys(log.details).length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] max-h-[400px] overflow-auto" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-semibold text-sm">Action Details</h4>
            <Badge variant="outline" className="text-xs">
              {Object.keys(log.details).length} fields
            </Badge>
          </div>
          <div className="space-y-2">
            {Object.entries(log.details).map(([key, value]) => (
              <div key={key} className="border rounded-md p-2 bg-muted/30">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-xs text-primary min-w-[100px] break-words">
                    {key}:
                  </span>
                  <div className="flex-1 min-w-0">
                    <pre className="text-xs whitespace-pre-wrap break-words font-mono bg-background rounded p-1">
                      {typeof value === 'object' 
                        ? JSON.stringify(value, null, 2) 
                        : String(value)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ) : (
    <span className="text-xs text-muted-foreground italic">No details</span>
  )}
</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={!pagination.hasPrevPage}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;