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
import { Plus, Edit, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { employeesApi } from '@/services/api/employees';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import type { Employee, Department, AreaDto, EmployeesQueryParams, PaginatedResult, ListEmployeeDto } from '@/types/data';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

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
  const [areaFilter, setAreaFilter] = useState<string>('all');

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

  // Handle area filter change
  const handleAreaFilterChange = (value: string) => {
    setAreaFilter(value);
    setQueryParams({
      ...queryParams,
      areaId: value === 'all' ? null : parseInt(value),
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

  // Pagination controls
  const handlePrevPage = () => {
    if (paginatedResult && paginatedResult.page > 1) {
      setQueryParams({ ...queryParams, page: queryParams.page! - 1 });
    }
  };

  const handleNextPage = () => {
    if (paginatedResult && paginatedResult.page < paginatedResult.totalPages) {
      setQueryParams({ ...queryParams, page: queryParams.page! + 1 });
    }
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && paginatedResult && value <= paginatedResult.totalPages) {
      setQueryParams({ ...queryParams, page: value });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Employee Management</h2>
        <button
          onClick={() => openForm()}
          className="btn-primary px-4 py-2 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      {/* Search, Filter, Sort Bar - Enterprise Style */}
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
      />

      {/* Error State */}
      {error && (
        <div className="card p-4 bg-error-background border-error-foreground">
          <p className="text-error-foreground">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Employee Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Position</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading employees...
                    </div>
                  </td>
                </tr>
              ) : !paginatedResult || paginatedResult.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-lg font-medium">No employees found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedResult.items.map((item) => (
                  <tr key={item.empId} className="group hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-foreground">{item.empCode || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{item.fullName}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{item.phoneNumber || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{item.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{item.position || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openForm(item as Employee)} 
                          className="p-1.5 text-primary-600 hover:text-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-all"
                          title="Edit employee"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setConfirmDelete(item as Employee)} 
                          className="p-1.5 text-error-foreground hover:bg-error-background/50 rounded transition-all"
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

        {/* Pagination Controls - Microsoft 365 style */}
        {paginatedResult && paginatedResult.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={paginatedResult.page === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md text-foreground bg-background border border-input hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={paginatedResult.page >= paginatedResult.totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md text-foreground bg-background border border-input hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Page</span>
              <input
                type="number"
                min="1"
                max={paginatedResult.totalPages}
                value={paginatedResult.page}
                onChange={handlePageInput}
                className="w-16 px-2 py-1 text-center border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                aria-label="Go to page"
              />
              <span>of {paginatedResult.totalPages}</span>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold">{editing ? 'Edit' : 'Add'} Employee</h3>
              <button onClick={() => setShowForm(false)} className="hover:text-muted-foreground">
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