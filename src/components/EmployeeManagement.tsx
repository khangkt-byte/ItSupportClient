import { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import type { Employee, Department, AreaDto } from '../types/data';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from './Pagination';
import { ConfirmDialog } from './ConfirmDialog';

interface Props {
  data: Employee[]; // Changed from ListEmployeeDto[] to Employee[]
  setData: (items: Employee[]) => void; // Changed from ListEmployeeDto[] to Employee[]
  departments: Department[];
  areas: AreaDto[];
}

export function EmployeeManagement({ data, setData, departments, areas }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    empCode: '', fullName: '', phoneNumber: '', email: '', position: '',
  });
  const [confirmDelete, setConfirmDelete] = useState<Employee | null>(null);

  const filtered = useMemo(() => 
    data.filter((emp) =>
      emp.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (emp.empCode && emp.empCode.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
      (emp.email && emp.email.toLowerCase().includes(debouncedSearch.toLowerCase()))
    ),
    [data, debouncedSearch]
  );

  const pagination = usePagination({ data: filtered, itemsPerPage: 15 });

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
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    // TODO: Call API to delete employee
    console.log('Delete employee:', confirmDelete.empId);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
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

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employees..."
            className="input-base pl-10 pr-4 py-2"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Employee ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Position</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {pagination.paginatedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                  No employees found
                </td>
              </tr>
            ) : (
              pagination.paginatedData.map((item) => (
                <tr key={item.empId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-50">{item.empCode || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-50">{item.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-50">{item.phoneNumber || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-50">{item.email || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-50">{item.position || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button 
                      onClick={() => openForm(item)} 
                      className="text-blue-600 hover:text-blue-800 mr-3 cursor-pointer"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setConfirmDelete(item)} 
                      className="text-red-600 hover:text-red-800 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.goToPage}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          totalItems={filtered.length}
          itemsPerPage={15}
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold">{editing ? 'Edit' : 'Add'} Employee</h3>
              <button onClick={() => setShowForm(false)} className="cursor-pointer hover:text-gray-600">
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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