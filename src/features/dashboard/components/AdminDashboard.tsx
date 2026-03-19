import { useEffect, useMemo, useState } from 'react';
import { LogOut } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, XAxis, YAxis } from 'recharts';
import type { DashboardSummaryQueryParams, User } from '@/types/data';
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

type DashboardFilterMode = 'day' | 'month' | 'range';
type DashboardPreset = 'today' | 'last7' | 'thisMonth' | 'lastMonth' | 'allTime' | 'custom';

const DASHBOARD_PERIOD = {
  day: 0,
  month: 1,
  range: 2,
} as const;

const DASHBOARD_GROUP_BY = {
  day: 0,
  month: 1,
} as const;

const FILTER_QUERY_KEYS = {
  mode: 'dbMode',
  day: 'dbDay',
  month: 'dbMonth',
  from: 'dbFrom',
  to: 'dbTo',
  preset: 'dbPreset',
} as const;

const ALL_TIME_START = '2000-01-01';

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatMonth = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}`;
};

const getMonthBounds = (monthValue: string): { fromDate: string; toDate: string } => {
  const [yearString, monthString] = monthValue.split('-');
  const year = Number(yearString);
  const month = Number(monthString);

  if (!year || !month) {
    const today = formatDate(new Date());
    return { fromDate: today, toDate: today };
  }

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  return {
    fromDate: formatDate(monthStart),
    toDate: formatDate(monthEnd),
  };
};

const getMonthOffset = (monthValue: string): number => {
  const [yearString, monthString] = monthValue.split('-');
  const year = Number(yearString);
  const month = Number(monthString);

  if (!year || !month) {
    return 0;
  }

  const now = new Date();
  return ((year - now.getFullYear()) * 12) + ((month - 1) - now.getMonth());
};

const getDayDifference = (fromDate: string, toDate: string): number => {
  const start = new Date(fromDate);
  const end = new Date(toDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
};

const isValidDateString = (value: string): boolean => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

const isValidMonthString = (value: string): boolean => /^\d{4}-\d{2}$/.test(value);

const getRelativeMonthValue = (offset: number): string => {
  const base = new Date();
  base.setDate(1);
  base.setMonth(base.getMonth() + offset);
  return formatMonth(base);
};

const formatMonthLabel = (value: string): string => {
  const [yearString, monthString] = value.split('-');
  return `${monthString}/${yearString}`;
};

const parseUrlFilterState = (defaults: {
  filterMode: DashboardFilterMode;
  dayDate: string;
  monthValue: string;
  rangeFrom: string;
  rangeTo: string;
  preset: DashboardPreset;
}) => {
  if (typeof window === 'undefined') {
    return defaults;
  }

  const params = new URLSearchParams(window.location.search);
  const mode = params.get(FILTER_QUERY_KEYS.mode);
  const day = params.get(FILTER_QUERY_KEYS.day);
  const month = params.get(FILTER_QUERY_KEYS.month);
  const from = params.get(FILTER_QUERY_KEYS.from);
  const to = params.get(FILTER_QUERY_KEYS.to);
  const preset = params.get(FILTER_QUERY_KEYS.preset);

  const parsedMode: DashboardFilterMode =
    mode === 'day' || mode === 'month' || mode === 'range' ? mode : defaults.filterMode;

  const parsedPreset: DashboardPreset =
    preset === 'today' ||
      preset === 'last7' ||
      preset === 'thisMonth' ||
      preset === 'lastMonth' ||
      preset === 'allTime' ||
      preset === 'custom'
      ? preset
      : defaults.preset;

  return {
    filterMode: parsedMode,
    dayDate: day && isValidDateString(day) ? day : defaults.dayDate,
    monthValue: month && isValidMonthString(month) ? month : defaults.monthValue,
    rangeFrom: from && isValidDateString(from) ? from : defaults.rangeFrom,
    rangeTo: to && isValidDateString(to) ? to : defaults.rangeTo,
    preset: parsedPreset,
  };
};

export function AdminDashboard({ user, onLogout, currentView }: Props) {
  const dataManager = useDataManager();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', []);
  const today = useMemo(() => formatDate(new Date()), []);
  const defaultRangeFrom = useMemo(() => formatDate(new Date(Date.now() - (6 * 24 * 60 * 60 * 1000))), []);
  const currentMonthValue = useMemo(() => formatMonth(new Date()), []);
  const lastMonthValue = useMemo(() => getRelativeMonthValue(-1), []);

  const initialFilterState = useMemo(
    () => parseUrlFilterState({
      filterMode: 'month',
      dayDate: today,
      monthValue: currentMonthValue,
      rangeFrom: defaultRangeFrom,
      rangeTo: today,
      preset: 'thisMonth',
    }),
    [currentMonthValue, defaultRangeFrom, today],
  );

  const [filterMode, setFilterMode] = useState<DashboardFilterMode>(initialFilterState.filterMode);
  const [dayDate, setDayDate] = useState(initialFilterState.dayDate);
  const [monthValue, setMonthValue] = useState(initialFilterState.monthValue);
  const [rangeFrom, setRangeFrom] = useState(initialFilterState.rangeFrom);
  const [rangeTo, setRangeTo] = useState(initialFilterState.rangeTo);
  const [activePreset, setActivePreset] = useState<DashboardPreset>(initialFilterState.preset);

  const monthOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    for (let offset = 0; offset >= -24; offset -= 1) {
      const value = getRelativeMonthValue(offset);
      options.push({ value, label: formatMonthLabel(value) });
    }

    if (monthValue && !options.some(option => option.value === monthValue)) {
      options.unshift({ value: monthValue, label: formatMonthLabel(monthValue) });
    }

    return options;
  }, [monthValue]);

  const handleApplyPreset = (preset: DashboardPreset) => {
    if (preset === 'today') {
      setFilterMode('day');
      setDayDate(today);
      setActivePreset('today');
      return;
    }

    if (preset === 'last7') {
      setFilterMode('range');
      setRangeFrom(defaultRangeFrom);
      setRangeTo(today);
      setActivePreset('last7');
      return;
    }

    if (preset === 'thisMonth') {
      setFilterMode('month');
      setMonthValue(currentMonthValue);
      setActivePreset('thisMonth');
      return;
    }

    if (preset === 'lastMonth') {
      setFilterMode('month');
      setMonthValue(lastMonthValue);
      setActivePreset('lastMonth');
      return;
    }

    if (preset === 'allTime') {
      setFilterMode('range');
      setRangeFrom(ALL_TIME_START);
      setRangeTo(today);
      setActivePreset('allTime');
      return;
    }

    setActivePreset('custom');
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    params.set(FILTER_QUERY_KEYS.mode, filterMode);
    params.set(FILTER_QUERY_KEYS.preset, activePreset);

    if (filterMode === 'day') {
      params.set(FILTER_QUERY_KEYS.day, dayDate);
      params.delete(FILTER_QUERY_KEYS.month);
      params.delete(FILTER_QUERY_KEYS.from);
      params.delete(FILTER_QUERY_KEYS.to);
    } else if (filterMode === 'month') {
      params.set(FILTER_QUERY_KEYS.month, monthValue);
      params.delete(FILTER_QUERY_KEYS.day);
      params.delete(FILTER_QUERY_KEYS.from);
      params.delete(FILTER_QUERY_KEYS.to);
    } else {
      params.set(FILTER_QUERY_KEYS.from, rangeFrom);
      params.set(FILTER_QUERY_KEYS.to, rangeTo);
      params.delete(FILTER_QUERY_KEYS.day);
      params.delete(FILTER_QUERY_KEYS.month);
    }

    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', nextUrl);
  }, [activePreset, dayDate, filterMode, monthValue, rangeFrom, rangeTo]);

  const dashboardQueryParams = useMemo<DashboardSummaryQueryParams>(() => {
    if (filterMode === 'day') {
      return {
        period: DASHBOARD_PERIOD.day,
        fromDate: dayDate,
        toDate: dayDate,
        timezone,
        groupBy: DASHBOARD_GROUP_BY.day,
      };
    }

    if (filterMode === 'month') {
      const bounds = getMonthBounds(monthValue);
      return {
        period: DASHBOARD_PERIOD.month,
        fromDate: bounds.fromDate,
        toDate: bounds.toDate,
        timezone,
        groupBy: DASHBOARD_GROUP_BY.day,
        monthOffset: getMonthOffset(monthValue),
      };
    }

    const normalizedFrom = rangeFrom <= rangeTo ? rangeFrom : rangeTo;
    const normalizedTo = rangeFrom <= rangeTo ? rangeTo : rangeFrom;
    const dayDifference = getDayDifference(normalizedFrom, normalizedTo);

    return {
      period: DASHBOARD_PERIOD.range,
      fromDate: normalizedFrom,
      toDate: normalizedTo,
      timezone,
      groupBy: dayDifference > 31 ? DASHBOARD_GROUP_BY.month : DASHBOARD_GROUP_BY.day,
    };
  }, [dayDate, filterMode, monthValue, rangeFrom, rangeTo, timezone]);

  const dashboardSummary = useDashboardSummary(currentView === 'admin', dashboardQueryParams);

  const trendData = useMemo(
    () => {
      const trendPoints = dashboardSummary.summary?.trend?.length
        ? dashboardSummary.summary.trend
        : (dashboardSummary.summary?.trendLast7Days || []);

      return trendPoints.map(item => ({
        ...item,
        dateLabel: item.label || item.periodStart || item.date || '-',
      }));
    },
    [dashboardSummary.summary?.trend, dashboardSummary.summary?.trendLast7Days],
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

            <section className="bg-card border border-border rounded-lg p-4 md:p-5 mb-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Period</label>
                    <select
                      value={filterMode}
                      onChange={(event) => {
                        setFilterMode(event.target.value as DashboardFilterMode);
                        setActivePreset('custom');
                      }}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="day">Day</option>
                      <option value="month">Month</option>
                      <option value="range">Date Range</option>
                    </select>
                  </div>

                  {filterMode === 'day' && (
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">Date</label>
                      <input
                        type="date"
                        value={dayDate}
                        onChange={(event) => {
                          setDayDate(event.target.value);
                          setActivePreset('custom');
                        }}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      />
                    </div>
                  )}

                  {filterMode === 'month' && (
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">Month</label>
                      <select
                        value={monthValue}
                        onChange={(event) => {
                          setMonthValue(event.target.value);
                          setActivePreset('custom');
                        }}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {monthOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {filterMode === 'range' && (
                    <>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">From</label>
                        <input
                          type="date"
                          value={rangeFrom}
                          onChange={(event) => {
                            setRangeFrom(event.target.value);
                            setActivePreset('custom');
                          }}
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">To</label>
                        <input
                          type="date"
                          value={rangeTo}
                          onChange={(event) => {
                            setRangeTo(event.target.value);
                            setActivePreset('custom');
                          }}
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>

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
              <p className="text-xs text-muted-foreground mt-3">
                Timezone: {timezone}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('today')}
                  className={`h-8 px-3 rounded-md border text-xs transition-colors ${
                    activePreset === 'today'
                      ? 'bg-primary-600 text-primary-foreground border-primary-600'
                      : 'bg-background border-border hover:bg-accent'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('last7')}
                  className={`h-8 px-3 rounded-md border text-xs transition-colors ${
                    activePreset === 'last7'
                      ? 'bg-primary-600 text-primary-foreground border-primary-600'
                      : 'bg-background border-border hover:bg-accent'
                  }`}
                >
                  Last 7 days
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('thisMonth')}
                  className={`h-8 px-3 rounded-md border text-xs transition-colors ${
                    activePreset === 'thisMonth'
                      ? 'bg-primary-600 text-primary-foreground border-primary-600'
                      : 'bg-background border-border hover:bg-accent'
                  }`}
                >
                  This month
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('lastMonth')}
                  className={`h-8 px-3 rounded-md border text-xs transition-colors ${
                    activePreset === 'lastMonth'
                      ? 'bg-primary-600 text-primary-foreground border-primary-600'
                      : 'bg-background border-border hover:bg-accent'
                  }`}
                >
                  Last month
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('allTime')}
                  className={`h-8 px-3 rounded-md border text-xs transition-colors ${
                    activePreset === 'allTime'
                      ? 'bg-primary-600 text-primary-foreground border-primary-600'
                      : 'bg-background border-border hover:bg-accent'
                  }`}
                >
                  All time
                </button>
              </div>
            </section>

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

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
              <section className="bg-card border border-border rounded-lg p-5 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Issue Log Trend</h2>
                  <p className="text-sm text-muted-foreground">Incident trend for the selected period.</p>
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