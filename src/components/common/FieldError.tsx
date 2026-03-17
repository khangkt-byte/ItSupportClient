import { AlertCircle } from 'lucide-react';

interface FieldErrorProps {
  messages: string[];
  className?: string;
}

export function FieldError({ messages, className = '' }: FieldErrorProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className={`mt-1 space-y-1 ${className}`.trim()} role="alert" aria-live="polite">
      {messages.map((message, index) => (
        <p key={`${message}-${index}`} className="flex items-start gap-1.5 text-sm text-error-foreground">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{message}</span>
        </p>
      ))}
    </div>
  );
}
