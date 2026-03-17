import { useState } from 'react';
import { Bug, Plus } from 'lucide-react';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import { PaginationBar } from '@/components/common/PaginationBar';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type {
  CreateIssueDto,
  IssueDto,
  IssuesQueryParams,
  UpdateIssueDto,
} from '@/types/data';
import { issuesApi } from '@/services/api/issues';
import { usePermission } from '@/hooks/usePermission';
import { Permissions } from '@/config/permissions';
import { useIssueQuery } from '@/features/issues/hooks/useIssueQuery';
import { IssueTable } from '@/features/issues/components/IssueTable';
import { IssueFormModal, type IssueFormData } from '@/features/issues/components/IssueFormModal';
import { parseApiError, type ValidationErrors } from '@/utils/apiErrors';

export function IssueManagement() {
  const [issueFilter, setIssueFilter] = useState<string>('all');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<IssueDto | null>(null);
  const [formData, setFormData] = useState<IssueFormData>({
    name: '',
    description: '',
    category: '',
    severity: '',
  });
  const [confirmDelete, setConfirmDelete] = useState<IssueDto | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors | null>(null);

  const { hasPermission } = usePermission();
  const {
    queryParams,
    setQueryParams,
    loading: queryLoading,
    error: queryError,
    paginatedResult,
    refetch,
    setError,
  } = useIssueQuery();

  const isLoading = queryLoading || isMutating;
  const tableError = showForm ? null : mutationError || queryError;

  const openForm = (item?: IssueDto) => {
    setEditing(item || null);
    setMutationError(null);
    setValidationErrors(null);
    setError(null);
    setFormData(
      item
        ? {
            name: item.name,
            description: item.description || '',
            category: item.category || '',
            severity: item.severity?.toString() || '',
          }
        : {
            name: '',
            description: '',
            category: '',
            severity: '',
          }
    );
    setShowForm(true);
  };

  const handleSubmit = async (nextFormData: IssueFormData) => {
    setIsMutating(true);
    setMutationError(null);
    setValidationErrors(null);
    setError(null);

    const payload: CreateIssueDto | UpdateIssueDto = {
      name: nextFormData.name,
      description: nextFormData.description || null,
      category: nextFormData.category || null,
      severity: nextFormData.severity ? Number(nextFormData.severity) : null,
    };

    try {
      if (editing) {
        await issuesApi.update(editing.issId, payload);
      } else {
        await issuesApi.create(payload as CreateIssueDto);
      }

      await refetch();
      setShowForm(false);
      setEditing(null);
      setFormData({ name: '', description: '', category: '', severity: '' });
    } catch (submitError: unknown) {
      console.error('Failed to save issue:', submitError);
      const parsedError = parseApiError(submitError);
      setMutationError(parsedError.message || 'Unable to save issue. Please try again.');
      setValidationErrors(parsedError.fieldErrors);
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    setDeleteLoading(true);
    try {
      await issuesApi.deleteSingle(confirmDelete.issId);
      await refetch();
      setConfirmDelete(null);
    } catch (deleteError: unknown) {
      console.error('Failed to delete issue:', deleteError);
      const parsedError = parseApiError(deleteError);
      setMutationError(parsedError.message || 'Unable to delete issue. Please try again.');
      setConfirmDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Bug className="w-7 h-7 text-primary-600" />
            Issue Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage issue catalog with search, sort, and pagination
          </p>
        </div>
        {hasPermission(Permissions.Issue.Create) && (
          <button
            onClick={() => openForm()}
            disabled={isLoading}
            className="btn-primary px-4 py-2 flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create Issue
          </button>
        )}
      </div>

      <SearchFilterBar
        queryParams={queryParams}
        onQueryChange={(params) => setQueryParams(params as IssuesQueryParams)}
        paginatedResult={paginatedResult || undefined}
        filterOptions={[{ label: 'All Issues', value: 'all' }]}
        currentFilter={issueFilter}
        onFilterChange={setIssueFilter}
        sortOptions={[
          { label: 'Issue Name', value: 'name' },
          { label: 'Category', value: 'category' },
          { label: 'Severity', value: 'severity' },
          { label: 'Usage Count', value: 'usageCount' },
          { label: 'Created Date', value: 'createdAt' },
        ]}
        placeholder="Search by issue name, category, or description..."
        showResults={true}
      />

      <IssueTable
        items={paginatedResult?.items || []}
        isLoading={isLoading}
        error={tableError}
        canEdit={hasPermission(Permissions.Issue.Edit)}
        canDelete={hasPermission(Permissions.Issue.Delete)}
        onEdit={openForm}
        onDelete={setConfirmDelete}
      />

      {paginatedResult && !isLoading && (
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

      <IssueFormModal
        isOpen={showForm}
        editing={editing}
        formData={formData}
        isSubmitting={isMutating}
        error={mutationError}
        validationErrors={validationErrors}
        onChange={setFormData}
        onSubmit={handleSubmit}
        onClose={() => {
          if (isLoading) return;
          setShowForm(false);
          setEditing(null);
        }}
        onClearError={() => {
          setMutationError(null);
          setValidationErrors(null);
        }}
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
        title="Delete issue"
        description={`Are you sure you want to delete "${confirmDelete?.name}"? If this issue is used by causes or work logs, deletion may be blocked by the server.`}
      />
    </div>
  );
}
