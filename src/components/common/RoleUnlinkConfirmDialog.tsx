/**
 * Role Unlink Confirmation Dialog Component
 * 
 * Specialized dialog for confirming the removal of roles when unchecking
 * inherited permissions in the PermissionEditor component.
 * 
 * Features:
 * - Shows list of roles that will be removed
 * - Displays the specific permission being unlinked
 * - Provides warning message with implications
 */

import { AlertCircle, Shield, X } from 'lucide-react';
import type { RoleDto } from '@/types/data';

interface RoleUnlinkConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rolesToRemove: RoleDto[];
  permissionName: string;
  isLoading?: boolean;
}

export function RoleUnlinkConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  rolesToRemove,
  permissionName,
  isLoading = false
}: RoleUnlinkConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-lg max-w-md w-full border border-border shadow-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-warning-foreground shrink-0 mt-0.5" />
            <h3 className="font-semibold text-lg text-foreground">
              Unlink Permission from Roles?
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer hover:text-muted-foreground transition-colors text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Description */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This permission is inherited from the following roles. Unchecking it will remove these roles:
            </p>
            <p className="text-sm font-semibold bg-info-background text-info-foreground px-3 py-2 rounded-lg">
              Permission: <span className="font-mono">{permissionName}</span>
            </p>
          </div>

          {/* Roles List */}
          <div className="bg-muted rounded-lg p-3 space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Roles to be removed:
            </h4>
            <ul className="space-y-2">
              {rolesToRemove.map((role) => (
                <li
                  key={role.roleId}
                  className="flex items-start gap-3 text-sm text-foreground p-2 rounded hover:bg-background transition-colors"
                >
                  <Shield className="w-4 h-4 text-warning-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{role.name}</div>
                    {role.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {role.description}
                      </p>
                    )}
                    {role.claims && role.claims.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ({role.claims.length} permission{role.claims.length !== 1 ? 's' : ''})
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Warning Message */}
          <div className="bg-warning-background/10 border border-warning-border rounded-lg p-3">
            <p className="text-xs text-warning-foreground">
              <strong>⚠️ Warning:</strong> Other permissions from these roles will be preserved as direct assignments.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 btn-secondary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cancel action"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-warning-background text-warning-foreground rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-label="Confirm removal of roles"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
