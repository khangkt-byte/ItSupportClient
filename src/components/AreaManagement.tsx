import { useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import type { Area } from '../types/data';
import { ConfirmDialog } from './ConfirmDialog';

interface Props {
  data: Area[];
  setData: (items: Area[]) => void;
}

export function AreaManagement({ data, setData }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Area | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [confirmDelete, setConfirmDelete] = useState<Area | null>(null);

  const openForm = (item?: Area) => {
    setEditing(item || null);
    setFormData(item ? { name: item.name, description: item.description || '' } : { name: '', description: '' });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = Date.now();
    setData(editing
      ? data.map((i) => (i.id === editing.id ? { ...i, ...formData } : i))
      : [...data, { 
          ...formData, 
          id: timestamp.toString(), 
          areaId: timestamp, // Add areaId
          createdAt: new Date().toISOString(), 
          updatedAt: null 
        }]);
    setShowForm(false);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    setData(data.filter((i) => i.id !== confirmDelete.id));
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">Areas</h2>
        <button onClick={() => openForm()} className="btn-primary px-4 py-2 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col min-h-[180px]">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-50">{item.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => openForm(item)} className="flex-1 px-3 py-2 text-sm bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button onClick={() => setConfirmDelete(item)} className="flex-1 px-3 py-2 text-sm bg-red-50 dark:bg-gray-700 text-red-600 dark:text-red-400 rounded-lg cursor-pointer hover:bg-red-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col min-h-[200px]">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{editing ? 'Edit' : 'Add'}</h3>
              <button onClick={() => setShowForm(false)} className="cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 text-gray-900 dark:text-gray-50 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Name *"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              />
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1 px-4 py-2">
                  {editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 px-4 py-2">
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
        title="Delete area"
        description={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}