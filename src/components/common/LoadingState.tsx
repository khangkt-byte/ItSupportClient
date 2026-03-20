import { cn } from '@/components/ui/utils';
import { LoadingSpinner, type LoadingSpinnerSize, type LoadingSpinnerTone } from '@/components/common/LoadingSpinner';

interface LoadingStateProps {
  label?: string;
  className?: string;
  spinnerClassName?: string;
  spinnerSize?: LoadingSpinnerSize;
  spinnerTone?: LoadingSpinnerTone;
}

export function LoadingState({
  label = 'Loading...',
  className,
  spinnerClassName,
  spinnerSize = 'lg',
  spinnerTone = 'primary',
}: LoadingStateProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="text-center">
        <LoadingSpinner size={spinnerSize} tone={spinnerTone} className={cn('mx-auto mb-4', spinnerClassName)} />
        <p className="text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
