import { X } from 'lucide-react';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { FieldError } from '@/components/common/FieldError';
import type { IssueDto } from '@/types/data';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  getFieldErrorMessages,
  getGeneralValidationMessages,
  type ValidationErrors,
} from '@/utils/apiErrors';

export interface IssueFormData {
  name: string;
  description: string;
  category: string;
  severity: string;
}

export function createIssueFormData(item: IssueDto | null): IssueFormData {
  return item
    ? {
        name: item.name,
        description: item.description || '',
        category: item.category || '',
        severity: item.severity?.toString() || '',
      }
    : { name: '', description: '', category: '', severity: '' };
}

interface IssueFormModalProps {
  isOpen: boolean;
  editing: IssueDto | null;
  formData: IssueFormData;
  isSubmitting: boolean;
  error: string | null;
  validationErrors: ValidationErrors | null;
  onChange: (formData: IssueFormData) => void;
  onSubmit: (formData: IssueFormData) => Promise<void>;
  onClose: () => void;
  onClearError: () => void;
}

export function IssueFormModal({
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
}: IssueFormModalProps) {
  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const nameErrors = getFieldErrorMessages(validationErrors, 'Name');
  const severityErrors = getFieldErrorMessages(validationErrors, 'Severity');
  const generalValidationMessages = getGeneralValidationMessages(validationErrors, ['Name', 'Severity']);
  const hasNameError = nameErrors.length > 0;
  const hasSeverityError = severityErrors.length > 0;

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-semibold text-foreground">{editing ? 'Edit Issue' : 'Create Issue'}</h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-foreground hover:text-muted-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
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
              className={`w-full px-3 py-2 border rounded-lg bg-card text-foreground placeholder-placeholder focus:ring-2 transition-colors ${
                hasNameError
                  ? 'border-error-border focus:ring-error-border/30 focus:border-error-border'
                  : 'border-input focus:ring-primary-500 focus:border-transparent'
              }`}
            />
            <FieldError messages={nameErrors} />
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
              className={`w-full px-3 py-2 border rounded-lg bg-card text-foreground focus:ring-2 transition-colors ${
                hasSeverityError
                  ? 'border-error-border focus:ring-error-border/30 focus:border-error-border'
                  : 'border-input focus:ring-primary-500 focus:border-transparent'
              }`}
            >
              <option value="">Not set</option>
              <option value="1">1 - Low</option>
              <option value="2">2 - Minor</option>
              <option value="3">3 - Medium</option>
              <option value="4">4 - High</option>
              <option value="5">5 - Critical</option>
            </select>
            <FieldError messages={severityErrors} />
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
              disabled={isSubmitting}
              className="btn-primary flex-1 px-4 py-2 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
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
              disabled={isSubmitting}
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
