import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X, MapPin, AlertCircle } from 'lucide-react';
import type { Area, AreasQueryParams, PaginatedResult, AreaDto } from '@/types/data';
import { areasApi } from '@/services/api/areas';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

interface Props {
  data: Area[];
  setData: (items: Area[]) => void;
}

export function AreaManagement({ data, setData }: Props) {
  const [queryParams, setQueryParams] = useState<AreasQueryParams>({
    page: 1,
    pageSize: 10,
    search: '',
    sortBy: 'name',
    isDescending: false,
  });
  const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<AreaDto> | null>(null);
  const [areaFilter, setAreaFilter] = useState<string>('all');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Area | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [confirmDelete, setConfirmDelete] = useState<Area | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAreas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await areasApi.getAll(queryParams);
      setPaginatedResult(result);
    } catch (err) {
      console.error('Failed to fetch areas:', err);
      setError('Failed to load areas');
      setPaginatedResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  const syncDataManagerAreas = useCallback(async () => {
    const allAreas = await areasApi.getAll({ page: 1, pageSize: 1000, sortBy: 'name', isDescending: false });
    setData(allAreas.items.map((area) => ({ ...area, id: String(area.areaId) } as Area)));
  }, [setData]);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  const openForm = (item?: Area) => {
    setEditing(item || null);
    setFormData(item ? { name: item.name, description: item.description || '' } : { name: '', description: '' });
    setError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

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
    } catch (err: any) {
      console.error('Failed to save area:', err);
      setError(err.message || 'Failed to save area. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    try {
      await areasApi.deleteSingle(confirmDelete.areaId);
      await Promise.all([fetchAreas(), syncDataManagerAreas()]);
      setConfirmDelete(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete area');
      setConfirmDelete(null);
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
        <button onClick={() => openForm()} className="btn-primary px-4 py-2 flex items-center gap-2 shadow-sm">
          <Plus className="w-5 h-5" />
          Create Area
        </button>
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

      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              <p className="text-muted-foreground">Loading areas...</p>
            </div>
          </div>
        )}

        {error && !showForm && !isLoading && (
          <div className="p-4 bg-error-background border border-error-border flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-error-foreground">Error</p>
              <p className="text-sm text-error-foreground">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Area Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(paginatedResult?.items || []).length > 0 ? (
                (paginatedResult?.items || []).map((item) => (
                  <tr key={item.areaId} className="hover:bg-accent transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{item.description || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openForm({ ...item, id: String(item.areaId) } as Area)}
                          className="text-primary-600 inline-flex items-center justify-center hover:text-primary-800 transition-colors"
                          title="Edit area"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ ...item, id: String(item.areaId) } as Area)}
                          className="text-error-foreground inline-flex items-center justify-center hover:text-error-foreground transition-colors"
                          title="Delete area"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No areas found</p>
                    <p className="text-sm mt-1">Create your first area to get started</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {paginatedResult && !isLoading && (
        <div className="card p-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page <span className="font-medium">{paginatedResult.page}</span> of{' '}
            <span className="font-medium">{paginatedResult.totalPages}</span> ({' '}
            <span className="font-medium">{paginatedResult.totalCount}</span> total items)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setQueryParams({
                  ...queryParams,
                  page: Math.max(1, (queryParams.page || 1) - 1),
                })
              }
              disabled={!paginatedResult.hasPreviousPage}
              className="flex items-center gap-1 px-3 py-2 border border-input rounded-lg bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-foreground"
            >
              <span>Previous</span>
            </button>

            <input
              type="number"
              min="1"
              max={paginatedResult.totalPages}
              value={queryParams.page || 1}
              onChange={(e) => {
                const pageNum = Math.min(
                  Math.max(1, parseInt(e.target.value) || 1),
                  paginatedResult.totalPages
                );
                setQueryParams({ ...queryParams, page: pageNum });
              }}
              className="w-12 px-2 py-2 border border-input rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card text-foreground"
            />

            <button
              onClick={() =>
                setQueryParams({
                  ...queryParams,
                  page: Math.min(paginatedResult.totalPages, (queryParams.page || 1) + 1),
                })
              }
              disabled={!paginatedResult.hasNextPage}
              className="flex items-center gap-1 px-3 py-2 border border-input rounded-lg bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-foreground"
            >
              <span>Next</span>
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm w-full max-w-xl">
            <div className="px-6 py-4 border-b border-border flex justify-between">
              <h3 className="text-lg font-semibold text-foreground">{editing ? 'Edit' : 'Add'}</h3>
              <button onClick={() => setShowForm(false)} className="hover:text-muted-foreground text-foreground transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Name *"
                className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground placeholder-placeholder focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description"
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground placeholder-placeholder focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
              />
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1 px-4 py-2">
                  {editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 px-4 py-2">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        action="delete"
        title="Delete area"
        description={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}