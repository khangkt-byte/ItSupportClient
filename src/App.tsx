import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { Sidebar } from './components/Sidebar';
import { DarkModeStyles } from './components/DarkModeStyles';
import { authApi } from './lib/api/auth';
import { SecurityValidator } from './lib/utils/securityChecks';
import { useDataLoader } from './hooks/useDataLoader';
import type { User } from './types/data';

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

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
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
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[App] Login error:', error);
      return false;
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (securityError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500">Security Error:</p>
          <p className="text-gray-600">{securityError}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen">
      <DarkModeStyles />
      <Sidebar 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        userRole={user.role}
      />
      <div className="flex-1 p-[30px_20px_30px_30px] max-w-full w-full max-md:p-[30px_20px]" style={{ color: 'var(--color-text-primary)' }}>
        {user.role === 'admin' ? (
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
      </div>
    </div>
  );
}