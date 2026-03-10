/**
 * Professional Account Management Component
 * 
 * **Design Pattern**: Microsoft Azure Active Directory "Users" interface
 * - Hybrid Permission Model (Roles + Direct Claims)
 * - Two-step workflow: Basic Info → Permission Assignment
 * - Real-time effective permissions calculation
 * 
 * **References:**
 * - Microsoft Entra Admin Center: https://entra.microsoft.com
 * - Azure AD User Management: https://learn.microsoft.com/en-us/entra/identity/users/
 * 
 * **API Integration:**
 * - POST /api/accounts - Create account
 * - PUT /api/accounts/{id} - Update account
 * - DELETE /api/accounts/{id} - Delete account
 * - POST /api/roles/assign - Assign roles to account
 * - GET /api/roles/claims - Get all available claims
 */

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X, Lock, Unlock, Shield, User, Save, AlertCircle } from 'lucide-react';
import { PermissionEditor } from '@/components/common/PermissionEditor';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import { PaginationBar } from '@/components/common/PaginationBar';
import { accountsApi } from '@/services/api/accounts';
import { rolesApi } from '@/services/api/roles';
import type { Account, Employee, RoleDto, ClaimDto, AccountsQueryParams, PaginatedResult, ListAccountDto } from '@/types/data';
import { usePermission } from '@/hooks/usePermission';
import { Permissions } from '@/config/permissions';

interface Props {
  data: Account[];
  setData: (items: Account[]) => void;
  employees: Employee[];
  roles: RoleDto[];
}

interface AccountFormData {
  employeeId: string;
  username: string;
  password: string;
  selectedRoleIds: number[];
  selectedClaimIds: number[];
}

type ConfirmAction = 'delete' | 'lock' | 'unlock';
type ConfirmState = { action: ConfirmAction; account: Account } | null;

export function AccountManagement({ data, setData, employees, roles }: Props) {
  // Query Parameters state (includes server-side filters)
  const [queryParams, setQueryParams] = useState<AccountsQueryParams>({
    page: 1,
    pageSize: 10,
    search: '',
    sortBy: 'username',
    isDescending: false,
    isLocked: null, // null = all, true = locked only, false = active only
  });

  // Paginated result state
  const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<ListAccountDto> | null>(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [formStep, setFormStep] = useState<'basic' | 'permissions'>('basic');
  const [formData, setFormData] = useState<AccountFormData>({
    employeeId: '',
    username: '',
    password: '',
    selectedRoleIds: [],
    selectedClaimIds: []
  });

  const [availableClaims, setAvailableClaims] = useState<ClaimDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const { hasPermission } = usePermission();

  // Fetch accounts with current query parameters (server-side filtering)
  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await accountsApi.getAll(queryParams);
      setPaginatedResult(result);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
      setError('Failed to load accounts');
      setPaginatedResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  // Fetch accounts when query parameters or status filter changes
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Load available claims when form opens
  useEffect(() => {
    if (showForm && formStep === 'permissions') {
      loadAvailableClaims();
    }
  }, [showForm, formStep]);

  // Ensure roles display is accurate by fetching account details if needed
  useEffect(() => {
    const missingRoles = data.filter(item => {
      const hasRoles = (item as { roles?: RoleDto[] | null }).roles;
      return !hasRoles && item.role === 'employee';
    });

    if (missingRoles.length === 0) return;

    let isMounted = true;

    const loadAccountRoles = async () => {
      const updates = await Promise.all(
        missingRoles.map(async (item) => {
          try {
            const detail = await accountsApi.getById(item.accountId);
            const roles = detail.roles || null;
            const roleDisplay = roles && roles.length > 0
              ? roles.map(role => role.name).join(', ')
              : 'No Role';
            return { id: item.id, roles, roleDisplay };
          } catch {
            return null;
          }
        })
      );

      if (!isMounted) return;

      const validUpdates = updates.filter(Boolean) as Array<{ id: string; roles: RoleDto[] | null; roleDisplay: string }>;
      if (validUpdates.length === 0) return;

      setData(
        data.map((item) => {
          const update = validUpdates.find((u) => u.id === item.id);
          if (!update) return item;
          return { ...item, roles: update.roles, role: update.roleDisplay };
        })
      );
    };

    loadAccountRoles();

    return () => {
      isMounted = false;
    };
  }, [data, setData]);

  const loadAvailableClaims = async () => {
    try {
      const claims = await rolesApi.getClaims();
      setAvailableClaims(claims);
    } catch (err) {
      console.error('Failed to load claims:', err);
      setError('Failed to load available permissions');
    }
  };

  // const getEmployeeName = (item: Account) => item.employeeName || 'Unknown';

  // const getRoleDisplay = (item: Account) => {
  //   const roles = (item as { roles?: RoleDto[] | null }).roles;
  //   if (roles && roles.length > 0) {
  //     return roles.map(role => role.name).join(', ');
  //   }
  //   return item.role || 'No Role';
  // };

  const openForm = (item?: Account) => {
    setEditing(item || null);
    
    if (item) {
      // Edit existing account - pre-populate form with current values
      const selectedRoleIds = item.roles?.map(r => r.roleId) || [];
      
      // Extract direct claims (claims not in any selected role)
      const roleClaimIds = new Set<number>();
      selectedRoleIds.forEach(roleId => {
        const role = roles.find(r => r.roleId === roleId);
        role?.claims?.forEach(claim => roleClaimIds.add(claim.claimId));
      });
      
      // Direct claims are those selected but NOT inherited from roles
      const selectedClaimIds = availableClaims
        .filter(claim => selectedRoleIds.some(roleId => {
          const role = roles.find(r => r.roleId === roleId);
          return role?.claims?.some(c => c.claimId === claim.claimId);
        }))
        .map(c => c.claimId);
      
      setFormData({
        employeeId: item.employeeId,
        username: item.username,
        password: '', // Never pre-fill password
        selectedRoleIds,
        selectedClaimIds
      });
    } else {
      // Create new account
      setFormData({
        employeeId: '',
        username: '',
        password: '',
        selectedRoleIds: [],
        selectedClaimIds: []
      });
    }
    
    setFormStep('basic');
    setError(null);
    setShowForm(true);
  };

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStep('permissions');
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const employee = employees.find((e) => e.employeeId === formData.employeeId);

      const selectedRoles = roles.filter(role => formData.selectedRoleIds.includes(role.roleId));
      const roleDisplay = selectedRoles.length > 0
        ? selectedRoles.map(role => role.name).join(', ')
        : 'No Role';

      if (editing) {
        // Update existing account
        await accountsApi.update(editing.accountId, {
          username: formData.username,
          ...(formData.password && { password: formData.password })
        });

        // Assign roles and claims
        if (formData.selectedRoleIds.length > 0 || formData.selectedClaimIds.length > 0) {
          await rolesApi.assignRolesAndClaims({
            accountId: editing.accountId,
            roleIds: formData.selectedRoleIds,
            claimIds: formData.selectedClaimIds
          });
        }

        // Update local state
        setData(
          data.map((i) =>
            i.id === editing.id
              ? { ...i, username: formData.username, roles: selectedRoles, role: roleDisplay }
              : i
          )
        );
      } else {
        // Create new account
        const created = await accountsApi.create({
          empId: formData.employeeId,
          username: formData.username,
          password: formData.password
        });

        // Assign roles and claims
        if (formData.selectedRoleIds.length > 0 || formData.selectedClaimIds.length > 0) {
          await rolesApi.assignRolesAndClaims({
            accountId: created.accountId,
            roleIds: formData.selectedRoleIds,
            claimIds: formData.selectedClaimIds
          });
        }

        // Update local state
        setData([
          ...data,
          {
            id: created.accountId,
            accountId: created.accountId,
            employeeId: formData.employeeId,
            username: formData.username,
            password: '', // Don't store password locally
            role: roleDisplay,
            roles: selectedRoles,
            empName: employee?.fullName || '',
            empCode: employee?.empCode || null,
            employeeName: employee?.fullName || '',
            employeeCode: employee?.empCode || null,
            isLocked: false,
            lastLoginAt: null,
            createdAt: new Date().toISOString(),
            deleteDate: null
          }
        ]);
      }

      setShowForm(false);
      setFormData({
        employeeId: '',
        username: '',
        password: '',
        selectedRoleIds: [],
        selectedClaimIds: []
      });
    } catch (err: any) {
      console.error('Failed to save account:', err);
      setError(err.message || 'Failed to save account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (item: Account) => {
    try {
      await accountsApi.deleteSingle(item.accountId);
      setData(data.filter((i) => i.id !== item.id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete account');
    }
  };

  const handleLockToggle = async (item: Account) => {
    try {
      if (item.isLocked) {
        await accountsApi.unlock(item.accountId);
      } else {
        await accountsApi.lock(item.accountId);
      }
      setData(
        data.map((i) =>
          i.id === item.id ? { ...i, isLocked: !i.isLocked } : i
        )
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update account status');
    }
  };

  const openConfirm = (action: ConfirmAction, account: Account) => {
    setConfirmState({ action, account });
  };

  const closeConfirm = () => {
    setConfirmState(null);
  };

  const confirmTitle = confirmState?.action === 'delete'
    ? 'Delete account'
    : confirmState?.action === 'lock'
    ? 'Lock account'
    : 'Unlock account';

  const confirmDescription = confirmState?.action === 'delete'
    ? `Are you sure you want to delete "${confirmState?.account.username}"? This action cannot be undone.`
    : confirmState?.action === 'lock'
    ? `Are you sure you want to lock "${confirmState?.account.username}"? The user will be unable to sign in.`
    : `Are you sure you want to unlock "${confirmState?.account.username}"?`;

  const confirmActionLabel = confirmState?.action === 'delete'
    ? 'Delete'
    : confirmState?.action === 'lock'
    ? 'Lock'
    : 'Unlock';

  const handleConfirmAction = async () => {
    if (!confirmState) return;
    if (confirmState.action === 'delete') {
      await handleDelete(confirmState.account);
    } else {
      await handleLockToggle(confirmState.account);
    }
    closeConfirm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <User className="w-7 h-7 text-primary-600" />
            Account Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user accounts with hybrid role and permission assignment
          </p>
        </div>
        {hasPermission(Permissions.Account.Create) && (
          <button
            onClick={() => openForm()}
            className="btn-primary px-4 py-2 flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create Account
          </button>
        )}
      </div>

      {/* Search, Filter & Sort Bar */}
      <SearchFilterBar
        queryParams={queryParams}
        onQueryChange={setQueryParams}
        paginatedResult={paginatedResult || undefined}
        filterOptions={[
          { label: 'All Status', value: 'all' },
          { label: 'Active', value: 'active' },
          { label: 'Locked', value: 'locked' },
        ]}
        currentFilter={
          queryParams.isLocked === null ? 'all' :
          queryParams.isLocked ? 'locked' : 'active'
        }
        onFilterChange={(value) =>
          setQueryParams({
            ...queryParams,
            isLocked: value === 'all' ? null : value === 'locked',
            page: 1, // Reset to page 1 when filter changes
          })
        }
        sortOptions={[
          { label: 'Username', value: 'username' },
          { label: 'Employee Name', value: 'empName' },
          { label: 'Employee Code', value: 'empCode' },
          { label: 'Created Date', value: 'createdAt' },
          { label: 'Last Login', value: 'lastLoginAt' },
          { label: 'Status', value: 'isLocked' },
        ]}
        placeholder="Search by username, email, or employee name..."
        showResults={true}
      />

      {/* Accounts Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              <p className="text-muted-foreground">Loading accounts...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="p-4 bg-error-background border border-error-border flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-error-foreground">Error</p>
              <p className="text-sm text-error-foreground">{error}</p>
            </div>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && (
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Employee Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Roles
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(paginatedResult?.items || []).length > 0 ? (
                (paginatedResult?.items || []).map((item) => (
                  <tr key={item.accountId} className="hover:bg-accent transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{item.empName || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {item.empCode || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-placeholder" />
                        {item.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {item.isLocked ? (
                        <span className="px-2 py-1 text-xs rounded bg-error-background text-error-foreground font-medium flex items-center gap-1 w-fit">
                          <Lock className="w-3 h-3" />
                          Locked
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded bg-success-background text-success-foreground font-medium flex items-center gap-1 w-fit">
                          <Unlock className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 text-xs rounded bg-primary-100 text-primary-700 flex items-center gap-1 w-fit">
                        <Shield className="w-3 h-3" />
                        {((item as any).roles?.length || (item as any).roleCount || 0)} roles
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="inline-flex items-center gap-2">
                        {hasPermission(Permissions.Account.Edit) && (
                          <>
                            <button
                              onClick={() => openForm(item as any)}
                              className="text-primary-600 inline-flex items-center justify-center hover:text-primary-800 transition-colors"
                              title="Edit account"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openConfirm(item.isLocked ? 'unlock' : 'lock', item as any)}
                              className={`inline-flex items-center justify-center transition-colors ${
                                item.isLocked
                                  ? 'text-success-foreground hover:text-success-foreground'
                                  : 'text-warning-foreground hover:text-warning-foreground'
                              }`}
                              title={item.isLocked ? 'Unlock account' : 'Lock account'}
                            >
                              {item.isLocked ? (
                                <Unlock className="w-4 h-4" />
                              ) : (
                                <Lock className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        )}
                        {hasPermission(Permissions.Account.Delete) && (
                          <button
                            onClick={() => openConfirm('delete', item as any)}
                            className="text-error-foreground inline-flex items-center justify-center hover:text-error-foreground transition-colors"
                            title="Delete account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No accounts found</p>
                    <p className="text-sm mt-1">Create your first account to get started</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {paginatedResult && !isLoading && (
        <PaginationBar
          page={queryParams.page || 1}
          totalPages={paginatedResult.totalPages}
          totalCount={paginatedResult.totalCount}
          hasPreviousPage={paginatedResult.hasPreviousPage}
          hasNextPage={paginatedResult.hasNextPage}
          onPageChange={(page) =>
            setQueryParams((prev) => ({
              ...prev,
              page: Math.min(Math.max(1, page), paginatedResult.totalPages),
            }))
          }
        />
      )}

      {/* Form Dialog - Multi-step */}
      {showForm && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card rounded-lg max-w-6xl w-full my-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                  <User className="w-5 h-5 text-primary-600" />
                  {editing ? 'Edit Account' : 'Create New Account'}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {formStep === 'basic'
                    ? 'Step 1: Basic Information'
                    : 'Step 2: Permission Assignment'}
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="hover:text-muted-foreground transition-colors text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mx-6 mt-4 p-4 bg-error-background border border-error-border rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-error-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-error-foreground">Error</p>
                  <p className="text-sm text-error-foreground mt-0.5">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-error-foreground hover:text-error-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 1: Basic Info */}
            {formStep === 'basic' && (
              <form onSubmit={handleBasicInfoSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Employee <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.employeeId}
                    onChange={(e) =>
                      setFormData({ ...formData, employeeId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-card text-foreground placeholder-placeholder transition-colors"
                    disabled={!!editing}
                  >
                    <option value="">Select employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.employeeId}>
                        {emp.employeeId} - {emp.fullName}
                      </option>
                    ))}
                  </select>
                  {editing && (
                    <p className="text-xs text-muted-foreground mt-1">Employee cannot be changed</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="Enter username"
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-card text-foreground placeholder-placeholder transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Password {!editing && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    required={!editing}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder={editing ? 'Leave empty to keep current password' : 'Enter password'}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-card text-foreground placeholder-placeholder transition-colors"
                  />
                  {editing && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to keep current password
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1 px-4 py-2"
                  >
                    Next: Assign Permissions →
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary flex-1 px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Permissions */}
            {formStep === 'permissions' && (
              <div className="p-6 space-y-6">
                <PermissionEditor
                  selectedRoleIds={formData.selectedRoleIds}
                  selectedClaimIds={formData.selectedClaimIds}
                  availableRoles={roles}
                  availableClaims={availableClaims}
                  onRolesChange={(roleIds) =>
                    setFormData({ ...formData, selectedRoleIds: roleIds })
                  }
                  onClaimsChange={(claimIds) =>
                    setFormData({ ...formData, selectedClaimIds: claimIds })
                  }
                />

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setFormStep('basic')}
                    className="btn-secondary px-4 py-2"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleFinalSubmit}
                    disabled={isLoading}
                    className="btn-primary flex-1 px-4 py-2 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editing ? 'Update Account' : 'Create Account'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {confirmState && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card rounded-lg max-w-md w-full">
            {/* Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {confirmState.action === 'delete' ? (
                    <Trash2 className="w-5 h-5 text-error-foreground" />
                  ) : confirmState.action === 'lock' ? (
                    <Lock className="w-5 h-5 text-warning-foreground" />
                  ) : (
                    <Unlock className="w-5 h-5 text-success-foreground" />
                  )}
                  {confirmTitle}
                </h3>
              </div>
              <button
                onClick={closeConfirm}
                className="hover:text-muted-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-base text-muted-foreground">{confirmDescription}</p>
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex gap-3">
              <button
                onClick={closeConfirm}
                className="btn-secondary flex-1 px-4 py-2"
              >
                Cancel
              </button>
              {confirmState.action === 'delete' && (
                <button
                  onClick={handleConfirmAction}
                  className="btn-danger flex-1 px-4 py-2"
                >
                  {confirmActionLabel}
                </button>
              )}
              {confirmState.action === 'lock' && (
                <button
                  onClick={handleConfirmAction}
                  className="btn-warning flex-1 px-4 py-2"
                >
                  {confirmActionLabel}
                </button>
              )}
              {confirmState.action === 'unlock' && (
                <button
                  onClick={handleConfirmAction}
                  className="btn-success flex-1 px-4 py-2"
                >
                  {confirmActionLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}