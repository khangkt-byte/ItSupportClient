import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import { PaginationBar } from '@/components/common/PaginationBar';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import type {
  CauseDto,
  CausesQueryParams,
  CreateCauseDto,
  IssueDto,
  ListCauseDto,
  UpdateCauseDto,
} from '@/types/data';
import { causesApi } from '@/services/api/causes';
import { issuesApi } from '@/services/api/issues';
import { usePermission } from '@/hooks/usePermission';
import { Permissions } from '@/config/permissions';
import { useCauseQuery } from '@/features/causes/hooks/useCauseQuery';
import { CauseTable } from '@/features/causes/components/CauseTable';
import {
  CauseFormModal,
  createCauseFormData,
  type CauseFormData,
} from '@/features/causes/components/CauseFormModal';
import { parseApiError, type ValidationErrors } from '@/utils/apiErrors';

export function CauseManagement() {
  const [causeFilter, setCauseFilter] = useState<string>('all');
  const [issueOptions, setIssueOptions] = useState<IssueDto[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CauseDto | null>(null);
  const [formData, setFormData] = useState<CauseFormData>(createCauseFormData(null));
  const [confirmDelete, setConfirmDelete] = useState<ListCauseDto | null>(null);
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
    setError: setQueryError,
  } = useCauseQuery();

  const isLoading = queryLoading || isMutating;

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const issueResult = await issuesApi.getAll({
          page: 1,
          pageSize: 200,
          sortBy: 'name',
          isDescending: false,
        });
        setIssueOptions(issueResult.items);
      } catch (error) {
        console.error('Failed to load issues for causes:', error);
      }
    };

    void fetchIssues();
  }, []);

  const filterOptions = useMemo(
    () => [
      { label: 'All Causes', value: 'all' },
      ...issueOptions.map((issue) => ({
        label: issue.name,
        value: `issue-${issue.issId}`,
      })),
    ],
    [issueOptions]
  );

  const openForm = (item?: CauseDto) => {
    setEditing(item || null);
    setMutationError(null);
    setValidationErrors(null);
    setQueryError(null);
    setFormData(createCauseFormData(item ?? null));
    setShowForm(true);
  };

  const handleEdit = async (item: ListCauseDto) => {
    try {
      setMutationError(null);
      setValidationErrors(null);
      setQueryError(null);
      const detail = await causesApi.getById(item.causeId);
      openForm(detail);
    } catch (editError: unknown) {
      console.error('Failed to load cause detail:', editError);
      const parsedError = parseApiError(editError);
      setMutationError(parsedError.message || 'Unable to load cause details. Please try again.');
      setValidationErrors(parsedError.fieldErrors);
    }
  };

  const handleSubmit = async (nextFormData: CauseFormData) => {
    setIsMutating(true);
    setMutationError(null);
    setValidationErrors(null);
    setQueryError(null);

    try {
      if (editing) {
        const payload: UpdateCauseDto = {
          name: nextFormData.name,
          description: nextFormData.description || null,
        };
        await causesApi.update(editing.causeId, payload);
      } else {
        const payload: CreateCauseDto = {
          issId: nextFormData.issId ? Number(nextFormData.issId) : undefined,
          name: nextFormData.name,
          description: nextFormData.description || null,
        };
        await causesApi.create(payload);
      }

      await refetch();
      setShowForm(false);
      setEditing(null);
      setFormData(createCauseFormData(null));
    } catch (submitError: unknown) {
      console.error('Failed to save cause:', submitError);
      const parsedError = parseApiError(submitError);
      setMutationError(parsedError.message || 'Unable to save cause. Please try again.');
      setValidationErrors(parsedError.fieldErrors);
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    setDeleteLoading(true);
    try {
      await causesApi.deleteSingle(confirmDelete.causeId);
      await refetch();
      setConfirmDelete(null);
    } catch (deleteError: unknown) {
      console.error('Failed to delete cause:', deleteError);
      const parsedError = parseApiError(deleteError);
      setMutationError(parsedError.message || 'Unable to delete cause. Please try again.');
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
            <AlertTriangle className="w-7 h-7 text-primary-600" />
            Cause Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage cause knowledge base with issue-based filtering, search, sort, and pagination
          </p>
        </div>
        {hasPermission(Permissions.Cause.Create) && (
          <button
            onClick={() => openForm()}
            disabled={isLoading}
            className="btn-primary px-4 py-2 flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create Cause
          </button>
        )}
      </div>

      <SearchFilterBar
        queryParams={queryParams}
        onQueryChange={(params) => setQueryParams(params as CausesQueryParams)}
        paginatedResult={paginatedResult || undefined}
        filterOptions={filterOptions}
        currentFilter={causeFilter}
        onFilterChange={(value) => {
          setCauseFilter(value);
          const selectedIssueId = value.startsWith('issue-')
            ? Number(value.replace('issue-', ''))
            : null;

          setQueryParams((prev) => ({
            ...prev,
            issueId: selectedIssueId,
            page: 1,
          }));
        }}
        sortOptions={[
          { label: 'Cause Name', value: 'name' },
          { label: 'Issue Name', value: 'issueName' },
          { label: 'Usage Count', value: 'usageCount' },
          { label: 'Created Date', value: 'createdAt' },
        ]}
        placeholder="Search by cause name or issue name..."
        showResults={true}
      />
      {mutationError && !showForm && (
        <ErrorAlert
          message={mutationError}
          onDismiss={() => setMutationError(null)}
        />
      )}

      <CauseTable
        items={paginatedResult?.items || []}
        isLoading={isLoading}
        error={queryError}
        canEdit={hasPermission(Permissions.Cause.Edit)}
        canDelete={hasPermission(Permissions.Cause.Delete)}
        onEdit={handleEdit}
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

      <CauseFormModal
        isOpen={showForm}
        editing={editing}
        formData={formData}
        issueOptions={issueOptions}
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
        title="Delete cause"
        description={`Are you sure you want to delete "${confirmDelete?.name}"? Deletion may be blocked when this cause is referenced by work logs.`}
      />
    </div>
  );
}
