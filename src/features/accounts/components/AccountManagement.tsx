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
import { Plus, User } from 'lucide-react';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import { PaginationBar } from '@/components/common/PaginationBar';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { accountsApi } from '@/services/api/accounts';
import { rolesApi } from '@/services/api/roles';
import type { Account, Employee, RoleDto, AccountsQueryParams, PaginatedResult, ListAccountDto } from '@/types/data';
import { usePermission } from '@/hooks/usePermission';
import { Permissions } from '@/config/permissions';
import { AccountTable } from '@/features/accounts/components/AccountTable';
import { AccountFormModal, type AccountFormData } from '@/features/accounts/components/AccountFormModal';

interface Props {
  data: Account[];
  setData: (items: Account[]) => void;
  employees: Employee[];
  roles: RoleDto[];
}

type ConfirmAction = 'delete' | 'lock' | 'unlock';
type ConfirmState = {
  action: ConfirmAction;
  accountId: string;
  username: string;
  isLocked: boolean;
} | null;

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

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
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

  useEffect(() => {
    void fetchAccounts();
  }, [fetchAccounts]);

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

    void loadAccountRoles();

    return () => {
      isMounted = false;
    };
  }, [data, setData]);

  const openCreateForm = () => {
    setEditing(null);
    setError(null);
    setShowForm(true);
  };

  const openEditForm = (accountId: string) => {
    const account = data.find((item) => item.accountId === accountId) || null;
    if (!account) {
      setError('Unable to load account details for editing.');
      return;
    }

    setEditing(account);
    setError(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData: AccountFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const employee = employees.find((e) => e.employeeId === formData.employeeId);

      const selectedRoles = roles.filter(role => formData.selectedRoleIds.includes(role.roleId));
      const roleDisplay = selectedRoles.length > 0
        ? selectedRoles.map(role => role.name).join(', ')
        : 'No Role';

      if (editing) {
        await accountsApi.update(editing.accountId, {
          username: formData.username,
          ...(formData.password && { password: formData.password })
        });

        if (formData.selectedRoleIds.length > 0 || formData.selectedClaimIds.length > 0) {
          await rolesApi.assignRolesAndClaims({
            accountId: editing.accountId,
            roleIds: formData.selectedRoleIds,
            claimIds: formData.selectedClaimIds
          });
        }

        setData(
          data.map((i) =>
            i.id === editing.id
              ? { ...i, username: formData.username, roles: selectedRoles, role: roleDisplay }
              : i
          )
        );
      } else {
        const created = await accountsApi.create({
          empId: formData.employeeId,
          username: formData.username,
          password: formData.password
        });

        if (formData.selectedRoleIds.length > 0 || formData.selectedClaimIds.length > 0) {
          await rolesApi.assignRolesAndClaims({
            accountId: created.accountId,
            roleIds: formData.selectedRoleIds,
            claimIds: formData.selectedClaimIds
          });
        }

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
      setEditing(null);
      await fetchAccounts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save account. Please try again.';
      console.error('Failed to save account:', err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (accountId: string) => {
    try {
      await accountsApi.deleteSingle(accountId);
      setData(data.filter((i) => i.accountId !== accountId));
      await fetchAccounts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete account';
      alert(message);
    }
  };

  const handleLockToggle = async (accountId: string, isLocked: boolean) => {
    try {
      if (isLocked) {
        await accountsApi.unlock(accountId);
      } else {
        await accountsApi.lock(accountId);
      }

      setData(
        data.map((i) =>
          i.accountId === accountId ? { ...i, isLocked: !i.isLocked } : i
        )
      );
      await fetchAccounts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update account status';
      alert(message);
    }
  };

  const openConfirm = (action: ConfirmAction, accountId: string) => {
    const listAccount = paginatedResult?.items.find((item) => item.accountId === accountId);
    if (!listAccount) return;

    setConfirmState({
      action,
      accountId,
      username: listAccount.username,
      isLocked: listAccount.isLocked,
    });
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
    ? `Are you sure you want to delete "${confirmState?.username}"? This action cannot be undone.`
    : confirmState?.action === 'lock'
    ? `Are you sure you want to lock "${confirmState?.username}"? The user will be unable to sign in.`
    : `Are you sure you want to unlock "${confirmState?.username}"?`;

  const confirmActionLabel = confirmState?.action === 'delete'
    ? 'Delete'
    : confirmState?.action === 'lock'
    ? 'Lock'
    : 'Unlock';

  const handleConfirmAction = async () => {
    if (!confirmState) return;

    if (confirmState.action === 'delete') {
      await handleDelete(confirmState.accountId);
    } else {
      await handleLockToggle(confirmState.accountId, confirmState.isLocked);
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
            onClick={openCreateForm}
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

      <AccountTable
        items={paginatedResult?.items || []}
        isLoading={isLoading}
        error={error}
        canEdit={hasPermission(Permissions.Account.Edit)}
        canDelete={hasPermission(Permissions.Account.Delete)}
        onEdit={openEditForm}
        onLockToggle={(accountId) => {
          const account = paginatedResult?.items.find((item) => item.accountId === accountId);
          if (!account) return;
          openConfirm(account.isLocked ? 'unlock' : 'lock', accountId);
        }}
        onDelete={(accountId) => openConfirm('delete', accountId)}
      />

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

      <AccountFormModal
        isOpen={showForm}
        editing={editing}
        employees={employees}
        roles={roles}
        isSubmitting={isLoading}
        error={error}
        onSubmit={handleFormSubmit}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        onClearError={() => setError(null)}
      />

      <ConfirmDialog
        isOpen={!!confirmState}
        onClose={closeConfirm}
        onConfirm={handleConfirmAction}
        action={confirmState?.action || 'custom'}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={confirmActionLabel}
      />
    </div>
  );
}