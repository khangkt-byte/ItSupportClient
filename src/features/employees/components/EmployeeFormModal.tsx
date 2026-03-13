import { useMemo } from 'react';
import { X } from 'lucide-react';
import type { Employee, Department, AreaDto } from '@/types/data';
import { SearchableCombobox } from '@/components/common/SearchableCombobox';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export interface EmployeeFormData {
  empCode: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  position: string;
  department: string;
  area: string;
}

interface Props {
  isOpen: boolean;
  loading: boolean;
  editing: Employee | null;
  formData: EmployeeFormData;
  onChange: (value: EmployeeFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  departments: Department[];
  areas: AreaDto[];
}

export function EmployeeFormModal({ isOpen, loading, editing, formData, onChange, onSubmit, onClose, departments, areas }: Props) {
  if (!isOpen) return null;

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
          <button onClick={onClose} disabled={loading} className="hover:text-muted-foreground transition-colors text-foreground disabled:opacity-50 disabled:cursor-not-allowed">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Employee Code</label>
              <input
                type="text"
                value={formData.empCode}
                onChange={(e) => onChange({ ...formData, empCode: e.target.value })}
                placeholder="EMP001"
                className="input-base"
                disabled={loading}
              />
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
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => onChange({ ...formData, phoneNumber: e.target.value })}
                placeholder="081-234-5678"
                className="input-base"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => onChange({ ...formData, email: e.target.value })}
                placeholder="john@company.com"
                className="input-base"
                disabled={loading}
              />
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
                disabled={loading}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-primary-foreground rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" tone="inverse" />
                  Saving...
                </>
              ) : (
                <>{editing ? 'Update' : 'Create'} Employee</>
              )}
            </button>
            <button type="button" onClick={onClose} disabled={loading} className="btn-secondary flex-1 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
