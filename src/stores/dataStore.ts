// Mock data store - to be replaced with API calls
// This file is kept for backward compatibility but most data should come from API

import type { Department } from '../types/data';

// Department mock data (API doesn't have Department endpoint yet)
export const initialDepartments: Department[] = [
  { id: 1, name: 'IT Department', description: 'Information Technology' },
  { id: 2, name: 'HR Department', description: 'Human Resources' },
  { id: 3, name: 'Finance Department', description: 'Finance and Accounting' },
  { id: 4, name: 'Marketing Department', description: 'Marketing and Sales' },
  { id: 5, name: 'Operations', description: 'Operations and Logistics' },
];

// All other data should be fetched from API
// See /api/* for API implementations
