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

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X, User, AlertCircle } from 'lucide-react';
import { employeesApi } from '@/services/api/employees';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import type { Employee, Department, AreaDto, EmployeesQueryParams, PaginatedResult, ListEmployeeDto } from '@/types/data';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PaginationBar } from '@/components/common/PaginationBar';

interface Props {
  data: Employee[];
  setData: (items: Employee[]) => void;
  departments: Department[];
  areas: AreaDto[];
}

interface EmployeeFormData {
  empCode: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  position: string;
}

export function EmployeeManagement({ data, setData, departments, areas }: Props) {
  void data;
  void setData;
  void areas;

  // Server-side query parameters
  const [queryParams, setQueryParams] = useState<EmployeesQueryParams>({
    page: 1,
    pageSize: 10,
    search: '',
    sortBy: 'fullName',
    isDescending: false,
    dptId: null, // null = all departments
    areaId: null, // null = all areas
  });

  // Paginated result from server
  const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<ListEmployeeDto> | null>(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>({
    empCode: '', 
    fullName: '', 
    phoneNumber: '', 
    email: '', 
    position: '',
  });

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Employee | null>(null);

  // Additional filter state for UI
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Fetch employees from server with current query parameters
  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await employeesApi.getAll(queryParams);
      setPaginatedResult(result);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setError('Failed to load employees');
      setPaginatedResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  // Fetch employees when query parameters change
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Handle department filter change
  const handleDepartmentFilterChange = (value: string) => {
    setDepartmentFilter(value);
    setQueryParams({
      ...queryParams,
      dptId: value === 'all' ? null : parseInt(value),
      page: 1,
    });
  };

  const openForm = (item?: Employee) => {
    setEditing(item || null);
    setFormData(item ? { 
      empCode: item.empCode || '', 
      fullName: item.fullName, 
      phoneNumber: item.phoneNumber || '', 
      email: item.email || '', 
      position: item.position || '' 
    } : { 
      empCode: '', fullName: '', phoneNumber: '', email: '', position: '' 
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API to create/update employee
    console.log('Submit employee:', formData);
    setShowForm(false);
    // Refresh data after submission
    fetchEmployees();
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    // TODO: Call API to delete employee
    console.log('Delete employee:', confirmDelete.empId);
    setConfirmDelete(null);
    // Refresh data after deletion
    fetchEmployees();
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
        <button
          onClick={() => openForm()}
          className="btn-primary px-4 py-2 flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Employee
        </button>
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
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              <p className="text-muted-foreground">Loading employees...</p>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="p-4 bg-error-background border border-error-border flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-error-foreground">Error</p>
              <p className="text-sm text-error-foreground">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Employee Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Position</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-border">
              {!paginatedResult || paginatedResult.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No employees found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                paginatedResult.items.map((item) => (
                  <tr key={item.empId} className="hover:bg-accent transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-foreground">{item.empCode || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{item.fullName}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{item.phoneNumber || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{item.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{item.position || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="inline-flex items-center gap-2">
                        <button 
                          onClick={() => openForm(item as Employee)} 
                          className="text-primary-600 inline-flex items-center justify-center hover:text-primary-800 transition-colors"
                          title="Edit employee"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setConfirmDelete(item as Employee)} 
                          className="text-error-foreground inline-flex items-center justify-center hover:text-error-foreground transition-colors"
                          title="Delete employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Pagination Controls */}
      {paginatedResult && !isLoading && !error && (
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
      {showForm && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card rounded-lg max-w-2xl w-full my-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
              <h3 className="text-lg font-semibold text-foreground">{editing ? 'Edit' : 'Add'} Employee</h3>
              <button onClick={() => setShowForm(false)} className="hover:text-muted-foreground transition-colors text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Employee Code</label>
                  <input
                    type="text"
                    value={formData.empCode}
                    onChange={(e) => setFormData({ ...formData, empCode: e.target.value })}
                    placeholder="EMP001"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Doe"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="081-234-5678"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@company.com"
                    className="input-base"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="IT Support"
                    className="input-base"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-primary-foreground rounded-lg hover:bg-primary-700"
                >
                  {editing ? 'Update' : 'Create'} Employee
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
        title="Delete employee"
        description={`Are you sure you want to delete "${confirmDelete?.fullName}"? This action cannot be undone.`}
      />
    </div>
  );
}