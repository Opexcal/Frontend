import apiClient from "./client";

// Organization settings API (SuperAdmin)
export const organizationApi = {
  get: () => apiClient.get("/organization"),
  update: (data) => apiClient.patch("/organization", data),
};

export default organizationApi;

