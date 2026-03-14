import { useMemo } from 'react';
import { X } from 'lucide-react';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import type { Employee, Department, AreaDto } from '@/types/data';
import { SearchableCombobox } from '@/components/common/SearchableCombobox';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  getFieldErrorMessages,
  getGeneralValidationMessages,
  type ValidationErrors,
} from '@/utils/apiErrors';

export interface EmployeeFormData {
  empCode: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  position: string;
  department: string;
  area: string;
}

interface EmployeeFormModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  editing: Employee | null;
  error: string | null;
  validationErrors: ValidationErrors | null;
  formData: EmployeeFormData;
  onChange: (formData: EmployeeFormData) => void;
  onSubmit: (formData: EmployeeFormData) => Promise<void>;
  onClose: () => void;
  onClearError: () => void;
  departments: Department[];
  areas: AreaDto[];
}

export function EmployeeFormModal({
  isOpen,
  isSubmitting,
  editing,
  error,
  validationErrors,
  formData,
  onChange,
  onSubmit,
  onClose,
  onClearError,
  departments,
  areas,
}: EmployeeFormModalProps) {
  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const fullNameErrors = getFieldErrorMessages(validationErrors, 'FullName');
  const empCodeErrors = getFieldErrorMessages(validationErrors, 'EmpCode');
  const emailErrors = getFieldErrorMessages(validationErrors, 'Email');
  const phoneErrors = getFieldErrorMessages(validationErrors, 'PhoneNumber');
  const generalValidationMessages = getGeneralValidationMessages(validationErrors, [
    'FullName',
    'EmpCode',
    'Email',
    'PhoneNumber',
  ]);

  const departmentOptions = useMemo(
    () =>
      departments.map((dept) => ({
        value: dept.name,
        label: dept.name,
      })),
    [departments]
  );

  const areaOptions = useMemo(
    () =>
      areas.map((area) => ({
        value: area.name,
        label: area.name,
      })),
    [areas]
  );

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card rounded-lg max-w-2xl w-full my-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
          <h3 className="text-lg font-semibold text-foreground">{editing ? 'Edit' : 'Add'} Employee</h3>
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
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Employee Code</label>
              <input
                type="text"
                value={formData.empCode}
                onChange={(e) => onChange({ ...formData, empCode: e.target.value })}
                placeholder="EMP001"
                className="input-base"
                disabled={isSubmitting}
              />
              {empCodeErrors.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-sm text-error-foreground space-y-1">
                  {empCodeErrors.map((message, index) => (
                    <li key={`empcode-${index}`}>{message}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Full Name <span className="text-error-foreground">*</span></label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => onChange({ ...formData, fullName: e.target.value })}
                placeholder="John Doe"
                className="input-base"
                disabled={isSubmitting}
              />
              {fullNameErrors.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-sm text-error-foreground space-y-1">
                  {fullNameErrors.map((message, index) => (
                    <li key={`fullname-${index}`}>{message}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => onChange({ ...formData, phoneNumber: e.target.value })}
                placeholder="081-234-5678"
                className="input-base"
                disabled={isSubmitting}
              />
              {phoneErrors.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-sm text-error-foreground space-y-1">
                  {phoneErrors.map((message, index) => (
                    <li key={`phone-${index}`}>{message}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => onChange({ ...formData, email: e.target.value })}
                placeholder="john@company.com"
                className="input-base"
                disabled={isSubmitting}
              />
              {emailErrors.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-sm text-error-foreground space-y-1">
                  {emailErrors.map((message, index) => (
                    <li key={`email-${index}`}>{message}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">
                Department
              </label>
              <SearchableCombobox
                options={departmentOptions}
                value={formData.department}
                onChange={(value) => onChange({ ...formData, department: value })}
                placeholder="Select department..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">
                Area
              </label>
              <SearchableCombobox
                options={areaOptions}
                value={formData.area}
                onChange={(value) => onChange({ ...formData, area: value })}
                placeholder="Select area..."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Position</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => onChange({ ...formData, position: e.target.value })}
                placeholder="IT Support"
                className="input-base"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary-600 text-primary-foreground rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" tone="inverse" />
                  Saving...
                </>
              ) : (
                <>{editing ? 'Update' : 'Create'} Employee</>
              )}
            </button>
            <button type="button" onClick={onClose} disabled={isSubmitting} className="btn-secondary flex-1 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
