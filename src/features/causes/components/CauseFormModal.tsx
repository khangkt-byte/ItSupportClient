import { X } from 'lucide-react';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { FieldError } from '@/components/common/FieldError';
import { SearchableCombobox } from '@/components/common/SearchableCombobox';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { CauseDto, IssueDto } from '@/types/data';
import {
  getFieldErrorMessages,
  getGeneralValidationMessages,
  type ValidationErrors,
} from '@/utils/apiErrors';

export interface CauseFormData {
  issId: string;
  name: string;
  description: string;
}

export function createCauseFormData(item: CauseDto | null): CauseFormData {
  return item
    ? {
        issId: item.issId.toString(),
        name: item.name,
        description: item.description || '',
      }
    : {
        issId: '',
        name: '',
        description: '',
      };
}

interface CauseFormModalProps {
  isOpen: boolean;
  editing: CauseDto | null;
  formData: CauseFormData;
  issueOptions: IssueDto[];
  isSubmitting: boolean;
  error: string | null;
  validationErrors: ValidationErrors | null;
  onChange: (formData: CauseFormData) => void;
  onSubmit: (formData: CauseFormData) => Promise<void>;
  onClose: () => void;
  onClearError: () => void;
}

export function CauseFormModal({
  isOpen,
  editing,
  formData,
  issueOptions,
  isSubmitting,
  error,
  validationErrors,
  onChange,
  onSubmit,
  onClose,
  onClearError,
}: CauseFormModalProps) {
  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const nameErrors = getFieldErrorMessages(validationErrors, 'Name');
  const issueErrors = getFieldErrorMessages(validationErrors, 'IssId', ['IssueId']);
  const generalValidationMessages = getGeneralValidationMessages(validationErrors, ['Name', 'IssId', 'IssueId']);
  const hasNameError = nameErrors.length > 0;
  const hasIssueError = issueErrors.length > 0;

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-semibold text-foreground">{editing ? 'Edit Cause' : 'Create Cause'}</h3>
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
              Issue
              {!editing && <span className="text-error-foreground"> *</span>}
            </label>
            <SearchableCombobox
              options={issueOptions.map((issue) => ({ value: issue.issId.toString(), label: issue.name }))}
              value={formData.issId}
              onChange={(value) => onChange({ ...formData, issId: value })}
              placeholder="Select issue..."
              disabled={isSubmitting || !!editing}
              hasError={hasIssueError}
            />
            <FieldError messages={issueErrors} />
            {editing && (
              <p className="text-xs text-muted-foreground mt-1">
                Issue cannot be changed when updating an existing cause.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-muted-foreground">
              Cause Name <span className="text-error-foreground">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              placeholder="Enter cause name"
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg bg-card text-foreground placeholder-placeholder focus:ring-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                hasNameError
                  ? 'border-error-border focus:ring-error-border/30 focus:border-error-border'
                  : 'border-input focus:ring-primary-500 focus:border-transparent'
              }`}
            />
            <FieldError messages={nameErrors} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-muted-foreground">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              placeholder="Describe this cause"
              rows={4}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground placeholder-placeholder focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none disabled:opacity-60 disabled:cursor-not-allowed"
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
                'Update Cause'
              ) : (
                'Create Cause'
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
