/**
 * Professional Employee Management Component
 * 
 * **Design Pattern**: Server-side pagination, filtering, and sorting
 * Following Microsoft Graph API, Azure Active Directory patterns
 * 
 * **References:**
 * - Microsoft Graph Users API: https://learn.microsoft.com/en-us/graph/api/user-list
 * - Azure Portal Employee Management UX
 * 
 * **Features:**
 * - Server-side search across empCode, fullName, email
 * - Filter by Department and Area
 * - Sort by empCode, fullName, email, position, createdAt
 * - Pagination with configurable page sizes (10, 20, 50, 100)
 */

import { useState } from 'react';
import { Plus, User } from 'lucide-react';
import { employeesApi } from '@/services/api/employees';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import type { Employee, Department, AreaDto } from '@/types/data';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PaginationBar } from '@/components/common/PaginationBar';
import { usePermission } from '@/hooks/usePermission';
import { Permissions } from '@/config/permissions';
import { parseApiError, type ValidationErrors } from '@/utils/apiErrors';
import { EmployeeTable } from '@/features/employees/components/EmployeeTable';
import { EmployeeFormModal, type EmployeeFormData } from '@/features/employees/components/EmployeeFormModal';
import { useEmployeeQuery } from '@/features/employees/hooks/useEmployeeQuery';

interface Props {
  departments: Department[];
  areas: AreaDto[];
}

export function EmployeeManagement({ departments, areas }: Props) {

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>({
    empCode: '', 
    fullName: '', 
    phoneNumber: '', 
    email: '', 
    position: '',
    department: '',
    area: '',
  });

  // UI states
  const [isMutating, setIsMutating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Employee | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors | null>(null);

  // Additional filter state for UI
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const {
    queryParams,
    setQueryParams,
    loading: queryLoading,
    error: queryError,
    setError: setQueryError,
    paginatedResult,
    refetch,
  } = useEmployeeQuery();
  const isLoading = queryLoading || isMutating;
  const tableError = showForm ? null : mutationError || queryError;
  const { hasPermission } = usePermission();

  // Handle department filter change
  const handleDepartmentFilterChange = (value: string) => {
    setDepartmentFilter(value);
    setQueryParams((prev) => ({
      ...prev,
      dptId: value === 'all' ? null : parseInt(value),
      page: 1,
    }));
  };

  const openForm = (item?: Employee) => {
    setEditing(item || null);
    setFormData(item ? { 
      empCode: item.empCode || '', 
      fullName: item.fullName, 
      phoneNumber: item.phoneNumber || '', 
      email: item.email || '', 
      position: item.position || '',
      department: item.department || '',
      area: item.area || '',
    } : { 
      empCode: '', fullName: '', phoneNumber: '', email: '', position: '', department: '', area: ''
    });
    setQueryError(null);
    setMutationError(null);
    setValidationErrors(null);
    setShowForm(true);
  };

  const handleSubmit = async (nextFormData: EmployeeFormData) => {
    try {
      setIsMutating(true);
      setQueryError(null);
      setMutationError(null);
      setValidationErrors(null);

      // Find department and area IDs from names
      const selectedDept = departments.find((dept) => dept.name === nextFormData.department);
      const selectedArea = areas.find((area) => area.name === nextFormData.area);

      if (editing) {
        // Update existing employee
        const updateData = {
          fullName: nextFormData.fullName,
          phoneNumber: nextFormData.phoneNumber || null,
          email: nextFormData.email || null,
          position: nextFormData.position || null,
          dptId: selectedDept?.dptId,
          areaId: selectedArea?.areaId,
        };
        await employeesApi.update(editing.empId, updateData);
      } else {
        // Create new employee
        const createData = {
          empCode: nextFormData.empCode || null,
          fullName: nextFormData.fullName,
          phoneNumber: nextFormData.phoneNumber || null,
          email: nextFormData.email || null,
          position: nextFormData.position || null,
          dptId: selectedDept?.dptId,
          areaId: selectedArea?.areaId,
        };
        await employeesApi.create(createData);
      }

      setShowForm(false);
      setFormData({ empCode: '', fullName: '', phoneNumber: '', email: '', position: '', department: '', area: '' });
      // Refresh data after submission
      await refetch();
    } catch (submitError: unknown) {
      console.error('Failed to save employee:', submitError);
      const parsedError = parseApiError(submitError);
      setMutationError(parsedError.message || `Failed to ${editing ? 'update' : 'create'} employee`);
      setValidationErrors(parsedError.fieldErrors);
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleteLoading(true);
      setQueryError(null);
      setMutationError(null);
      await employeesApi.deleteSingle(confirmDelete.empId);
      setConfirmDelete(null);
      // Refresh data after deletion
      await refetch();
    } catch (deleteError: unknown) {
      console.error('Failed to delete employee:', deleteError);
      const parsedError = parseApiError(deleteError);
      setMutationError(parsedError.message || 'Failed to delete employee');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <User className="w-7 h-7 text-primary-600" />
            Employee Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage employee profiles with search, filter, and sorting controls
          </p>
        </div>
        {hasPermission(Permissions.Employee.Create) && (
          <button
            onClick={() => openForm()}
            disabled={isLoading}
            className="btn-primary px-4 py-2 flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        )}
      </div>

      {/* Search, Filter, Sort Bar */}
      <SearchFilterBar
        queryParams={queryParams}
        onQueryChange={setQueryParams}
        paginatedResult={paginatedResult || undefined}
        filterOptions={[
          { label: 'All Departments', value: 'all' },
          ...departments.map(dept => ({
            label: dept.name,
            value: dept.dptId.toString(),
          })),
        ]}
        currentFilter={departmentFilter}
        onFilterChange={handleDepartmentFilterChange}
        sortOptions={[
          { label: 'Name', value: 'fullName' },
          { label: 'Employee Code', value: 'empCode' },
          { label: 'Email', value: 'email' },
          { label: 'Position', value: 'position' },
          { label: 'Created Date', value: 'createdAt' },
        ]}
        placeholder="Search by name, employee code, or email..."
        showResults={true}
      />

      {/* Employees Table */}
      <EmployeeTable
        isLoading={isLoading}
        error={tableError}
        items={paginatedResult?.items || []}
        canEdit={hasPermission(Permissions.Employee.Edit)}
        canDelete={hasPermission(Permissions.Employee.Delete)}
        onEdit={(item) => openForm(item as Employee)}
        onDelete={(item) => setConfirmDelete(item as Employee)}
      />

      {/* Pagination Controls */}
      {paginatedResult && !isLoading && !tableError && (
        <PaginationBar
          page={queryParams.page || 1}
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

      {/* Form Modal */}
      <EmployeeFormModal
        isOpen={showForm}
        isSubmitting={isMutating}
        editing={editing}
        error={mutationError}
        validationErrors={validationErrors}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        onClose={() => {
          if (isLoading) return;
          setShowForm(false);
        }}
        onClearError={() => {
          setMutationError(null);
          setValidationErrors(null);
        }}
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
        title="Delete employee"
        description={`Are you sure you want to delete "${confirmDelete?.fullName}"? This action cannot be undone.`}
      />
    </div>
  );
}