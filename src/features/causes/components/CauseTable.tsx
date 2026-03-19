import { AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { LoadingState } from '@/components/common/LoadingState';
import type { ListCauseDto } from '@/types/data';

interface CauseTableProps {
  items: ListCauseDto[];
  isLoading: boolean;
  error: string | null;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (cause: ListCauseDto) => void;
  onDelete: (cause: ListCauseDto) => void;
}

export function CauseTable({
  items,
  isLoading,
  error,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: CauseTableProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      {isLoading && (
        <LoadingState className="py-12" spinnerSize="md" label="Loading causes..." />
      )}

      {error && !isLoading && (
        <ErrorAlert message={error} className="m-4" />
      )}

      {!isLoading && !error && (
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Cause</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Issue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Usage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.causeId} className="hover:bg-accent transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{item.issueName || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{item.usageCount}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="inline-flex items-center gap-2">
                      {canEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="text-primary-600 inline-flex items-center justify-center hover:text-primary-800 transition-colors"
                          title="Edit cause"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="text-error-foreground inline-flex items-center justify-center hover:text-error-foreground transition-colors"
                          title="Delete cause"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-lg font-medium">No causes found</p>
                  <p className="text-sm mt-1">Create your first cause to improve issue resolution quality</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
