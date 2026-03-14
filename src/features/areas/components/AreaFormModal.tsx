import { AlertCircle, X } from 'lucide-react';
import type { Area } from '@/types/data';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { ValidationErrors } from '@/utils/apiValidation';

export interface AreaFormData {
  name: string;
  description: string;
}

interface Props {
  isOpen: boolean;
  editing: Area | null;
  formData: AreaFormData;
  isLoading: boolean;
  error: string | null;
  validationErrors: ValidationErrors | null;
  onChange: (data: AreaFormData) => void;
  onSubmit: (formData: AreaFormData) => Promise<void>;
  onClose: () => void;
  onClearError: () => void;
}

export function AreaFormModal({
  isOpen,
  editing,
  formData,
  isLoading,
  error,
  validationErrors,
  onChange,
  onSubmit,
  onClose,
  onClearError,
}: Props) {
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
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm w-full max-w-xl">
        <div className="px-6 py-4 border-b border-border flex justify-between">
          <h3 className="text-lg font-semibold text-foreground">{editing ? 'Edit' : 'Add'}</h3>
          <button onClick={onClose} disabled={isLoading} className="hover:text-muted-foreground text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
              disabled={isLoading}
              className="text-error-foreground hover:text-error-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
            placeholder="Name *"
            className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground placeholder-placeholder focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
          {nameErrors.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-sm text-error-foreground space-y-1">
              {nameErrors.map((message, index) => (
                <li key={`name-${index}`}>{message}</li>
              ))}
            </ul>
          )}
          <textarea
            value={formData.description}
            onChange={(e) => onChange({ ...formData, description: e.target.value })}
            placeholder="Description"
            rows={3}
            className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground placeholder-placeholder focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
          />
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1 px-4 py-2 flex items-center justify-center gap-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" tone="inverse" />
                  Saving...
                </>
              ) : (
                <>{editing ? 'Update' : 'Create'}</>
              )}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1 px-4 py-2" disabled={isLoading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
