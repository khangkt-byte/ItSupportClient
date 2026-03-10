import { AlertCircle, Building2, Edit, Trash2 } from 'lucide-react';
import type { DepartmentDto } from '@/types/data';

interface Props {
  loading: boolean;
  error: string | null;
  items: DepartmentDto[];
  onEdit: (item: DepartmentDto) => void;
  onDelete: (item: DepartmentDto) => void;
}

export function DepartmentTable({ loading, error, items, onEdit, onDelete }: Props) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading departments...</p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-error-background border border-error-border flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-error-foreground mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-error-foreground">Error</p>
            <p className="text-sm text-error-foreground">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Department Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Employees</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Issues</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.dptId} className="hover:bg-accent transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{item.description || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{item.employeeCount}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{item.issueLogCount}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        disabled={loading}
                        className="text-primary-600 inline-flex items-center justify-center hover:text-primary-800 transition-colors disabled:opacity-50"
                        title="Edit department"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        disabled={loading}
                        className="text-error-foreground inline-flex items-center justify-center hover:text-error-foreground transition-colors disabled:opacity-50"
                        title="Delete department"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-lg font-medium">No departments found</p>
                  <p className="text-sm mt-1">Create your first department to get started</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
