import { useCallback, useState } from 'react';
import { Building2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Department, CreateDepartmentDto, DepartmentsQueryParams, UpdateDepartmentDto } from '@/types/data';
import { departmentApi } from '@/services/api/departments';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import { PaginationBar } from '@/components/common/PaginationBar';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useDepartmentQuery } from '../hooks/useDepartmentQuery';
import { DepartmentTable } from './DepartmentTable';
import { DepartmentFormModal, type DepartmentFormData } from './DepartmentFormModal';

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
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentFormData>({ name: '', description: '' });
  const [confirmDelete, setConfirmDelete] = useState<Department | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const { loading: queryLoading, error, setError, paginatedResult, fetchDepartments } = useDepartmentQuery(queryParams);
  const loading = queryLoading || isMutating;

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

  const openForm = (item?: Department) => {
    setEditing(item || null);
    setFormData(item ? { name: item.name, description: item.description } : { name: '', description: '' });
    setError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMutating(true);
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
      setIsMutating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    setIsMutating(true);
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
      setIsMutating(false);
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

      <DepartmentTable
        loading={loading}
        error={showForm ? null : error}
        items={paginatedResult?.items || []}
        onEdit={(item) =>
          openForm({
            id: item.dptId,
            dptId: item.dptId,
            name: item.name,
            description: item.description || '',
          })
        }
        onDelete={(item) =>
          setConfirmDelete({
            id: item.dptId,
            dptId: item.dptId,
            name: item.name,
            description: item.description || '',
          })
        }
      />

      {paginatedResult && !loading && (
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

      <DepartmentFormModal
        isOpen={showForm}
        editing={editing}
        loading={loading}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        onClose={() => setShowForm(false)}
      />

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
