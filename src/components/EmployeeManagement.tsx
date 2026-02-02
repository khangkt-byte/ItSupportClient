import { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import type { ListEmployeeDto, Department, AreaDto } from '../types/data';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from './Pagination';

interface Props {
  data: ListEmployeeDto[];
  setData: (items: ListEmployeeDto[]) => void;
  departments: Department[];
  areas: AreaDto[];
}

export function EmployeeManagement({ data, setData, departments, areas }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ListEmployeeDto | null>(null);
  const [formData, setFormData] = useState({
    empCode: '', fullName: '', phoneNumber: '', email: '', position: '',
  });

  const filtered = useMemo(() => 
    data.filter((emp) =>
      emp.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (emp.empCode && emp.empCode.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
      (emp.email && emp.email.toLowerCase().includes(debouncedSearch.toLowerCase()))
    ),
    [data, debouncedSearch]
  );

  const pagination = usePagination({ data: filtered, itemsPerPage: 15 });

  const openForm = (item?: ListEmployeeDto) => {
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

  const handleDelete = (empId: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      // TODO: Call API to delete employee
      console.log('Delete employee:', empId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Employee Management</h2>
        <button 
          onClick={() => openForm()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      {/* Search */}
      <div style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border-hr)' }} className="border p-4 rounded-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employees..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            style={{ borderColor: 'var(--color-border-hr)' }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border-hr)' }} className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-hr)' }} className="border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--color-text-secondary)' }}>Employee ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--color-text-secondary)' }}>Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--color-text-secondary)' }}>Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--color-text-secondary)' }}>Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--color-text-secondary)' }}>Position</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase" style={{ color: 'var(--color-text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--color-border-hr)' }}>
            {pagination.paginatedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                  No employees found
                </td>
              </tr>
            ) : (
              pagination.paginatedData.map((item) => (
                <tr key={item.empId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 text-sm">{item.empCode || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm font-medium">{item.fullName}</td>
                  <td className="px-6 py-4 text-sm">{item.phoneNumber || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">{item.email || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">{item.position || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button 
                      onClick={() => openForm(item)} 
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.empId)} 
                      className="text-red-600 hover:text-red-800"
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
          <div style={{ background: 'var(--color-bg-card)' }} className="rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--color-border-hr)' }}>
              <h3 className="text-lg font-semibold">{editing ? 'Edit' : 'Add'} Employee</h3>
              <button onClick={() => setShowForm(false)}>
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
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: 'var(--color-border-hr)' }}
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
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: 'var(--color-border-hr)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="081-234-5678"
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: 'var(--color-border-hr)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@company.com"
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: 'var(--color-border-hr)' }}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="IT Support"
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: 'var(--color-border-hr)' }}
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
                  className="flex-1 px-4 py-2 rounded-lg"
                  style={{ background: 'var(--color-bg-secondary)' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
