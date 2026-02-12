/**
 * Accessibility Report Generator
 * Analyzes colors and generates WCAG compliance reports
 * 
 * Features:
 * - WCAG 2.1 Level AA/AAA contrast ratio checking
 * - Color analysis for all semantic tokens
 * - Detailed remediation suggestions
 * - PDF report generation
 * - Detailed violation listings
 * 
 * Core math functions are imported from colorMath.ts (SSOT).
 * 
 * @module accessibilityReport
 */

import { defaultSemanticTokens } from '@/constants/palettes';
import {
    hexToRgb,
    getContrastRatio as calculateContrastRatio,
    calculateBrightness,
    meetsWCAGRatio as meetsWCAGStandard,
} from '@/utils/colorMath';

// Re-export for consumers that import from this file
export { hexToRgb, calculateBrightness };

/**
 * Color information in a report
 */
export interface ColorEntry {
    name: string;
    value: string;
    usage: string;
    rgb?: { r: number; g: number; b: number };
    brightness?: number;
}

/**
 * Contrast pair result
 */
export interface ContrastPair {
    foreground: string;
    background: string;
    ratio: number;
    passAA: boolean;      // 4.5:1 minimum
    passAALarge: boolean; // 3:1 minimum for large text
    passAAA: boolean;     // 7:1 minimum
    passAAALarge: boolean; // 4.5:1 minimum for large text AAA
}

/**
 * WCAG violation entry
 */
export interface WCAGViolation {
    foreground: string;
    background: string;
    currentRatio: number;
    requiredRatio: number;
    level: 'AA' | 'AAA';
    severity: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Summary of violations
 */
export interface ViolationSummary {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
}

/**
 * Complete accessibility report
 */
export interface AccessibilityReport {
    themeName: string;
    generatedAt: string;
    colors: ColorEntry[];
    contrastPairs: ContrastPair[];
    violations: WCAGViolation[];
    summary: ViolationSummary;
    passedAA: boolean;
    passedAAA: boolean;
}

/**
 * Generate sample contrast pairs for all semantic colors
 * @param theme - Theme data with CSS variables
 * @returns Array of contrast pairs
 */
export function generateSampleContrasts(
    successColor: string,
    warningColor: string,
    errorColor: string,
    infoColor: string,
    bgLight: string,
    bgDark: string
): ContrastPair[] {
    const colors = [
        { name: 'success', value: successColor },
        { name: 'warning', value: warningColor },
        { name: 'error', value: errorColor },
        { name: 'info', value: infoColor },
    ];

    const backgrounds = [
        { name: 'light', value: bgLight },
        { name: 'dark', value: bgDark },
    ];

    const pairs: ContrastPair[] = [];

    // Test each color against both backgrounds
    for (const color of colors) {
        for (const bg of backgrounds) {
            const ratio = calculateContrastRatio(color.value, bg.value);

            pairs.push({
                foreground: color.value,
                background: bg.value,
                ratio: Math.round(ratio * 100) / 100,
                passAA: meetsWCAGStandard(ratio, 'AA', false),
                passAALarge: meetsWCAGStandard(ratio, 'AA', true),
                passAAA: meetsWCAGStandard(ratio, 'AAA', false),
                passAAALarge: meetsWCAGStandard(ratio, 'AAA', true),
            });
        }
    }

    return pairs;
}

/**
 * Find violations in contrast pairs
 * @param pairs - Array of contrast pairs
 * @param minimumLevel - 'AA' or 'AAA'
 * @returns Array of violations
 */
export function findViolations(
    pairs: ContrastPair[],
    minimumLevel: 'AA' | 'AAA' = 'AA'
): WCAGViolation[] {
    const violations: WCAGViolation[] = [];

    for (const pair of pairs) {
        const passes = minimumLevel === 'AA'
            ? pair.passAA
            : pair.passAAA;

        if (!passes) {
            const requiredRatio = minimumLevel === 'AA' ? 4.5 : 7;
            const severity = pair.ratio < 3
                ? 'critical'
                : pair.ratio < 4.5
                    ? 'high'
                    : pair.ratio < 7
                        ? 'medium'
                        : 'low';

            violations.push({
                foreground: pair.foreground,
                background: pair.background,
                currentRatio: pair.ratio,
                requiredRatio,
                level: minimumLevel,
                severity,
            });
        }
    }

    return violations;
}

/**
 * Generate a complete accessibility report
 * @param themeName - Name of the theme
 * @param colors - Array of color entries
 * @param minimumLevel - 'AA' or 'AAA'
 * @returns Complete accessibility report
 */
export function generateAccessibilityReport(
    themeName: string,
    colors: ColorEntry[],
    minimumLevel: 'AA' | 'AAA' = 'AA'
): AccessibilityReport {
    // Find background and text colors
    const bgColor = colors.find(c => c.usage.includes('background'))?.value || '#ffffff';
    const textColor = colors.find(c => c.usage.includes('text'))?.value || '#000000';

    // Generate semantic color values
    const successColor = colors.find(c => c.name.toLowerCase().includes('success'))?.value || defaultSemanticTokens.success;
    const warningColor = colors.find(c => c.name.toLowerCase().includes('warning'))?.value || defaultSemanticTokens.warning;
    const errorColor = colors.find(c => c.name.toLowerCase().includes('error'))?.value || defaultSemanticTokens.error;
    const infoColor = colors.find(c => c.name.toLowerCase().includes('info'))?.value || defaultSemanticTokens.info;

    // Generate contrast pairs
    const contrastPairs = generateSampleContrasts(
        successColor,
        warningColor,
        errorColor,
        infoColor,
        bgColor,
        textColor
    );

    // Find violations
    const violations = findViolations(contrastPairs, minimumLevel);

    // Create summary
    const summary: ViolationSummary = {
        total: violations.length,
        critical: violations.filter(v => v.severity === 'critical').length,
        high: violations.filter(v => v.severity === 'high').length,
        medium: violations.filter(v => v.severity === 'medium').length,
        low: violations.filter(v => v.severity === 'low').length,
    };

    return {
        themeName,
        generatedAt: new Date().toISOString(),
        colors,
        contrastPairs,
        violations,
        summary,
        passedAA: summary.critical === 0 && summary.high === 0,
        passedAAA: violations.length === 0,
    };
}

/**
 * Get remediation suggestions for a violation
 * @param violation - The WCAG violation
 * @returns Suggestion text
 */
export function getSuggestions(violation: WCAGViolation): string {
    const ratio = violation.requiredRatio;
    const needed = Math.max(1, Math.round((ratio - violation.currentRatio) * 100) / 100);

    return `Increase contrast by ${needed}:1. Try:\n` +
        `• Make foreground darker\n` +
        `• Make background lighter\n` +
        `• Or both\n` +
        `Current: ${violation.currentRatio}:1, Required (${violation.level}): ${violation.requiredRatio}:1`;
}

/**
 * Convert report to HTML for display/PDF export
 * @param report - Accessibility report
 * @returns HTML string
 */
export function reportToHTML(report: AccessibilityReport): string {
    const timestamp = new Date(report.generatedAt).toLocaleDateString();
    const statusIcon = report.passedAA ? '✅' : '⚠️';

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Accessibility Report - ${report.themeName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        h1 { color: #2563eb; }
        h2 { color: #1e40af; margin-top: 30px; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f3f4f6; }
        .pass { color: #059669; font-weight: bold; }
        .fail { color: #dc2626; font-weight: bold; }
        .critical { background-color: #fee2e2; }
        .warning { background-color: #fef3c7; }
        .color-swatch { width: 30px; height: 30px; border: 1px solid #ccc; }
        .summary { background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <h1>${statusIcon} Accessibility Report: ${report.themeName}</h1>
      <p><strong>Generated:</strong> ${timestamp}</p>

      <div class="summary">
        <h3>Summary</h3>
        <p><strong>WCAG AA Compliance:</strong> <span class="${report.passedAA ? 'pass' : 'fail'}">${report.passedAA ? '✓ PASS' : '✗ FAIL'}</span></p>
        <p><strong>WCAG AAA Compliance:</strong> <span class="${report.passedAAA ? 'pass' : 'fail'}">${report.passedAAA ? '✓ PASS' : '✗ FAIL'}</span></p>
        <p><strong>Total Violations:</strong> ${report.summary.total}</p>
        ${report.summary.critical > 0 ? `<p style="color: #dc2626;">&#x26A0; Critical Issues: ${report.summary.critical}</p>` : ''}
      </div>`;

    if (report.violations.length > 0) {
        html += `
      <h2>Violations</h2>
      <table>
        <tr>
          <th>Foreground</th>
          <th>Background</th>
          <th>Current Ratio</th>
          <th>Required</th>
          <th>Level</th>
          <th>Severity</th>
        </tr>`;

        for (const v of report.violations) {
            const rowClass = v.severity === 'critical' ? 'critical' : v.severity === 'high' ? 'warning' : '';
            html += `
        <tr class="${rowClass}">
          <td><span class="color-swatch" style="background-color: ${v.foreground}"></span> ${v.foreground}</td>
          <td><span class="color-swatch" style="background-color: ${v.background}"></span> ${v.background}</td>
          <td>${v.currentRatio}:1</td>
          <td>${v.requiredRatio}:1</td>
          <td>${v.level}</td>
          <td>${v.severity.toUpperCase()}</td>
        </tr>`;
        }
        html += `</table>`;
    }

    html += `
      <h2>Color Swatches</h2>
      <table>
        <tr>
          <th>Color</th>
          <th>Name</th>
          <th>Usage</th>
        </tr>`;

    for (const color of report.colors) {
        html += `
        <tr>
          <td><span class="color-swatch" style="background-color: ${color.value}"></span></td>
          <td><code>${color.value}</code></td>
          <td>${color.name} - ${color.usage}</td>
        </tr>`;
    }

    html += `
      </table>
      <hr>
      <p style="color: #666; font-size: 12px;">
        Report generated automatically. WCAG testing based on W3C standards.
        <a href="https://www.w3.org/WAI/WCAG21/quickref/">Learn more about WCAG 2.1</a>
      </p>
    </body>
    </html>`;

    return html;
}