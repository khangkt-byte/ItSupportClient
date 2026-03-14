import { useRef, useState } from 'react';
import { Download, FileSpreadsheet, Upload, X } from 'lucide-react';
import type { Area, Department, DuplicateHandling, Employee, ImportValidationResult, WorkLog } from '@/types/data';
import { exportWorkLogsToExcel, validateImportedWorkLogs, importWorkLogsFromExcel, downloadExcelTemplate } from '@/utils/excelUtils';
import { workLogsApi } from '@/services/api';
import { mapIssueLogToWorkLog } from '@/features/workLogs/hooks/useWorkLogQuery';
import { ImportValidation } from '@/features/workLogs/components/ImportValidation';
import { ImportWizard } from '@/features/workLogs/components/ImportWizard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getApiErrorMessage } from '@/utils/apiValidation';

interface WorkLogImportExportPanelProps {
  /** Current page items — used by ImportWizard for client-side duplicate detection. */
  currentItems: WorkLog[];
  /** Reload the work log list from the server. */
  refetch: () => Promise<void>;
  employees: Employee[];
  departments: Department[];
  areas: Area[];
}

export function WorkLogImportExportPanel({
  currentItems,
  refetch,
  employees,
  departments,
  areas,
}: WorkLogImportExportPanelProps) {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [duplicateHandling, setDuplicateHandling] = useState<DuplicateHandling>('Skip');
  const [currentImportFile, setCurrentImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);
    setImporting(true);
    try {
      const validation = await validateImportedWorkLogs(file, currentItems);
      setValidationResult(validation);
      setCurrentImportFile(file);
      setShowImportDialog(true);
    } catch (error) {
      setImportError(getApiErrorMessage(error, 'Failed to validate Excel file'));
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmImport = async () => {
    if (!currentImportFile || !validationResult) return;

    setImportError(null);
    setImporting(true);
    try {
      const importedLogs = await importWorkLogsFromExcel(
        currentImportFile,
        duplicateHandling,
        validationResult
      );

      const count = importedLogs?.length ?? 0;
      await refetch();
      setImportSuccess(count > 0 ? `Successfully imported ${count} work log(s)` : 'No work logs were imported');

      setShowImportDialog(false);
      setValidationResult(null);
      setCurrentImportFile(null);
      setDuplicateHandling('Skip');
    } catch (error) {
      setImportError(getApiErrorMessage(error, 'Failed to import Excel file'));
    } finally {
      setImporting(false);
    }
  };

  const handleCancelImport = () => {
    setShowImportDialog(false);
    setValidationResult(null);
    setCurrentImportFile(null);
    setDuplicateHandling('Skip');
    setImportError(null);
  };

  return (
    <>
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Excel Import/Export</h3>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={async () => {
              setExporting(true);
              try {
                const result = await workLogsApi.getAll({ page: 1, pageSize: 10000 });
                exportWorkLogsToExcel(result.items.map(mapIssueLogToWorkLog));
              } finally {
                setExporting(false);
              }
            }}
            disabled={exporting}
            className="px-4 py-3 bg-primary-600 text-primary-foreground rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <>
                <LoadingSpinner size="sm" tone="current" className="w-5 h-5" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export to Excel
              </>
            )}
          </button>
          <button
            onClick={() => setShowImportWizard(true)}
            disabled={importing}
            className="px-4 py-3 bg-primary-600 text-primary-foreground rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? (
              <>
                <LoadingSpinner size="sm" tone="current" className="w-5 h-5" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Import from Excel
              </>
            )}
          </button>
          <button
            onClick={() => downloadExcelTemplate()}
            className="px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Download Template
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          className="hidden"
          accept=".xlsx, .xls"
        />
        {(importError || importSuccess) && (
          <div className={`mt-4 p-3 rounded-md text-sm border ${
            importError
              ? 'bg-destructive/10 text-destructive border-destructive/20'
              : 'bg-success-background text-success-foreground border-success-border'
          }`}>
            {importError || importSuccess}
          </div>
        )}
        <p className="text-sm text-muted-foreground mt-4">
          <strong>Note:</strong> The Excel template follows your existing work log format with columns: Report Date,
          Operators (comma-separated for multiple), Requesters (comma-separated for multiple, optional), Department,
          Area, Issue Description, Cause, Fix Description, Permanent Fix, Notes, and Status.
        </p>
      </div>

      {showImportDialog && validationResult && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-60 p-4 overflow-y-auto h-screen w-screen">
          <div className="bg-card rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between sticky top-0 bg-card z-60">
              <h3 className="text-lg font-semibold">Import Validation</h3>
              <button onClick={handleCancelImport} className="hover:text-muted-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>
            {importError && (
              <div className="px-6 py-3 bg-destructive/10 text-destructive border-b border-destructive/20 text-sm">
                {importError}
              </div>
            )}
            <div className="p-6">
              <ImportValidation
                validationResult={validationResult}
                duplicateHandling={duplicateHandling}
                onDuplicateHandlingChange={setDuplicateHandling}
                onConfirm={handleConfirmImport}
                onCancel={handleCancelImport}
              />
            </div>
          </div>
        </div>
      )}

      {showImportWizard && (
        <ImportWizard
          existingWorkLogs={currentItems}
          employees={employees}
          departments={departments}
          areas={areas}
          onImportComplete={async () => {
            await refetch();
            setShowImportWizard(false);
          }}
          onClose={() => setShowImportWizard(false)}
        />
      )}
    </>
  );
}
