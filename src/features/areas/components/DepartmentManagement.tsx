import { useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Department, CreateDepartmentDto, UpdateDepartmentDto } from '@/types/data';
import { departmentApi } from '@/services/api/departments';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

interface Props { 
  data: Department[]; 
  setData: (items: Department[]) => void; 
}

export function DepartmentManagement({ data, setData }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Department | null>(null);

  const openForm = (item?: Department) => { 
    setEditing(item || null); 
    setFormData(item 
      ? { name: item.name, description: item.description } 
      : { name: '', description: '' }
    ); 
    setShowForm(true); 
  };

  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editing) {
        // Update existing department via API
        const updateDto: UpdateDepartmentDto = {
          name: formData.name,
          description: formData.description || null,
        };
        
        const updated = await departmentApi.update(editing.id, updateDto);
        
        // Update local state
        setData(data.map((i) => 
          i.id === editing.id 
            ? {
                id: updated.dptId,
                departmentId: updated.dptId,
                name: updated.name,
                description: updated.description || '',
              }
            : i
        ));
        
        toast.success('Department updated successfully');
      } else {
        // Create new department via API
        const createDto: CreateDepartmentDto = {
          name: formData.name,
          description: formData.description || null,
        };
        
        const created = await departmentApi.create(createDto);
        
        // Add to local state
        setData([
          ...data,
          {
            id: created.dptId,
            departmentId: created.dptId,
            name: created.name,
            description: created.description || '',
          }
        ]);
        
        toast.success('Department created successfully');
      }
      
      setShowForm(false);
    } catch (error: any) {
      console.error('Failed to save department:', error);
      toast.error(error.message || 'Failed to save department');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    
    setLoading(true);
    try {
      await departmentApi.delete(confirmDelete.id);
      
      // Remove from local state
      setData(data.filter((i) => i.id !== confirmDelete.id));
      setConfirmDelete(null);
      
      toast.success('Department deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete department:', error);
      
      // Check for business rule violations
      if (error.message?.includes('employees') || error.message?.includes('422')) {
        toast.error('Cannot delete: Department has employees or issue logs');
      } else {
        toast.error(error.message || 'Failed to delete department');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Departments</h2>
        <button 
          onClick={() => openForm()} 
          disabled={loading}
          className="btn-primary px-4 py-2 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Department
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No departments found. Click "Add Department" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col min-h-50">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-50">{item.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {item.description || 'No description'}
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => openForm(item)} 
                  disabled={loading}
                  className="flex-1 px-3 py-2 text-sm bg-primary-50 dark:bg-gray-700 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button 
                  onClick={() => setConfirmDelete(item)} 
                  disabled={loading}
                  className="flex-1 px-3 py-2 text-sm bg-red-50 dark:bg-gray-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                {editing ? 'Edit Department' : 'Add Department'}
              </h3>
              <button 
                onClick={() => setShowForm(false)} 
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 cursor-pointer transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="e.g., IT Department" 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  placeholder="Optional description" 
                  rows={3} 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 resize-none transition-colors"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-600 dark:bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {loading ? 'Saving...' : (editing ? 'Update' : 'Create')}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  disabled={loading}
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
        title="Delete department"
        description={`Are you sure you want to delete "${confirmDelete?.name}"? This department may have employees or issue logs.`}
      />
    </div>
  );
}
