/**
 * Reusable Confirmation Dialog Component
 * 
 * A customizable modal for confirming destructive actions (delete, lock, etc.)
 * with action-specific styling and icons.
 */

import { X, Trash2, Lock, Unlock, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export type ConfirmAction = 'delete' | 'lock' | 'unlock' | 'logout' | 'custom';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: ConfirmAction;
  title: string;
  description: string;
  confirmLabel?: string;
  loadingLabel?: string;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  action,
  title,
  description,
  confirmLabel,
  loadingLabel,
  isLoading = false,
  icon
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    if (icon) return icon;
    switch (action) {
      case 'delete':
        return <Trash2 className="w-5 h-5 text-red-600" />;
      case 'lock':
        return <Lock className="w-6 h-6 text-orange-600" />;
      case 'unlock':
        return <Unlock className="w-5 h-5 text-green-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-primary-600" />;
    }
  };

  const getButtonClass = () => {
    switch (action) {
      case 'delete':
        return 'bg-destructive dark:bg-destructive hover:bg-destructive/90 dark:hover:bg-destructive/90';
      case 'lock':
        return 'bg-orange-600 dark:bg-orange-600 hover:bg-orange-700 dark:hover:bg-orange-700';
      case 'unlock':
        return 'bg-green-600 dark:bg-green-600 hover:bg-green-700 dark:hover:bg-green-700';
      case 'logout':
        return 'bg-destructive dark:bg-destructive hover:bg-destructive/90 dark:hover:bg-destructive/90';
      default:
        return 'bg-primary-600 dark:bg-primary-600 hover:bg-primary-700 dark:hover:bg-primary-700';
    }
  };

  const getConfirmLabel = () => {
    if (confirmLabel) return confirmLabel;
    switch (action) {
      case 'delete':
        return 'Delete';
      case 'lock':
        return 'Lock';
      case 'unlock':
        return 'Unlock';
      case 'logout':
        return 'Logout';
      default:
        return 'Confirm';
    }
  };

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              {getIcon()}
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer hover:text-muted-foreground transition-colors text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-base text-muted-foreground">{description}</p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn-secondary flex-1 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg text-destructive-foreground cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${getButtonClass()}`}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" tone="inverse" />
                {loadingLabel || 'Processing...'}
              </>
            ) : (
              getConfirmLabel()
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
