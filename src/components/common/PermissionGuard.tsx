/**
 * Permission-based Component Guards
 * 
 * Usage:
 * - <PermissionGuard permission="IssueLog.Create">...</PermissionGuard>
 * - <RequireAllPermissions permissions={['IssueLog.View', 'IssueLog.Edit']}>...</RequireAllPermissions>
 * - <RequireAnyPermission permissions={['IssueLog.View', 'IssueLog.Edit']}>...</RequireAnyPermission>
 * 
 * References:
 * - React Conditional Rendering: https://react.dev/learn/conditional-rendering
 * - Microsoft MSAL React Guards: https://learn.microsoft.com/en-us/entra/msal/react/getting-started#protecting-components
 */

import React, { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';

/**
 * Props for permission components
 */
interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

interface RequireAllPermissionsProps {
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

interface RequireAnyPermissionProps {
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Single permission guard
 * Renders children only if user has the specified permission
 * 
 * @example
 * <PermissionGuard permission="IssueLog.Create">
 *   <CreateButton />
 * </PermissionGuard>
 */
export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, isLoading } = usePermission();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Require ALL permissions
 * Renders children only if user has ALL specified permissions
 * 
 * @example
 * <RequireAllPermissions permissions={['IssueLog.View', 'IssueLog.Edit']}>
 *   <EditForm />
 * </RequireAllPermissions>
 */
export function RequireAllPermissions({
  permissions,
  children,
  fallback = null,
}: RequireAllPermissionsProps) {
  const { hasAllPermissions, isLoading } = usePermission();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!hasAllPermissions(...permissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Require ANY permission
 * Renders children if user has ANY of the specified permissions
 * 
 * @example
 * <RequireAnyPermission permissions={['IssueLog.Create', 'IssueLog.Edit']}>
 *   <ActionButtons />
 * </RequireAnyPermission>
 */
export function RequireAnyPermission({
  permissions,
  children,
  fallback = null,
}: RequireAnyPermissionProps) {
  const { hasAnyPermission, isLoading } = usePermission();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!hasAnyPermission(...permissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Admin-only guard
 * Renders children only if user is admin
 * 
 * @example
 * <AdminOnly>
 *   <AdminPanel />
 * </AdminOnly>
 */
export function AdminOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isAdmin, isLoading } = usePermission();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Forbidden fallback component
 * Shows when user lacks permission
 */
export function ForbiddenMessage() {
  return (
    <div className="p-8 text-center bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-700 rounded-lg text-red-600 dark:text-red-400">
      <h3 className="mt-0 font-semibold text-lg">⛔ Access Denied</h3>
      <p className="mb-0">You don't have permission to access this resource.</p>
      <p className="text-sm text-red-800 dark:text-red-300 mt-2 mb-0">
        Contact your administrator if you believe this is an error.
      </p>
    </div>
  );
}
