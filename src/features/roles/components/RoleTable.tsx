import { AlertCircle, Edit, Shield, Trash2 } from 'lucide-react';
import type { RoleDto } from '@/types/data';

interface RoleTableProps {
  items: RoleDto[];
  isLoading: boolean;
  error: string | null;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (role: RoleDto) => void;
  onDelete: (role: RoleDto) => void;
}

export function RoleTable({
  items,
  isLoading,
  error,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: RoleTableProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading roles...</p>
          </div>
        </div>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Role Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Permissions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.length > 0 ? (
              items.map((item) => {
                const claimCount = item.claims?.length || 0;

                return (
                  <tr key={item.roleId} className="hover:bg-accent transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">{item.description || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 text-xs rounded bg-primary-100 text-primary-700 font-medium">
                        {claimCount} {claimCount !== 1 ? 'permissions' : 'permission'}
                      </span>
                    </td>
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
                            className="w-4 h-4 text-primary-600 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-primary-800 transition-colors shrink-0"
                            title="Edit role"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="w-4 h-4 text-error-foreground inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-error-foreground transition-colors shrink-0"
                            title="Delete role"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-lg font-medium">No roles found</p>
                  <p className="text-sm mt-1">Create your first role to get started</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
