import { AlertCircle, X } from 'lucide-react';
import type { IssueDto } from '@/types/data';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { ValidationErrors } from '@/utils/apiValidation';

export interface IssueFormData {
  name: string;
  description: string;
  category: string;
  severity: string;
}

interface IssueFormModalProps {
  isOpen: boolean;
  editing: IssueDto | null;
  formData: IssueFormData;
  isLoading: boolean;
  error: string | null;
  validationErrors: ValidationErrors | null;
  onChange: (data: IssueFormData) => void;
  onSubmit: (formData: IssueFormData) => Promise<void>;
  onClose: () => void;
  onClearError: () => void;
}

export function IssueFormModal({
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
}: IssueFormModalProps) {
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
  const severityErrors = getFieldErrors('Severity');

  const generalValidationErrors = validationErrors
    ? Object.entries(validationErrors).filter(([field]) => {
      const fieldLower = field.toLowerCase();
      return fieldLower !== 'name' && fieldLower !== 'severity';
    })
    : [];

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-semibold text-foreground">{editing ? 'Edit Issue' : 'Create Issue'}</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-foreground hover:text-muted-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={isLoading}
              className="text-error-foreground hover:text-error-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-muted-foreground">
              Issue Name <span className="text-error-foreground">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              placeholder="Enter issue name"
              className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground placeholder-placeholder focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
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
            <label className="block text-sm font-medium mb-1 text-muted-foreground">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => onChange({ ...formData, category: e.target.value })}
              placeholder="e.g. Hardware, Network, Software"
              className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground placeholder-placeholder focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-muted-foreground">Severity</label>
            <select
              value={formData.severity}
              onChange={(e) => onChange({ ...formData, severity: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            >
              <option value="">Not set</option>
              <option value="1">1 - Low</option>
              <option value="2">2 - Minor</option>
              <option value="3">3 - Medium</option>
              <option value="4">4 - High</option>
              <option value="5">5 - Critical</option>
            </select>
            {severityErrors.length > 0 && (
              <ul className="mt-2 list-disc list-inside text-sm text-error-foreground space-y-1">
                {severityErrors.map((message, index) => (
                  <li key={`severity-${index}`}>{message}</li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-muted-foreground">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              placeholder="Describe the issue type"
              rows={4}
              className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground placeholder-placeholder focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex-1 px-4 py-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" tone="inverse" />
                  Saving...
                </>
              ) : editing ? (
                'Update Issue'
              ) : (
                'Create Issue'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary flex-1 px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
