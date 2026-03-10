import { X } from 'lucide-react';
import type { Department } from '@/types/data';

export interface DepartmentFormData {
  name: string;
  description: string;
}

interface Props {
  isOpen: boolean;
  editing: Department | null;
  loading: boolean;
  formData: DepartmentFormData;
  onChange: (value: DepartmentFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function DepartmentFormModal({ isOpen, editing, loading, formData, onChange, onSubmit, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-md w-full shadow-xl">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-semibold text-foreground">{editing ? 'Edit Department' : 'Add Department'}</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-placeholder hover:text-muted-foreground disabled:opacity-50 cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Name <span className="text-error-foreground">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              placeholder="e.g., IT Department"
              className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-card text-foreground placeholder-placeholder transition-colors"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              placeholder="Optional description"
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-card text-foreground placeholder-placeholder resize-none transition-colors"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-primary-foreground rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={onClose} disabled={loading} className="btn-secondary flex-1 px-4 py-2">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
