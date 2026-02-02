import { apiClient } from './common';
import type { Department } from '../types/data';

/**
 * Note: The API doesn't have a Department endpoint.
 * Departments appear to be managed inline in IssueLogs.
 * This is a minimal implementation for compatibility.
 */

// In-memory department cache from API responses
let departmentsCache: Department[] = [];

export const departmentsApi = {
  /**
   * Get all departments (from cache or hardcoded)
   * Note: These need to be extracted from API responses or hardcoded
   */
  async getAll(): Promise<Department[]> {
    // Return cached departments or default list
    if (departmentsCache.length > 0) {
      return [...departmentsCache];
    }

    // Default departments - these should be replaced with actual data from your backend
    return [
      { id: 1, name: 'IT Department', description: 'Information Technology' },
      { id: 2, name: 'HR Department', description: 'Human Resources' },
      { id: 3, name: 'Finance Department', description: 'Finance' },
      { id: 4, name: 'Operations', description: 'Operations' },
    ];
  },

  /**
   * Update cache with departments from API responses
   */
  updateCache(departments: Department[]) {
    departmentsCache = departments;
  },

  /**
   * Clear cache
   */
  clearCache() {
    departmentsCache = [];
  },
};
