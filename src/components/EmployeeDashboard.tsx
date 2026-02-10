import { useState } from 'react';
import { LogOut } from 'lucide-react';
import type { User } from '../types/data';
import { useDataManager } from '../hooks/useDataManager';
import { WorkLogManagement } from './WorkLogManagement';
import { ConfirmDialog } from './ConfirmDialog';

interface Props {
  user: User;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

export function EmployeeDashboard({ user, onLogout, currentView, onNavigate }: Props) {
  const dataManager = useDataManager();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    onLogout();
    setShowLogoutConfirm(false);
  };

  // Show loading if data is still being fetched
  if (dataManager.workLogs.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Map currentView to the appropriate component
  const renderContent = () => {
    switch (currentView) {
      case 'employee':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-5 text-gray-900 dark:text-gray-50">Employee Dashboard</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">Welcome, {user.fullName}!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Use the menu to navigate and manage work logs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-200 dark:border-primary-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Work Logs</p>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{dataManager.workLogs.data.length}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending Work Logs</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {dataManager.workLogs.data.filter(log => log.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'workLogs':
        return (
          <WorkLogManagement
            data={dataManager.workLogs.data}
            setData={dataManager.workLogs.setData}
            currentUser={user.fullName}
            employees={dataManager.employees.data}
            departments={dataManager.departments.data}
            areas={dataManager.areas.data}
          />
        );
      default:
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-5 text-gray-900 dark:text-gray-50">Employee Dashboard</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <p className="text-gray-600 dark:text-gray-400">Select a menu item to get started.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {/* Header with user info and logout */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-gray-500">Logged in as</p>
          <p className="font-medium">{user.fullName} ({user.role})</p>
        </div>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Main content */}
      {renderContent()}

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        action="logout"
        title="Logout"
        description="Are you sure you want to logout?"
        icon={<LogOut className="w-5 h-5 text-red-600" />}
      />
    </>
  );
}