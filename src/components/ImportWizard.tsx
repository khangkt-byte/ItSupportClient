import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle, AlertTriangle, FileSpreadsheet, ArrowLeft } from 'lucide-react';
import type { WorkLog, Employee, Department, Area } from '../types/data';
import { 
  validateWorkLogFile, 
  importWorkLogsWithOptions, 
  type EnhancedValidationResult,
  type ImportOptions,
  type ImportResult,
  type RowValidation,
  type FieldError
} from '../utils/enhancedExcelUtils';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

interface Props {
  existingWorkLogs: WorkLog[];
  employees: Employee[];
  departments: Department[];
  areas: Area[];
  onImportComplete: (logs: WorkLog[]) => void;
  onClose: () => void;
}

export function ImportWizard({
  existingWorkLogs,
  employees,
  departments,
  areas,
  onImportComplete,
  onClose
}: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validationResult, setValidationResult] = useState<EnhancedValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importOptions, setImportOptions] = useState<ImportOptions>({
    skipRowsWithErrors: true,
    autoCreateMissingEntities: false,
    fuzzyMatchThreshold: 85,
    manualMappings: {}
  });

  // File upload handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
        setFile(droppedFile);
      } else {
        alert('Please upload an Excel file (.xlsx or .xls)');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Validation
  const handleValidate = async () => {
    if (!file) return;

    setValidating(true);
    try {
      const result = await validateWorkLogFile(
        file,
        existingWorkLogs,
        employees,
        departments,
        areas
      );
      setValidationResult(result);
      setStep(2);
    } catch (error) {
      alert('Validation failed: ' + (error as Error).message);
    } finally {
      setValidating(false);
    }
  };

  // Import
  const handleConfirmImport = async () => {
    if (!file || !validationResult) return;

    setImporting(true);
    try {
      const result = await importWorkLogsWithOptions(
        file,
        validationResult,
        importOptions,
        existingWorkLogs,
        employees,
        departments,
        areas
      );
      
      setImportResult(result);
      setStep(3);
      
      if (result.importedLogs.length > 0) {
        onImportComplete(result.importedLogs as WorkLog[]);
      }
    } catch (error) {
      alert('Import failed: ' + (error as Error).message);
    } finally {
      setImporting(false);
    }
  };

  const applySuggestion = (rowNumber: number, fieldName: string, suggestedValue: string, suggestedId?: string) => {
    if (!validationResult) return;

    // Update manual mappings
    if (suggestedId) {
      setImportOptions(prev => ({
        ...prev,
        manualMappings: {
          ...prev.manualMappings,
          [`${fieldName}:${validationResult.rows.find(r => r.rowNumber === rowNumber)?.errors.find(e => e.field === fieldName)?.originalValue}`]: suggestedId
        }
      }));
    }

    // Update validation result to reflect the change
    const updatedRows = validationResult.rows.map(row => {
      if (row.rowNumber === rowNumber) {
        return {
          ...row,
          errors: row.errors.filter(e => e.field !== fieldName),
          hasErrors: row.errors.filter(e => e.field !== fieldName).length > 0
        };
      }
      return row;
    });

    setValidationResult({
      ...validationResult,
      rows: updatedRows,
      errorCount: updatedRows.filter(r => r.hasErrors).length
    });
  };

  const calculateMatchScore = (error: FieldError): number => {
    return error.matchScore || 0;
  };

  const rowsWithIssues = validationResult?.rows.filter(r => r.hasErrors || r.hasWarnings) || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Import Work Logs from Excel</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Step {step} of 3: {step === 1 ? 'Upload File' : step === 2 ? 'Validation & Preview' : 'Import Results'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* STEP 1: UPLOAD & VALIDATE */}
          {step === 1 && (
            <div className="space-y-6">
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FileSpreadsheet className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  {file ? file.name : 'Drag & drop your Excel file here'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  or click to browse
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Choose File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".xlsx,.xls"
                  className="hidden"
                />
              </div>

              {file && (
                <div className="bg-success-background border border-success-border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-success" />
                    <div className="flex-1">
                      <p className="font-medium text-success-foreground">{file.name}</p>
                      <p className="text-sm text-success">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="btn-secondary px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleValidate}
                  disabled={!file || validating}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {validating ? 'Validating...' : 'Validate & Preview'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: VALIDATION RESULT & PREVIEW */}
          {step === 2 && validationResult && (
            <div className="space-y-6">
              {/* Summary Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-success-background border border-success-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Valid Rows</span>
                  </div>
                  <div className="text-2xl font-semibold text-success-foreground">
                    {validationResult.validCount}
                  </div>
                </div>

                <div className="bg-warning-background border border-warning-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Warnings</span>
                  </div>
                  <div className="text-2xl font-semibold text-warning-foreground">
                    {validationResult.warningCount}
                  </div>
                </div>

                <div className="bg-error-background border border-error-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-error" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Errors</span>
                  </div>
                  <div className="text-2xl font-semibold text-error-foreground">
                    {validationResult.errorCount}
                  </div>
                </div>
              </div>

              {/* Errors & Warnings Table */}
              {rowsWithIssues.length > 0 && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-50">Issues Found</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Review and fix errors before importing
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Row</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Field</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Original Value</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Suggestion</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {rowsWithIssues.map((row) => (
                          <React.Fragment key={row.rowNumber}>
                            {row.errors.map((error, idx) => (
                              <tr key={`${row.rowNumber}-error-${idx}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-50">{row.rowNumber}</td>
                                <td className="px-4 py-3 text-sm">
                                  <Badge variant="outline" className="bg-error-background border-error-border text-error-foreground">
                                    {error.field}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {error.originalValue || '(empty)'}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {error.suggestedValue ? (
                                    <div>
                                      <span className="font-medium text-success">
                                        {error.suggestedValue}
                                      </span>
                                      {error.matchScore && (
                                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                          ({calculateMatchScore(error)}% match)
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 dark:text-gray-500">No suggestion</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {error.suggestedValue && (
                                    <button
                                      onClick={() => applySuggestion(
                                        row.rowNumber, 
                                        error.field, 
                                        error.suggestedValue!, 
                                        error.suggestedId
                                      )}
                                      className="px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700"
                                    >
                                      Apply
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                            {row.warnings.map((warning, idx) => (
                              <tr key={`${row.rowNumber}-warning-${idx}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-50">{row.rowNumber}</td>
                                <td className="px-4 py-3 text-sm">
                                  <Badge variant="outline" className="bg-warning-background border-warning-border text-warning-foreground">
                                    {warning.field}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-sm" colSpan={3}>
                                  {warning.message}
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Preview Table */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-50">Preview (First 10 rows)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Row</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Operators</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Department</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Area</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Issue</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {validationResult.rows.slice(0, 10).map((row) => (
                        <tr 
                          key={row.rowNumber}
                          className={`${
                            row.hasErrors ? 'bg-red-50 dark:bg-red-900/20' : row.hasWarnings ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <td className="px-4 py-3 text-gray-900 dark:text-gray-50">{row.rowNumber}</td>
                          <td className="px-4 py-3 text-gray-900 dark:text-gray-50">{row.previewData?.operators || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-gray-500 dark:text-gray-400 text-xs">{row.previewData?.department || 'N/A'}</span>
                              <span className={row.mappedDepartmentName ? 'font-medium text-gray-900 dark:text-gray-50' : 'text-red-600 dark:text-red-400'}>
                                {row.mappedDepartmentName ? `→ ${row.mappedDepartmentName}` : '❌ Not found'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-gray-500 text-xs">{row.previewData?.area || 'N/A'}</span>
                              <span className={row.mappedAreaName ? 'font-medium' : 'text-red-600'}>
                                {row.mappedAreaName ? `→ ${row.mappedAreaName}` : '❌ Not found'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 max-w-xs truncate" title={row.previewData?.issueDescription || ''}>
                            {row.previewData?.issueDescription || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            {row.hasErrors && <Badge variant="outline" className="bg-error-background border-error-border text-error-foreground">Error</Badge>}
                            {row.hasWarnings && !row.hasErrors && <Badge variant="outline" className="bg-warning-background border-warning-border text-warning-foreground">Warning</Badge>}
                            {!row.hasErrors && !row.hasWarnings && <Badge variant="outline" className="bg-success-background border-success-border text-success-foreground">Valid</Badge>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Import Options */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-50">Import Options</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={importOptions.skipRowsWithErrors}
                      onChange={(e) => setImportOptions({ ...importOptions, skipRowsWithErrors: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Skip rows with errors (import valid rows only)</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={importOptions.autoCreateMissingEntities}
                      onChange={(e) => setImportOptions({ ...importOptions, autoCreateMissingEntities: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Auto-create missing departments and areas</span>
                  </label>

                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium">Fuzzy match threshold:</label>
                    <input
                      type="range"
                      min="70"
                      max="100"
                      value={importOptions.fuzzyMatchThreshold}
                      onChange={(e) => setImportOptions({ ...importOptions, fuzzyMatchThreshold: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">{importOptions.fuzzyMatchThreshold}%</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={importing || (validationResult.errorCount > 0 && !importOptions.skipRowsWithErrors)}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? 'Importing...' : validationResult.errorCount > 0 ? 'Import Valid Rows Only' : 'Import All Rows'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: IMPORT RESULT */}
          {step === 3 && importResult && (
            <div className="space-y-6">
              <div className={`text-center p-8 rounded-lg ${
                importResult.hasErrors ? 'bg-warning-background border border-warning-border' : 'bg-success-background border border-success-border'
              }`}>
                {importResult.hasErrors ? (
                  <AlertTriangle className="w-16 h-16 mx-auto text-warning mb-4" />
                ) : (
                  <CheckCircle className="w-16 h-16 mx-auto text-success mb-4" />
                )}
                <h3 className="text-2xl font-semibold mb-2">
                  {importResult.hasErrors ? 'Import Completed with Warnings' : 'Import Successful!'}
                </h3>
                <p className="text-gray-700">{importResult.summary}</p>
              </div>

              {/* Import Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Imported</p>
                  <p className="text-2xl font-semibold text-success">{importResult.successCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Auto-matched</p>
                  <p className="text-2xl font-semibold text-info">{importResult.autoMatched}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Entities Created</p>
                  <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">{importResult.entitiesCreated}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Skipped</p>
                  <p className="text-2xl font-semibold text-gray-600 dark:text-gray-400">{importResult.skippedCount}</p>
                </div>
              </div>

              {/* Errors */}
              {importResult.errors.length > 0 && (
                <Alert className="border-red-400 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
                  <AlertCircle className="size-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Errors encountered:</strong>
                    <ul className="list-disc list-inside mt-2">
                      {importResult.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}