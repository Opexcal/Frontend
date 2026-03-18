// constant/roleMapDisplay.js

/**
 * Backend role → Display label (PRD-aligned)
 */
export const roleDisplayMap = {
  SuperAdmin: 'Manager',
  Admin: 'Admin',
  Staff: 'Staff',
  Unassigned: 'Viewer',
}

export const roleColors = {
  SuperAdmin: 'bg-purple-600 text-white',
  Admin: 'bg-green-600 text-white',
  Staff: 'bg-blue-600 text-white',
  Unassigned: 'bg-gray-500 text-white',
}

// Backward-compat: older code expected an "internal" role string.
// Prefer using backend roles directly everywhere.
export const backendToFrontendRole = {
  SuperAdmin: 'SuperAdmin',
  Admin: 'Admin',
  Staff: 'Staff',
  Unassigned: 'Unassigned',
}

