import { useMemo, useState } from 'react';
import { LogOut } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, XAxis, YAxis } from 'recharts';
import type { User } from '@/types/data';
import { useDataManager } from '@/hooks/useDataManager';
import { WorkLogManagement } from '@/features/workLogs/components/WorkLogManagement';
import { useDashboardSummary } from '@/features/dashboard/hooks';
import { EmployeeManagement } from '@/features/employees/components/EmployeeManagement';
import { DepartmentManagement } from '@/features/departments/components/DepartmentManagement';
import { AreaManagement } from '@/features/areas/components/AreaManagement';
import { AccountManagement } from '@/features/accounts/components/AccountManagement';
import { MyAccountManagement } from '@/features/myAccount/components/MyAccountManagement';
import { RoleManagement } from '@/features/roles/components/RoleManagement';
import { IssueManagement } from '@/features/issues/components/IssueManagement';
import { CauseManagement } from '@/features/causes/components/CauseManagement';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { LoadingState } from '@/components/common/LoadingState';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

interface Props {
  user: User;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

const trendChartConfig = {
  count: {
    label: 'Issue Logs',
    color: '#4f7cff',
  },
} satisfies ChartConfig;

const statusChartConfig = {
  count: {
    label: 'Count',
    color: '#4f7cff',
  },
} satisfies ChartConfig;

const STATUS_COLORS: Record<string, string> = {
  resolved: '#2c9d62',
  pending: '#e19f00',
  'in-progress': '#3b82f6',
  cancelled: '#7f8ea3',
  open: '#e24747',
};

const toStatusLabel = (value: string): string => {
  if (!value) return 'Unknown';

  return value
    .split('-')
    .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
};

export function AdminDashboard({ user, onLogout, currentView }: Props) {
  const dataManager = useDataManager();
  const dashboardSummary = useDashboardSummary(currentView === 'admin');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const trendData = useMemo(
    () => (dashboardSummary.summary?.trendLast7Days || []).map(item => ({
      ...item,
      dateLabel: item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }) : '-',
    })),
    [dashboardSummary.summary?.trendLast7Days],
  );

  const statusData = useMemo(
    () => (dashboardSummary.summary?.statusBreakdown || []).map(item => ({
      ...item,
      statusLabel: toStatusLabel(item.status),
    })),
    [dashboardSummary.summary?.statusBreakdown],
  );

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      onLogout();
    } finally {
      setLogoutLoading(false);
      setShowLogoutConfirm(false);
    }
  };

  // Keep lookup-data loading behavior for non-dashboard views.
  if (currentView !== 'admin' && dataManager.employees.loading) {
    return (
      <LoadingState className="min-h-100" label="Loading dashboard..." />
    );
  }

  // Map currentView to the appropriate component
  const renderContent = () => {
    switch (currentView) {
      case 'admin':
        const overview = dashboardSummary.summary?.overview;

        return (
          <div>
            <h1 className="text-2xl font-semibold mb-5 text-foreground">Admin Dashboard</h1>
            {dashboardSummary.error && (
              <ErrorAlert
                className="mb-4"
                title="Unable to load dashboard summary"
                message={dashboardSummary.error}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-200 dark:border-primary-800">
                <p className="text-sm text-muted-foreground">Total Work Logs</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {dashboardSummary.loading ? '...' : (overview?.totalIssueLogs ?? 0)}
                </p>
              </div>
              <div className="bg-success-background p-4 rounded-lg border border-success-border">
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold text-success-foreground">
                  {dashboardSummary.loading ? '...' : (overview?.totalEmployees ?? 0)}
                </p>
              </div>
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-200 dark:border-primary-800">
                <p className="text-sm text-muted-foreground">Total Departments</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {dashboardSummary.loading ? '...' : (overview?.totalDepartments ?? 0)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-warning-background p-4 rounded-lg border border-warning-border">
                <p className="text-sm text-muted-foreground">Issue Logs Today</p>
                <p className="text-2xl font-bold text-warning-foreground">
                  {dashboardSummary.loading ? '...' : (overview?.issueLogsToday ?? 0)}
                </p>
              </div>
              <div className="bg-error-background p-4 rounded-lg border border-error-border">
                <p className="text-sm text-muted-foreground">Open Issue Logs</p>
                <p className="text-2xl font-bold text-error-foreground">
                  {dashboardSummary.loading ? '...' : (overview?.openIssueLogs ?? 0)}
                </p>
              </div>
              <div className="bg-success-background p-4 rounded-lg border border-success-border">
                <p className="text-sm text-muted-foreground">Resolved Issue Logs</p>
                <p className="text-2xl font-bold text-success-foreground">
                  {dashboardSummary.loading ? '...' : (overview?.resolvedIssueLogs ?? 0)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-start">
              <button
                type="button"
                onClick={() => void dashboardSummary.refetch()}
                disabled={dashboardSummary.loading}
                className="h-9 px-3 rounded-md border border-border bg-background hover:bg-accent text-sm inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {dashboardSummary.loading && <LoadingSpinner size="sm" tone="current" />}
                {dashboardSummary.loading ? 'Refreshing...' : 'Refresh Summary'}
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
              <section className="bg-card border border-border rounded-lg p-5 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Issue Log Trend (7 days)</h2>
                  <p className="text-sm text-muted-foreground">Daily incident volume in the last 7 days.</p>
                </div>

                {trendData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No trend data available.</p>
                ) : (
                  <ChartContainer className="h-70 w-full" config={trendChartConfig}>
                    <LineChart data={trendData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="dateLabel" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="var(--color-count)"
                        strokeWidth={2}
                        dot={{ r: 3, fill: 'var(--color-count)' }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ChartContainer>
                )}
              </section>

              <section className="bg-card border border-border rounded-lg p-5 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Status Breakdown</h2>
                  <p className="text-sm text-muted-foreground">Current distribution of issue log statuses.</p>
                </div>

                {statusData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No status data available.</p>
                ) : (
                  <ChartContainer className="h-70 w-full" config={statusChartConfig}>
                    <BarChart data={statusData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="statusLabel" tickLine={false} axisLine={false} interval={0} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {statusData.map((item) => (
                          <Cell
                            key={item.status}
                            fill={STATUS_COLORS[item.status.toLowerCase()] || '#4f7cff'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                )}
              </section>
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
            departments={dataManager.departments.data}
            areas={dataManager.areas.data}
          />
        );
      case 'issues':
        return (
          <IssueManagement />
        );
      case 'causes':
        return (
          <CauseManagement />
        );
      case 'departments':
        return <DepartmentManagement />;
      case 'areas':
        return <AreaManagement />;
      case 'accounts':
        return (
          <AccountManagement
            employees={dataManager.employees.data}
            roles={dataManager.roles.data}
          />
        );
      case 'my-account':
        return <MyAccountManagement />;
      case 'roles':
        return <RoleManagement />;
      default:
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-5 text-foreground">Admin Dashboard</h1>
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
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