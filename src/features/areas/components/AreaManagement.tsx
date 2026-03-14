import { useState, useCallback } from 'react';
import { Plus, MapPin } from 'lucide-react';
import type { Area, AreasQueryParams } from '@/types/data';
import { areasApi } from '@/services/api/areas';
import { useAreaQuery } from '@/features/areas/hooks/useAreaQuery';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import { PaginationBar } from '@/components/common/PaginationBar';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { usePermission } from '@/hooks/usePermission';
import { Permissions } from '@/config/permissions';
import { parseApiError, type ValidationErrors } from '@/utils/apiValidation';
import { AreaTable } from './AreaTable';
import { AreaFormModal, type AreaFormData } from './AreaFormModal';

interface Props {
  data: Area[];
  setData: (items: Area[]) => void;
}

export function AreaManagement({ data, setData }: Props) {
  void data;
  const {
    queryParams,
    setQueryParams,
    paginatedResult,
    loading: queryLoading,
    error,
    setError,
    fetchAreas,
  } = useAreaQuery();
  const [areaFilter, setAreaFilter] = useState<string>('all');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Area | null>(null);
  const [formData, setFormData] = useState<AreaFormData>({ name: '', description: '' });
  const [confirmDelete, setConfirmDelete] = useState<Area | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors | null>(null);

  const isLoading = queryLoading || isMutating;

  const { hasPermission } = usePermission();

  const syncDataManagerAreas = useCallback(async () => {
    const allAreas = await areasApi.getAll({ page: 1, pageSize: 1000, sortBy: 'name', isDescending: false });
    setData(allAreas.items.map((area) => ({ ...area, id: String(area.areaId) } as Area)));
  }, [setData]);

  const openForm = (item?: Area) => {
    setEditing(item || null);
    setFormData(item ? { name: item.name, description: item.description || '' } : { name: '', description: '' });
    setError(null);
    setValidationErrors(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMutating(true);
    setError(null);
    setValidationErrors(null);

    try {
      if (editing) {
        await areasApi.update(editing.areaId, {
          name: formData.name,
          description: formData.description || null,
        });
      } else {
        await areasApi.create({
          name: formData.name,
          description: formData.description || null,
        });
      }

      await Promise.all([fetchAreas(), syncDataManagerAreas()]);
      setShowForm(false);
      setFormData({ name: '', description: '' });
    } catch (submitError: unknown) {
      console.error('Failed to save area:', submitError);
      const parsedError = parseApiError(submitError);
      setError(parsedError.message || 'Failed to save area');
      setValidationErrors(parsedError.fieldErrors);
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    try {
      setDeleteLoading(true);
      setError(null);
      await areasApi.deleteSingle(confirmDelete.areaId);
      await Promise.all([fetchAreas(), syncDataManagerAreas()]);
      setConfirmDelete(null);
    } catch (deleteError: unknown) {
      console.error('Failed to delete area:', deleteError);
      const parsedError = parseApiError(deleteError);
      setError(parsedError.message || 'Failed to delete area');
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
            <MapPin className="w-7 h-7 text-primary-600" />
            Area Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage areas with searchable, sortable, and paginated data
          </p>
        </div>
        {hasPermission(Permissions.Area.Create) && (
          <button
            onClick={() => openForm()}
            disabled={isLoading}
            className="btn-primary px-4 py-2 flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create Area
          </button>
        )}
      </div>

      <SearchFilterBar
        queryParams={queryParams}
        onQueryChange={(params) => setQueryParams(params as AreasQueryParams)}
        paginatedResult={paginatedResult || undefined}
        filterOptions={[{ label: 'All Areas', value: 'all' }]}
        currentFilter={areaFilter}
        onFilterChange={setAreaFilter}
        sortOptions={[
          { label: 'Area Name', value: 'name' },
          { label: 'Description', value: 'description' },
          { label: 'Created Date', value: 'createdAt' },
        ]}
        placeholder="Search by area name or description..."
        showResults={true}
      />

      <AreaTable
        isLoading={isLoading}
        error={showForm ? null : error}
        items={paginatedResult?.items || []}
        canEdit={hasPermission(Permissions.Area.Edit)}
        canDelete={hasPermission(Permissions.Area.Delete)}
        onEdit={(item) => openForm({ ...item, id: String(item.areaId) } as Area)}
        onDelete={(item) => setConfirmDelete({ ...item, id: String(item.areaId) } as Area)}
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

      <AreaFormModal
        isOpen={showForm}
        editing={editing}
        formData={formData}
        isLoading={isLoading}
        error={error}
        validationErrors={validationErrors}
        onChange={setFormData}
        onSubmit={handleSubmit}
        onClose={() => {
          if (isLoading) return;
          setShowForm(false);
        }}
        onClearError={() => {
          setError(null);
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
        title="Delete area"
        description={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}