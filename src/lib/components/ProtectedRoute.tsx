/**
 * Protected Route Component
 * 
 * Protects routes/views from unauthorized access
 * Requires authentication and optional permission checks
 * 
 * Usage:
 * <ProtectedRoute requiredPermission="Admin">
 *   <AdminDashboard />
 * </ProtectedRoute>
 */

import { ReactNode } from 'react';
import { usePermission } from '../hooks/usePermission';

interface ProtectedRouteProps {
  /** Child component to render if authorized */
  children: ReactNode;

  /** Required single permission */
  requiredPermission?: string;

  /** Required multiple permissions */
  requiredPermissions?: string[];

  /** Require all or any of the permissions - default: 'any' */
  mode?: 'any' | 'all';

  /** Fallback component while checking permissions */
  loadingComponent?: ReactNode;

  /** Fallback component for unauthorized access */
  unauthorizedComponent?: ReactNode;

  /** Callback when access is denied */
  onAccessDenied?: () => void;
}

/**
 * Protected Route Component
 * 
 * Checks authentication and permissions before rendering content
 */
export function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions,
  mode = 'any',
  loadingComponent,
  unauthorizedComponent,
  onAccessDenied,
}: ProtectedRouteProps) {
  const { 
    isLoading, 
    hasPermission, 
    hasAllPermissions, 
    hasAnyPermission
  } = usePermission();

  // Show loading state
  if (isLoading) {
    return <>{loadingComponent ?? <div>Loading...</div>}</>;
  }

  // Check permissions if specified
  if (requiredPermission || requiredPermissions) {
    const permissions = requiredPermissions ?? (requiredPermission ? [requiredPermission] : []);

    let hasAccess = false;

    if (permissions.length === 1) {
      hasAccess = hasPermission(permissions[0]);
    } else if (mode === 'all') {
      hasAccess = hasAllPermissions(...permissions);
    } else {
      hasAccess = hasAnyPermission(...permissions);
    }

    if (!hasAccess) {
      onAccessDenied?.();
      return <>{unauthorizedComponent ?? <UnauthorizedFallback />}</>;
    }
  }

  return <>{children}</>;
}

/**
 * Admin-only protected route
 * Requires user to be admin
 */
export function AdminRoute({
  children,
  loadingComponent,
  unauthorizedComponent,
  onAccessDenied,
}: Omit<ProtectedRouteProps, 'requiredPermission' | 'requiredPermissions' | 'mode'>) {
  const { isLoading, isAdmin } = usePermission();

  if (isLoading) {
    return <>{loadingComponent ?? <div>Loading...</div>}</>;
  }

  if (!isAdmin) {
    onAccessDenied?.();
    return <>{unauthorizedComponent ?? <UnauthorizedFallback />}</>;
  }

  return <>{children}</>;
}

/**
 * Default unauthorized fallback component
 */
export function UnauthorizedFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      padding: '2rem',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        borderRadius: '8px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        maxWidth: '500px',
      }}>
        <h2 style={{ 
          color: '#dc2626', 
          marginTop: 0,
          fontSize: '1.5rem' 
        }}>
          🔒 Access Denied
        </h2>
        <p style={{ 
          color: '#7f1d1d',
          marginBottom: 0 
        }}>
          You don't have permission to access this page.
        </p>
        <p style={{
          fontSize: '0.875rem',
          color: '#991b1b',
          marginTop: '1rem',
          marginBottom: 0
        }}>
          Please contact your administrator if you believe this is an error.
        </p>
      </div>
    </div>
  );
}

export default ProtectedRoute;
