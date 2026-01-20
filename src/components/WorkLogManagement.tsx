import { useState, useMemo, useRef } from 'react';
import { Plus, Search, Edit, Trash2, X, ChevronDown, ChevronUp, Loader2, Download, Upload, FileSpreadsheet } from 'lucide-react';
import type { WorkLog, WorkStatus, Employee, Department, Area } from '../types/data';
import { workLogsApi } from '../api';
import React from 'react';
import { SearchableCombobox } from './SearchableCombobox';
import { MultiSelectCombobox } from './MultiSelectCombobox';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from './Pagination';
import { exportWorkLogsToExcel, importWorkLogsFromExcel, downloadExcelTemplate } from '../utils/excelUtils';

interface Props {
  data: WorkLog[];
  setData: (logs: WorkLog[]) => void;
  currentUser: string;
  loading?: boolean;
  employees: Employee[];
  departments: Department[];
  areas: Area[];
}

export function WorkLogManagement({ data, setData, currentUser, loading = false, employees, departments, areas }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<WorkStatus | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WorkLog | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    reportDate: new Date().toISOString().slice(0, 16),
    operators: [currentUser], // Changed to array
    requesters: [] as string[], // Changed to array
    department: '',
    area: '',
    issue: '',
    cause: '',
    fixDescription: '',
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
      const matchesSearch =
        log.issue.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
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
      reportDate: new Date(log.reportDate).toISOString().slice(0, 16),
      operators: log.operators || [currentUser], // Use operators array or default to current user
      requesters: log.requesters || [], // Use requesters array or default to empty array
      department: log.department,
      area: log.area,
      issue: log.issue,
      cause: log.cause,
      fixDescription: log.fixDescription,
      note: log.note,
      status: log.status,
    } : {
      reportDate: new Date().toISOString().slice(0, 16),
      operators: [currentUser],
      requesters: [],
      department: '',
      area: '',
      issue: '',
      cause: '',
      fixDescription: '',
      note: '',
      status: 'pending',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const logData = { ...formData, reportDate: new Date(formData.reportDate) };
    if (editing) {
      await workLogsApi.update(editing.id, logData);
      setData(data.map((l) => (l.id === editing.id ? { ...l, ...logData } : l)));
    } else {
      const newLog = await workLogsApi.create(logData);
      setData([{ ...newLog, id: Date.now().toString() }, ...data]);
    }
    setShowForm(false);
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this work log?')) {
      await workLogsApi.delete(id);
      setData(data.filter((l) => l.id !== id));
    }
  };

  const getStatusBadge = (status: WorkStatus) => {
    const styles = {
      pending: 'bg-yellow-50 text-yellow-700',
      'in-progress': 'bg-blue-50 text-blue-700',
      completed: 'bg-green-50 text-green-700',
      cancelled: 'bg-gray-50 text-gray-700',
    };
    return styles[status];
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const importedLogs = await importWorkLogsFromExcel(file);
      if (importedLogs && importedLogs.length > 0) {
        setData([...data, ...importedLogs as WorkLog[]]);
        alert(`Successfully imported ${importedLogs.length} work log(s)`);
      } else {
        alert('No valid work logs found in the file');
      }
    } catch (error) {
      alert('Failed to import Excel file: ' + (error as Error).message);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div><h2 className="text-2xl font-semibold">Work Log Management</h2></div>
        <button onClick={() => openForm()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-5 h-5" />New Work Log
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-semibold">{data.length}</p></div>
        <div className="bg-white border rounded-lg p-4"><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-semibold text-yellow-600">{data.filter((l) => l.status === 'pending').length}</p></div>
        <div className="bg-white border rounded-lg p-4"><p className="text-sm text-gray-500">In Progress</p><p className="text-2xl font-semibold text-blue-600">{data.filter((l) => l.status === 'in-progress').length}</p></div>
        <div className="bg-white border rounded-lg p-4"><p className="text-sm text-gray-500">Completed</p><p className="text-2xl font-semibold text-green-600">{data.filter((l) => l.status === 'completed').length}</p></div>
      </div>

      <div className="bg-white rounded-lg border p-4 grid grid-cols-2 gap-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as WorkStatus | 'all')} className="px-4 py-2 border rounded-lg">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operator</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagination.paginatedData.map((log) => (
              <React.Fragment key={log.id}>
                <tr className="hover:bg-gray-50 border-b">
                  <td className="px-4 py-3 text-sm">{new Date(log.reportDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                  <td className="px-4 py-3 text-sm">{(log.operators || []).join(', ')}</td>
                  <td className="px-4 py-3 text-sm">{(log.requesters || []).join(', ') || 'None'}</td>
                  <td className="px-4 py-3 text-sm">{log.department}</td>
                  <td className="px-4 py-3 text-sm"><button onClick={() => toggleRow(log.id)} className="text-left hover:text-blue-600 line-clamp-2">{log.issue}</button></td>
                  <td className="px-4 py-3 text-sm"><span className={`px-2 py-1 text-xs rounded ${getStatusBadge(log.status)}`}>{log.status}</span></td>
                  <td className="px-4 py-3 text-sm text-right">
                    <button onClick={() => toggleRow(log.id)} className="text-blue-600 mr-2">{expandedRows.has(log.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
                    <button onClick={() => openForm(log)} className="text-blue-600 mr-2"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(log.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
                {expandedRows.has(log.id) && (
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="px-4 py-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><p className="font-medium mb-1">Cause:</p><p className="text-gray-600">{log.cause}</p></div>
                        <div><p className="font-medium mb-1">Fix:</p><p className="text-gray-600">{log.fixDescription}</p></div>
                        {log.note && <div className="col-span-2"><p className="font-medium mb-1">Note:</p><p className="text-gray-600">{log.note}</p></div>}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between sticky top-0 bg-white z-[60]"><h3 className="text-lg font-semibold">{editing ? 'Edit' : 'New'} Work Log</h3><button onClick={() => setShowForm(false)}><X className="w-6 h-6" /></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Date *</label><input type="datetime-local" required value={formData.reportDate} onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Status *</label><select required value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkStatus })} className="w-full px-3 py-2 border rounded-lg"><option value="pending">Pending</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Operators (IT Department) *</label>
                  <MultiSelectCombobox 
                    options={operatorOptions} 
                    values={formData.operators} 
                    onChange={(values) => setFormData({ ...formData, operators: values })} 
                    placeholder="Select IT operators..."
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Requesters (Optional)</label>
                  <MultiSelectCombobox 
                    options={requesterOptions} 
                    values={formData.requesters} 
                    onChange={(values) => setFormData({ ...formData, requesters: values })} 
                    placeholder="Select requesters (optional)..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department *</label>
                  <SearchableCombobox 
                    options={departmentOptions} 
                    value={formData.department} 
                    onChange={(value) => setFormData({ ...formData, department: value })} 
                    placeholder="Select department..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Area *</label>
                  <SearchableCombobox 
                    options={areaOptions} 
                    value={formData.area} 
                    onChange={(value) => setFormData({ ...formData, area: value })} 
                    placeholder="Select area..."
                    required
                  />
                </div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Issue *</label><textarea required value={formData.issue} onChange={(e) => setFormData({ ...formData, issue: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Cause *</label><textarea required value={formData.cause} onChange={(e) => setFormData({ ...formData, cause: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Fix Description *</label><textarea required value={formData.fixDescription} onChange={(e) => setFormData({ ...formData, fixDescription: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Note</label><textarea value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Excel Import/Export</h3>
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => exportWorkLogsToExcel(data)} 
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export to Excel
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={importing}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <strong>Note:</strong> The Excel template follows your existing work log format with columns: Report Date, Operators (comma-separated for multiple), Requesters (comma-separated for multiple, optional), Department, Area, Issue Description, Cause, Fix Description, Notes, and Status.
        </p>
      </div>
    </div>
  );
}