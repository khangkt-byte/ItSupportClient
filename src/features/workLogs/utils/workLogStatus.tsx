import type { JSX } from 'react';
import { CheckCircle2, Clock, PlayCircle, XCircle } from 'lucide-react';
import type { WorkStatus } from '@/types/data';

export function getWorkLogStatusLabel(status: WorkStatus): string {
  const labels: Record<string, string> = {
    pending: 'PENDING',
    'in-progress': 'IN PROGRESS',
    resolved: 'RESOLVED',
    cancelled: 'CANCELLED',
  };

  return labels[status] || status?.toUpperCase() || 'UNKNOWN';
}

export function getWorkLogStatusIcon(status: WorkStatus): JSX.Element | null {
  const iconProps = { className: 'w-3 h-3', strokeWidth: 2.5 };
  const icons: Record<string, JSX.Element> = {
    pending: <Clock {...iconProps} />,
    'in-progress': <PlayCircle {...iconProps} />,
    resolved: <CheckCircle2 {...iconProps} />,
    cancelled: <XCircle {...iconProps} />,
  };
  const icon = icons[status];

  if (!icon) return null;

  // Keep icon footprint aligned between Lucide glyphs.
  return <span className="inline-flex w-3 h-3 shrink-0 items-center justify-center">{icon}</span>;
}

export function getWorkLogStatusBadgeClass(status: WorkStatus): string {
  const base =
    'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium leading-4 tracking-wide transition-colors';
  const styles: Record<string, string> = {
    pending: 'bg-warning-background text-warning-foreground ring-1 ring-inset ring-warning-border',
    'in-progress': 'bg-info-background text-info-foreground ring-1 ring-inset ring-info-border',
    resolved: 'bg-success-background text-success-foreground ring-1 ring-inset ring-success-border',
    cancelled: 'bg-muted text-muted-foreground ring-1 ring-inset ring-border',
  };

  return `${base} ${styles[status] || 'bg-muted text-muted-foreground ring-1 ring-inset ring-border'}`;
}