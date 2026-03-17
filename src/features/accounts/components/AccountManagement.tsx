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

import { useState } from 'react';
import { Plus, User } from 'lucide-react';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import { PaginationBar } from '@/components/common/PaginationBar';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { accountsApi } from '@/services/api/accounts';
import { rolesApi } from '@/services/api/roles';
import type { Account, Employee, RoleDto } from '@/types/data';
import { usePermission } from '@/hooks/usePermission';
import { Permissions } from '@/config/permissions';
import { AccountTable } from '@/features/accounts/components/AccountTable';
import {
  AccountFormModal,
  createAccountFormData,
  type AccountFormData,
} from '@/features/accounts/components/AccountFormModal';
import { useAccountQuery } from '@/features/accounts/hooks/useAccountQuery';
import { createApiErrorState, type ValidationErrors } from '@/utils/apiErrors';

interface Props {
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

export function AccountManagement({ employees, roles }: Props) {
  const {
    queryParams,
    setQueryParams,
    paginatedResult,
    loading,
    error,
    refetch,
  } = useAccountQuery();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [formData, setFormData] = useState<AccountFormData>(createAccountFormData(null));
  const [isMutating, setIsMutating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { hasPermission } = usePermission();

  const openCreateForm = () => {
    setEditing(null);
    setFormData(createAccountFormData(null));
    setMutationError(null);
    setValidationErrors(null);
    setShowForm(true);
  };

  const openEditForm = async (accountId: string) => {
    const listAccount = paginatedResult?.items.find((item) => item.accountId === accountId) || null;
    if (!listAccount) {
      setMutationError('Unable to load account details for editing.');
      setValidationErrors(null);
      return;
    }

    try {
      const detail = await accountsApi.getById(accountId);
      const matchedEmployee = employees.find(
        (employee) =>
          employee.empCode === listAccount.empCode ||
          employee.fullName === listAccount.empName
      );

      const accountToEdit: Account = {
        id: detail.accountId,
        accountId: detail.accountId,
        username: detail.username,
        empName: detail.empName,
        empCode: detail.empCode,
        isLocked: detail.isLocked,
        lastLoginAt: detail.lastLoginAt,
        createdAt: detail.createdAt,
        role:
          detail.roles && detail.roles.length > 0
            ? detail.roles.map((role) => role.name).join(', ')
            : 'No Role',
        password: '',
        employeeId: matchedEmployee?.employeeId || detail.accountId,
        employeeName: detail.empName,
        employeeCode: detail.empCode,
        roles: detail.roles,
      };

      setEditing(accountToEdit);
      setFormData(createAccountFormData(accountToEdit));
    } catch (loadError: unknown) {
      const errorState = createApiErrorState(loadError, 'Unable to load account details. Please refresh and try again.');
      setMutationError(errorState.message);
      setValidationErrors(errorState.fieldErrors);
      return;
    }

    setMutationError(null);
    setValidationErrors(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData: AccountFormData) => {
    setIsMutating(true);
    setMutationError(null);
    setValidationErrors(null);

    try {
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
      }

      setShowForm(false);
      setEditing(null);
      setFormData(createAccountFormData(null));
      await refetch();
    } catch (err: unknown) {
      console.error('Failed to save account:', err);
      const errorState = createApiErrorState(err, 'Unable to save account. Please try again.');
      setMutationError(errorState.message);
      setValidationErrors(errorState.fieldErrors);
    } finally {
      setIsMutating(false);
    }
  };

  const isLoading = loading || isMutating;
  const tableError = showForm ? null : mutationError || error;

  const handleDelete = async (accountId: string) => {
    try {
      await accountsApi.deleteSingle(accountId);
      await refetch();
    } catch (err: unknown) {
      const errorState = createApiErrorState(err, 'Unable to delete account. Please try again.');
      setMutationError(errorState.message);
      setValidationErrors(errorState.fieldErrors);
    }
  };

  const handleLockToggle = async (accountId: string, isLocked: boolean) => {
    try {
      if (isLocked) {
        await accountsApi.unlock(accountId);
      } else {
        await accountsApi.lock(accountId);
      }
      await refetch();
    } catch (err: unknown) {
      const errorState = createApiErrorState(err, 'Unable to update account status. Please try again.');
      setMutationError(errorState.message);
      setValidationErrors(errorState.fieldErrors);
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
    if (deleteLoading) return;
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

    try {
      if (confirmState.action === 'delete') {
        setDeleteLoading(true);
        await handleDelete(confirmState.accountId);
      } else {
        await handleLockToggle(confirmState.accountId, confirmState.isLocked);
      }

      closeConfirm();
    } finally {
      setDeleteLoading(false);
    }
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
        error={tableError}
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
        formData={formData}
        employees={employees}
        roles={roles}
        isSubmitting={isMutating}
        error={mutationError}
        validationErrors={validationErrors}
        onChange={setFormData}
        onSubmit={handleFormSubmit}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
          setFormData(createAccountFormData(null));
          setValidationErrors(null);
        }}
        onClearError={() => {
          setMutationError(null);
          setValidationErrors(null);
        }}
      />

      <ConfirmDialog
        isOpen={!!confirmState}
        onClose={closeConfirm}
        onConfirm={handleConfirmAction}
        isLoading={deleteLoading}
        loadingLabel={confirmState?.action === 'delete' ? 'Deleting...' : undefined}
        action={confirmState?.action || 'custom'}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={confirmActionLabel}
      />
    </div>
  );
}