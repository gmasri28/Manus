const API_BASE = 'http://localhost:3000/api';

export async function apiCall(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
) {
  const { token, ...fetchOptions } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// Public endpoints
export const publicApi = {
  getOpportunities: (filters?: { location?: string; startDate?: string; endDate?: string }) =>
    apiCall('/public/opportunities', { method: 'GET' }),
  getOpportunityDetail: (id: string) =>
    apiCall(`/public/opportunities/${id}`, { method: 'GET' }),
};

// Auth endpoints
export const authApi = {
  register: (email: string, password: string) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// Volunteer endpoints
export const volunteerApi = {
  getSignups: (token: string) =>
    apiCall('/volunteer/signups', { method: 'GET', token }),
  signupForOpportunity: (opportunityId: string, token: string) =>
    apiCall(`/volunteer/opportunities/${opportunityId}/signup`, {
      method: 'POST',
      token,
    }),
  cancelSignup: (signupId: string, token: string) =>
    apiCall(`/volunteer/signups/${signupId}/cancel`, {
      method: 'PUT',
      token,
    }),
};

// Organization endpoints
export const organizationApi = {
  getOpportunities: (token: string) =>
    apiCall('/org/opportunities', { method: 'GET', token }),
  createOpportunity: (data: any, token: string) =>
    apiCall('/org/opportunities', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),
  updateOpportunity: (id: string, data: any, token: string) =>
    apiCall(`/org/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),
  getVolunteers: (opportunityId: string, token: string) =>
    apiCall(`/org/opportunities/${opportunityId}/volunteers`, {
      method: 'GET',
      token,
    }),
  markAttendance: (signupId: string, status: string, token: string) =>
    apiCall(`/org/signups/${signupId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
      token,
    }),
  exportVolunteers: (opportunityId: string, token: string) =>
    apiCall(`/org/opportunities/${opportunityId}/export`, {
      method: 'GET',
      token,
    }),
};

// Admin endpoints
export const adminApi = {
  getOrganizations: (token: string) =>
    apiCall('/admin/organizations', { method: 'GET', token }),
  createOrganization: (data: any, token: string) =>
    apiCall('/admin/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),
  updateOrganizationStatus: (id: string, status: string, token: string) =>
    apiCall(`/admin/organizations/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
      token,
    }),
  getOpportunities: (token: string) =>
    apiCall('/admin/opportunities', { method: 'GET', token }),
  getSignups: (token: string) =>
    apiCall('/admin/signups', { method: 'GET', token }),
};
