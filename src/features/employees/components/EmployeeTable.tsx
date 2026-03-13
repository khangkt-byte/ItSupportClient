import { AlertCircle, Edit, Trash2, User } from 'lucide-react';
import type { ListEmployeeDto } from '@/types/data';
import { LoadingState } from '@/components/common/LoadingState';

interface Props {
  loading: boolean;
  error: string | null;
  items: ListEmployeeDto[];
  onEdit: (item: ListEmployeeDto) => void;
  onDelete: (item: ListEmployeeDto) => void;
}

export function EmployeeTable({ loading, error, items, onEdit, onDelete }: Props) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      {loading && (
        <LoadingState className="py-12" spinnerSize="md" label="Loading employees..." />
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Employee Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Position</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No employees found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.empId} className="hover:bg-accent transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-foreground">{item.empCode || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{item.fullName}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{item.phoneNumber || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{item.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{item.position || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => onEdit(item)}
                          disabled={loading}
                          className="text-primary-600 inline-flex items-center justify-center hover:text-primary-800 transition-colors disabled:opacity-50"
                          title="Edit employee"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(item)}
                          disabled={loading}
                          className="text-error-foreground inline-flex items-center justify-center hover:text-error-foreground transition-colors disabled:opacity-50"
                          title="Delete employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
