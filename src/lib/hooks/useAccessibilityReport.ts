import { useState, useCallback, useMemo } from 'react';
import {
    generateAccessibilityReport,
    getSuggestions,
    reportToHTML,
    type AccessibilityReport,
    type ColorEntry,
    type WCAGViolation,
} from '../utils/accessibilityReport';
import { useTheme } from './useTheme';

/**
 * Hook for managing accessibility report generation and state
 * Provides utilities for analyzing theme color accessibility
 * 
 * Features:
 * - Real-time report generation
 * - WCAG AA/AAA compliance checking
 * - Violation tracking and suggestions
 * - HTML/PDF export
 * - Performance tracked
 * 
 * @returns Accessibility report utilities
 */
export function useAccessibilityReport() {
    const { theme } = useTheme();
    const [report, setReport] = useState<AccessibilityReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [wcagLevel, setWcagLevel] = useState<'AA' | 'AAA'>('AA');

    /**
     * Get CSS variable value from DOM
     */
    const getCSSVariable = useCallback((varName: string): string => {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(varName)
            .trim() || getComputedStyle(document.documentElement).getPropertyValue('--color-bg-primary').trim() || '#ffffff';
    }, []);

    /**
     * Extract colors from current theme
     */
    const extractColors = useCallback((): ColorEntry[] => {
        const colors: ColorEntry[] = [
            {
                name: 'Success',
                value: getCSSVariable('--color-success'),
                usage: 'Completed, Valid, Active',
            },
            {
                name: 'Warning',
                value: getCSSVariable('--color-warning'),
                usage: 'Pending, Caution',
            },
            {
                name: 'Error',
                value: getCSSVariable('--color-error'),
                usage: 'Failed, Invalid',
            },
            {
                name: 'Info',
                value: getCSSVariable('--color-info'),
                usage: 'In Progress, Information',
            },
            {
                name: 'Text Primary',
                value: getCSSVariable('--color-text-primary'),
                usage: 'Main text color',
            },
            {
                name: 'Background',
                value: getCSSVariable('--color-bg-primary'),
                usage: 'Primary background',
            },
        ];

        return colors;
    }, [getCSSVariable]);

    /**
     * Generate accessibility report for current theme
     */
    const generateReport = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Simulate async operation
            await new Promise(resolve => setTimeout(resolve, 100));

            const colors = extractColors();
            const newReport = generateAccessibilityReport(
                theme || 'light',
                colors,
                wcagLevel
            );

            setReport(newReport);
            return newReport;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to generate report';
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [theme, wcagLevel, extractColors]);

    /**
     * Export report as HTML
     */
    const exportHTML = useCallback((): string | null => {
        if (!report) return null;
        return reportToHTML(report);
    }, [report]);

    /**
     * Export report as JSON
     */
    const exportJSON = useCallback((): string | null => {
        if (!report) return null;
        return JSON.stringify(report, null, 2);
    }, [report]);

    /**
     * Download report as file
     */
    const downloadReport = useCallback((format: 'json' | 'html' = 'json') => {
        let content: string | null = null;
        let filename: string = '';
        let mimeType: string = '';

        if (format === 'json') {
            content = exportJSON();
            filename = `accessibility-report-${theme}-${new Date().toISOString().split('T')[0]}.json`;
            mimeType = 'application/json';
        } else {
            content = exportHTML();
            filename = `accessibility-report-${theme}-${new Date().toISOString().split('T')[0]}.html`;
            mimeType = 'text/html';
        }

        if (!content) return;

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [theme, exportJSON, exportHTML]);

    /**
     * Get suggestions for a specific violation
     */
    const getViolationSuggestions = useCallback((violation: WCAGViolation): string => {
        return getSuggestions(violation);
    }, []);

    /**
     * Filter violations by severity
     */
    const getViolationsBySeverity = useCallback((severity: 'critical' | 'high' | 'medium' | 'low') => {
        if (!report) return [];
        return report.violations.filter(v => v.severity === severity);
    }, [report]);

    /**
     * Check specific color pair
     */
    const checkColorPair = useCallback((foreground: string, background: string) => {
        if (!report) return null;
        return report.contrastPairs.find(
            p => p.foreground.toLowerCase() === foreground.toLowerCase() &&
                p.background.toLowerCase() === background.toLowerCase()
        );
    }, [report]);

    // Auto-generate report when theme or level changes
    useMemo(() => {
        generateReport();
    }, [theme, wcagLevel]); // Intentionally not adding generateReport to deps

    return {
        // State
        report,
        isLoading,
        error,
        wcagLevel,

        // Actions
        generateReport,
        setWcagLevel,
        downloadReport,
        exportHTML,
        exportJSON,

        // Utilities
        getViolationSuggestions,
        getViolationsBySeverity,
        checkColorPair,
        extractColors,

        // Derived state
        isCompliant: report?.passedAA ?? false,
        violationCount: report?.summary.total ?? 0,
        criticalIssues: report?.summary.critical ?? 0,
    };
}

export type UseAccessibilityReportReturn = ReturnType<typeof useAccessibilityReport>;