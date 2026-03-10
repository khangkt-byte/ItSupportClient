import { useEffect, useState } from 'react';
import { Clock, Plus } from 'lucide-react';
import type { Area, Department, Employee, IssueLogDto, WorkLog, WorkStatus, WorkLogsQueryParams } from '@/types/data';
import { workLogsApi } from '@/services/api';
import { workLogToCreateDto } from '@/utils/workLogAdapter';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import { PaginationBar } from '@/components/common/PaginationBar';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { Permissions } from '@/config/permissions';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { WorkLogFormModal, type WorkLogFormData } from '@/features/workLogs/components/WorkLogFormModal';
import { WorkLogImportExportPanel } from '@/features/workLogs/components/WorkLogImportExportPanel';
import { WorkLogTable } from '@/features/workLogs/components/WorkLogTable';
import { useFilteredWorkLogs } from '@/features/workLogs/hooks/useFilteredWorkLogs';

interface Props {
  data: WorkLog[];
  setData: (logs: WorkLog[]) => void;
  currentUser: string;
  loading?: boolean;
  employees: Employee[];
  departments: Department[];
  areas: Area[];
}

export function WorkLogManagement({ data, setData, currentUser, employees, departments, areas, loading }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(!!loading);
  const [queryParams, setQueryParams] = useState<WorkLogsQueryParams>({
    page: 1,
    pageSize: 20,
    search: '',
    sortBy: 'reportDate',
    isDescending: true,
    status: null,
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WorkLog | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const paginatedResult = useFilteredWorkLogs(data, queryParams);

  const openForm = (log?: WorkLog) => {
    setError(null);
    setEditing(log || null);
    setShowForm(true);
  };

  const handleSubmit = async (formData: WorkLogFormData) => {
    setSubmitting(true);
    setError(null);
    
    try {
      // Find department and area IDs
      const dept = departments.find(d => d.name === formData.department);
      const areaObj = areas.find(a => a.name === formData.area);
      
      // Convert formData to WorkLog format first, then to CreateIssueLogDto using adapter
      const workLogData: Partial<WorkLog> = {
        operators: [formData.operators[0] || currentUser],
        requesters: formData.requesters,
        dptId: dept?.dptId,
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
      setEditing(null);
    } catch (error) {
      console.error('Failed to submit work log:', error);
      setError('Failed to submit work log. Please try again.');
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
      setError('Failed to delete work log. Please try again.');
      setConfirmDelete(null);
    }
  };

  useEffect(() => {
    setIsLoading(!!loading);
  }, [loading]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Clock className="w-7 h-7 text-primary-600" />
            Work Log Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage issue logs with consistent filtering, sorting, and pagination
          </p>
        </div>
        <PermissionGuard 
          permission={Permissions.IssueLog.Create}
          fallback={
            <button disabled className="btn-primary px-4 py-2 flex items-center gap-2 opacity-50">
              <Plus className="w-5 h-5" />New Work Log
            </button>
          }
        >
          <button onClick={() => openForm()} className="btn-primary px-4 py-2 flex items-center gap-2 shadow-sm">
            <Plus className="w-5 h-5" />New Work Log
          </button>
        </PermissionGuard>
      </div>



      <SearchFilterBar
        queryParams={queryParams}
        onQueryChange={(params) => setQueryParams(params as WorkLogsQueryParams)}
        paginatedResult={paginatedResult}
        filterOptions={[
          { label: 'All Status', value: 'all' },
          { label: 'Pending', value: 'pending' },
          { label: 'In Progress', value: 'in-progress' },
          { label: 'Resolved', value: 'resolved' },
          { label: 'Cancelled', value: 'cancelled' },
        ]}
        currentFilter={statusFilter}
        onFilterChange={(value) => {
          setStatusFilter(value);
          setQueryParams({
            ...queryParams,
            status: value === 'all' ? null : value,
            page: 1,
          });
        }}
        sortOptions={[
          { label: 'Report Date', value: 'reportDate' },
          { label: 'Issue', value: 'issue' },
          { label: 'Status', value: 'status' },
          { label: 'Department', value: 'department' },
          { label: 'Area', value: 'area' },
          { label: 'Operator', value: 'operator' },
          { label: 'Requester', value: 'requester' },
        ]}
        placeholder="Search by issue, operator, requester, department, or area..."
        showResults={true}
      />

      <WorkLogTable
        paginatedResult={paginatedResult}
        isLoading={isLoading}
        error={error}
        onEdit={(log) => openForm(log)}
        onDelete={(id) => setConfirmDelete(id)}
      />

      {paginatedResult && !isLoading && !error && (
        <PaginationBar
          page={paginatedResult.page}
          totalPages={paginatedResult.totalPages}
          totalCount={paginatedResult.totalCount}
          hasPreviousPage={paginatedResult.hasPreviousPage}
          hasNextPage={paginatedResult.hasNextPage}
          onPageChange={(page) =>
            setQueryParams((prev) => ({
              ...prev,
              page: Math.min(Math.max(1, page), paginatedResult.totalPages),
            }))
          }
        />
      )}

      <WorkLogFormModal
        isOpen={showForm}
        editing={editing}
        currentUser={currentUser}
        employees={employees}
        departments={departments}
        areas={areas}
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        onClearError={() => setError(null)}
      />

      <WorkLogImportExportPanel
        data={data}
        setData={setData}
        employees={employees}
        departments={departments}
        areas={areas}
      />

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