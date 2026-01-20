import { useState } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import type { Device, DeviceType } from '../types/data';

interface Props { data: Device[]; setData: (items: Device[]) => void; deviceTypes: DeviceType[]; }

export function DeviceManagement({ data, setData, deviceTypes }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Device | null>(null);
  const [formData, setFormData] = useState({ name: '', brand: '', model: '', serialNumber: '', deviceType: '', description: '' });

  const filtered = data.filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.brand.toLowerCase().includes(searchQuery.toLowerCase()));

  const openForm = (item?: Device) => {
    setEditing(item || null);
    setFormData(item ? { name: item.name, brand: item.brand, model: item.model, serialNumber: item.serialNumber, deviceType: item.deviceType, description: item.description } : { name: '', brand: '', model: '', serialNumber: '', deviceType: '', description: '' });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setData(editing ? data.map((i) => (i.id === editing.id ? { ...i, ...formData } : i)) : [...data, { ...formData, id: Date.now().toString() }]);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between"><h2 className="text-2xl font-semibold">Device Management</h2><button onClick={() => openForm()} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"><Plus className="w-5 h-5" />Add</button></div>
      <div className="bg-white border p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div></div>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
          <tbody className="divide-y">{filtered.map((item) => (<tr key={item.id} className="hover:bg-gray-50"><td className="px-6 py-4 text-sm font-medium">{item.name}</td><td className="px-6 py-4 text-sm">{item.brand}</td><td className="px-6 py-4 text-sm">{item.model}</td><td className="px-6 py-4 text-sm">{item.serialNumber}</td><td className="px-6 py-4 text-sm">{item.deviceType}</td><td className="px-6 py-4 text-sm text-right"><button onClick={() => openForm(item)} className="text-blue-600 mr-3"><Edit className="w-4 h-4" /></button><button onClick={() => { if(confirm('Delete?')) setData(data.filter((i) => i.id !== item.id)); }} className="text-red-600"><Trash2 className="w-4 h-4" /></button></td></tr>))}</tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full"><div className="p-6 border-b flex justify-between"><h3 className="text-lg font-semibold">{editing ? 'Edit' : 'Add'} Device</h3><button onClick={() => setShowForm(false)}><X className="w-6 h-6" /></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Name *" className="w-full px-3 py-2 border rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} placeholder="Brand *" className="px-3 py-2 border rounded-lg" />
                <input type="text" required value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} placeholder="Model *" className="px-3 py-2 border rounded-lg" />
                <input type="text" required value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} placeholder="Serial *" className="px-3 py-2 border rounded-lg" />
                <select required value={formData.deviceType} onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })} className="px-3 py-2 border rounded-lg"><option value="">Type *</option>{deviceTypes.map((t) => (<option key={t.id} value={t.name}>{t.name}</option>))}</select>
              </div>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description" rows={3} className="w-full px-3 py-2 border rounded-lg" />
              <div className="flex gap-3"><button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">{editing ? 'Update' : 'Create'}</button><button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">Cancel</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
