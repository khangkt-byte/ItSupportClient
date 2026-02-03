import React from 'react';
import { AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { ImportValidationResult, DuplicateHandling } from '../types/data';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

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
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="size-5 text-green-600" />
            <span className="text-sm text-gray-600">Total Rows</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900">{validationResult.totalRows}</div>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="size-5 text-yellow-600" />
            <span className="text-sm text-gray-600">Duplicates</span>
          </div>
          <div className="text-2xl font-semibold text-yellow-700">
            {validationResult.duplicateCount}
          </div>
        </div>

        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="size-5 text-red-600" />
            <span className="text-sm text-gray-600">Invalid Rows</span>
          </div>
          <div className="text-2xl font-semibold text-red-700">
            {invalidRows.length}
          </div>
        </div>
      </div>

      {/* Duplicate Warning Alert */}
      {validationResult.duplicateCount > 0 && (
        <Alert className="border-yellow-400 bg-yellow-50">
          <AlertTriangle className="size-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Found <strong>{validationResult.duplicateCount}</strong> potential duplicate{validationResult.duplicateCount > 1 ? 's' : ''}. 
            Please choose how to handle them below.
          </AlertDescription>
        </Alert>
      )}

      {/* Invalid Rows Alert */}
      {invalidRows.length > 0 && (
        <Alert className="border-red-400 bg-red-50">
          <XCircle className="size-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Found <strong>{invalidRows.length}</strong> invalid row{invalidRows.length > 1 ? 's' : ''} with missing required fields. 
            These rows will be skipped during import.
          </AlertDescription>
        </Alert>
      )}

      {/* Duplicate Handling Options */}
      {validationResult.duplicateCount > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="size-5 text-blue-600" />
            How to handle duplicates?
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
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
                  <strong className="text-gray-900">Skip duplicates</strong>
                  <Badge variant="outline" className="text-xs bg-blue-50 border-blue-300 text-blue-700">Recommended</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Skip importing rows that match existing work logs. Best for re-importing the same file.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
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
                  <strong className="text-gray-900">Update existing</strong>
                </div>
                <p className="text-sm text-gray-600">
                  Merge data with existing work logs. Updates will overwrite current data.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
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
                  <strong className="text-gray-900">Create new anyway</strong>
                </div>
                <p className="text-sm text-gray-600">
                  Import all rows as new entries, even if they appear to be duplicates.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
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
                  <strong className="text-gray-900">Fail on duplicates</strong>
                </div>
                <p className="text-sm text-gray-600">
                  Cancel the entire import if any duplicates are found. Strict mode for data integrity.
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Duplicate Rows Table */}
      {duplicateRows.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold">Duplicate Rows</h3>
            <p className="text-sm text-gray-600 mt-1">
              These rows appear similar to existing work logs in your system
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Row #</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Issue</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Operators</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Match Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {duplicateRows.map((row) => (
                  <tr key={row.rowNumber} className="hover:bg-gray-50">
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
                        <Badge variant="outline" className="text-xs w-fit bg-yellow-50 border-yellow-400 text-yellow-700">
                          Duplicate
                        </Badge>
                        {row.duplicateOf && (
                          <span className="text-xs text-gray-500">
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
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold">Invalid Rows</h3>
            <p className="text-sm text-gray-600 mt-1">
              These rows have missing or invalid data and will be skipped
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Row #</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Issue</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invalidRows.map((row) => (
                  <tr key={row.rowNumber} className="hover:bg-gray-50">
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
                                ? 'bg-red-50 border-red-400 text-red-700' 
                                : 'bg-yellow-50 border-yellow-400 text-yellow-700'
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
      <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          onClick={onConfirm}
        >
          Confirm Import
        </button>
      </div>
    </div>
  );
}