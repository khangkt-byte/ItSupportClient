import { useEffect, useState } from 'react';
import { Save, User, X } from 'lucide-react';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { FieldError } from '@/components/common/FieldError';
import { PermissionEditor } from '@/components/common/PermissionEditor';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { employeesApi } from '@/services/api/employees';
import { rolesApi } from '@/services/api/roles';
import type { Account, ClaimDto, ListEmployeeDto, RoleDto } from '@/types/data';
import {
  getFieldErrorMessages,
  getGeneralValidationMessages,
  type ValidationErrors,
} from '@/utils/apiErrors';

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
  formData: AccountFormData;
  isSubmitting: boolean;
  error: string | null;
  validationErrors: ValidationErrors | null;
  onChange: (formData: AccountFormData) => void;
  onSubmit: (formData: AccountFormData) => Promise<void>;
  onClose: () => void;
  onClearError: () => void;
}

export function createAccountFormData(editing: Account | null): AccountFormData {
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
  formData,
  isSubmitting,
  error,
  validationErrors,
  onChange,
  onSubmit,
  onClose,
  onClearError,
}: AccountFormModalProps) {
  const [formStep, setFormStep] = useState<'basic' | 'permissions'>('basic');
  const [availableEmployees, setAvailableEmployees] = useState<ListEmployeeDto[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleDto[]>([]);
  const [availableClaims, setAvailableClaims] = useState<ClaimDto[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingClaims, setIsLoadingClaims] = useState(false);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setFormStep('basic');
    setDataLoadError(null);
  }, [isOpen, editing]);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setIsLoadingData(true);

      try {
        const [employeesResult, rolesResult] = await Promise.all([
          employeesApi.getAll({ page: 1, pageSize: 1000 }),
          rolesApi.getAll({ page: 1, pageSize: 1000 }),
        ]);

        setAvailableEmployees(employeesResult.items || []);
        setAvailableRoles(rolesResult.items || []);
      } catch (loadError) {
        console.error('Failed to load account form data:', loadError);
        setAvailableEmployees([]);
        setAvailableRoles([]);
        setDataLoadError('Failed to load employees/roles. Please retry.');
      } finally {
        setIsLoadingData(false);
      }
    };

    void loadData();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || formStep !== 'permissions') return;

    const loadClaims = async () => {
      setIsLoadingClaims(true);

      try {
        const claims = await rolesApi.getClaims();
        setAvailableClaims(claims);
      } catch (loadError) {
        console.error('Failed to load claims:', loadError);
        setAvailableClaims([]);
        setDataLoadError('Failed to load claims. Please retry.');
      } finally {
        setIsLoadingClaims(false);
      }
    };

    void loadClaims();
  }, [isOpen, formStep]);

  useEffect(() => {
    if (!isOpen || !editing || formData.employeeId || availableEmployees.length === 0) return;

    const matchedEmployee = availableEmployees.find((emp) => {
      const matchByCode = Boolean(editing.empCode) && emp.empCode === editing.empCode;
      const matchByName = emp.fullName === editing.empName;
      return matchByCode || matchByName;
    });

    if (matchedEmployee) {
      onChange({ ...formData, employeeId: matchedEmployee.empId });
    }
  }, [isOpen, editing, formData, availableEmployees, onChange]);

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStep('permissions');
  };

  const handleFinalSubmit = async () => {
    await onSubmit(formData);
  };

  const employeeErrors = getFieldErrorMessages(validationErrors, 'EmpId', ['EmployeeId']);
  const usernameErrors = getFieldErrorMessages(validationErrors, 'Username');
  const passwordErrors = getFieldErrorMessages(validationErrors, 'Password');
  const generalValidationMessages = getGeneralValidationMessages(validationErrors, [
    'EmpId',
    'EmployeeId',
    'Username',
    'Password',
  ]);
  const hasEmployeeError = employeeErrors.length > 0;
  const hasUsernameError = usernameErrors.length > 0;
  const hasPasswordError = passwordErrors.length > 0;

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
          <ErrorAlert
            message={error}
            details={generalValidationMessages}
            onDismiss={onClearError}
            dismissDisabled={isSubmitting}
            className="mx-6 mt-4"
          />
        )}

        {dataLoadError && (
          <ErrorAlert
            message={dataLoadError}
            onDismiss={() => setDataLoadError(null)}
            dismissDisabled={isSubmitting || isLoadingData || isLoadingClaims}
            className="mx-6 mt-4"
          />
        )}

        {formStep === 'basic' && (
          isLoadingData ? (
            <div className="p-10 flex flex-col items-center justify-center gap-3 text-center">
              <LoadingSpinner size="md" tone="current" />
              <p className="text-sm text-muted-foreground">Loading employees and roles...</p>
            </div>
          ) : (
          <form onSubmit={handleBasicInfoSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.employeeId}
                onChange={(e) => onChange({ ...formData, employeeId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 bg-card text-foreground placeholder-placeholder transition-colors ${
                  hasEmployeeError
                    ? 'border-error-border focus:ring-error-border/30 focus:border-error-border'
                    : 'border-input focus:ring-primary-500 focus:border-transparent'
                }`}
                disabled={!!editing}
              >
                <option value="">Select employee...</option>
                {availableEmployees.map((emp) => (
                  <option key={emp.empId} value={emp.empId}>
                    {(emp.empCode || emp.empId)} - {emp.fullName}
                  </option>
                ))}
              </select>
              <FieldError messages={employeeErrors} />
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
                onChange={(e) => onChange({ ...formData, username: e.target.value })}
                placeholder="Enter username"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 bg-card text-foreground placeholder-placeholder transition-colors ${
                  hasUsernameError
                    ? 'border-error-border focus:ring-error-border/30 focus:border-error-border'
                    : 'border-input focus:ring-primary-500 focus:border-transparent'
                }`}
              />
              <FieldError messages={usernameErrors} />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Password {!editing && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                required={!editing}
                value={formData.password}
                onChange={(e) => onChange({ ...formData, password: e.target.value })}
                placeholder={editing ? 'Leave empty to keep current password' : 'Enter password'}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 bg-card text-foreground placeholder-placeholder transition-colors ${
                  hasPasswordError
                    ? 'border-error-border focus:ring-error-border/30 focus:border-error-border'
                    : 'border-input focus:ring-primary-500 focus:border-transparent'
                }`}
              />
              <FieldError messages={passwordErrors} />
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
          )
        )}

        {formStep === 'permissions' && (
          <div className="p-6 space-y-6">
            {isLoadingData || isLoadingClaims ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                <LoadingSpinner size="md" tone="current" />
                <p className="text-sm text-muted-foreground">Loading permissions...</p>
              </div>
            ) : (
              <PermissionEditor
                selectedRoleIds={formData.selectedRoleIds}
                selectedClaimIds={formData.selectedClaimIds}
                availableRoles={availableRoles}
                availableClaims={availableClaims}
                onRolesChange={(roleIds) =>
                  onChange({ ...formData, selectedRoleIds: roleIds })
                }
                onClaimsChange={(claimIds) =>
                  onChange({ ...formData, selectedClaimIds: claimIds })
                }
              />
            )}

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
                    <LoadingSpinner size="sm" tone="inverse" />
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
