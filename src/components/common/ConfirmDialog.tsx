/**
 * Reusable Confirmation Dialog Component
 * 
 * A customizable modal for confirming destructive actions (delete, lock, etc.)
 * with action-specific styling and icons.
 */

import { X, Trash2, Lock, Unlock, AlertCircle } from 'lucide-react';

export type ConfirmAction = 'delete' | 'lock' | 'unlock' | 'logout' | 'custom';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: ConfirmAction;
  title: string;
  description: string;
  confirmLabel?: string;
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
        return 'bg-red-600 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-700';
      case 'lock':
        return 'bg-orange-600 dark:bg-orange-600 hover:bg-orange-700 dark:hover:bg-orange-700';
      case 'unlock':
        return 'bg-green-600 dark:bg-green-600 hover:bg-green-700 dark:hover:bg-green-700';
      case 'logout':
        return 'bg-red-600 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-700';
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
            className="cursor-pointer hover:text-muted-foreground transition-colors text-foreground"
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
            className="btn-secondary flex-1 px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg text-white cursor-pointer transition-colors ${getButtonClass()}`}
          >
            {getConfirmLabel()}
          </button>
        </div>
      </div>
    </div>
  );
}
