import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X, Building2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Department, CreateDepartmentDto, UpdateDepartmentDto, DepartmentsQueryParams, PaginatedResult, DepartmentDto } from '@/types/data';
import { departmentApi } from '@/services/api/departments';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

interface Props {
  data: Department[];
  setData: (items: Department[]) => void;
}

export function DepartmentManagement({ data, setData }: Props) {
  void data;

  const [queryParams, setQueryParams] = useState<DepartmentsQueryParams>({
    page: 1,
    pageSize: 10,
    search: '',
    sortBy: 'name',
    isDescending: false,
  });
  const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<DepartmentDto> | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Department | null>(null);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await departmentApi.getAll(queryParams);
      setPaginatedResult(result);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
      setError('Failed to load departments');
      setPaginatedResult(null);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  const syncDataManagerDepartments = useCallback(async () => {
    const allDepartments = await departmentApi.getAll({ page: 1, pageSize: 1000, sortBy: 'name', isDescending: false });
    setData(
      allDepartments.items.map((dept) => ({
        id: dept.dptId,
        dptId: dept.dptId,
        name: dept.name,
        description: dept.description || '',
      }))
    );
  }, [setData]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const openForm = (item?: Department) => {
    setEditing(item || null);
    setFormData(item ? { name: item.name, description: item.description } : { name: '', description: '' });
    setError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editing) {
        const updateDto: UpdateDepartmentDto = {
          name: formData.name,
          description: formData.description || null,
        };
        await departmentApi.update(editing.id, updateDto);
        toast.success('Department updated successfully');
      } else {
        const createDto: CreateDepartmentDto = {
          name: formData.name,
          description: formData.description || null,
        };
        await departmentApi.create(createDto);
        toast.success('Department created successfully');
      }

      await Promise.all([fetchDepartments(), syncDataManagerDepartments()]);
      setShowForm(false);
      setFormData({ name: '', description: '' });
    } catch (submitError: any) {
      console.error('Failed to save department:', submitError);
      const message = submitError.message || 'Failed to save department';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await departmentApi.delete(confirmDelete.id);
      await Promise.all([fetchDepartments(), syncDataManagerDepartments()]);
      setConfirmDelete(null);
      toast.success('Department deleted successfully');
    } catch (deleteError: any) {
      console.error('Failed to delete department:', deleteError);
      if (deleteError.message?.includes('employees') || deleteError.message?.includes('422')) {
        toast.error('Cannot delete: Department has employees or issue logs');
      } else {
        toast.error(deleteError.message || 'Failed to delete department');
      }
      setConfirmDelete(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary-600" />
            Department Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage departments with searchable, sortable, and paginated data
          </p>
        </div>
        <button
          onClick={() => openForm()}
          disabled={loading}
          className="btn-primary px-4 py-2 flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create Department
        </button>
      </div>

      <SearchFilterBar
        queryParams={queryParams}
        onQueryChange={(params) => setQueryParams(params as DepartmentsQueryParams)}
        paginatedResult={paginatedResult || undefined}
        filterOptions={[{ label: 'All Departments', value: 'all' }]}
        currentFilter={departmentFilter}
        onFilterChange={setDepartmentFilter}
        sortOptions={[
          { label: 'Department Name', value: 'name' },
          { label: 'Description', value: 'description' },
          { label: 'Employee Count', value: 'employeeCount' },
          { label: 'Issue Count', value: 'issueLogCount' },
          { label: 'Created Date', value: 'createdAt' },
        ]}
        placeholder="Search by department name or description..."
        showResults={true}
      />

      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              <p className="text-muted-foreground">Loading departments...</p>
            </div>
          </div>
        )}

        {error && !showForm && !loading && (
          <div className="p-4 bg-error-background border border-error-border flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-error-foreground">Error</p>
              <p className="text-sm text-error-foreground">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Department Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Employees</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Issues</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(paginatedResult?.items || []).length > 0 ? (
                (paginatedResult?.items || []).map((item) => (
                  <tr key={item.dptId} className="hover:bg-accent transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{item.description || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{item.employeeCount}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{item.issueLogCount}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() =>
                            openForm({
                              id: item.dptId,
                              dptId: item.dptId,
                              name: item.name,
                              description: item.description || '',
                            })
                          }
                          disabled={loading}
                          className="text-primary-600 inline-flex items-center justify-center hover:text-primary-800 transition-colors disabled:opacity-50"
                          title="Edit department"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDelete({
                              id: item.dptId,
                              dptId: item.dptId,
                              name: item.name,
                              description: item.description || '',
                            })
                          }
                          disabled={loading}
                          className="text-error-foreground inline-flex items-center justify-center hover:text-error-foreground transition-colors disabled:opacity-50"
                          title="Delete department"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No departments found</p>
                    <p className="text-sm mt-1">Create your first department to get started</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {paginatedResult && !loading && (
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
          <div className="bg-card rounded-lg max-w-md w-full shadow-xl">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">
                {editing ? 'Edit Department' : 'Add Department'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                disabled={loading}
                className="text-placeholder hover:text-muted-foreground disabled:opacity-50 cursor-pointer transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Name <span className="text-error-foreground">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., IT Department"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-card text-foreground placeholder-placeholder transition-colors"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-card text-foreground placeholder-placeholder resize-none transition-colors"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-primary-foreground rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {loading ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                  className="btn-secondary flex-1 px-4 py-2"
                >
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
        title="Delete department"
        description={`Are you sure you want to delete "${confirmDelete?.name}"? This department may have employees or issue logs.`}
      />
    </div>
  );
}
