import { useState } from 'react';
import { LogOut } from 'lucide-react';
import type { User } from '@/types/data';
import { useDataManager } from '@/hooks/useDataManager';
import { WorkLogManagement } from '@/features/workLogs/components/WorkLogManagement';
import { EmployeeManagement } from '@/features/employees/components/EmployeeManagement';
import { DepartmentManagement } from '@/features/areas/components/DepartmentManagement';
import { AreaManagement } from '@/features/areas/components/AreaManagement';
import { AccountManagement } from '@/features/accounts/components/AccountManagement';
import { RoleManagement } from '@/features/roles/components/RoleManagement';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

interface Props {
  user: User;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

export function AdminDashboard({ user, onLogout, currentView }: Props) {
  const dataManager = useDataManager();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    onLogout();
    setShowLogoutConfirm(false);
  };

  // Show loading if data is still being fetched
  if (dataManager.employees.loading || dataManager.workLogs.loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Map currentView to the appropriate component
  const renderContent = () => {
    switch (currentView) {
      case 'admin':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-5">Admin Dashboard</h1>
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Welcome, {user.fullName}!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You have full administrative access to the IT Support Management System.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-primary-100 dark:bg-primary-900/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Work Logs</p>
                  <p className="text-2xl font-bold text-primary-600">{dataManager.workLogs.data.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Employees</p>
                  <p className="text-2xl font-bold text-green-600">{dataManager.employees.data.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Areas</p>
                  <p className="text-2xl font-bold text-purple-600">{dataManager.areas.data.length}</p>
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
      case 'employees':
        return (
          <EmployeeManagement
            data={dataManager.employees.data}
            setData={dataManager.employees.setData}
            departments={dataManager.departments.data}
            areas={dataManager.areas.data}
          />
        );
      case 'departments':
        return (
          <DepartmentManagement
            data={dataManager.departments.data}
            setData={dataManager.departments.setData}
          />
        );
      case 'areas':
        return (
          <AreaManagement
            data={dataManager.areas.data}
            setData={dataManager.areas.setData}
          />
        );
      case 'accounts':
        return (
          <AccountManagement
            data={dataManager.accounts.data}
            setData={dataManager.accounts.setData}
            employees={dataManager.employees.data}
            roles={dataManager.roles.data}
          />
        );
      case 'roles':
        return (
          <RoleManagement
            data={dataManager.roles.data}
            setData={dataManager.roles.setData}
          />
        );
      default:
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-5">Admin Dashboard</h1>
            <div className="card p-6">
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
          <p className="text-sm text-gray-600 dark:text-gray-400">Logged in as</p>
          <p className="font-medium">{user.fullName} ({user.role})</p>
        </div>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 cursor-pointer"
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