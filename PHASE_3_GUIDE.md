# Phase 3: Team/Admin Views Implementation Guide

## Overview

Phase 3 implements comprehensive team management and task assignment capabilities for OpexCal. This includes 6 pages, 5 shared components, and full API integration templates.

## Project Structure

```
src/
├── pages/
│   ├── team/
│   │   ├── TeamDashboard.jsx      # Team overview and statistics
│   │   ├── TeamCalendar.jsx       # Unified calendar view
│   │   ├── TeamTasks.jsx          # Task management interface
│   │   └── TeamReports.jsx        # Analytics and reporting
│   └── assignments/
│       ├── TaskDelegation.jsx     # Accept/decline/reassign interface
│       └── PendingAssignments.jsx # Quick view of urgent tasks
├── components/
│   └── team/
│       ├── TaskCard.jsx           # Reusable task card component
│       ├── TeamMemberCard.jsx     # Team member display card
│       ├── AssignmentModal.jsx    # Task creation/reassignment modal
│       ├── PriorityBadge.jsx      # Priority visual indicator
│       └── StatusBadge.jsx        # Status visual indicator
├── api/
│   ├── teamApi.js                 # Team API client
│   └── assignmentApi.js           # Assignment API client
├── context/
│   └── TeamContext.jsx            # Team state management (optional)
├── lib/
│   └── mockTeamData.js            # Mock data for development
└── utils/
    └── teamUtils.js               # Team utility functions
```

## Pages & Features

### 1. TeamDashboard (`/team/dashboard`)
**Role**: Admin/Manager only

- 📊 **Statistics Cards**: Total tasks, in progress, completed, overdue
- 👥 **Team Members Grid**: Display team members with task counts
- 📈 **Completion Rate**: Visual progress indicator
- 📅 **Upcoming Deadlines**: Next 5 deadlines with assignees
- 🎯 **Quick Actions**: Assign task, view calendar

**Key Features**:
- Real-time stats updates
- Filter by team/department
- Responsive grid layout

---

### 2. TeamCalendar (`/team/calendar`)
**Role**: Admin/Manager only

- 📅 **Multi-view Calendar**: Day/Week/Month toggle
- 🎨 **Color-coded Events**: Different colors for events vs tasks
- 🔍 **Filtering**: By team member, event type
- 📍 **Event Details**: Modal with meeting links
- 🔗 **Conference Links**: Quick access to meeting URLs

**Key Features**:
- Interactive date selection
- Event creation from date click
- Drag-and-drop support (extensible)
- Export functionality

---

### 3. TeamTasks (`/team/tasks`)
**Role**: Admin/Manager only

- 📋 **Task List**: Comprehensive task management
- 🔎 **Advanced Filters**: Status, priority, assignee, date range
- ☑️ **Bulk Actions**: Select multiple, mark as read, delete
- 🎯 **Task Creation**: Modal for creating & assigning new tasks
- ⚙️ **Task Management**: Edit, reassign, delete individual tasks

**Columns**:
- Title | Assignee | Priority | Status | Due Date | Actions

**Filters**:
- Status: All, Not Started, In Progress, Completed
- Priority: High, Medium, Low
- Assignee: All team members
- Date Range: Custom picker

---

### 4. TeamReports (`/team/reports`)
**Role**: Admin/Manager only

- 📊 **Task Completion Rate**: Visual chart over time
- 📈 **Priority Distribution**: Pie chart (High/Medium/Low)
- 🔄 **Status Overview**: Bar chart (Not Started/In Progress/Completed)
- 👥 **Member Performance**: Table with completion rates
- 📉 **Overdue Trend**: Line chart showing overdue tasks over time
- 💾 **Export**: Download reports as CSV

**Date Range Options**:
- Last 7 days
- Last 30 days
- Last 90 days
- Custom range

---

### 5. TaskDelegation (`/assignments`)
**Role**: All authenticated users

- 📬 **Pending Tasks**: Tasks awaiting response
- 🎯 **Bulk Accept/Decline**: Quick actions
- ↪️ **Reassign Option**: Delegate to another team member
- 💬 **Decline Reason**: Optional feedback to assignor
- 🔍 **Search**: Find specific tasks
- 📑 **Tabs**: Filter by status (All, Pending, Accepted, Declined)

**Task Card Variant**:
- Task title & description
- Assigned by (with avatar)
- Due date & priority
- Conference link (if any)
- Accept/Decline/Reassign buttons

---

### 6. PendingAssignments (`/assignments/pending`)
**Role**: All authenticated users

- ⏰ **Urgent View**: Only pending tasks requiring action
- 🔴 **Color-coded Urgency**: OVERDUE/URGENT/DUE SOON labels
- ⏱️ **Hours Remaining**: Countdown to due date
- 🔄 **Auto-refresh**: Updates every 30 seconds
- 📊 **Task Count Badge**: Visual indicator in header

**Urgency Levels**:
- 🔴 **OVERDUE**: Past due date
- 🔴 **URGENT**: Due within 6 hours
- 🟠 **DUE SOON**: Due within 24 hours
- ⭕ **DUE LATER**: More than 24 hours

---

## Shared Components

### TaskCard.jsx
Reusable card for displaying tasks with 3 variants:

```jsx
// Default variant - Full details with actions
<TaskCard
  task={taskData}
  variant="default"
  showActions
  onEdit={handleEdit}
  onDelete={handleDelete}
/>

// Compact variant - Minimal display
<TaskCard
  task={taskData}
  variant="compact"
/>

// Delegation variant - For assignment workflow
<TaskCard
  task={taskData}
  variant="delegation"
  onAccept={handleAccept}
  onDecline={handleDecline}
  onReassign={handleReassign}
/>
```

**Props**:
- `task`: Task data object
- `variant`: 'default' | 'compact' | 'delegation'
- `showActions`: Show action buttons
- `onAccept`, `onDecline`, `onDelete`, etc.: Event handlers

---

### TeamMemberCard.jsx
Display team member with statistics:

```jsx
<TeamMemberCard
  member={memberData}
  taskCount={5}
  completedCount={3}
  overdueCount={1}
  onClick={handleMemberClick}
/>
```

**Shows**:
- Avatar, name, email
- Task count, completed count, overdue count
- Completion rate with progress bar

---

### AssignmentModal.jsx
Modal for creating/reassigning tasks:

```jsx
<AssignmentModal
  isOpen={showModal}
  onClose={handleClose}
  mode="create" // or "reassign"
  teamMembers={membersList}
  existingTask={taskData} // For reassign mode
  onSubmit={handleAssignTask}
/>
```

**Fields**:
- Title (create mode only)
- Description (create mode only)
- Assignee (dropdown)
- Priority (create mode only)
- Due Date (create mode only)
- Conference Link (optional, create mode only)

---

### PriorityBadge.jsx
Visual priority indicator:

```jsx
<PriorityBadge priority="high" />    // 🔴 High
<PriorityBadge priority="medium" />  // 🟡 Medium
<PriorityBadge priority="low" />     // 🟢 Low
```

---

### StatusBadge.jsx
Visual status indicator:

```jsx
<StatusBadge status="not_started" />  // ⭕ Not Started
<StatusBadge status="in_progress" />  // 🔵 In Progress
<StatusBadge status="completed" />    // ✅ Completed
<StatusBadge status="on_hold" />      // ⏸️ On Hold
```

---

## Routes Configuration

All routes are integrated in `App.jsx`:

```javascript
// Team Management (Admin/Manager only)
GET /team/dashboard
GET /team/calendar
GET /team/tasks
GET /team/reports

// Task Assignments (All authenticated users)
GET /assignments
GET /assignments/pending
```

**Route Protection**:
- Team routes require `admin` or `manager` role
- Assignment routes accessible to all authenticated users
- Use `ProtectedRoute` wrapper for role-based access

---

## API Integration

### teamApi.js
```javascript
teamApi.getDashboard(teamId)
teamApi.getMembers(teamId)
teamApi.getTasks(teamId, filters)
teamApi.getCalendar(teamId, startDate, endDate)
teamApi.getReports(teamId, filters)
teamApi.createTask(taskData)
teamApi.updateTask(taskId, updates)
teamApi.deleteTask(taskId)
teamApi.bulkUpdateTasks(taskIds, updates)
```

### assignmentApi.js
```javascript
assignmentApi.getPending()
assignmentApi.getAll(filters)
assignmentApi.accept(assignmentId)
assignmentApi.decline(assignmentId, reason, suggestedReassignee)
assignmentApi.reassign(assignmentId, newAssigneeId, note)
assignmentApi.markReviewed(assignmentIds)
assignmentApi.getUrgent()
```

---

## Mock Data

Mock data available in `src/lib/mockTeamData.js`:

```javascript
mockTeamMembers        // 4 team members with stats
mockTeamTasks          // 6 sample tasks with various statuses
mockTeamEvents         // 3 team events/meetings
mockAssignments        // 3 pending assignments
mockTeamStats          // Dashboard statistics
mockReportData         // Sample report data with charts
```

**Helper functions**:
```javascript
getTeamDashboard()     // Returns dashboard data
getTeamTasks(filters)  // Returns filtered tasks
getPendingAssignments()// Returns pending assignments
```

---

## Utility Functions

`src/utils/teamUtils.js` provides helpful functions:

```javascript
formatTaskDueDate(dueDate)         // "Due in 3 days"
calculateCompletionRate(assigned, completed)
groupTasksByStatus(tasks)
getTaskStats(tasks)                // Returns stats object
sortTasksByPriority(tasks)
sortTasksByDueDate(tasks)
getMemberMetrics(members, tasks)   // Member performance data
generateTaskReport(tasks, dateRange)
```

---

## State Management

### Option 1: Local State (Current)
Each page manages its own state with `useState`. Simple and immediate.

### Option 2: TeamContext (Optional)
Global state management provided in `src/context/TeamContext.jsx`:

```javascript
import { useTeamContext } from '@/context/TeamContext';

const MyComponent = () => {
  const {
    teamData,
    fetchTeamDashboard,
    createTask,
    acceptAssignment,
  } = useTeamContext();
};
```

**To enable**: Wrap app in `TeamProvider`:
```jsx
<TeamProvider>
  <App />
</TeamProvider>
```

---

## Styling

### Color Scheme
```javascript
// Priority
High:    text-red-600 bg-red-50    // 🔴
Medium:  text-yellow-600 bg-yellow-50  // 🟡
Low:     text-green-600 bg-green-50    // 🟢

// Status
Not Started:  text-gray-600 bg-gray-50      // ⭕
In Progress:  text-blue-600 bg-blue-50      // 🔵
Completed:    text-green-600 bg-green-50    // ✅
On Hold:      text-orange-600 bg-orange-50  // ⏸️

// Urgency
OVERDUE:    text-destructive bg-red-50
URGENT:     bg-red-500 text-white
DUE SOON:   bg-orange-500 text-white
DUE LATER:  text-gray-600
```

### Responsive Design
- Mobile: Single column, collapsible filters
- Tablet: 2-column grid for cards
- Desktop: Full multi-column layout

---

## Testing Checklist

### Unit Tests
- [ ] TaskCard renders all variants correctly
- [ ] Priority/Status badges display correct colors
- [ ] AssignmentModal form validation works
- [ ] Utility functions return correct values

### Integration Tests
- [ ] API calls work with mock data
- [ ] Role-based access blocks unauthorized users
- [ ] Task assignment flow (create → assign → accept)
- [ ] Team dashboard loads stats correctly

### E2E Tests (Manual)
- [ ] Admin can view team dashboard
- [ ] Admin can create and assign task to team member
- [ ] Staff receives and can accept/decline assignment
- [ ] Team calendar displays all events
- [ ] Reports generate with correct statistics
- [ ] Filters and search work on all pages
- [ ] Mobile responsive layout works

---

## Performance Optimization

### 1. Code Splitting
```javascript
const TeamReports = lazy(() => import('./pages/team/TeamReports'));
```

### 2. Pagination
```javascript
const [cursor, setCursor] = useState(null);
const loadMore = async () => {
  const response = await teamApi.getTasks(teamId, { cursor });
  setTasks(prev => [...prev, ...response.data.tasks]);
};
```

### 3. Debounce Search
```javascript
const debouncedSearch = useCallback(
  debounce((query) => {
    fetchFilteredTasks(query);
  }, 500),
  []
);
```

### 4. Memoization
```javascript
const filteredTasks = useMemo(() => {
  return tasks.filter(/* ... */);
}, [tasks, filters]);
```

---

## Accessibility

- ✅ Semantic HTML (`<button>`, `<nav>`, `<section>`)
- ✅ ARIA labels on icon buttons
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Color contrast ≥ 4.5:1
- ✅ Screen reader announcements for status changes
- ✅ Skip navigation links

---

## Known Limitations

1. **Charts**: Recharts library used; consider alternatives for more advanced visualizations
2. **Real-time**: No WebSocket implementation; polling every 30 seconds for PendingAssignments
3. **Drag & Drop**: Calendar drag-to-reschedule not implemented (can be added with react-dnd)
4. **Export**: CSV export button present but needs backend implementation
5. **Notifications**: Assignment notifications use existing notification system

---

## Next Steps / Future Enhancements

1. **Real-time Updates**: Implement WebSocket for instant notifications
2. **Advanced Filtering**: Save/recall filter presets
3. **Bulk Email**: Send emails to team members about assignments
4. **Recurring Tasks**: Support task templates and recurrence
5. **Time Tracking**: Track time spent on tasks
6. **Burndown Charts**: Visualize sprint progress
7. **Gantt Charts**: Visual timeline view of tasks
8. **Team Capacity**: Plan assignments based on member workload
9. **Approval Workflow**: Require manager approval before task assignment
10. **API Integration**: Connect with calendar APIs (Google, Outlook)

---

## Troubleshooting

### Tasks not showing
- Check mock data in `mockTeamData.js`
- Verify API endpoints in `teamApi.js`
- Check console for errors

### Filters not working
- Ensure filter values match task properties
- Check `getTeamTasks(filters)` function
- Verify state updates after filter change

### Modal not closing
- Check `onClose` callback is passed
- Verify state management in parent component
- Check for form validation errors

### Styling issues
- Verify TailwindCSS is configured
- Check color class names against config
- Inspect element in browser DevTools

---

## Support & Documentation

- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Forms**: React Hook Form + Yup
- **Charts**: Recharts
- **UI Components**: shadcn/ui

---

**Phase 3 Complete! 🎉**

All team management and task assignment features are now ready for development and deployment.
