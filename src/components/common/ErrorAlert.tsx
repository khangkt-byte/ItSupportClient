import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  title?: string;
  details?: string[];
  onDismiss?: () => void;
  dismissDisabled?: boolean;
  className?: string;
}

export function ErrorAlert({
  message,
  title = 'Error',
  details = [],
  onDismiss,
  dismissDisabled = false,
  className = '',
}: ErrorAlertProps) {
  return (
    <div className={`rounded-lg border border-error-border bg-error-background p-4 flex items-start gap-3 ${className}`.trim()}>
      <AlertCircle className="w-5 h-5 text-error-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-error-foreground">{title}</p>
        <p className="text-sm text-error-foreground mt-0.5">{message}</p>
        {details.length > 0 && (
          <ul className="mt-2 list-disc list-inside text-sm text-error-foreground space-y-1">
            {details.map((detail, index) => (
              <li key={`${detail}-${index}`}>{detail}</li>
            ))}
          </ul>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          disabled={dismissDisabled}
          className="text-error-foreground hover:text-error-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}