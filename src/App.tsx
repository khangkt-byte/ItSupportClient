import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { Sidebar } from './components/Sidebar';
import { DarkModeStyles } from './components/DarkModeStyles';
import { authApi } from './api';
import { useDataLoader } from './hooks/useDataLoader';
import type { User } from './types/data';

// IT Support Work Log Management System
// Version: 2.0.0 - API Integration Complete
// Last updated: February 2, 2026

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<string>('');

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('accessToken');
      
      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setCurrentView(parsedUser.role === 'admin' ? 'admin' : 'employee');
      }
    } catch (error) {
      console.error('Error loading user session:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ identifier: username, password });
      
      if (response.success && response.user && response.token) {
        setUser(response.user);
        setIsAuthenticated(true);
        setCurrentView(response.user.role === 'admin' ? 'admin' : 'employee');
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('accessToken', response.token.accessToken);
        localStorage.setItem('refreshToken', response.token.refreshToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setCurrentView('');
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
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

  if (!isAuthenticated || !user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="container">
      <DarkModeStyles />
      <Sidebar 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        userRole={user.role}
      />
      <div className="main-content">
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