import { useEffect, useState } from 'react';
import { AlertCircle, Save, User, X } from 'lucide-react';
import { PermissionEditor } from '@/components/common/PermissionEditor';
import { rolesApi } from '@/services/api/roles';
import type { Account, ClaimDto, Employee, RoleDto } from '@/types/data';

export interface AccountFormData {
  employeeId: string;
  username: string;
  password: string;
  selectedRoleIds: number[];
  selectedClaimIds: number[];
}

interface AccountFormModalProps {
  isOpen: boolean;
  editing: Account | null;
  employees: Employee[];
  roles: RoleDto[];
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (formData: AccountFormData) => Promise<void>;
  onClose: () => void;
  onClearError: () => void;
}

function getInitialFormData(editing: Account | null): AccountFormData {
  if (editing) {
    return {
      employeeId: editing.employeeId,
      username: editing.username,
      password: '',
      selectedRoleIds: editing.roles?.map((role) => role.roleId) || [],
      selectedClaimIds: [],
    };
  }

  return {
    employeeId: '',
    username: '',
    password: '',
    selectedRoleIds: [],
    selectedClaimIds: [],
  };
}

export function AccountFormModal({
  isOpen,
  editing,
  employees,
  roles,
  isSubmitting,
  error,
  onSubmit,
  onClose,
  onClearError,
}: AccountFormModalProps) {
  const [formStep, setFormStep] = useState<'basic' | 'permissions'>('basic');
  const [formData, setFormData] = useState<AccountFormData>(getInitialFormData(editing));
  const [availableClaims, setAvailableClaims] = useState<ClaimDto[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    setFormStep('basic');
    setFormData(getInitialFormData(editing));
  }, [isOpen, editing]);

  useEffect(() => {
    if (!isOpen || formStep !== 'permissions') return;

    const loadClaims = async () => {
      try {
        const claims = await rolesApi.getClaims();
        setAvailableClaims(claims);
      } catch (loadError) {
        console.error('Failed to load claims:', loadError);
        setAvailableClaims([]);
      }
    };

    void loadClaims();
  }, [isOpen, formStep]);

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStep('permissions');
  };

  const handleFinalSubmit = async () => {
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card rounded-lg max-w-6xl w-full my-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <User className="w-5 h-5 text-primary-600" />
              {editing ? 'Edit Account' : 'Create New Account'}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {formStep === 'basic' ? 'Step 1: Basic Information' : 'Step 2: Permission Assignment'}
            </p>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="hover:text-muted-foreground transition-colors text-foreground disabled:opacity-50 disabled:cursor-not-allowed">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-error-background border border-error-border rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-error-foreground">Error</p>
              <p className="text-sm text-error-foreground mt-0.5">{error}</p>
            </div>
            <button onClick={onClearError} className="text-error-foreground hover:text-error-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {formStep === 'basic' && (
          <form onSubmit={handleBasicInfoSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
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
              {editing && <p className="text-xs text-muted-foreground mt-1">Employee cannot be changed</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editing ? 'Leave empty to keep current password' : 'Enter password'}
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-card text-foreground placeholder-placeholder transition-colors"
              />
              {editing && <p className="text-xs text-muted-foreground mt-1">Leave empty to keep current password</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="btn-primary flex-1 px-4 py-2">
                Next: Assign Permissions {'->'}
              </button>
              <button type="button" onClick={onClose} disabled={isSubmitting} className="btn-secondary flex-1 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
                Cancel
              </button>
            </div>
          </form>
        )}

        {formStep === 'permissions' && (
          <div className="p-6 space-y-6">
            <PermissionEditor
              selectedRoleIds={formData.selectedRoleIds}
              selectedClaimIds={formData.selectedClaimIds}
              availableRoles={roles}
              availableClaims={availableClaims}
              onRolesChange={(roleIds) => setFormData({ ...formData, selectedRoleIds: roleIds })}
              onClaimsChange={(claimIds) => setFormData({ ...formData, selectedClaimIds: claimIds })}
            />

            <div className="flex gap-3 pt-4 border-t border-border">
              <button type="button" onClick={() => setFormStep('basic')} disabled={isSubmitting} className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {'<-'} Back
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="btn-primary flex-1 px-4 py-2 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
  );
}
