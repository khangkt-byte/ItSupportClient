import { useState } from 'react';
import { LogOut } from 'lucide-react';
import type { User } from '@/types/data';
import { useDataManager } from '@/hooks/useDataManager';
import { WorkLogManagement } from '@/features/workLogs/components/WorkLogManagement';
import { useWorkLogSummary } from '@/features/workLogs/hooks/useWorkLogSummary';
import { EmployeeManagement } from '@/features/employees/components/EmployeeManagement';
import { DepartmentManagement } from '@/features/departments/components/DepartmentManagement';
import { AreaManagement } from '@/features/areas/components/AreaManagement';
import { AccountManagement } from '@/features/accounts/components/AccountManagement';
import { MyAccountManagement } from '@/features/myAccount/components/MyAccountManagement';
import { RoleManagement } from '@/features/roles/components/RoleManagement';
import { IssueManagement } from '@/features/issues/components/IssueManagement';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingState } from '@/components/common/LoadingState';

interface Props {
  user: User;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

export function AdminDashboard({ user, onLogout, currentView }: Props) {
  const dataManager = useDataManager();
  const workLogSummary = useWorkLogSummary(currentView === 'admin');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      onLogout();
    } finally {
      setLogoutLoading(false);
      setShowLogoutConfirm(false);
    }
  };

  // Show loading if data is still being fetched
  if (dataManager.employees.loading) {
    return (
      <LoadingState className="min-h-100" />
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
              <p className="text-muted-foreground mb-4">
                You have full administrative access to the IT Support Management System.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-primary-100 dark:bg-primary-900/20">
                  <p className="text-sm text-muted-foreground">Total Work Logs</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {workLogSummary.loading ? '...' : workLogSummary.totalCount}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-success-background">
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold text-success-foreground">{dataManager.employees.data.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-primary-100 dark:bg-primary-900/20">
                  <p className="text-sm text-muted-foreground">Total Areas</p>
                  <p className="text-2xl font-bold text-primary-600">{dataManager.areas.data.length}</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'workLogs':
        return (
          <WorkLogManagement
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
      case 'issues':
        return (
          <IssueManagement
            data={dataManager.issues.data}
            setData={dataManager.issues.setData}
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
      case 'my-account':
        return <MyAccountManagement />;
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
              <p className="text-muted-foreground">Select a menu item to get started.</p>
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
          <p className="text-sm text-muted-foreground">Logged in as</p>
          <p className="font-medium">{user.fullName} ({user.role})</p>
          <p className="text-xs text-muted-foreground">{user.email || 'No email'}</p>
        </div>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          disabled={logoutLoading}
          className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <LogOut className="w-4 h-4" />
          {logoutLoading ? 'Logging out...' : 'Logout'}
        </button>
      </div>

      {/* Main content */}
      {renderContent()}

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => {
          if (logoutLoading) return;
          setShowLogoutConfirm(false);
        }}
        onConfirm={handleLogout}
        isLoading={logoutLoading}
        loadingLabel="Logging out..."
        action="logout"
        title="Logout"
        description="Are you sure you want to logout?"
        icon={<LogOut className="w-5 h-5 text-error-foreground" />}
      />
    </>
  );
}