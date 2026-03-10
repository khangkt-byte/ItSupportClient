import { AlertCircle, AlertTriangle, CheckCircle2, Eye, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { WCAGViolation } from '@/utils/accessibilityReport';

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-error-background text-error-foreground border-error-border';
    case 'high':
      return 'bg-warning-background text-warning-foreground border-warning-border';
    case 'medium':
      return 'bg-warning-background text-warning-foreground border-warning-border';
    case 'low':
      return 'bg-info-background text-info-foreground border-info-border';
    default:
      return 'bg-accent text-foreground border-input';
  }
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <AlertCircle className="w-5 h-5" />;
    case 'high':
      return <AlertTriangle className="w-5 h-5" />;
    case 'medium':
      return <Eye className="w-5 h-5" />;
    case 'low':
      return <CheckCircle2 className="w-5 h-5" />;
    default:
      return null;
  }
};

function Swatch({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-10 h-10 rounded border border-input shadow-sm"
        style={{ backgroundColor: color }}
        title={color}
      />
      <span className="text-sm font-mono text-muted-foreground">{color}</span>
    </div>
  );
}

interface AccessibilityViolationRowProps {
  violation: WCAGViolation;
  index: number;
  expandedViolation: number | null;
  onToggle: (index: number) => void;
  getViolationSuggestions: (violation: WCAGViolation) => string;
}

export function AccessibilityViolationRow({
  violation,
  index,
  expandedViolation,
  onToggle,
  getViolationSuggestions,
}: AccessibilityViolationRowProps) {
  const isExpanded = expandedViolation === index;
  const suggestions = getViolationSuggestions(violation);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => onToggle(index)}
        className={`w-full p-4 flex items-center gap-4 hover:bg-muted transition-colors border-l-4 ${getSeverityColor(
          violation.severity
        )}`}
      >
        <div className="shrink-0">{getSeverityIcon(violation.severity)}</div>

        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {violation.foreground} on {violation.background}
            </span>
            <span className="text-xs font-mono bg-secondary px-2 py-1 rounded">
              {violation.currentRatio.toFixed(2)}:1
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Required: {violation.requiredRatio.toFixed(2)}:1 ({violation.level})
          </p>
        </div>

        <Badge variant="outline" className={`capitalize ${getSeverityColor(violation.severity)}`}>
          {violation.severity}
        </Badge>
      </button>

      {isExpanded && (
        <div className="p-4 bg-muted border-t">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Color Preview</h4>
              <div className="space-y-2">
                <Swatch color={violation.foreground} />
                <Swatch color={violation.background} />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Contrast Analysis</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Current Ratio:</span>{' '}
                  <span className="font-mono font-bold">{violation.currentRatio.toFixed(2)}:1</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Required ({violation.level}):</span>{' '}
                  <span className="font-mono font-bold">{violation.requiredRatio.toFixed(2)}:1</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Shortfall:</span>{' '}
                  <span className="font-mono font-bold text-error-foreground">
                    {(violation.requiredRatio - violation.currentRatio).toFixed(2)}:1
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                How to Fix
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{suggestions}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
