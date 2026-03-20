import { useState, useEffect, lazy, Suspense } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { LoadingState } from '@/components/common/LoadingState';
import { authApi } from '@/services/api/auth';
import { SecurityValidator } from '@/utils/securityChecks';
import type { User } from '@/types/data';
import type { LoginResponse } from '@/features/auth/types/auth';

// Route-level lazy chunks — loaded only when first navigated to
const LoginPage = lazy(() =>
  import('@/features/auth/components/LoginPage').then(m => ({ default: m.LoginPage }))
);
const AdminDashboard = lazy(() =>
  import('@/features/dashboard/components/AdminDashboard').then(m => ({ default: m.AdminDashboard }))
);
const EmployeeDashboard = lazy(() =>
  import('@/features/dashboard/components/EmployeeDashboard').then(m => ({ default: m.EmployeeDashboard }))
);
const ThemeValidationTest = lazy(() =>
  import('@/features/theme/components/ThemeValidationTest')
);

// IT Support Work Log Management System
// Version: 3.0.0 - Permission System & Enterprise Security
// Last updated: February 5, 2026

// ===== SECURITY INITIALIZATION =====
// Perform security checks before app initialization
if (typeof window !== 'undefined') {
  try {
    SecurityValidator.initialize();
  } catch (error) {
    console.error('[Security] Initialization failed:', error);
    // Show error UI in render
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<string>('');
  const [securityError, setSecurityError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check security requirements
      const securityCheck = SecurityValidator.checkBrowserSecurity();
      if (securityCheck.errors.length > 0) {
        setSecurityError(securityCheck.errors.join('\n'));
        setIsLoading(false);
        return;
      }

      // Try to restore authentication session
      const restored = await authApi.initializeAuth();
      
      if (restored) {
        // Get user profile from new auth system
        const profile = await authApi.getProfile();
        
        // Get user permissions to determine role
        const permissions = await authApi.getMyPermissions();
        const isAdmin = permissions.includes('Admin');
        
        // Convert profile to User format for compatibility
        const userData: User = {
          id: profile.empId,
          username: profile.username || '',
          employeeId: profile.empId,
          fullName: profile.fullName,
          role: isAdmin ? 'admin' : 'employee',
          email: profile.email || ''
        };

        setUser(userData);
        setIsAuthenticated(true);
        setCurrentView(userData.role === 'admin' ? 'admin' : 'employee');

        // Store for compatibility
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('[App] ✅ Session restored successfully');
      } else {
        console.log('[App] ℹ️ No active session');
      }
    } catch (error) {
      console.error('[App] Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await authApi.login({ identifier: username, password });
      
      if (response.success) {
        // Get user profile
        const profile = await authApi.getProfile();
        
        // Get user permissions to determine role
        const permissions = await authApi.getMyPermissions();
        const isAdmin = permissions.includes('Admin');
        
        // Convert to User format
        const userData: User = {
          id: profile.empId,
          username: profile.username || '',
          employeeId: profile.empId,
          fullName: profile.fullName,
          role: isAdmin ? 'admin' : 'employee',
          email: profile.email || ''
        };

        setUser(userData);
        setIsAuthenticated(true);
        setCurrentView(userData.role === 'admin' ? 'admin' : 'employee');

        // Store for compatibility
        localStorage.setItem('user', JSON.stringify(userData));

        console.log('[App] ✅ Login successful');
        return { success: true };
      }

      return {
        success: false,
        error: response.error || 'Login failed'
      };
    } catch (error) {
      console.error('[App] Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('[App] Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setCurrentView('');
      localStorage.removeItem('user');
      
      console.log('[App] 👋 Logged out');
    }
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
  };

  if (isLoading) {
    return (
      <LoadingState className="min-h-screen bg-muted" />
    );
  }

  if (securityError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <p className="text-error-foreground">Security Error:</p>
          <p className="text-muted-foreground">{securityError}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Suspense fallback={<LoadingState className="min-h-screen bg-muted" />}>
        <LoginPage onLogin={handleLogin} />
      </Suspense>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        userRole={user.role}
      />
      <div className="main-content">
        <Suspense fallback={<LoadingState />}>
          {currentView === 'test-themes' ? (
            <ThemeValidationTest />
          ) : user.role === 'admin' ? (
            <AdminDashboard 
              user={user} 
              onLogout={handleLogout} 
              currentView={currentView}
              onNavigate={handleNavigate}
            />
          ) : (
            <EmployeeDashboard 
              user={user} 
              onLogout={handleLogout} 
              currentView={currentView}
              onNavigate={handleNavigate}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}