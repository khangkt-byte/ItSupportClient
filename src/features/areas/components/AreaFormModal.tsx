import { X } from 'lucide-react';
import type { Area } from '@/types/data';

export interface AreaFormData {
  name: string;
  description: string;
}

interface Props {
  isOpen: boolean;
  editing: Area | null;
  formData: AreaFormData;
  isLoading: boolean;
  onChange: (data: AreaFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function AreaFormModal({ isOpen, editing, formData, isLoading, onChange, onSubmit, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm w-full max-w-xl">
        <div className="px-6 py-4 border-b border-border flex justify-between">
          <h3 className="text-lg font-semibold text-foreground">{editing ? 'Edit' : 'Add'}</h3>
          <button onClick={onClose} className="hover:text-muted-foreground text-foreground transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
            placeholder="Name *"
            className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground placeholder-placeholder focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
          <textarea
            value={formData.description}
            onChange={(e) => onChange({ ...formData, description: e.target.value })}
            placeholder="Description"
            rows={3}
            className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground placeholder-placeholder focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
          />
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1 px-4 py-2" disabled={isLoading}>
              {editing ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1 px-4 py-2" disabled={isLoading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
