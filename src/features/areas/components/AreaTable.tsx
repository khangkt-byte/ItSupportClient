import { Edit, MapPin, Trash2, AlertCircle } from 'lucide-react';
import type { AreaDto } from '@/types/data';
import { LoadingState } from '@/components/common/LoadingState';

interface Props {
  isLoading: boolean;
  error: string | null;
  items: AreaDto[];
  onEdit: (item: AreaDto) => void;
  onDelete: (item: AreaDto) => void;
}

export function AreaTable({ isLoading, error, items, onEdit, onDelete }: Props) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      {isLoading && (
        <LoadingState className="py-12" spinnerSize="md" label="Loading areas..." />
      )}

      {error && !isLoading && (
        <div className="p-4 bg-error-background border border-error-border flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-error-foreground mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-error-foreground">Error</p>
            <p className="text-sm text-error-foreground">{error}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Area Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.areaId} className="hover:bg-accent transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{item.description || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="text-primary-600 inline-flex items-center justify-center hover:text-primary-800 transition-colors"
                        title="Edit area"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="text-error-foreground inline-flex items-center justify-center hover:text-error-foreground transition-colors"
                        title="Delete area"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-lg font-medium">No areas found</p>
                  <p className="text-sm mt-1">Create your first area to get started</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
