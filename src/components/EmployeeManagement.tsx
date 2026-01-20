import { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import type { Employee } from '../types/data';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from './Pagination';

interface Props {
  data: Employee[];
  setData: (items: Employee[]) => void;
}

export function EmployeeManagement({ data, setData }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '', fullName: '', birthday: '', department: '', area: '', phoneNumber: '', email: '',
  });

  const filtered = useMemo(() => 
    data.filter((emp) =>
      emp.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(debouncedSearch.toLowerCase())
    ),
    [data, debouncedSearch]
  );

  const pagination = usePagination({ data: filtered, itemsPerPage: 15 });

  const openForm = (item?: Employee) => {
    setEditing(item || null);
    setFormData(item ? { employeeId: item.employeeId, fullName: item.fullName, birthday: item.birthday, department: item.department, area: item.area, phoneNumber: item.phoneNumber, email: item.email } : { employeeId: '', fullName: '', birthday: '', department: '', area: '', phoneNumber: '', email: '' });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setData(editing ? data.map((i) => (i.id === editing.id ? { ...i, ...formData } : i)) : [...data, { ...formData, id: Date.now().toString(), deleteDate: null }]);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete?')) setData(data.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">Employee Management</h2>
        <button onClick={() => openForm()} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"><Plus className="w-5 h-5" />Add</button>
      </div>
      <div className="bg-white border p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div></div>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Birthday</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pagination.paginatedData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{item.employeeId}</td>
                <td className="px-6 py-4 text-sm font-medium">{item.fullName}</td>
                <td className="px-6 py-4 text-sm">{item.birthday}</td>
                <td className="px-6 py-4 text-sm">{item.department}</td>
                <td className="px-6 py-4 text-sm">{item.area}</td>
                <td className="px-6 py-4 text-sm">{item.phoneNumber}</td>
                <td className="px-6 py-4 text-sm">{item.email}</td>
                <td className="px-6 py-4 text-sm text-right">
                  <button onClick={() => openForm(item)} className="text-blue-600 mr-3"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
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
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b flex justify-between"><h3 className="text-lg font-semibold">{editing ? 'Edit' : 'Add'} Employee</h3><button onClick={() => setShowForm(false)}><X className="w-6 h-6" /></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} placeholder="Employee ID *" className="px-3 py-2 border rounded-lg" />
                <input type="text" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Full Name *" className="px-3 py-2 border rounded-lg" />
                <input type="date" required value={formData.birthday} onChange={(e) => setFormData({ ...formData, birthday: e.target.value })} placeholder="Birthday *" className="px-3 py-2 border rounded-lg" />
                <input type="tel" required value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="Phone *" className="px-3 py-2 border rounded-lg" />
                <input type="text" required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="Department *" className="px-3 py-2 border rounded-lg" />
                <input type="text" required value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} placeholder="Area *" className="px-3 py-2 border rounded-lg" />
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email *" className="col-span-2 px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex gap-3"><button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">{editing ? 'Update' : 'Create'}</button><button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">Cancel</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}