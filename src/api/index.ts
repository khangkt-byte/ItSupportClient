// Central API export
export { authApi } from './auth';
export { workLogsApi } from './workLogs';
export { employeesApi } from './employees';
export { devicesApi } from './devices';
export { deviceTypesApi, departmentsApi, areasApi, accountsApi, rolesApi } from './common';

// API Configuration
export const API_CONFIG = {
  baseURL: 'http://localhost:3001/api', // Change this when connecting to real backend
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper to get auth token
export function getAuthToken(): string | null {
  return localStorage.getItem('auth-token');
}

// Helper to add auth header
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Error handling helper
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API request helper (for when you connect to real backend)
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`);
  }

  return response.json();
}