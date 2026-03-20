import { Edit, Lock, Trash2, Unlock, User } from 'lucide-react';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import type { ListAccountDto } from '@/types/data';
import { LoadingState } from '@/components/common/LoadingState';

interface AccountTableProps {
  items: ListAccountDto[];
  isLoading: boolean;
  error: string | null;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (accountId: string) => void;
  onLockToggle: (accountId: string) => void;
  onDelete: (accountId: string) => void;
}

export function AccountTable({
  items,
  isLoading,
  error,
  canEdit,
  canDelete,
  onEdit,
  onLockToggle,
  onDelete,
}: AccountTableProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      {isLoading && (
        <LoadingState className="py-12" spinnerSize="md" label="Loading accounts..." />
      )}

      {error && !isLoading && (
        <ErrorAlert message={error} className="m-4" />
      )}

      {!isLoading && !error && (
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Employee Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Permissions</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.accountId} className="hover:bg-accent transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{item.empName || 'Unknown'}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{item.empCode || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-placeholder" />
                      {item.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {item.isLocked ? (
                      <span className="px-2 py-1 text-xs rounded bg-error-background text-error-foreground font-medium flex items-center gap-1 w-fit">
                        <Lock className="w-3 h-3" />
                        Locked
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded bg-success-background text-success-foreground font-medium flex items-center gap-1 w-fit">
                        <Unlock className="w-3 h-3" />
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 text-xs rounded bg-primary-100 text-primary-700 flex items-center gap-1 w-fit">
                      {((item as { totalClaims?: number }).totalClaims ?? 0)} {((item as { totalClaims?: number }).totalClaims ?? 0) !== 1 ? 'permissions' : 'permission'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="inline-flex items-center gap-2">
                      {canEdit && (
                        <>
                          <button
                            onClick={() => onEdit(item.accountId)}
                            className="w-4 h-4 text-primary-600 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-primary-800 transition-colors shrink-0"
                            title="Edit account"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onLockToggle(item.accountId)}
                            className={`w-4 h-4 inline-flex items-center justify-center rounded-md hover:bg-accent transition-colors shrink-0 ${
                              item.isLocked
                                ? 'text-success-foreground hover:text-success-foreground'
                                : 'text-warning-foreground hover:text-warning-foreground'
                            }`}
                            title={item.isLocked ? 'Unlock account' : 'Lock account'}
                          >
                            {item.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>
                        </>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(item.accountId)}
                          className="w-4 h-4 text-error-foreground inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-error-foreground transition-colors shrink-0"
                          title="Delete account"
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
                  <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-lg font-medium">No accounts found</p>
                  <p className="text-sm mt-1">Create your first account to get started</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
