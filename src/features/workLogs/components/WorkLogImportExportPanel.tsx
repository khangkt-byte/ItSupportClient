import { useRef, useState } from 'react';
import { Download, FileSpreadsheet, Loader2, Upload, X } from 'lucide-react';
import type { Area, Department, DuplicateHandling, Employee, ImportValidationResult, WorkLog } from '@/types/data';
import { exportWorkLogsToExcel, validateImportedWorkLogs, importWorkLogsFromExcel, downloadExcelTemplate } from '@/utils/excelUtils';
import { ImportValidation } from '@/features/workLogs/components/ImportValidation';
import { ImportWizard } from '@/features/workLogs/components/ImportWizard';

interface WorkLogImportExportPanelProps {
  data: WorkLog[];
  setData: (logs: WorkLog[]) => void;
  employees: Employee[];
  departments: Department[];
  areas: Area[];
}

export function WorkLogImportExportPanel({
  data,
  setData,
  employees,
  departments,
  areas,
}: WorkLogImportExportPanelProps) {
  const [importing, setImporting] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [duplicateHandling, setDuplicateHandling] = useState<DuplicateHandling>('Skip');
  const [currentImportFile, setCurrentImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const validation = await validateImportedWorkLogs(file, data);
      setValidationResult(validation);
      setCurrentImportFile(file);
      setShowImportDialog(true);
    } catch (error) {
      alert('Failed to validate Excel file: ' + (error as Error).message);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmImport = async () => {
    if (!currentImportFile || !validationResult) return;

    setImporting(true);
    try {
      const importedLogs = await importWorkLogsFromExcel(
        currentImportFile,
        duplicateHandling,
        validationResult
      );

      if (importedLogs && importedLogs.length > 0) {
        if (duplicateHandling === 'Update') {
          const updatedData = [...data];
          importedLogs.forEach((newLog: WorkLog) => {
            const existingIndex = updatedData.findIndex((log) => log.id === newLog.id);
            if (existingIndex >= 0) {
              updatedData[existingIndex] = { ...updatedData[existingIndex], ...newLog } as WorkLog;
            } else {
              updatedData.push(newLog as WorkLog);
            }
          });
          setData(updatedData);
        } else {
          setData([...data, ...(importedLogs as WorkLog[])]);
        }

        alert(`Successfully imported ${importedLogs.length} work log(s)`);
      } else {
        alert('No work logs were imported');
      }

      setShowImportDialog(false);
      setValidationResult(null);
      setCurrentImportFile(null);
      setDuplicateHandling('Skip');
    } catch (error) {
      alert('Failed to import Excel file: ' + (error as Error).message);
    } finally {
      setImporting(false);
    }
  };

  const handleCancelImport = () => {
    setShowImportDialog(false);
    setValidationResult(null);
    setCurrentImportFile(null);
    setDuplicateHandling('Skip');
  };

  return (
    <>
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Excel Import/Export</h3>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => exportWorkLogsToExcel(data)}
            className="px-4 py-3 bg-primary-600 text-primary-foreground rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export to Excel
          </button>
          <button
            onClick={() => setShowImportWizard(true)}
            disabled={importing}
            className="px-4 py-3 bg-primary-600 text-primary-foreground rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
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
          existingWorkLogs={data}
          employees={employees}
          departments={departments}
          areas={areas}
          onImportComplete={(logs) => {
            setData([...data, ...logs]);
            setShowImportWizard(false);
          }}
          onClose={() => setShowImportWizard(false)}
        />
      )}
    </>
  );
}
