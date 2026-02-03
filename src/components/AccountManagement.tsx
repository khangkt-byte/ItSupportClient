import { useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import type { Account, Employee, Role } from '../types/data';

interface Props { data: Account[]; setData: (items: Account[]) => void; employees: Employee[]; roles: Role[]; }

export function AccountManagement({ data, setData, employees, roles }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [formData, setFormData] = useState({ employeeId: '', username: '', password: '', role: '' });

  const getEmployeeName = (empId: string) => employees.find((e) => e.employeeId === empId)?.fullName || 'Unknown';

  const openForm = (item?: Account) => { setEditing(item || null); setFormData(item ? { employeeId: item.employeeId, username: item.username, password: item.password, role: item.role } : { employeeId: '', username: '', password: '', role: '' }); setShowForm(true); };
  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    const employee = employees.find((e) => e.employeeId === formData.employeeId);
    setData(editing 
      ? data.map((i) => (i.id === editing.id ? { ...i, ...formData } : i)) 
      : [...data, { 
          ...formData, 
          id: Date.now().toString(), 
          accountId: Date.now().toString(),
          empName: employee?.fullName || '',
          empCode: employee?.empCode || null,
          employeeName: employee?.fullName || '',
          employeeCode: employee?.empCode || null, // Fixed: use empCode instead of employeeCode
          isLocked: false,
          lastLoginAt: null,
          createdAt: new Date().toISOString(),
          deleteDate: null 
        }]
    ); 
    setShowForm(false); 
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between"><h2 className="text-2xl font-semibold">Accounts</h2><button onClick={() => openForm()} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 cursor-pointer hover:bg-blue-700"><Plus className="w-5 h-5" />Add</button></div>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full"><thead className="bg-gray-50 border-b"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
          <tbody className="divide-y">{data.map((item) => (<tr key={item.id} className="hover:bg-gray-50"><td className="px-6 py-4 text-sm">{getEmployeeName(item.employeeId)}</td><td className="px-6 py-4 text-sm font-medium">{item.username}</td><td className="px-6 py-4 text-sm"><span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">{item.role}</span></td><td className="px-6 py-4 text-sm text-right"><div className="inline-flex items-center gap-2"><button onClick={() => openForm(item)} className="text-blue-600 inline-flex items-center justify-center cursor-pointer hover:text-blue-800"><Edit className="w-4 h-4" /></button><button onClick={() => { if(confirm('Delete?')) setData(data.filter((i) => i.id !== item.id)); }} className="text-red-600 inline-flex items-center justify-center cursor-pointer hover:text-red-800"><Trash2 className="w-4 h-4" /></button></div></td></tr>))}</tbody>
        </table>
      </div>
      {showForm && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-lg max-w-md w-full"><div className="p-6 border-b flex justify-between"><h3 className="text-lg font-semibold">{editing ? 'Edit' : 'Add'}</h3><button onClick={() => setShowForm(false)} className="cursor-pointer hover:text-gray-600"><X className="w-6 h-6" /></button></div><form onSubmit={handleSubmit} className="p-6 space-y-4"><div><label className="block text-sm font-medium mb-1">Employee <span className="text-red-500">*</span></label><select required value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} className="w-full px-3 py-2 border rounded-lg"><option value="">Select employee...</option>{employees.map((emp) => (<option key={emp.id} value={emp.employeeId}>{emp.employeeId} - {emp.fullName}</option>))}</select></div><div><label className="block text-sm font-medium mb-1">Username <span className="text-red-500">*</span></label><input type="text" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="Username" className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium mb-1">Password <span className="text-red-500">*</span></label><input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Password" className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium mb-1">Role <span className="text-red-500">*</span></label><select required value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-3 py-2 border rounded-lg"><option value="">Select role...</option>{roles.map((role) => (<option key={role.id} value={role.name}>{role.name}</option>))}</select></div><div className="flex gap-3"><button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">{editing ? 'Update' : 'Create'}</button><button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300">Cancel</button></div></form></div></div>)}
    </div>
  );
}