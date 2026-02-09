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

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Lock, Unlock, Shield, User, Save, AlertCircle } from 'lucide-react';
import { PermissionEditor } from './PermissionEditor';
import { accountsApi } from '../api/accounts';
import { rolesApi } from '../api/roles';
import type { Account, Employee, RoleDto, ClaimDto } from '../types/data';
import { usePermission } from '../lib/hooks/usePermission';
import { Permissions } from '../lib/constants/permissions';

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

  const getEmployeeName = (item: Account) => item.employeeName || 'Unknown';

  const getRoleDisplay = (item: Account) => {
    const roles = (item as { roles?: RoleDto[] | null }).roles;
    if (roles && roles.length > 0) {
      return roles.map(role => role.name).join(', ');
    }
    return item.role || 'No Role';
  };

  const openForm = (item?: Account) => {
    setEditing(item || null);
    setFormData(
      item
        ? {
            employeeId: item.employeeId,
            username: item.username,
            password: '', // Never pre-fill password
            selectedRoleIds: [], // TODO: Load from account's roles
            selectedClaimIds: [] // TODO: Load from account's direct claims
          }
        : {
            employeeId: '',
            username: '',
            password: '',
            selectedRoleIds: [],
            selectedClaimIds: []
          }
    );
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
            <User className="w-7 h-7 text-blue-600" />
            Account Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage user accounts with hybrid role and permission assignment
          </p>
        </div>
        {hasPermission(Permissions.Account.Create) && (
          <button
            onClick={() => openForm()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create Account
          </button>
        )}
      </div>

      {/* Accounts Table */}
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Employee Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Roles
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium">{getEmployeeName(item)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {item.employeeCode || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    {item.username}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {item.isLocked ? (
                    <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 font-medium flex items-center gap-1 w-fit">
                      <Lock className="w-3 h-3" />
                      Locked
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 font-medium flex items-center gap-1 w-fit">
                      <Unlock className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 flex items-center gap-1 w-fit">
                    <Shield className="w-3 h-3" />
                    {getRoleDisplay(item)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <div className="inline-flex items-center gap-2">
                    {hasPermission(Permissions.Account.Edit) && (
                      <>
                        <button
                          onClick={() => openForm(item)}
                          className="text-blue-600 inline-flex items-center justify-center cursor-pointer hover:text-blue-800 transition-colors"
                          title="Edit account"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openConfirm(item.isLocked ? 'unlock' : 'lock', item)}
                          className={`inline-flex items-center justify-center cursor-pointer transition-colors ${
                            item.isLocked
                              ? 'text-green-600 hover:text-green-800'
                              : 'text-orange-600 hover:text-orange-800'
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
                        onClick={() => openConfirm('delete', item)}
                        className="text-red-600 inline-flex items-center justify-center cursor-pointer hover:text-red-800 transition-colors"
                        title="Delete account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">No accounts found</p>
                  <p className="text-sm mt-1">Create your first account to get started</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Dialog - Multi-step */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-6xl w-full my-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  {editing ? 'Edit Account' : 'Create New Account'}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {formStep === 'basic'
                    ? 'Step 1: Basic Information'
                    : 'Step 2: Permission Assignment'}
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="cursor-pointer hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-red-900">Error</p>
                  <p className="text-sm text-red-700 mt-0.5">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 cursor-pointer"
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
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <p className="text-xs text-gray-500 mt-1">Employee cannot be changed</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
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
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
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
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {editing && (
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to keep current password
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    Next: Assign Permissions →
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors"
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
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setFormStep('basic')}
                    className="px-4 py-2 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleFinalSubmit}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-md w-full">
            {/* Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {confirmState.action === 'delete' ? (
                    <Trash2 className="w-5 h-5 text-red-600" />
                  ) : confirmState.action === 'lock' ? (
                    <Lock className="w-5 h-5 text-orange-600" />
                  ) : (
                    <Unlock className="w-5 h-5 text-green-600" />
                  )}
                  {confirmTitle}
                </h3>
              </div>
              <button
                onClick={closeConfirm}
                className="cursor-pointer hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-base text-gray-700">{confirmDescription}</p>
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex gap-3">
              <button
                onClick={closeConfirm}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              {confirmState.action === 'delete' && (
                <button
                  onClick={handleConfirmAction}
                  className="flex-1 px-4 py-2 rounded-lg text-white cursor-pointer transition-colors bg-red-600 hover:bg-red-700"
                >
                  {confirmActionLabel}
                </button>
              )}
              {confirmState.action === 'lock' && (
                <button
                  onClick={handleConfirmAction}
                  className="flex-1 px-4 py-2 rounded-lg text-white cursor-pointer transition-colors bg-orange-600 hover:bg-orange-700"
                >
                  {confirmActionLabel}
                </button>
              )}
              {confirmState.action === 'unlock' && (
                <button
                  onClick={handleConfirmAction}
                  className="flex-1 px-4 py-2 rounded-lg text-white cursor-pointer transition-colors bg-green-600 hover:bg-green-700"
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