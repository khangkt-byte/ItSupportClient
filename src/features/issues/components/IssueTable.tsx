import { AlertCircle, Bug, Edit, Trash2 } from 'lucide-react';
import type { IssueDto } from '@/types/data';
import { LoadingState } from '@/components/common/LoadingState';

interface IssueTableProps {
  items: IssueDto[];
  isLoading: boolean;
  error: string | null;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (issue: IssueDto) => void;
  onDelete: (issue: IssueDto) => void;
}

export function IssueTable({
  items,
  isLoading,
  error,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: IssueTableProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      {isLoading && (
        <LoadingState className="py-12" spinnerSize="md" label="Loading issues..." />
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
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Issue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Usage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.issId} className="hover:bg-accent transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs truncate">{item.description || 'No description'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{item.category || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{item.severity ?? 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{item.usageCount}</td>
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
                          title="Edit issue"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="text-error-foreground inline-flex items-center justify-center hover:text-error-foreground transition-colors"
                          title="Delete issue"
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
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  <Bug className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-lg font-medium">No issues found</p>
                  <p className="text-sm mt-1">Create your first issue to build the knowledge base</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
