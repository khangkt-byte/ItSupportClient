import { useCallback, useState } from 'react';
import { Building2, Plus } from 'lucide-react';
import type { Department, CreateDepartmentDto, DepartmentsQueryParams, UpdateDepartmentDto } from '@/types/data';
import { departmentsApi } from '@/services/api/departments';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import { PaginationBar } from '@/components/common/PaginationBar';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { usePermission } from '@/hooks/usePermission';
import { Permissions } from '@/config/permissions';
import { parseApiError, type ValidationErrors } from '@/utils/apiValidation';
import { useDepartmentQuery } from '../hooks/useDepartmentQuery';
import { DepartmentTable } from './DepartmentTable';
import { DepartmentFormModal, type DepartmentFormData } from './DepartmentFormModal';

interface Props {
  data: Department[];
  setData: (items: Department[]) => void;
}

export function DepartmentManagement({ data, setData }: Props) {
  void data;
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentFormData>({ name: '', description: '' });
  const [confirmDelete, setConfirmDelete] = useState<Department | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors | null>(null);
  const {
    queryParams,
    setQueryParams,
    loading: queryLoading,
    error,
    setError,
    paginatedResult,
    fetchDepartments,
  } = useDepartmentQuery();
  const loading = queryLoading || isMutating;
  const { hasPermission } = usePermission();

  const syncDataManagerDepartments = useCallback(async () => {
    const allDepartments = await departmentsApi.getAll({ page: 1, pageSize: 1000, sortBy: 'name', isDescending: false });
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
        const updateDto: UpdateDepartmentDto = {
          name: formData.name,
          description: formData.description || null,
        };
        await departmentsApi.update(editing.id, updateDto);
      } else {
        const createDto: CreateDepartmentDto = {
          name: formData.name,
          description: formData.description || null,
        };
        await departmentsApi.create(createDto);
      }

      await Promise.all([fetchDepartments(), syncDataManagerDepartments()]);
      setShowForm(false);
      setFormData({ name: '', description: '' });
    } catch (submitError: unknown) {
      console.error('Failed to save department:', submitError);
      const parsedError = parseApiError(submitError);
      setError(parsedError.message || 'Failed to save department');
      setValidationErrors(parsedError.fieldErrors);
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    setDeleteLoading(true);
    try {
      setError(null);
      await departmentsApi.deleteSingle(confirmDelete.id);
      await Promise.all([fetchDepartments(), syncDataManagerDepartments()]);
      setConfirmDelete(null);
    } catch (deleteError: unknown) {
      console.error('Failed to delete department:', deleteError);
      const parsedError = parseApiError(deleteError);
      setError(parsedError.message || 'Failed to delete department');
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
            <Building2 className="w-7 h-7 text-primary-600" />
            Department Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage departments with searchable, sortable, and paginated data
          </p>
        </div>
        {hasPermission(Permissions.Department.Create) && (
          <button
            onClick={() => openForm()}
            disabled={loading}
            className="btn-primary px-4 py-2 flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create Department
          </button>
        )}
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
        canEdit={hasPermission(Permissions.Department.Edit)}
        canDelete={hasPermission(Permissions.Department.Delete)}
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
        error={error}
        validationErrors={validationErrors}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        onClose={() => {
          if (loading) return;
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
        title="Delete department"
        description={`Are you sure you want to delete "${confirmDelete?.name}"? This department may have employees or issue logs.`}
      />
    </div>
  );
}
