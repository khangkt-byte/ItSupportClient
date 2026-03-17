import { X } from 'lucide-react';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { FieldError } from '@/components/common/FieldError';
import type { Area } from '@/types/data';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  getFieldErrorMessages,
  getGeneralValidationMessages,
  type ValidationErrors,
} from '@/utils/apiErrors';

export interface AreaFormData {
  name: string;
  description: string;
}

interface AreaFormModalProps {
  isOpen: boolean;
  editing: Area | null;
  formData: AreaFormData;
  isSubmitting: boolean;
  error: string | null;
  validationErrors: ValidationErrors | null;
  onChange: (formData: AreaFormData) => void;
  onSubmit: (formData: AreaFormData) => Promise<void>;
  onClose: () => void;
  onClearError: () => void;
}

export function AreaFormModal({
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
}: AreaFormModalProps) {
  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const nameErrors = getFieldErrorMessages(validationErrors, 'Name');
  const generalValidationMessages = getGeneralValidationMessages(validationErrors, ['Name']);
  const hasNameError = nameErrors.length > 0;

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm w-full max-w-xl">
        <div className="px-6 py-4 border-b border-border flex justify-between">
          <h3 className="text-lg font-semibold text-foreground">{editing ? 'Edit' : 'Add'}</h3>
          <button onClick={onClose} disabled={isSubmitting} className="hover:text-muted-foreground text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
            placeholder="Name *"
            className={`w-full px-3 py-2 border rounded-lg bg-card text-foreground placeholder-placeholder focus:ring-2 transition-colors ${
              hasNameError
                ? 'border-error-border focus:ring-error-border/30 focus:border-error-border'
                : 'border-input focus:ring-primary-500 focus:border-transparent'
            }`}
          />
          <FieldError messages={nameErrors} />
          <textarea
            value={formData.description}
            onChange={(e) => onChange({ ...formData, description: e.target.value })}
            placeholder="Description"
            rows={3}
            className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground placeholder-placeholder focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
          />
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1 px-4 py-2 flex items-center justify-center gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" tone="inverse" />
                  Saving...
                </>
              ) : (
                <>{editing ? 'Update' : 'Create'}</>
              )}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1 px-4 py-2" disabled={isSubmitting}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
