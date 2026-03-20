/**
 * Permission Checking Hook
 * 
 * Usage:
 * - const { hasPermission, hasAnyPermission, hasAllPermissions, isAdmin } = usePermission();
 * - if (hasPermission('IssueLog.Create')) { ... }
 * 
 * References:
 * - React Hooks: https://react.dev/reference/react/hooks
 * - RBAC Pattern: https://learn.microsoft.com/en-us/azure/role-based-access-control/overview
 */

import { useState, useEffect } from 'react';
import { authApi } from '@/services/api/auth';
import { createApiErrorState } from '@/utils/apiErrors';

/**
 * Permission checking hook
 * 
 * Features:
 * - Real-time permission checking
 * - Auto-refresh from backend
 * - Admin bypass
 * - Multiple permission checks
 */
export function usePermission() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setIsLoading(true);
      const perms = await authApi.getMyPermissions();
      setPermissions(perms);
      setError(null);
    } catch (err) {
      const errorState = createApiErrorState(err, 'Unable to load permissions. Please refresh and try again.');
      setError(errorState.message);
      console.error('[Permission] Failed to load permissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if user is admin (has Admin permission)
   */
  const isAdmin = permissions.includes('Admin');

  /**
   * Check if user has specific permission
   * Admin always returns true
   */
  const hasPermission = (permission: string): boolean => {
    if (isAdmin) return true;
    return permissions.includes(permission);
  };

  /**
   * Check if user has ANY of the specified permissions
   */
  const hasAnyPermission = (...perms: string[]): boolean => {
    if (isAdmin) return true;
    return perms.some(p => permissions.includes(p));
  };

  /**
   * Check if user has ALL of the specified permissions
   */
  const hasAllPermissions = (...perms: string[]): boolean => {
    if (isAdmin) return true;
    return perms.every(p => permissions.includes(p));
  };

  /**
   * Get all user permissions
   */
  const getPermissions = (): string[] => {
    return permissions;
  };

  /**
   * Refresh permissions from backend
   */
  const refreshPermissions = async (): Promise<void> => {
    await loadPermissions();
  };

  return {
    permissions,
    isLoading,
    error,
    isAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissions,
    refreshPermissions,
  };
}

/**
 * Synchronous permission check (use with caution)
 * Requires permissions to be loaded in parent component
 */
export function checkPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  // Admin bypass
  if (userPermissions.includes('Admin')) {
    return true;
  }

  return userPermissions.includes(requiredPermission);
}
