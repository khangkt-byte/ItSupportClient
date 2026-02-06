import { useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { Department, CreateDepartmentDto, UpdateDepartmentDto } from '../types/data';
import { departmentApi } from '../lib/api/departments';

interface Props { 
  data: Department[]; 
  setData: (items: Department[]) => void; 
}

export function DepartmentManagement({ data, setData }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

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

  const handleDelete = async (item: Department) => {
    if (!confirm(`Delete department "${item.name}"?`)) return;
    
    setLoading(true);
    try {
      await departmentApi.delete(item.id);
      
      // Remove from local state
      setData(data.filter((i) => i.id !== item.id));
      
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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div key={item.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {item.description || 'No description'}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => openForm(item)} 
                  disabled={loading}
                  className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(item)} 
                  disabled={loading}
                  className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 flex items-center justify-center gap-1"
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
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {editing ? 'Edit Department' : 'Add Department'}
              </h3>
              <button 
                onClick={() => setShowForm(false)} 
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="e.g., IT Department" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  placeholder="Optional description" 
                  rows={3} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Saving...' : (editing ? 'Update' : 'Create')}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 font-medium"
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
