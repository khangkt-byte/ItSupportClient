import { useState, useMemo } from 'react';
import {
    AlertCircle,
    CheckCircle2,
    Download,
    Code,
} from 'lucide-react';
import { useAccessibilityReport } from '@/features/accessibility/hooks/useAccessibilityReport';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { WCAGViolation, ColorEntry } from '@/utils/accessibilityReport';
import { AccessibilityViolationRow } from '@/features/accessibility/components/AccessibilityViolationRow';
import { LoadingState } from '@/components/common/LoadingState';

/**
 * AccessibilityReportViewer Component
 * 
 * Displays WCAG accessibility report for the current theme
 * Shows violations, color pairs, and remediation suggestions
 * 
 * Features:
 * - Real-time report generation
 * - Violation filtering and sorting
 * - Color swatch previews
 * - Remediation suggestions
 * - Export to JSON/HTML
 * - WCAG level toggle (AA/AAA)
 * 
 * @component
 */
export function AccessibilityReportViewer() {
    const {
        report,
        isLoading,
        error,
        wcagLevel,
        setWcagLevel,
        downloadReport,
        getViolationSuggestions,
        violationCount,
        criticalIssues,
    } = useAccessibilityReport();

    const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
    const [expandedViolation, setExpandedViolation] = useState<number | null>(null);

    // Filter violations by severity
    const filteredViolations = useMemo(() => {
        if (!report) return [];
        if (selectedSeverity === 'all') return report.violations;
        return report.violations.filter((v: WCAGViolation) => v.severity === selectedSeverity);
    }, [report, selectedSeverity]);

    if (isLoading) {
        return (
            <LoadingState className="p-8" spinnerSize="md" label="Generating accessibility report..." />
        );
    }

    if (error) {
        return (
            <Card className="p-6 bg-error-background border-error-border">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-error-foreground shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-error-foreground">Error generating report</h3>
                        <p className="text-sm text-error-foreground mt-1">{error}</p>
                    </div>
                </div>
            </Card>
        );
    }

    if (!report) {
        return (
            <Card className="p-6">
                <p className="text-muted-foreground text-center">No report available</p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Accessibility Report</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Theme: <span className="font-semibold capitalize">{report.themeName}</span> •
                        Generated: {new Date(report.generatedAt).toLocaleString()}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadReport('json')}
                        className="gap-2"
                    >
                        <Download className="w-4 h-4" />
                        JSON
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadReport('html')}
                        className="gap-2"
                    >
                        <Download className="w-4 h-4" />
                        HTML
                    </Button>
                </div>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Compliance Status */}
                <Card className={`p-4 ${report.passedAA ? 'bg-success-background border-success-border' : 'bg-error-background border-error-border'}`}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        WCAG AA
                    </p>
                    <p className="text-2xl font-bold">
                        {report.passedAA ? '✓' : '✗'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        {report.passedAA ? 'Compliant' : 'Non-compliant'}
                    </p>
                </Card>

                {/* AAA Status */}
                <Card className={`p-4 ${report.passedAAA ? 'bg-success-background border-success-border' : 'bg-warning-background border-warning-border'}`}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        WCAG AAA
                    </p>
                    <p className="text-2xl font-bold">
                        {report.passedAAA ? '✓' : '◐'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        {report.passedAAA ? 'Compliant' : 'Partial'}
                    </p>
                </Card>

                {/* Total Violations */}
                <Card
                    className={`p-4 ${violationCount === 0 ? 'bg-success-background border-success-border' : 'bg-warning-background border-warning-border'}`}
                >
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Total Issues
                    </p>
                    <p className="text-2xl font-bold">{violationCount}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                        {violationCount === 0 ? 'All clear!' : 'Need attention'}
                    </p>
                </Card>

                {/* Critical Issues */}
                <Card
                    className={`p-4 ${criticalIssues === 0 ? 'bg-success-background border-success-border' : 'bg-error-background border-error-border'}`}
                >
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Critical
                    </p>
                    <p className="text-2xl font-bold">{criticalIssues}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                        {criticalIssues === 0 ? 'Safe' : 'Fix immediately'}
                    </p>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="violations" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="violations">
                        Violations ({violationCount})
                    </TabsTrigger>
                    <TabsTrigger value="colors">
                        Colors ({report.colors.length})
                    </TabsTrigger>
                    <TabsTrigger value="analysis">
                        Analysis
                    </TabsTrigger>
                </TabsList>

                {/* Violations Tab */}
                <TabsContent value="violations" className="space-y-4">
                    {violationCount === 0 ? (
                        <Card className="p-8 text-center bg-success-background border-success-border">
                            <CheckCircle2 className="w-12 h-12 text-success-foreground mx-auto mb-3" />
                            <h3 className="font-semibold text-success-foreground mb-2">
                                No Violations Found
                            </h3>
                            <p className="text-sm text-success-foreground">
                                Your theme meets WCAG {wcagLevel} standards. Great work!
                            </p>
                        </Card>
                    ) : (
                        <>
                            {/* Controls */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                                        Filter by Severity
                                    </label>
                                    <Select value={selectedSeverity} onValueChange={(value: any) => setSelectedSeverity(value)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select severity..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Severities</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="low">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex-1">
                                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                                        WCAG Level
                                    </label>
                                    <Select value={wcagLevel} onValueChange={(value: any) => setWcagLevel(value)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select level..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AA">Level AA (Standard)</SelectItem>
                                            <SelectItem value="AAA">Level AAA (Enhanced)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Violations List */}
                            <div className="space-y-2">
                                {filteredViolations.length === 0 ? (
                                    <Card className="p-6 text-center bg-info-background border-info-border">
                                        <CheckCircle2 className="w-8 h-8 text-info-foreground mx-auto mb-2" />
                                        <p className="text-info-foreground">
                                            No {selectedSeverity === 'all' ? 'violations' : selectedSeverity} issues found
                                        </p>
                                    </Card>
                                ) : (
                                    filteredViolations.map((violation: WCAGViolation, index: number) => (
                                        <AccessibilityViolationRow
                                            key={index}
                                            violation={violation}
                                            index={index}
                                            expandedViolation={expandedViolation}
                                            onToggle={(itemIndex) => {
                                                setExpandedViolation((prev) => (prev === itemIndex ? null : itemIndex));
                                            }}
                                            getViolationSuggestions={getViolationSuggestions}
                                        />
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </TabsContent>

                {/* Colors Tab */}
                <TabsContent value="colors" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.colors.map((color: ColorEntry, index: number) => (
                            <Card key={index} className="p-4">
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-16 h-16 rounded-lg border-2 border-border shrink-0 shadow-sm"
                                        style={{ backgroundColor: color.value }}
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-foreground">{color.name}</h4>
                                        <p className="text-sm font-mono text-muted-foreground mt-1">{color.value}</p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            <span className="font-medium">Usage:</span> {color.usage}
                                        </p>
                                        {color.brightness !== undefined && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                <span className="font-medium">Brightness:</span> {Math.round(color.brightness)}/255
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Analysis Tab */}
                <TabsContent value="analysis" className="space-y-4">
                    <Card className="p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Code className="w-5 h-5" />
                            Violation Summary
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="p-3 bg-muted rounded border border-border">
                                <p className="text-xs font-medium text-muted-foreground uppercase">Total</p>
                                <p className="text-2xl font-bold text-foreground mt-1">
                                    {report.summary.total}
                                </p>
                            </div>
                            <div className="p-3 bg-error-background rounded border border-error-border">
                                <p className="text-xs font-medium text-error-foreground uppercase">Critical</p>
                                <p className="text-2xl font-bold text-error-foreground mt-1">
                                    {report.summary.critical}
                                </p>
                            </div>
                            <div className="p-3 bg-warning-background rounded border border-warning-border">
                                <p className="text-xs font-medium text-warning-foreground uppercase">High</p>
                                <p className="text-2xl font-bold text-warning-foreground mt-1">
                                    {report.summary.high}
                                </p>
                            </div>
                            <div className="p-3 bg-warning-background rounded border border-warning-border">
                                <p className="text-xs font-medium text-warning-foreground uppercase">Medium</p>
                                <p className="text-2xl font-bold text-warning-foreground mt-1">
                                    {report.summary.medium}
                                </p>
                            </div>
                            <div className="p-3 bg-info-background rounded border border-info-border">
                                <p className="text-xs font-medium text-info-foreground uppercase">Low</p>
                                <p className="text-2xl font-bold text-info-foreground mt-1">
                                    {report.summary.low}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-semibold mb-3">Reference Information</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="font-medium text-foreground">WCAG Level AA</p>
                                <p className="text-muted-foreground">
                                    Requires 4.5:1 contrast ratio (or 3:1 for large text). This is the
                                    standard compliance level for most applications.
                                </p>
                            </div>
                            <div>
                                <p className="font-medium text-foreground">WCAG Level AAA</p>
                                <p className="text-muted-foreground">
                                    Requires 7:1 contrast ratio (or 4.5:1 for large text). For contexts
                                    where visual clarity is critical (medical applications, low-vision support).
                                </p>
                            </div>
                            <div className="pt-3 border-t">
                                <a
                                    href="https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-info-foreground hover:text-info-foreground hover:underline"
                                >
                                    Learn more about WCAG contrast requirements →
                                </a>
                            </div>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default AccessibilityReportViewer;
