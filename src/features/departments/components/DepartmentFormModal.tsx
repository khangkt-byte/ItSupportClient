import { AlertCircle, X } from 'lucide-react';
import type { Department } from '@/types/data';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { ValidationErrors } from '@/utils/apiValidation';

export interface DepartmentFormData {
  name: string;
  description: string;
}

interface DepartmentFormModalProps {
  isOpen: boolean;
  editing: Department | null;
  isSubmitting: boolean;
  error: string | null;
  validationErrors: ValidationErrors | null;
  formData: DepartmentFormData;
  onChange: (value: DepartmentFormData) => void;
  onSubmit: (formData: DepartmentFormData) => Promise<void>;
  onClose: () => void;
  onClearError: () => void;
}

export function DepartmentFormModal({
  isOpen,
  editing,
  isSubmitting,
  error,
  validationErrors,
  formData,
  onChange,
  onSubmit,
  onClose,
  onClearError,
}: DepartmentFormModalProps) {
  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const getFieldErrors = (fieldName: string): string[] => {
    if (!validationErrors) return [];

    const directMatch = validationErrors[fieldName];
    if (directMatch?.length) return directMatch;

    const matchEntry = Object.entries(validationErrors).find(
      ([key]) => key.toLowerCase() === fieldName.toLowerCase()
    );

    return matchEntry ? matchEntry[1] : [];
  };

  const nameErrors = getFieldErrors('Name');
  const generalValidationErrors = validationErrors
    ? Object.entries(validationErrors).filter(([field]) => field.toLowerCase() !== 'name')
    : [];

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-md w-full shadow-xl">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-semibold text-foreground">{editing ? 'Edit Department' : 'Add Department'}</h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-placeholder hover:text-muted-foreground disabled:opacity-50 cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-error-background border border-error-border rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-error-foreground">Error</p>
              <p className="text-sm text-error-foreground mt-0.5">{error}</p>
              {generalValidationErrors.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-sm text-error-foreground space-y-1">
                  {generalValidationErrors.map(([field, messages]) =>
                    messages.map((message, index) => (
                      <li key={`${field}-${index}`}>
                        {field}: {message}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
            <button
              onClick={onClearError}
              disabled={isSubmitting}
              className="text-error-foreground hover:text-error-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Name <span className="text-error-foreground">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              placeholder="e.g., IT Department"
              className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-card text-foreground placeholder-placeholder transition-colors"
              disabled={isSubmitting}
            />
            {nameErrors.length > 0 && (
              <ul className="mt-2 list-disc list-inside text-sm text-error-foreground space-y-1">
                {nameErrors.map((message, index) => (
                  <li key={`name-${index}`}>{message}</li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              placeholder="Optional description"
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-card text-foreground placeholder-placeholder resize-none transition-colors"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary-600 text-primary-foreground rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" tone="inverse" />
                  Saving...
                </>
              ) : (
                <>{editing ? 'Update' : 'Create'}</>
              )}
            </button>
            <button type="button" onClick={onClose} disabled={isSubmitting} className="btn-secondary flex-1 px-4 py-2">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
