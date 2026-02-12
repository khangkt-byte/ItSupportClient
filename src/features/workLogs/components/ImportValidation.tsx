import React from 'react';
import { AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { ImportValidationResult, DuplicateHandling } from '@/types/data';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  validationResult: ImportValidationResult | null;
  duplicateHandling: DuplicateHandling;
  onDuplicateHandlingChange: (handling: DuplicateHandling) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ImportValidation({ 
  validationResult, 
  duplicateHandling, 
  onDuplicateHandlingChange,
  onConfirm,
  onCancel
}: Props) {
  if (!validationResult) return null;

  const duplicateRows = validationResult.rows.filter(r => r.duplicateOf !== null);
  const invalidRows = validationResult.rows.filter(r => r.hasErrors); // Changed from r.isValid to r.hasErrors

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-muted rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="size-5 text-success" />
            <span className="text-sm text-muted-foreground">Total Rows</span>
          </div>
          <div className="text-2xl font-semibold text-foreground">{validationResult.totalRows}</div>
        </div>

        <div className="p-4 bg-warning-background rounded-lg border border-warning-border">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="size-5 text-warning" />
            <span className="text-sm text-muted-foreground">Duplicates</span>
          </div>
          <div className="text-2xl font-semibold text-warning-foreground">
            {validationResult.duplicateCount}
          </div>
        </div>

        <div className="p-4 bg-error-background rounded-lg border border-error-border">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="size-5 text-error-foreground" />
            <span className="text-sm text-muted-foreground">Invalid Rows</span>
          </div>
          <div className="text-2xl font-semibold text-error-foreground">
            {invalidRows.length}
          </div>
        </div>
      </div>

      {/* Duplicate Warning Alert */}
      {validationResult.duplicateCount > 0 && (
        <Alert className="border-warning-border bg-warning-background">
          <AlertTriangle className="size-4 text-warning-foreground" />
          <AlertDescription className="text-warning-foreground">
            Found <strong>{validationResult.duplicateCount}</strong> potential duplicate{validationResult.duplicateCount > 1 ? 's' : ''}. 
            Please choose how to handle them below.
          </AlertDescription>
        </Alert>
      )}

      {/* Invalid Rows Alert */}
      {invalidRows.length > 0 && (
        <Alert className="border-error-border bg-error-background">
          <XCircle className="size-4 text-error-foreground" />
          <AlertDescription className="text-error-foreground">
            Found <strong>{invalidRows.length}</strong> invalid row{invalidRows.length > 1 ? 's' : ''} with missing required fields. 
            These rows will be skipped during import.
          </AlertDescription>
        </Alert>
      )}

      {/* Duplicate Handling Options */}
      {validationResult.duplicateCount > 0 && (
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="size-5 text-primary-600" />
            How to handle duplicates?
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors">
              <input
                type="radio"
                name="duplicateHandling"
                value="Skip"
                checked={duplicateHandling === 'Skip'}
                onChange={(e) => onDuplicateHandlingChange(e.target.value as DuplicateHandling)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">⏭️</span>
                  <strong className="text-foreground">Skip duplicates</strong>
                  <Badge variant="outline" className="text-xs bg-primary-50 border-blue-300 text-primary-700">Recommended</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Skip importing rows that match existing work logs. Best for re-importing the same file.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors">
              <input
                type="radio"
                name="duplicateHandling"
                value="Update"
                checked={duplicateHandling === 'Update'}
                onChange={(e) => onDuplicateHandlingChange(e.target.value as DuplicateHandling)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">✏️</span>
                  <strong className="text-foreground">Update existing</strong>
                </div>
                <p className="text-sm text-muted-foreground">
                  Merge data with existing work logs. Updates will overwrite current data.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors">
              <input
                type="radio"
                name="duplicateHandling"
                value="CreateNew"
                checked={duplicateHandling === 'CreateNew'}
                onChange={(e) => onDuplicateHandlingChange(e.target.value as DuplicateHandling)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">➕</span>
                  <strong className="text-foreground">Create new anyway</strong>
                </div>
                <p className="text-sm text-muted-foreground">
                  Import all rows as new entries, even if they appear to be duplicates.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors">
              <input
                type="radio"
                name="duplicateHandling"
                value="Fail"
                checked={duplicateHandling === 'Fail'}
                onChange={(e) => onDuplicateHandlingChange(e.target.value as DuplicateHandling)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">❌</span>
                  <strong className="text-foreground">Fail on duplicates</strong>
                </div>
                <p className="text-sm text-muted-foreground">
                  Cancel the entire import if any duplicates are found. Strict mode for data integrity.
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Duplicate Rows Table */}
      {duplicateRows.length > 0 && (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-muted">
            <h3 className="text-lg font-semibold">Duplicate Rows</h3>
            <p className="text-sm text-muted-foreground mt-1">
              These rows appear similar to existing work logs in your system
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Row #</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Issue</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Operators</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Match Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {duplicateRows.map((row) => (
                  <tr key={row.rowNumber} className="hover:bg-accent">
                    <td className="px-4 py-3 text-sm">{row.rowNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="max-w-md truncate" title={row.previewData?.issueDescription || ''}>
                        {row.previewData?.issueDescription || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {row.previewData?.dateReported || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="max-w-xs truncate" title={row.previewData?.operator || ''}>
                        {row.previewData?.operator || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="text-xs w-fit bg-warning-background border-warning-border text-warning-foreground">
                          Duplicate
                        </Badge>
                        {row.duplicateOf && (
                          <span className="text-xs text-muted-foreground">
                            ID: {row.duplicateOf.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invalid Rows Table */}
      {invalidRows.length > 0 && (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-muted">
            <h3 className="text-lg font-semibold">Invalid Rows</h3>
            <p className="text-sm text-muted-foreground mt-1">
              These rows have missing or invalid data and will be skipped
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Row #</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Issue</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invalidRows.map((row) => (
                  <tr key={row.rowNumber} className="hover:bg-accent">
                    <td className="px-4 py-3 text-sm">{row.rowNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="max-w-md truncate" title={row.previewData?.issueDescription || ''}>
                        {row.previewData?.issueDescription || '(empty)'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {row.warnings.map((warning, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className={`text-xs ${
                              warning.severity === 1 // 1 = Error, 0 = Warning
                                ? 'bg-error-background border-error-border text-error-foreground' 
                                : 'bg-warning-background border-warning-border text-warning-foreground'
                            }`}
                          >
                            {warning.field}: {warning.message}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm and Cancel Buttons */}
      <div className="flex justify-end gap-4 pt-4 border-t border-border">
        <button
          className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-2 rounded-lg transition-colors"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
          onClick={onConfirm}
        >
          Confirm Import
        </button>
      </div>
    </div>
  );
}