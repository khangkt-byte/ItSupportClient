import { useState } from 'react';
import { Clock, Plus } from 'lucide-react';
import type { Area, Department, Employee, WorkLog } from '@/types/data';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import { PaginationBar } from '@/components/common/PaginationBar';
import { Permissions } from '@/config/permissions';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { usePermission } from '@/hooks/usePermission';
import { WorkLogFormModal, type WorkLogFormData } from '@/features/workLogs/components/WorkLogFormModal';
import { WorkLogImportExportPanel } from '@/features/workLogs/components/WorkLogImportExportPanel';
import { WorkLogTable } from '@/features/workLogs/components/WorkLogTable';
import { useWorkLogQuery } from '@/features/workLogs/hooks/useWorkLogQuery';
import { useWorkLogMutations } from '@/features/workLogs/hooks/useWorkLogMutations';

interface Props {
  currentUser: string;
  employees: Employee[];
  departments: Department[];
  areas: Area[];
}

export function WorkLogManagement({ currentUser, employees, departments, areas }: Props) {
  const {
    queryParams,
    setQueryParams,
    paginatedResult,
    loading,
    error: queryError,
    setError: setQueryError,
    refetch,
  } = useWorkLogQuery();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WorkLog | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    submitting,
    error: mutationError,
    setError: setMutationError,
    submitWorkLog,
    deleteWorkLog,
  } = useWorkLogMutations({
    currentUser,
    departments,
    areas,
    refetch,
  });

  const error = queryError || mutationError;
  const setError = queryError ? setQueryError : setMutationError;
  const { hasPermission } = usePermission();
  const canCreate = hasPermission(Permissions.IssueLog.Create);

  const openForm = (log?: WorkLog) => {
    setMutationError(null);
    setEditing(log || null);
    setShowForm(true);
  };

  const handleSubmit = async (formData: WorkLogFormData) => {
    const success = await submitWorkLog(formData, editing);
    if (success) {
      setShowForm(false);
      setEditing(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    setDeleteLoading(true);
    try {
      const success = await deleteWorkLog(confirmDelete);
      if (success) setConfirmDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  };

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
        {canCreate ? (
          <button onClick={() => openForm()} className="btn-primary px-4 py-2 flex items-center gap-2 shadow-sm">
            <Plus className="w-5 h-5" />New Work Log
          </button>
        ) : (
          <button disabled className="btn-primary px-4 py-2 flex items-center gap-2 opacity-50">
            <Plus className="w-5 h-5" />New Work Log
          </button>
        )}
      </div>



      <SearchFilterBar
        queryParams={queryParams}
        onQueryChange={setQueryParams}
        paginatedResult={paginatedResult ?? undefined}
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
        paginatedResult={paginatedResult ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false, items: [] }}
        isLoading={loading}
        error={error}
        onEdit={(log) => openForm(log)}
        onDelete={(id) => setConfirmDelete(id)}
      />

      {paginatedResult && !loading && !error && (
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
          if (submitting) return;
          setShowForm(false);
          setEditing(null);
        }}
        onClearError={() => setError(null)}
      />

      <WorkLogImportExportPanel
        currentItems={paginatedResult?.items ?? []}
        refetch={refetch}
        employees={employees}
        departments={departments}
        areas={areas}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => {
          if (deleteLoading) return;
          setConfirmDelete(null);
        }}
        onConfirm={handleDelete}
        isLoading={deleteLoading}
        loadingLabel="Deleting..."
        action="delete"
        title="Delete work log"
        description="Are you sure you want to delete this work log? This action cannot be undone."
      />
    </div>
  );
}