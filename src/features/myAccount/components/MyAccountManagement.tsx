import { useCallback, useEffect, useMemo, useState } from 'react';
import { accountsApi } from '@/services/api/accounts';
import { employeesApi } from '@/services/api/employees';
import type { ChangePasswordDto, LoginHistoryDto, ProfileDto } from '@/types/data';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { LoadingState } from '@/components/common/LoadingState';

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const INITIAL_PASSWORD_FORM: PasswordFormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

type LoginHistoryStatusFilter = 'all' | 'success' | 'failed';

function formatDateTime(value: string | null): string {
  if (!value) {
    return 'N/A';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

export function MyAccountManagement() {
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryDto[]>([]);

  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(INITIAL_PASSWORD_FORM);
  const [historyStatusFilter, setHistoryStatusFilter] = useState<LoginHistoryStatusFilter>('all');
  const [historyPage, setHistoryPage] = useState(1);

  const HISTORY_PAGE_SIZE = 10;

  const [loading, setLoading] = useState(true);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [historyRefreshing, setHistoryRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadMyAccountData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [profileData, historyData] = await Promise.all([
        employeesApi.getProfile(),
        accountsApi.getLoginHistory(),
      ]);

      setProfile(profileData);
      setLoginHistory(historyData);
    } catch (loadError: any) {
      setError(loadError?.message || 'Failed to load your account data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyAccountData();
  }, [loadMyAccountData]);

  const handlePasswordFieldChange = (field: keyof PasswordFormState, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Please fill all password fields.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Confirm password does not match new password.');
      return;
    }

    const payload: ChangePasswordDto = {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword,
    };

    setPasswordSaving(true);

    try {
      await accountsApi.changePassword(payload);
      setPasswordForm(INITIAL_PASSWORD_FORM);
      setSuccessMessage('Password changed successfully.');
    } catch (passwordError: any) {
      setError(passwordError?.message || 'Failed to change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleRefreshHistory = async () => {
    setHistoryRefreshing(true);
    try {
      const history = await accountsApi.getLoginHistory();
      setLoginHistory(history);
      setHistoryPage(1);
    } catch {
      setError('Failed to refresh login history.');
    } finally {
      setHistoryRefreshing(false);
    }
  };

  const filteredLoginHistory = useMemo(() => {
    if (historyStatusFilter === 'all') {
      return loginHistory;
    }

    const targetStatus = historyStatusFilter === 'success';
    return loginHistory.filter((entry) => entry.success === targetStatus);
  }, [loginHistory, historyStatusFilter]);

  const totalHistoryPages = Math.max(1, Math.ceil(filteredLoginHistory.length / HISTORY_PAGE_SIZE));

  const paginatedLoginHistory = useMemo(() => {
    const safePage = Math.min(historyPage, totalHistoryPages);
    const start = (safePage - 1) * HISTORY_PAGE_SIZE;
    return filteredLoginHistory.slice(start, start + HISTORY_PAGE_SIZE);
  }, [filteredLoginHistory, historyPage, totalHistoryPages]);

  useEffect(() => {
    if (historyPage > totalHistoryPages) {
      setHistoryPage(totalHistoryPages);
    }
  }, [historyPage, totalHistoryPages]);

  if (loading) {
    return (
      <LoadingState className="min-h-100" label="Loading account data..." />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">My Account</h1>
        <p className="text-muted-foreground">View your profile information and manage account security.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-error-border bg-error-background p-3 text-error-foreground text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-success-border bg-success-background p-3 text-success-foreground text-sm">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-card border border-border rounded-lg p-5 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Profile (Read-only)</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Employee Code</label>
              <input
                type="text"
                value={profile?.empCode || 'N/A'}
                disabled
                className="w-full h-10 rounded-md border border-input bg-muted px-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">Username</label>
              <input
                type="text"
                value={profile?.username || ''}
                disabled
                className="w-full h-10 rounded-md border border-input bg-muted px-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">Full Name</label>
              <input
                type="text"
                value={profile?.fullName || ''}
                disabled
                className="w-full h-10 rounded-md border border-input bg-muted px-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">Email</label>
              <input
                type="text"
                value={profile?.email || ''}
                disabled
                className="w-full h-10 rounded-md border border-input bg-muted px-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">Phone Number</label>
              <input
                type="text"
                value={profile?.phoneNumber || ''}
                disabled
                className="w-full h-10 rounded-md border border-input bg-muted px-3 text-sm"
              />
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-lg p-5 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Change Password</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) => handlePasswordFieldChange('currentPassword', event.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) => handlePasswordFieldChange('newPassword', event.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) => handlePasswordFieldChange('confirmPassword', event.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleChangePassword}
            disabled={passwordSaving}
            className="h-10 px-4 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {passwordSaving && <LoadingSpinner size="sm" tone="inverse" />}
            {passwordSaving ? 'Updating...' : 'Change Password'}
          </button>
        </section>
      </div>

      <section className="bg-card border border-border rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-semibold text-foreground">Login History</h2>
          <div className="flex items-center gap-2">
            <select
              value={historyStatusFilter}
              onChange={(event) => {
                setHistoryStatusFilter(event.target.value as LoginHistoryStatusFilter);
                setHistoryPage(1);
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
            <button
              onClick={handleRefreshHistory}
              disabled={historyRefreshing}
              className="h-9 px-3 rounded-md border border-border bg-background hover:bg-accent text-sm inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {historyRefreshing && <LoadingSpinner size="sm" tone="current" />}
              {historyRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {filteredLoginHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground">No login history records found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 pr-3">Time</th>
                    <th className="text-left py-2 pr-3">Status</th>
                    <th className="text-left py-2 pr-3">IP Address</th>
                    <th className="text-left py-2 pr-3">User Agent</th>
                    <th className="text-left py-2">Failure Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLoginHistory.map((entry, index) => (
                    <tr key={`${entry.loginAt}-${index}`} className="border-b border-border/60">
                      <td className="py-2 pr-3 text-foreground">{formatDateTime(entry.loginAt)}</td>
                      <td className="py-2 pr-3">
                        <span className={`text-xs px-2 py-1 rounded ${entry.success ? 'bg-success-background text-success-foreground' : 'bg-error-background text-error-foreground'}`}>
                          {entry.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">{entry.ipAddress || 'N/A'}</td>
                      <td className="py-2 pr-3 text-muted-foreground max-w-80 truncate" title={entry.userAgent || ''}>
                        {entry.userAgent || 'N/A'}
                      </td>
                      <td className="py-2 text-muted-foreground">{entry.failureReason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
              <p className="text-xs text-muted-foreground">
                Showing {(historyPage - 1) * HISTORY_PAGE_SIZE + 1} - {Math.min(historyPage * HISTORY_PAGE_SIZE, filteredLoginHistory.length)} of {filteredLoginHistory.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
                  disabled={historyPage <= 1}
                  className="h-8 px-3 rounded-md border border-border bg-background hover:bg-accent text-sm disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm text-muted-foreground">Page {historyPage}/{totalHistoryPages}</span>
                <button
                  onClick={() => setHistoryPage((prev) => Math.min(totalHistoryPages, prev + 1))}
                  disabled={historyPage >= totalHistoryPages}
                  className="h-8 px-3 rounded-md border border-border bg-background hover:bg-accent text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
