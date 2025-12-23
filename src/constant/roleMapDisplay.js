// constant/roleMapDisplay.js

/**
 * Backend role → Frontend internal role
 */
export const backendToFrontendRole = {
  SuperAdmin: "manager",
  Admin: "admin",
  Staff: "staff",
  Unassigned: "wanderer",
};

/**
 * Frontend role → Display label
 */
export const roleDisplayMap = {
  manager: "SuperAdmin",
  admin: "Admin",
  staff: "Staff",
  wanderer: "Unassigned",
};

export const roleColors = {
  manager: "bg-purple-600 text-white",
  admin: "bg-green-600 text-white",
  staff: "bg-blue-600 text-white",
  wanderer: "bg-gray-500 text-white",
};