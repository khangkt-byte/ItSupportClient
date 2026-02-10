import { useState, useMemo, useRef, useEffect, JSX } from 'react';
import { Plus, Search, Edit, Trash2, X, ChevronDown, ChevronUp, Loader2, Download, Upload, FileSpreadsheet, Clock, PlayCircle, CheckCircle2, XCircle } from 'lucide-react';
import type { WorkLog, WorkStatus, Employee, Department, Area, ImportValidationResult, DuplicateHandling, IssueLogDto } from '../types/data';
import { workLogsApi, issuesApi, causesApi } from '../api';
import { workLogToCreateDto } from '../utils/workLogAdapter';
import React from 'react';
import { SearchableCombobox } from './SearchableCombobox';
import { FlexibleMultiSelect } from './FlexibleMultiSelect';
import { AutocompleteInput, type Suggestion } from './AutocompleteInput';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from './Pagination';
import { exportWorkLogsToExcel, validateImportedWorkLogs, importWorkLogsFromExcel, downloadExcelTemplate } from '../utils/excelUtils';
import { ImportValidation } from './ImportValidation';
import { ImportWizard } from './ImportWizard';
import { PermissionGuard } from '../lib/components/PermissionGuard';
import { Permissions } from '../lib/constants/permissions';
import { ConfirmDialog } from './ConfirmDialog';

interface Props {
  data: WorkLog[];
  setData: (logs: WorkLog[]) => void;
  currentUser: string;
  loading?: boolean;
  employees: Employee[];
  departments: Department[];
  areas: Area[];
}

export function WorkLogManagement({ data, setData, currentUser, employees, departments, areas }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<WorkStatus | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WorkLog | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Import wizard state
  const [showImportWizard, setShowImportWizard] = useState(false);

  // Old import validation state (keeping for backward compatibility)
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [duplicateHandling, setDuplicateHandling] = useState<DuplicateHandling>('Skip');
  const [currentImportFile, setCurrentImportFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    reportDate: new Date().toISOString().slice(0, 10),
    operators: [currentUser], // Changed to array
    requesters: [] as string[], // Changed to array
    department: '',
    area: '',
    issue: '',
    cause: '',
    fixDescription: '',
    permanentFix: '',
    note: '',
    status: 'pending' as WorkStatus,
  });

  // Memoize employee filtering
  const itEmployees = useMemo(() => 
    employees.filter(emp => emp.department === 'IT' && !emp.deleteDate), 
    [employees]
  );
  
  const activeEmployees = useMemo(() => 
    employees.filter(emp => !emp.deleteDate), 
    [employees]
  );

  const operatorOptions = useMemo(() => 
    itEmployees.map(emp => ({
      value: emp.fullName,
      label: `${emp.fullName} (${emp.employeeId})`
    })),
    [itEmployees]
  );

  const requesterOptions = useMemo(() => 
    activeEmployees.map(emp => ({
      value: emp.fullName,
      label: `${emp.fullName} (${emp.employeeId})`
    })),
    [activeEmployees]
  );

  const departmentOptions = useMemo(() => 
    departments.map(dept => ({
      value: dept.name,
      label: dept.name
    })),
    [departments]
  );

  const areaOptions = useMemo(() => 
    areas.map(area => ({
      value: area.name,
      label: area.name
    })),
    [areas]
  );

  // Memoize filtered logs with debounced search
  const filteredLogs = useMemo(() => {
    return data.filter((log) => {
      const operators = log.operators || [];
      const requesters = log.requesters || [];
      const issue = log.issue || log.issueDescription || '';
      const matchesSearch =
        issue.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        operators.some(op => op.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        requesters.some(req => req.toLowerCase().includes(debouncedSearch.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, debouncedSearch, statusFilter]);

  // Pagination
  const pagination = usePagination({ data: filteredLogs, itemsPerPage: 20 });

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    newExpanded.has(id) ? newExpanded.delete(id) : newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const openForm = (log?: WorkLog) => {
    setEditing(log || null);
    setFormData(log ? {
      reportDate: new Date(log.reportDate).toISOString().slice(0, 10),
      operators: log.operators || [currentUser], // Use operators array or default to current user
      requesters: log.requesters || [], // Use requesters array or default to empty array
      department: log.department,
      area: log.area,
      issue: log.issue,
      cause: log.cause || '', // Fix: convert null to empty string
      fixDescription: log.fixDescription,
      permanentFix: log.permanentFix || '',
      note: log.note,
      status: log.status,
    } : {
      reportDate: new Date().toISOString().slice(0, 10),
      operators: [currentUser],
      requesters: [],
      department: '',
      area: '',
      issue: '',
      cause: '',
      fixDescription: '',
      permanentFix: '',
      note: '',
      status: 'pending',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Find department and area IDs
      const dept = departments.find(d => d.name === formData.department);
      const areaObj = areas.find(a => a.name === formData.area);
      
      // Convert formData to WorkLog format first, then to CreateIssueLogDto using adapter
      const workLogData: Partial<WorkLog> = {
        operators: [formData.operators[0] || currentUser],
        requesters: formData.requesters,
        departmentId: dept?.departmentId,
        areaId: areaObj?.areaId,
        issue: formData.issue,
        cause: formData.cause || undefined,
        fixDescription: formData.fixDescription || undefined,
        permanentFix: formData.permanentFix || undefined,
        note: formData.note || undefined,
        reportDate: formData.reportDate,
        status: formData.status as WorkStatus
      };
      
      // Use adapter to convert to API DTO
      const createDto = workLogToCreateDto(workLogData);

      if (editing) {
        // For update, use UpdateIssueLogDto
        await workLogsApi.update(editing.id, createDto);
        // Refresh the data by converting the response back to WorkLog
        const updatedWorkLog: WorkLog = {
          ...editing,
          reportDate: createDto.dateReported,
          operators: formData.operators,
          requesters: formData.requesters,
          department: formData.department,
          area: formData.area,
          issue: formData.issue,
          cause: formData.cause,
          fixDescription: formData.fixDescription,
          permanentFix: formData.permanentFix,
          note: formData.note,
          status: formData.status
        };
        setData(data.map((l) => (l.id === editing.id ? updatedWorkLog : l)));
      } else {
        // Create new log
        const newLog: IssueLogDto = await workLogsApi.create(createDto);
        // Convert IssueLogDto to WorkLog
        const newWorkLog: WorkLog = {
          ...newLog,
          id: newLog.issLogId,
          reportDate: newLog.dateReported,
          operators: formData.operators,
          requesters: formData.requesters,
          department: formData.department,
          area: formData.area,
          issue: newLog.issueDescription,
          cause: newLog.cause || '',
          fixDescription: newLog.resolution || '',
          permanentFix: newLog.permanentFix || '',
          note: newLog.notes || '',
          status: newLog.status as WorkStatus || 'pending'
        };
        setData([newWorkLog, ...data]);
      }
      
      setShowForm(false);
    } catch (error) {
      console.error('Failed to submit work log:', error);
      alert('Failed to submit work log: ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    
    try {
      await workLogsApi.deleteSingle(confirmDelete);
      setData(data.filter((l) => l.id !== confirmDelete));
      setConfirmDelete(null);
    } catch (error) {
      console.error('Failed to delete work log:', error);
      alert('Failed to delete work log: ' + (error as Error).message);
      setConfirmDelete(null);
    }
  };

  const getStatusLabel = (status: WorkStatus) => {
    const labels: Record<string, string> = {
      pending: 'PENDING',
      'in-progress': 'IN PROGRESS',
      resolved: 'RESOLVED',
      cancelled: 'CANCELLED',
    };
    return labels[status] || status?.toUpperCase() || 'UNKNOWN';
  };

  const getStatusIcon = (status: WorkStatus) => {
    const iconProps = { className: 'w-3 h-3', strokeWidth: 2.5 };
    const icons: Record<string, JSX.Element> = {
      pending: <Clock {...iconProps} />,
      'in-progress': <PlayCircle {...iconProps} />,
      resolved: <CheckCircle2 {...iconProps} />,
      cancelled: <XCircle {...iconProps} />,
    };
    return icons[status] || null;
  };

  const getStatusBadge = (status: WorkStatus) => {
    const base = 'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium leading-4 tracking-wide transition-colors';
    const styles: Record<string, string> = {
      // Pending → Warning semantic token (theme-aware, auto-adapts to light/dark)
      // Reference: Material Design 3, Bootstrap, MUI - warning colors for pending states
      pending: 'bg-warning-background text-warning-foreground ring-1 ring-inset ring-warning-border',
      
      // In Progress → Info semantic token (theme-aware, auto-adapts to light/dark)
      // Reference: IBM Carbon, Shopify Polaris, Bootstrap - info/blue for active processes
      'in-progress': 'bg-info-background text-info-foreground ring-1 ring-inset ring-info-border',
      
      // Resolved → Success semantic token (theme-aware, auto-adapts to light/dark)
      // Reference: GitHub Primer, Material Design, MUI - success/green for completion
      resolved: 'bg-success-background text-success-foreground ring-1 ring-inset ring-success-border',
      
      // Cancelled → Neutral gray (theme-aware via Tailwind dark: variant)
      // Reference: Universal design systems - gray for cancelled/neutral states
      cancelled: 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20',
    };
    return `${base} ${styles[status] || 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-600/20 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20'}`;
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      // Step 1: Validate the file and detect duplicates
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
      // Step 2: Perform the actual import with the selected duplicate handling
      const importedLogs = await importWorkLogsFromExcel(
        currentImportFile,
        duplicateHandling,
        validationResult
      );

      if (importedLogs && importedLogs.length > 0) {
        // For 'Update' handling, merge with existing data
        if (duplicateHandling === 'Update') {
          const updatedData = [...data];
          importedLogs.forEach((newLog: WorkLog) => {
            const existingIndex = updatedData.findIndex(log => log.id === newLog.id);
            if (existingIndex >= 0) {
              updatedData[existingIndex] = { ...updatedData[existingIndex], ...newLog } as WorkLog;
            } else {
              updatedData.push(newLog as WorkLog);
            }
          });
          setData(updatedData);
        } else {
          // For other handling modes, just append new logs
          setData([...data, ...importedLogs as WorkLog[]]);
        }

        alert(`Successfully imported ${importedLogs.length} work log(s)`);
      } else {
        alert('No work logs were imported');
      }

      // Close dialog and reset
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

  // Autocomplete state for KB suggestions
  const [issueSuggestions, setIssueSuggestions] = useState<Suggestion[]>([]);
  const [causeSuggestions, setCauseSuggestions] = useState<Suggestion[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Suggestion | null>(null);
  const [selectedCause, setSelectedCause] = useState<Suggestion | null>(null);
  const [loadingIssueSuggestions, setLoadingIssueSuggestions] = useState(false);
  const [loadingCauseSuggestions, setLoadingCauseSuggestions] = useState(false);

  // Search for issue suggestions
  useEffect(() => {
    const fetchIssueSuggestions = async () => {
      if (formData.issue.length < 2) {
        setIssueSuggestions([]);
        return;
      }

      setLoadingIssueSuggestions(true);
      try {
        const results = await issuesApi.getSuggestions(formData.issue);
        setIssueSuggestions(results.map(issue => ({
          id: issue.issId,
          name: issue.name,
          description: issue.description || '',
          usageCount: issue.usageCount
        })));
      } catch (error) {
        console.error('Failed to fetch issue suggestions:', error);
        setIssueSuggestions([]);
      } finally {
        setLoadingIssueSuggestions(false);
      }
    };

    const timeoutId = setTimeout(fetchIssueSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [formData.issue]);

  // When issue is selected from KB, load its common causes
  useEffect(() => {
    const loadCausesForIssue = async () => {
      if (!selectedIssue) {
        // If no KB issue selected but user is typing cause, search all causes
        if (formData.cause.length >= 2) {
          setLoadingCauseSuggestions(true);
          try {
            const results = await causesApi.getSuggestions(undefined, formData.cause);
            setCauseSuggestions(results.map(cause => ({
              id: cause.causeId,
              name: cause.name,
              description: cause.description || '',
              usageCount: cause.usageCount
            })));
          } catch (error) {
            console.error('Failed to fetch cause suggestions:', error);
            setCauseSuggestions([]);
          } finally {
            setLoadingCauseSuggestions(false);
          }
        } else {
          setCauseSuggestions([]);
        }
        return;
      }

      // If KB issue is selected, show its common causes
      setLoadingCauseSuggestions(true);
      try {
        const results = await causesApi.getSuggestions(selectedIssue.id);
        setCauseSuggestions(results.map(cause => ({
          id: cause.causeId,
          name: cause.name,
          description: cause.description || '',
          usageCount: cause.usageCount
        })));
      } catch (error) {
        console.error('Failed to fetch cause suggestions:', error);
        setCauseSuggestions([]);
      } finally {
        setLoadingCauseSuggestions(false);
      }
    };

    loadCausesForIssue();
  }, [selectedIssue, formData.cause]);

  // Handle issue selection
  const handleIssueSelect = async (suggestion: Suggestion | null) => {
    setSelectedIssue(suggestion);
    if (suggestion) {
      // Auto-load causes for this issue
      try {
        const results = await causesApi.getSuggestions(suggestion.id);
        setCauseSuggestions(results.map(cause => ({
          id: cause.causeId,
          name: cause.name,
          description: cause.description || '',
          usageCount: cause.usageCount
        })));
      } catch (error) {
        console.error('Failed to fetch causes for issue:', error);
        setCauseSuggestions([]);
      }
    } else {
      setCauseSuggestions([]);
    }
  };

  // Handle cause selection
  const handleCauseSelect = (suggestion: Suggestion | null) => {
    setSelectedCause(suggestion);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div><h2 className="text-2xl font-semibold">Work Log Management</h2></div>
        <PermissionGuard 
          permission={Permissions.IssueLog.Create}
          fallback={
            <button disabled className="btn-primary px-4 py-2 flex items-center gap-2 opacity-50">
              <Plus className="w-5 h-5" />New Work Log
            </button>
          }
        >
          <button onClick={() => openForm()} className="btn-primary px-4 py-2 flex items-center gap-2">
            <Plus className="w-5 h-5" />New Work Log
          </button>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4"><p className="text-sm text-gray-500 dark:text-gray-400">Total</p><p className="text-2xl font-semibold text-gray-900 dark:text-gray-50">{data.length}</p></div>
        <div className="card p-4"><p className="text-sm text-gray-500 dark:text-gray-400">Pending</p><p className="text-2xl font-semibold text-warning">{data.filter((l) => l.status === 'pending').length}</p></div>
        <div className="card p-4"><p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p><p className="text-2xl font-semibold text-info">{data.filter((l) => l.status === 'in-progress').length}</p></div>
        <div className="card p-4"><p className="text-sm text-gray-500 dark:text-gray-400">Resolved</p><p className="text-2xl font-semibold text-success">{data.filter((l) => l.status === 'resolved').length}</p></div>
      </div>

      <div className="card p-4 grid grid-cols-2 gap-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500" /></div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as WorkStatus | 'all')} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Operator</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Requester</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Department</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Issue</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {pagination.paginatedData.map((log) => (
              <React.Fragment key={log.id}>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-50">{new Date(log.reportDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-50">{(log.operators || []).join(', ')}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-50">{(log.requesters || []).join(', ') || 'None'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-50">{log.department}</td>
                  <td className="px-4 py-3 text-sm"><button onClick={() => toggleRow(log.id)} className="text-left hover:text-primary-600 dark:hover:text-primary-400 line-clamp-2 text-gray-900 dark:text-gray-50">{log.issue}</button></td>
                  <td className="px-4 py-3 text-sm">
                    <span className={getStatusBadge(log.status)}>
                      {getStatusIcon(log.status)}
                      {getStatusLabel(log.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="inline-flex items-center gap-2">
                      <button 
                        onClick={() => toggleRow(log.id)} 
                        className="text-primary-600 inline-flex items-center justify-center hover:text-primary-800 transition-colors min-w-[16px] min-h-[16px]"
                        title={expandedRows.has(log.id) ? "Collapse details" : "Expand details"}
                      >
                        {expandedRows.has(log.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <PermissionGuard 
                        permission={Permissions.IssueLog.Edit}
                        fallback={null}
                      >
                        <button 
                          onClick={() => openForm(log)} 
                          className="text-primary-600 inline-flex items-center justify-center hover:text-primary-800 transition-colors min-w-[16px] min-h-[16px]"
                          title="Edit work log"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard 
                        permission={Permissions.IssueLog.Delete}
                        fallback={null}
                      >
                        <button 
                          onClick={() => setConfirmDelete(log.id)} 
                          className="text-red-600 inline-flex items-center justify-center hover:text-red-800 transition-colors min-w-[16px] min-h-[16px]"
                          title="Delete work log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
                {expandedRows.has(log.id) && (
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <td colSpan={7} className="px-4 py-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><p className="font-medium mb-1 text-gray-700 dark:text-gray-300">Area:</p><p className="text-gray-600 dark:text-gray-400">{log.area || 'N/A'}</p></div>
                        <div><p className="font-medium mb-1 text-gray-700 dark:text-gray-300">Cause:</p><p className="text-gray-600 dark:text-gray-400">{log.cause || 'N/A'}</p></div>
                        <div><p className="font-medium mb-1 text-gray-700 dark:text-gray-300">Fix:</p><p className="text-gray-600 dark:text-gray-400">{log.fixDescription || 'N/A'}</p></div>
                        {log.permanentFix && <div><p className="font-medium mb-1 text-gray-700 dark:text-gray-300">Permanent Fix:</p><p className="text-gray-600 dark:text-gray-400">{log.permanentFix}</p></div>}
                        {log.note && <div><p className="font-medium mb-1 text-gray-700 dark:text-gray-300">Note:</p><p className="text-gray-600 dark:text-gray-400">{log.note}</p></div>}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        <Pagination 
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.goToPage}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          totalItems={filteredLogs.length}
          itemsPerPage={20}
        />
      </div>

      {showForm && (
        <PermissionGuard 
          permission={editing ? Permissions.IssueLog.Edit : Permissions.IssueLog.Create}
          fallback={
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-sm text-center">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Access Denied</h3>
                <p className="text-gray-600 mb-4">You don't have permission to {editing ? 'edit' : 'create'} work logs.</p>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Close</button>
              </div>
            </div>
          }
        >
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between sticky top-0 bg-white dark:bg-gray-800 z-[60]"><h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{editing ? 'Edit' : 'New'} Work Log</h3><button onClick={() => setShowForm(false)} className="hover:text-gray-600 dark:hover:text-gray-400"><X className="w-6 h-6" /></button></div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input type="date" required value={formData.reportDate} onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select required value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkStatus })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors">
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Operators (IT Department) <span className="text-red-500">*</span>
                  </label>
                  <FlexibleMultiSelect 
                    options={operatorOptions} 
                    values={formData.operators} 
                    onChange={(values) => setFormData({ ...formData, operators: values })} 
                    placeholder="Select IT operators or type custom name..."
                    label=""
                    required
                    allowCustom={true}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Requesters</label>
                  <FlexibleMultiSelect 
                    options={requesterOptions} 
                    values={formData.requesters} 
                    onChange={(values) => setFormData({ ...formData, requesters: values })} 
                    placeholder="Select requesters or type custom name..."
                    label=""
                    allowCustom={true}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <SearchableCombobox 
                    options={departmentOptions} 
                    value={formData.department} 
                    onChange={(value) => setFormData({ ...formData, department: value })} 
                    placeholder="Select department..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Area <span className="text-red-500">*</span>
                  </label>
                  <SearchableCombobox 
                    options={areaOptions} 
                    value={formData.area} 
                    onChange={(value) => setFormData({ ...formData, area: value })} 
                    placeholder="Select area..."
                    required
                  />
                </div>
              </div>
              <AutocompleteInput 
                value={formData.issue} 
                onChange={(value) => setFormData({ ...formData, issue: value })} 
                onSelect={handleIssueSelect}
                selectedSuggestion={selectedIssue}
                suggestions={issueSuggestions} 
                loading={loadingIssueSuggestions}
                label="Issue Description"
                required
                placeholder="Start typing to see suggestions from knowledge base..."
                suggestionHeader=""
              />
              <AutocompleteInput 
                value={formData.cause} 
                onChange={(value) => setFormData({ ...formData, cause: value })} 
                onSelect={handleCauseSelect}
                selectedSuggestion={selectedCause}
                suggestions={causeSuggestions} 
                loading={loadingCauseSuggestions}
                label="Cause"
                placeholder={selectedIssue ? `Common causes for "${selectedIssue.name}"...` : "Start typing to see suggestions..."}
                suggestionHeader={selectedIssue ? `💡 Common Causes for "${selectedIssue.name}"` : " Suggested Causes"}
              />
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Fix Description</label>
                <textarea value={formData.fixDescription} onChange={(e) => setFormData({ ...formData, fixDescription: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Permanent Fix</label>
                <textarea value={formData.permanentFix} onChange={(e) => setFormData({ ...formData, permanentFix: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Note</label>
                <textarea value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1 px-4 py-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 px-4 py-2">Cancel</button>
              </div>
            </form>
            </div>
          </div>
        </PermissionGuard>
      )}

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-50">Excel Import/Export</h3>
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => exportWorkLogsToExcel(data)} 
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export to Excel
          </button>
          <button 
            onClick={() => setShowImportWizard(true)} 
            disabled={importing}
            className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
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
        <p className="text-sm text-gray-500 mt-4">
          <strong>Note:</strong> The Excel template follows your existing work log format with columns: Report Date, Operators (comma-separated for multiple), Requesters (comma-separated for multiple, optional), Department, Area, Issue Description, Cause, Fix Description, Permanent Fix, Notes, and Status.
        </p>
      </div>

      {showImportDialog && validationResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between sticky top-0 bg-white z-[60]">
              <h3 className="text-lg font-semibold">Import Validation</h3>
              <button onClick={handleCancelImport} className="hover:text-gray-600"><X className="w-6 h-6" /></button>
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

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        action="delete"
        title="Delete work log"
        description="Are you sure you want to delete this work log? This action cannot be undone."
      />
    </div>
  );
}