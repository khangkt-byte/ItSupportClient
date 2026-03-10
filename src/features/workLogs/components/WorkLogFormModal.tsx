import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Clock, Save, X } from 'lucide-react';
import type { Area, Department, Employee, WorkLog, WorkStatus } from '@/types/data';
import { causesApi, issuesApi } from '@/services/api';
import { SearchableCombobox } from '@/components/common/SearchableCombobox';
import { FlexibleMultiSelect } from '@/components/common/FlexibleMultiSelect';
import { AutocompleteInput, type Suggestion } from '@/components/common/AutocompleteInput';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { Permissions } from '@/config/permissions';

export interface WorkLogFormData {
  reportDate: string;
  operators: string[];
  requesters: string[];
  department: string;
  area: string;
  issue: string;
  cause: string;
  fixDescription: string;
  permanentFix: string;
  note: string;
  status: WorkStatus;
}

interface WorkLogFormModalProps {
  isOpen: boolean;
  editing: WorkLog | null;
  currentUser: string;
  employees: Employee[];
  departments: Department[];
  areas: Area[];
  submitting: boolean;
  error: string | null;
  onSubmit: (formData: WorkLogFormData) => Promise<void>;
  onClose: () => void;
  onClearError: () => void;
}

function getInitialFormData(editing: WorkLog | null): WorkLogFormData {
  if (editing) {
    return {
      reportDate: new Date(editing.reportDate).toISOString().slice(0, 10),
      operators: editing.operators || [],
      requesters: editing.requesters || [],
      department: editing.department,
      area: editing.area,
      issue: editing.issue,
      cause: editing.cause || '',
      fixDescription: editing.fixDescription,
      permanentFix: editing.permanentFix || '',
      note: editing.note,
      status: editing.status,
    };
  }

  return {
    reportDate: new Date().toISOString().slice(0, 10),
    operators: [],
    requesters: [],
    department: '',
    area: '',
    issue: '',
    cause: '',
    fixDescription: '',
    permanentFix: '',
    note: '',
    status: 'pending',
  };
}

export function WorkLogFormModal({
  isOpen,
  editing,
  currentUser,
  employees,
  departments,
  areas,
  submitting,
  error,
  onSubmit,
  onClose,
  onClearError,
}: WorkLogFormModalProps) {
  const [formData, setFormData] = useState<WorkLogFormData>(getInitialFormData(editing));
  const [issueSuggestions, setIssueSuggestions] = useState<Suggestion[]>([]);
  const [causeSuggestions, setCauseSuggestions] = useState<Suggestion[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Suggestion | null>(null);
  const [selectedCause, setSelectedCause] = useState<Suggestion | null>(null);
  const [loadingIssueSuggestions, setLoadingIssueSuggestions] = useState(false);
  const [loadingCauseSuggestions, setLoadingCauseSuggestions] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const nextData = getInitialFormData(editing);
    setFormData(nextData);
    setSelectedIssue(null);
    setSelectedCause(null);
    setIssueSuggestions([]);
    setCauseSuggestions([]);
  }, [isOpen, editing, currentUser]);

  const itEmployees = useMemo(
    () => employees.filter((emp) => emp.department === 'IT' && !emp.deleteDate),
    [employees]
  );

  const activeEmployees = useMemo(() => employees.filter((emp) => !emp.deleteDate), [employees]);

  const operatorOptions = useMemo(
    () =>
      itEmployees.map((emp) => ({
        value: emp.fullName,
        label: `${emp.fullName} (${emp.employeeId})`,
      })),
    [itEmployees]
  );

  const requesterOptions = useMemo(
    () =>
      activeEmployees.map((emp) => ({
        value: emp.fullName,
        label: `${emp.fullName} (${emp.employeeId})`,
      })),
    [activeEmployees]
  );

  const departmentOptions = useMemo(
    () =>
      departments.map((dept) => ({
        value: dept.name,
        label: dept.name,
      })),
    [departments]
  );

  const areaOptions = useMemo(
    () =>
      areas.map((area) => ({
        value: area.name,
        label: area.name,
      })),
    [areas]
  );

  useEffect(() => {
    const fetchIssueSuggestions = async () => {
      if (formData.issue.length < 2) {
        setIssueSuggestions([]);
        return;
      }

      setLoadingIssueSuggestions(true);
      try {
        const results = await issuesApi.getSuggestions(formData.issue);
        setIssueSuggestions(
          results.map((issue) => ({
            id: issue.issId,
            name: issue.name,
            description: issue.description || '',
            usageCount: issue.usageCount,
          }))
        );
      } catch (fetchError) {
        console.error('Failed to fetch issue suggestions:', fetchError);
        setIssueSuggestions([]);
      } finally {
        setLoadingIssueSuggestions(false);
      }
    };

    const timeoutId = setTimeout(fetchIssueSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [formData.issue]);

  useEffect(() => {
    const loadCausesForIssue = async () => {
      if (!selectedIssue) {
        if (formData.cause.length >= 2) {
          setLoadingCauseSuggestions(true);
          try {
            const results = await causesApi.getSuggestions(undefined, formData.cause);
            setCauseSuggestions(
              results.map((cause) => ({
                id: cause.causeId,
                name: cause.name,
                description: cause.description || '',
                usageCount: cause.usageCount,
              }))
            );
          } catch (fetchError) {
            console.error('Failed to fetch cause suggestions:', fetchError);
            setCauseSuggestions([]);
          } finally {
            setLoadingCauseSuggestions(false);
          }
        } else {
          setCauseSuggestions([]);
        }
        return;
      }

      setLoadingCauseSuggestions(true);
      try {
        const results = await causesApi.getSuggestions(selectedIssue.id);
        setCauseSuggestions(
          results.map((cause) => ({
            id: cause.causeId,
            name: cause.name,
            description: cause.description || '',
            usageCount: cause.usageCount,
          }))
        );
      } catch (fetchError) {
        console.error('Failed to fetch cause suggestions:', fetchError);
        setCauseSuggestions([]);
      } finally {
        setLoadingCauseSuggestions(false);
      }
    };

    void loadCausesForIssue();
  }, [selectedIssue, formData.cause]);

  const handleIssueSelect = async (suggestion: Suggestion | null) => {
    setSelectedIssue(suggestion);
    if (suggestion) {
      try {
        const results = await causesApi.getSuggestions(suggestion.id);
        setCauseSuggestions(
          results.map((cause) => ({
            id: cause.causeId,
            name: cause.name,
            description: cause.description || '',
            usageCount: cause.usageCount,
          }))
        );
      } catch (fetchError) {
        console.error('Failed to fetch causes for issue:', fetchError);
        setCauseSuggestions([]);
      }
    } else {
      setCauseSuggestions([]);
    }
  };

  const handleCauseSelect = (suggestion: Suggestion | null) => {
    setSelectedCause(suggestion);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <PermissionGuard
      permission={editing ? Permissions.IssueLog.Edit : Permissions.IssueLog.Create}
      fallback={
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-60 p-4 overflow-y-auto h-screen w-screen">
          <div className="bg-card rounded-lg p-6 max-w-sm text-center">
            <h3 className="text-lg font-semibold text-error-foreground mb-2">Access Denied</h3>
            <p className="text-muted-foreground mb-4">
              You don't have permission to {editing ? 'edit' : 'create'} work logs.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
            >
              Close
            </button>
          </div>
        </div>
      }
    >
      <div className="fixed inset-0 bg-overlay flex items-center justify-center z-60 p-4 overflow-y-auto h-screen w-screen">
        <div className="bg-card rounded-lg max-w-6xl w-full my-4 max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <Clock className="w-5 h-5 text-primary-600" />
                {editing ? 'Edit Work Log' : 'Create New Work Log'}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Record issue details and assign operators/requesters
              </p>
            </div>
            <button onClick={onClose} disabled={submitting} className="hover:text-muted-foreground transition-colors text-foreground disabled:opacity-50 disabled:cursor-not-allowed">
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-4 bg-error-background border border-error-border rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-error-foreground">Error</p>
                <p className="text-sm text-error-foreground mt-0.5">{error}</p>
              </div>
              <button
                onClick={onClearError}
                disabled={submitting}
                className="text-error-foreground hover:text-error-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">
                  Date <span className="text-error-foreground">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.reportDate}
                  onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">
                  Status <span className="text-error-foreground">*</span>
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkStatus })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-muted-foreground">
                  Operators (IT Department) <span className="text-error-foreground">*</span>
                </label>
                <FlexibleMultiSelect
                  options={operatorOptions}
                  values={formData.operators}
                  onChange={(values) => setFormData({ ...formData, operators: values })}
                  placeholder="Select IT operators or type custom name..."
                  label=""
                  required
                  allowCustom
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Requesters</label>
                <FlexibleMultiSelect
                  options={requesterOptions}
                  values={formData.requesters}
                  onChange={(values) => setFormData({ ...formData, requesters: values })}
                  placeholder="Select requesters or type custom name..."
                  label=""
                  allowCustom
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">
                  Department <span className="text-error-foreground">*</span>
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
                <label className="block text-sm font-medium mb-1 text-muted-foreground">
                  Area <span className="text-error-foreground">*</span>
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
              placeholder={selectedIssue ? `Common causes for "${selectedIssue.name}"...` : 'Start typing to see suggestions...'}
              suggestionHeader={selectedIssue ? `Common Causes for "${selectedIssue.name}"` : 'Suggested Causes'}
            />

            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Fix Description</label>
              <textarea
                value={formData.fixDescription}
                onChange={(e) => setFormData({ ...formData, fixDescription: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground placeholder-placeholder focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Permanent Fix</label>
              <textarea
                value={formData.permanentFix}
                onChange={(e) => setFormData({ ...formData, permanentFix: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground placeholder-placeholder focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Note</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground placeholder-placeholder focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1 px-4 py-2 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editing ? 'Update Work Log' : 'Create Work Log'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="btn-secondary flex-1 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </PermissionGuard>
  );
}
