import React, { useState, useMemo } from 'react';
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    Download,
    Filter,
    TrendingUp,
    Eye,
    Code,
} from 'lucide-react';
import { useAccessibilityReport } from '@/lib/hooks/useAccessibilityReport';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { WCAGViolation } from '@/lib/utils/accessibilityReport';

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
        return report.violations.filter(v => v.severity === selectedSeverity);
    }, [report, selectedSeverity]);

    // Get severity color and icon
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'low':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
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

    // Render color swatch
    const Swatch = ({ color, label }: { color: string; label: string }) => (
        <div className="flex items-center gap-2">
            <div
                className="w-10 h-10 rounded border border-gray-300 shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
            />
            <span className="text-sm font-mono text-gray-700">{color}</span>
        </div>
    );

    // Render violation row
    const ViolationRow = ({ violation, index }: { violation: WCAGViolation; index: number }) => {
        const isExpanded = expandedViolation === index;
        const suggestions = getViolationSuggestions(violation);

        return (
            <div key={index} className="border rounded-lg overflow-hidden">
                <button
                    onClick={() => setExpandedViolation(isExpanded ? null : index)}
                    className={`w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-l-4 ${getSeverityColor(
                        violation.severity
                    )}`}
                >
                    <div className="flex-shrink-0">{getSeverityIcon(violation.severity)}</div>

                    <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                                {violation.foreground} on {violation.background}
                            </span>
                            <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">
                                {violation.currentRatio.toFixed(2)}:1
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            Required: {violation.requiredRatio.toFixed(2)}:1 ({violation.level})
                        </p>
                    </div>

                    <Badge
                        variant="outline"
                        className={`capitalize ${getSeverityColor(violation.severity)}`}
                    >
                        {violation.severity}
                    </Badge>
                </button>

                {isExpanded && (
                    <div className="p-4 bg-gray-50 border-t">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold mb-2">Color Preview</h4>
                                <div className="space-y-2">
                                    <Swatch color={violation.foreground} label="Foreground" />
                                    <Swatch color={violation.background} label="Background" />
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold mb-2">Contrast Analysis</h4>
                                <div className="space-y-1 text-sm">
                                    <p>
                                        <span className="text-gray-600">Current Ratio:</span>{' '}
                                        <span className="font-mono font-bold">
                                            {violation.currentRatio.toFixed(2)}:1
                                        </span>
                                    </p>
                                    <p>
                                        <span className="text-gray-600">Required ({violation.level}):</span>{' '}
                                        <span className="font-mono font-bold">
                                            {violation.requiredRatio.toFixed(2)}:1
                                        </span>
                                    </p>
                                    <p>
                                        <span className="text-gray-600">Shortfall:</span>{' '}
                                        <span className="font-mono font-bold text-red-600">
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
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{suggestions}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
                    <p className="text-gray-600">Generating accessibility report...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-6 bg-red-50 border-red-200">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-red-900">Error generating report</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                </div>
            </Card>
        );
    }

    if (!report) {
        return (
            <Card className="p-6">
                <p className="text-gray-600 text-center">No report available</p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Accessibility Report</h2>
                    <p className="text-sm text-gray-600 mt-1">
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
                <Card className={`p-4 ${report.passedAA ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                        WCAG AA
                    </p>
                    <p className="text-2xl font-bold">
                        {report.passedAA ? '✓' : '✗'}
                    </p>
                    <p className="text-xs text-gray-700 mt-2">
                        {report.passedAA ? 'Compliant' : 'Non-compliant'}
                    </p>
                </Card>

                {/* AAA Status */}
                <Card className={`p-4 ${report.passedAAA ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                        WCAG AAA
                    </p>
                    <p className="text-2xl font-bold">
                        {report.passedAAA ? '✓' : '◐'}
                    </p>
                    <p className="text-xs text-gray-700 mt-2">
                        {report.passedAAA ? 'Compliant' : 'Partial'}
                    </p>
                </Card>

                {/* Total Violations */}
                <Card
                    className={`p-4 ${violationCount === 0 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}
                >
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                        Total Issues
                    </p>
                    <p className="text-2xl font-bold">{violationCount}</p>
                    <p className="text-xs text-gray-700 mt-2">
                        {violationCount === 0 ? 'All clear!' : 'Need attention'}
                    </p>
                </Card>

                {/* Critical Issues */}
                <Card
                    className={`p-4 ${criticalIssues === 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                >
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                        Critical
                    </p>
                    <p className="text-2xl font-bold">{criticalIssues}</p>
                    <p className="text-xs text-gray-700 mt-2">
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
                        <Card className="p-8 text-center bg-green-50 border-green-200">
                            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                            <h3 className="font-semibold text-green-900 mb-2">
                                No Violations Found
                            </h3>
                            <p className="text-sm text-green-700">
                                Your theme meets WCAG {wcagLevel} standards. Great work!
                            </p>
                        </Card>
                    ) : (
                        <>
                            {/* Controls */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-700 block mb-2">
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
                                    <label className="text-sm font-medium text-gray-700 block mb-2">
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
                                    <Card className="p-6 text-center bg-blue-50 border-blue-200">
                                        <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                        <p className="text-blue-700">
                                            No {selectedSeverity === 'all' ? 'violations' : selectedSeverity} issues found
                                        </p>
                                    </Card>
                                ) : (
                                    filteredViolations.map((violation, index) => (
                                        <ViolationRow
                                            key={index}
                                            violation={violation}
                                            index={index}
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
                        {report.colors.map((color, index) => (
                            <Card key={index} className="p-4">
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-16 h-16 rounded-lg border-2 border-gray-200 flex-shrink-0 shadow-sm"
                                        style={{ backgroundColor: color.value }}
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{color.name}</h4>
                                        <p className="text-sm font-mono text-gray-700 mt-1">{color.value}</p>
                                        <p className="text-xs text-gray-600 mt-2">
                                            <span className="font-medium">Usage:</span> {color.usage}
                                        </p>
                                        {color.brightness !== undefined && (
                                            <p className="text-xs text-gray-600 mt-1">
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
                            <div className="p-3 bg-gray-50 rounded border border-gray-200">
                                <p className="text-xs font-medium text-gray-600 uppercase">Total</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {report.summary.total}
                                </p>
                            </div>
                            <div className="p-3 bg-red-50 rounded border border-red-200">
                                <p className="text-xs font-medium text-red-600 uppercase">Critical</p>
                                <p className="text-2xl font-bold text-red-700 mt-1">
                                    {report.summary.critical}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded border border-orange-200">
                                <p className="text-xs font-medium text-orange-600 uppercase">High</p>
                                <p className="text-2xl font-bold text-orange-700 mt-1">
                                    {report.summary.high}
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                                <p className="text-xs font-medium text-yellow-600 uppercase">Medium</p>
                                <p className="text-2xl font-bold text-yellow-700 mt-1">
                                    {report.summary.medium}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                <p className="text-xs font-medium text-blue-600 uppercase">Low</p>
                                <p className="text-2xl font-bold text-blue-700 mt-1">
                                    {report.summary.low}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-semibold mb-3">Reference Information</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="font-medium text-gray-900">WCAG Level AA</p>
                                <p className="text-gray-600">
                                    Requires 4.5:1 contrast ratio (or 3:1 for large text). This is the
                                    standard compliance level for most applications.
                                </p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">WCAG Level AAA</p>
                                <p className="text-gray-600">
                                    Requires 7:1 contrast ratio (or 4.5:1 for large text). For contexts
                                    where visual clarity is critical (medical applications, low-vision support).
                                </p>
                            </div>
                            <div className="pt-3 border-t">
                                <a
                                    href="https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 hover:underline"
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
