import { useMemo } from 'react';
import { X } from 'lucide-react';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { FieldError } from '@/components/common/FieldError';
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

export function createEmployeeFormData(
  item: Employee | null,
  departments: Department[] = [],
  areas: AreaDto[] = [],
): EmployeeFormData {
  return item
    ? {
        empCode: item.empCode || '',
        fullName: item.fullName,
        phoneNumber: item.phoneNumber || '',
        email: item.email || '',
        position: item.position || '',
        department: item.department || departments.find((dept) => dept.dptId === item.dptId)?.name || '',
        area: item.area || areas.find((area) => area.areaId === item.areaId)?.name || '',
      }
    : { empCode: '', fullName: '', phoneNumber: '', email: '', position: '', department: '', area: '' };
}

interface EmployeeFormModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  isLoadingData: boolean;
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
  isLoadingData,
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
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const fullNameErrors = getFieldErrorMessages(validationErrors, 'FullName');
  const empCodeErrors = getFieldErrorMessages(validationErrors, 'EmpCode');
  const emailErrors = getFieldErrorMessages(validationErrors, 'Email');
  const phoneErrors = getFieldErrorMessages(validationErrors, 'PhoneNumber');
  const departmentErrors = getFieldErrorMessages(validationErrors, 'Department', ['DptId', 'DepartmentId']);
  const areaErrors = getFieldErrorMessages(validationErrors, 'Area', ['AreaId']);
  const generalValidationMessages = getGeneralValidationMessages(validationErrors, [
    'FullName',
    'EmpCode',
    'Email',
    'PhoneNumber',
    'Department',
    'DptId',
    'DepartmentId',
    'Area',
    'AreaId',
  ]);
  const hasEmpCodeError = empCodeErrors.length > 0;
  const hasFullNameError = fullNameErrors.length > 0;
  const hasPhoneError = phoneErrors.length > 0;
  const hasEmailError = emailErrors.length > 0;

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card rounded-lg max-w-2xl w-full my-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
          <h3 className="text-lg font-semibold text-foreground">{editing ? 'Edit' : 'Add'} Employee</h3>
          <button onClick={onClose} disabled={isSubmitting || isLoadingData} className="hover:text-muted-foreground transition-colors text-foreground disabled:opacity-50 disabled:cursor-not-allowed">
            <X className="w-6 h-6" />
          </button>
        </div>
        {error && (
          <ErrorAlert
            message={error}
            details={generalValidationMessages}
            onDismiss={onClearError}
            dismissDisabled={isSubmitting || isLoadingData}
            className="mx-6 mt-4"
          />
        )}
        {isLoadingData ? (
          <div className="p-10 flex flex-col items-center justify-center gap-3 text-center">
            <LoadingSpinner size="md" tone="current" />
            <p className="text-sm text-muted-foreground">Loading employee details...</p>
          </div>
        ) : (
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Employee Code</label>
              <input
                type="text"
                value={formData.empCode}
                onChange={(e) => onChange({ ...formData, empCode: e.target.value })}
                placeholder="EMP001"
                className={`input-base ${
                  hasEmpCodeError ? 'border-error-border focus:ring-error-border/30 focus:border-error-border' : ''
                }`}
                disabled={isSubmitting}
              />
              <FieldError messages={empCodeErrors} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Full Name <span className="text-error-foreground">*</span></label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => onChange({ ...formData, fullName: e.target.value })}
                placeholder="John Doe"
                className={`input-base ${
                  hasFullNameError ? 'border-error-border focus:ring-error-border/30 focus:border-error-border' : ''
                }`}
                disabled={isSubmitting}
              />
              <FieldError messages={fullNameErrors} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => onChange({ ...formData, phoneNumber: e.target.value })}
                placeholder="081-234-5678"
                className={`input-base ${
                  hasPhoneError ? 'border-error-border focus:ring-error-border/30 focus:border-error-border' : ''
                }`}
                disabled={isSubmitting}
              />
              <FieldError messages={phoneErrors} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => onChange({ ...formData, email: e.target.value })}
                placeholder="john@company.com"
                className={`input-base ${
                  hasEmailError ? 'border-error-border focus:ring-error-border/30 focus:border-error-border' : ''
                }`}
                disabled={isSubmitting}
              />
              <FieldError messages={emailErrors} />
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
                hasError={departmentErrors.length > 0}
              />
              <FieldError messages={departmentErrors} />
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
                hasError={areaErrors.length > 0}
              />
              <FieldError messages={areaErrors} />
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
        )}
      </div>
    </div>
  );
}
