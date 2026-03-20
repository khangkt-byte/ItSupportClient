import { cn } from '@/components/ui/utils';

export type LoadingSpinnerSize = 'sm' | 'md' | 'lg';
export type LoadingSpinnerTone = 'primary' | 'current' | 'inverse';

interface LoadingSpinnerProps {
  size?: LoadingSpinnerSize;
  tone?: LoadingSpinnerTone;
  className?: string;
}

const sizeClasses: Record<LoadingSpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-16 w-16 border-4',
};

const toneClasses: Record<LoadingSpinnerTone, string> = {
  primary: 'border-primary-200 border-t-primary-600',
  current: 'border-current/30 border-t-current',
  inverse: 'border-white/40 border-t-white',
};

export function LoadingSpinner({
  size = 'md',
  tone = 'primary',
  className,
}: LoadingSpinnerProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block rounded-full animate-spin',
        sizeClasses[size],
        toneClasses[tone],
        className,
      )}
    />
  );
}
