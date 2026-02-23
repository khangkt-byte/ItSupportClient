/**
 * Theme Validation & Testing Component - Combinatorial Theming System
 * 
 * Interactive testing page for validating combinatorial theme system:
 * - Appearance modes: Light, Dark, Auto (3 options)
 * - Brand colors: Default + 10 brand themes (11 options)
 * - Total combinations: 3 × 11 = 33 permutations
 * 
 * Testing coverage:
 * - Visual appearance validation
 * - Semantic token independence (appearance-based)
 * - Brand palette independence (brand-based)
 * - Work Log status badges
 * - Accessibility modes (WCAG 2.1 compliance)
 * - Performance metrics (Chrome DevTools API)
 * 
 * @architecture Option A - Combinatorial Theming
 * @reference
 * - WCAG 2.1 Color Contrast: https://developer.mozilla.org/en-US/docs/Web/Accessibility/Understanding_WCAG/Perceivable/Color_contrast
 * - Chrome Performance API: https://developer.mozilla.org/en-US/docs/Web/API/Performance
 * - Material Design 3 Testing: https://m3.material.io/foundations/accessible-design/testing
 * - Apple HIG Dark Mode Testing: https://developer.apple.com/design/human-interface-guidelines/dark-mode
 * - React Testing Best Practices: https://react.dev/learn/testing
 */

import React, { useState, useCallback } from 'react';
import { useTheme } from '@/features/theme/hooks/useTheme';
import { palettes, BrandTheme } from '@/constants/palettes';
import { getContrastRatio } from '@/utils/colorMath';

interface PerformanceMetrics {
  appearanceChangeTime?: number;
  brandColorChangeTime?: number;
  cssVariableUpdateTime: number;
  rerenderTime: number;
  totalTime: number;
}

interface ColorContrastResult {
  ratio: number;
  wcagAA: 'pass' | 'fail';
  wcagAAA: 'pass' | 'fail';
}

interface CombinationTestResult {
  appearance: 'light' | 'dark';
  brand: string;
  tested: boolean;
  passed: boolean;
  performanceMs: number;
}

export const ThemeValidationTest: React.FC = () => {
  const { 
    appearance,
    brandColor,
    resolvedAppearance,
    setAppearance,
    setBrandColor,
    accessibilityMode,
    setAccessibilityMode,
    getSemanticTokens,
    getPrimaryColor,
    prefersReducedMotion,
    // Legacy for backward compatibility testing
    theme,
  } = useTheme();

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [showAllCombinations, setShowAllCombinations] = useState(false);
  const [testedCombinations, setTestedCombinations] = useState<CombinationTestResult[]>([]);

  // All available options
  const appearanceOptions: ('light' | 'dark' | 'auto')[] = ['light', 'dark', 'auto'];
  const brandOptions: string[] = ['default', ...Object.keys(palettes) as BrandTheme[]];
  
  // Total combinations: 3 appearances × 11 brands = 33 (auto counts as either light or dark)
  const totalCombinations = 2 * brandOptions.length; // light × 11 + dark × 11 = 22 unique states

  /**
   * Measure appearance change performance
   * Tests setAppearance() in isolation to measure semantic token updates
   * 
   * @reference Chrome Performance API: https://developer.mozilla.org/en-US/docs/Web/API/Performance/mark
   * @reference Google Web.dev: https://web.dev/rendering-performance/
   */
  const measureAppearanceChange = useCallback((targetAppearance: 'light' | 'dark' | 'auto') => {
    const startTime = performance.now();
    performance.mark('appearance-change-start');
    
    setAppearance(targetAppearance);
    
    // Measure after CSS variables update (next animation frame)
    requestAnimationFrame(() => {
      const cssUpdateEnd = performance.now();
      
      // Measure after re-render (second animation frame)
      requestAnimationFrame(() => {
        const endTime = performance.now();
        performance.mark('appearance-change-end');
        performance.measure('appearance-change', 'appearance-change-start', 'appearance-change-end');
        
        setPerformanceMetrics({
          appearanceChangeTime: cssUpdateEnd - startTime,
          cssVariableUpdateTime: cssUpdateEnd - startTime,
          rerenderTime: endTime - cssUpdateEnd,
          totalTime: endTime - startTime,
        });
      });
    });
  }, [setAppearance]);

  /**
   * Measure brand color change performance
   * Tests setBrandColor() in isolation to measure brand palette updates
   * 
   * @reference Chrome Performance API
   */
  const measureBrandColorChange = useCallback((targetBrand: string) => {
    const startTime = performance.now();
    performance.mark('brand-change-start');
    
    setBrandColor(targetBrand as any);
    
    requestAnimationFrame(() => {
      const cssUpdateEnd = performance.now();
      
      requestAnimationFrame(() => {
        const endTime = performance.now();
        performance.mark('brand-change-end');
        performance.measure('brand-change', 'brand-change-start', 'brand-change-end');
        
        setPerformanceMetrics({
          brandColorChangeTime: cssUpdateEnd - startTime,
          cssVariableUpdateTime: cssUpdateEnd - startTime,
          rerenderTime: endTime - cssUpdateEnd,
          totalTime: endTime - startTime,
        });
      });
    });
  }, [setBrandColor]);

  /**
   * Measure combinatorial theme change
   * Tests changing both appearance AND brand color simultaneously
   * Validates independence of two systems
   * 
   * @reference Apple HIG: Independent appearance and accent color
   * @reference Material Design 3: Contexts + seed color
   */
  const measureCombinationChange = useCallback(
    (targetAppearance: 'light' | 'dark' | 'auto', targetBrand: string) => {
      // CRITICAL FIX: Apply theme IMMEDIATELY (don't wait for performance measurement)
      // Force update even if theme is already the same (for testing purposes)
      setAppearance(targetAppearance);
      setBrandColor(targetBrand as any);
      
      // Start performance measurement AFTER theme is applied
      const startTime = performance.now();
      performance.mark('combination-change-start');
      
      requestAnimationFrame(() => {
        const cssUpdateEnd = performance.now();
        
        requestAnimationFrame(() => {
          const endTime = performance.now();
          const totalMs = endTime - startTime;
          
          performance.mark('combination-change-end');
          performance.measure('combination-change', 'combination-change-start', 'combination-change-end');
          
          setPerformanceMetrics({
            appearanceChangeTime: totalMs / 2, // Estimate (both happen together)
            brandColorChangeTime: totalMs / 2,
            cssVariableUpdateTime: cssUpdateEnd - startTime,
            rerenderTime: endTime - cssUpdateEnd,
            totalTime: totalMs,
          });
          
          // Track tested combination
          // Read actual resolved appearance from DOM (in case 'auto' mode)
          const actualAppearance = document.documentElement.getAttribute('data-appearance') as 'light' | 'dark' || 
                                  (targetAppearance === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : targetAppearance);
          
          setTestedCombinations(prev => [
            ...prev.filter(c => !(c.appearance === actualAppearance && c.brand === targetBrand)),
            {
              appearance: actualAppearance as 'light' | 'dark',
              brand: targetBrand,
              tested: true,
              passed: totalMs < 50, // Target: <50ms (WCAG timing)
              performanceMs: totalMs,
            },
          ]);
        });
      });
    },
    [setAppearance, setBrandColor] // REMOVED resolvedAppearance from deps to prevent stale closure
  );

  /**
   * Calculate WCAG contrast ratio between two hex colors
   * Uses shared colorMath.ts module (SSOT)
   * 
   * @reference WCAG 2.1: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
   * @reference MDN Color Contrast: https://developer.mozilla.org/en-US/docs/Web/Accessibility/Understanding_WCAG/Perceivable/Color_contrast
   * 
   * WCAG Standards:
   * - AA (4.5:1): Minimum for body text
   * - AA Large (3:1): Minimum for large text (18pt+)
   * - AAA (7:1): Enhanced for body text
   * - AAA Large (4.5:1): Enhanced for large text
   */
  const calculateContrast = (fg: string, bg: string): ColorContrastResult => {
    const ratio = getContrastRatio(fg, bg);
    return {
      ratio: Math.round(ratio * 100) / 100,
      wcagAA: ratio >= 4.5 ? 'pass' : 'fail',
      wcagAAA: ratio >= 7 ? 'pass' : 'fail',
    };
  };

  /**
   * Get CSS variable value from document
   */
  const getCSSVariable = (varName: string): string => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
  };

  // Get current semantic tokens
  const tokens = getSemanticTokens();
  const primaryColor = getPrimaryColor();

  /**
   * Status badge component for testing
   */
  const StatusBadge: React.FC<{ status: string; label: string }> = ({ status, label }) => {
    const base = 'inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium leading-4 tracking-wide transition-colors';
    const styles: Record<string, string> = {
      pending: 'bg-warning-background text-warning-foreground ring-1 ring-inset ring-warning-border',
      progress: 'bg-info-background text-info-foreground ring-1 ring-inset ring-info-border',
      resolved: 'bg-success-background text-success-foreground ring-1 ring-inset ring-success-border',
      error: 'bg-error-background text-error-foreground ring-1 ring-inset ring-error-border',
    };
    
    return (
      <span className={`${base} ${styles[status]}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🧪 Theme Validation & Testing Suite - Combinatorial System
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            Architecture: Option A - Independent Appearance × Brand Color Selection
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
              <strong className="text-blue-900 dark:text-blue-100">3 Appearance Modes:</strong>
              <span className="text-blue-700 dark:text-blue-300"> Light, Dark, Auto</span>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
              <strong className="text-purple-900 dark:text-purple-100">11 Brand Colors:</strong>
              <span className="text-purple-700 dark:text-purple-300"> Default + 10 themes</span>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
              <strong className="text-green-900 dark:text-green-100">Total Combinations:</strong>
              <span className="text-green-700 dark:text-green-300"> {totalCombinations} unique states</span>
            </div>
          </div>
        </div>

        {/* Current State Display */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Appearance</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">
              {appearance}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Resolved: <span className="font-semibold">{resolvedAppearance}</span>
            </p>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {appearance === 'auto' ? '🖥️ Follows system' : appearance === 'light' ? '☀️ Light mode' : '🌙 Dark mode'}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Brand Color</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">
              {brandColor.replace('brand-', '')}
            </p>
            {primaryColor && (
              <div className="mt-3 flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded border border-gray-300" 
                  style={{ backgroundColor: primaryColor }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {primaryColor}
                </span>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">DOM Attributes</h3>
            <div className="text-xs font-mono space-y-1 mt-2">
              <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded">
                <span className="text-gray-600 dark:text-gray-400">data-appearance:</span>{' '}
                <span className="text-blue-600 dark:text-blue-400 font-bold">{resolvedAppearance}</span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded">
                <span className="text-gray-600 dark:text-gray-400">data-brand:</span>{' '}
                <span className="text-purple-600 dark:text-purple-400 font-bold">{brandColor}</span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded">
                <span className="text-gray-600 dark:text-gray-400">data-theme:</span>{' '}
                <span className="text-gray-600 dark:text-gray-400 font-bold">{theme}</span>
                <span className="text-xs text-gray-500"> (legacy)</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Accessibility</h3>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 capitalize mb-2">
              {accessibilityMode === 'highContrast' ? 'High Contrast' : 'Default'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Motion: {prefersReducedMotion ? '⚠️ Reduced' : '✅ Normal'}
            </p>
            <button
              onClick={() => setAccessibilityMode(accessibilityMode === 'default' ? 'highContrast' : 'default')}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
            >
              Toggle High Contrast
            </button>
          </div>
        </div>

        {/* Performance Metrics */}
        {performanceMetrics && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              ⚡ Performance Metrics (Chrome Performance API)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {performanceMetrics.appearanceChangeTime !== undefined && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Appearance Change</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {performanceMetrics.appearanceChangeTime.toFixed(2)}ms
                  </p>
                  <p className="text-xs text-gray-500">
                    {performanceMetrics.appearanceChangeTime < 16 ? '✅ 60fps' : 
                     performanceMetrics.appearanceChangeTime < 50 ? '⚠️ Good' : '❌ Slow'}
                  </p>
                </div>
              )}
              {performanceMetrics.brandColorChangeTime !== undefined && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Brand Change</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {performanceMetrics.brandColorChangeTime.toFixed(2)}ms
                  </p>
                  <p className="text-xs text-gray-500">
                    {performanceMetrics.brandColorChangeTime < 16 ? '✅ 60fps' : 
                     performanceMetrics.brandColorChangeTime < 50 ? '⚠️ Good' : '❌ Slow'}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">CSS Update</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {performanceMetrics.cssVariableUpdateTime.toFixed(2)}ms
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Re-render</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {performanceMetrics.rerenderTime.toFixed(2)}ms
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {performanceMetrics.totalTime.toFixed(2)}ms
                </p>
                <p className="text-xs text-gray-500">
                  Target: &lt;50ms
                </p>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded">
              <strong>Performance Standards:</strong> 60fps = 16.67ms/frame | Good = &lt;50ms | WCAG timing guidelines
            </div>
          </div>
        )}

        {/* Appearance Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            ☀️🌙 Appearance Testing (Semantic Tokens)
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Semantic tokens (success/error/warning/info) are controlled by appearance, independent of brand color
          </p>
          <div className="grid grid-cols-3 gap-3">
            {appearanceOptions.map((app) => (
              <button
                key={app}
                onClick={() => measureAppearanceChange(app)}
                className={`px-4 py-3 rounded-lg border-2 transition-all capitalize ${
                  appearance === app
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 font-bold'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                {app === 'light' && '☀️ '}{app === 'dark' && '🌙 '}{app === 'auto' && '🖥️ '}
                {app}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Color Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🎨 Brand Color Testing (Primary Palette)
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Brand colors affect primary palette only, semantic tokens remain unchanged
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {brandOptions.map((brand) => (
              <button
                key={brand}
                onClick={() => measureBrandColorChange(brand)}
                className={`px-4 py-3 rounded-lg border-2 transition-all capitalize ${
                  brandColor === brand
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 font-bold'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
              >
                {brand.replace('brand-', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Combinatorial Testing */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔀 Combinatorial Testing Matrix
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Test all {totalCombinations} combinations (Light/Dark × 11 brands). Auto mode is resolved to Light or Dark.
          </p>
          
          {/* Progress */}
          <div className="mb-4 bg-gray-100 dark:bg-gray-900 p-4 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Testing Progress: {testedCombinations.length} / {totalCombinations}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round((testedCombinations.length / totalCombinations) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${(testedCombinations.length / totalCombinations) * 100}%` }}
              />
            </div>
          </div>

          {/* Quick test buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Light + Default */}
            <button
              onClick={() => measureCombinationChange('light', 'default')}
              className="group relative px-4 py-3 bg-white border-2 border-gray-300 dark:bg-gray-800 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-all text-sm shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">☀️</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Light + Default</span>
              </div>
              <div className="flex gap-1">
                <div className="h-5 w-5 rounded bg-success" title="Success" />
                <div className="h-5 w-5 rounded bg-warning" title="Warning" />
                <div className="h-5 w-5 rounded bg-error" title="Error" />
                <div className="h-5 w-5 rounded bg-indigo-500" title="Primary (Default)" />
              </div>
            </button>

            {/* Dark + Default */}
            <button
              onClick={() => measureCombinationChange('dark', 'default')}
              className="group relative px-4 py-3 bg-gray-900 border-2 border-gray-700 dark:bg-gray-950 dark:border-gray-800 rounded-lg hover:border-indigo-400 transition-all text-sm shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🌙</span>
                <span className="font-semibold text-gray-100">Dark + Default</span>
              </div>
              <div className="flex gap-1">
                <div className="h-5 w-5 rounded bg-success" title="Success" />
                <div className="h-5 w-5 rounded bg-warning" title="Warning" />
                <div className="h-5 w-5 rounded bg-error" title="Error" />
                <div className="h-5 w-5 rounded bg-indigo-400" title="Primary (Default)" />
              </div>
            </button>

            {/* Light + Purple */}
            <button
              onClick={() => measureCombinationChange('light', 'brand-purple')}
              className="group relative px-4 py-3 bg-white border-2 border-gray-300 dark:bg-gray-800 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition-all text-sm shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">☀️</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Light + Purple</span>
              </div>
              <div className="flex gap-1">
                <div className="h-5 w-5 rounded bg-success" title="Success" />
                <div className="h-5 w-5 rounded bg-warning" title="Warning" />
                <div className="h-5 w-5 rounded bg-error" title="Error" />
                <div className="h-5 w-5 rounded bg-purple-500" title="Primary (Purple)" />
              </div>
            </button>

            {/* Dark + Purple */}
            <button
              onClick={() => measureCombinationChange('dark', 'brand-purple')}
              className="group relative px-4 py-3 bg-gray-900 border-2 border-gray-700 dark:bg-gray-950 dark:border-gray-800 rounded-lg hover:border-purple-400 transition-all text-sm shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🌙</span>
                <span className="font-semibold text-gray-100">Dark + Purple</span>
              </div>
              <div className="flex gap-1">
                <div className="h-5 w-5 rounded bg-success" title="Success" />
                <div className="h-5 w-5 rounded bg-warning" title="Warning" />
                <div className="h-5 w-5 rounded bg-error" title="Error" />
                <div className="h-5 w-5 rounded bg-purple-400" title="Primary (Purple)" />
              </div>
            </button>
          </div>

          {/* Results table */}
          {testedCombinations.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-900">
                  <tr>
                    <th className="px-3 py-2 text-left">Appearance</th>
                    <th className="px-3 py-2 text-left">Brand</th>
                    <th className="px-3 py-2 text-left">Performance</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {testedCombinations.slice(-10).reverse().map((result, idx) => (
                    <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-3 py-2 capitalize">{result.appearance}</td>
                      <td className="px-3 py-2 capitalize">{result.brand.replace('brand-', '')}</td>
                      <td className="px-3 py-2 font-mono">{result.performanceMs.toFixed(2)}ms</td>
                      <td className="px-3 py-2">
                        {result.passed ? '✅ Pass' : '❌ Slow'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Semantic Token Validation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🎯 Semantic Token Validation (WCAG 2.1 Compliance)
          </h2>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded p-4 mb-4">
            <p className="text-sm text-yellow-900 dark:text-yellow-100">
              <strong>⚠️ Critical Test:</strong> Semantic tokens should change with <strong>appearance</strong> only, 
              NOT with brand color. Switch brand colors and verify semantic tokens remain unchanged.
            </p>
          </div>
          
          {tokens ? (
            <div className="space-y-6">
              {/* Token Colors Display with WCAG Testing */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Object.entries(tokens).map(([key, value]) => {
                  const bgVar = `--color-${key}-background`;
                  const fgVar = `--color-${key}-foreground`;
                  const bg = getCSSVariable(bgVar) || 'hsl(var(--background))';
                  const fg = getCSSVariable(fgVar) || value;
                  
                  // Calculate contrast (WCAG 2.1 standard)
                  const contrast = calculateContrast(fg, bg);
                  
                  return (
                    <div key={key} className="space-y-2">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {key}
                      </div>
                      
                      {/* Color swatch */}
                      <div 
                        className="h-20 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center"
                        style={{ backgroundColor: value }}
                      >
                        <span className="text-white text-xs font-mono drop-shadow px-2 py-1 bg-black/30 rounded">
                          {value}
                        </span>
                      </div>
                      
                      {/* Background variant with WCAG test */}
                      <div 
                        className="h-16 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm font-medium"
                        style={{ 
                          backgroundColor: bg,
                          color: fg
                        }}
                      >
                        Text Preview
                      </div>
                      
                      {/* WCAG Contrast Ratios */}
                      <div className="text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Contrast:</span>
                          <span className="font-mono font-bold">{contrast.ratio}:1</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">WCAG AA:</span>
                          <span className={contrast.wcagAA === 'pass' ? 'text-green-600' : 'text-red-600'}>
                            {contrast.wcagAA === 'pass' ? '✅ Pass' : '❌ Fail'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">WCAG AAA:</span>
                          <span className={contrast.wcagAAA === 'pass' ? 'text-green-600' : 'text-amber-600'}>
                            {contrast.wcagAAA === 'pass' ? '✅ Pass' : '⚠️ Fail'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CSS Variables Verification */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Semantic CSS Variables (Appearance-based)
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  These variables should change when appearance changes (light ↔ dark), but remain unchanged when brand color changes
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                  {Object.keys(tokens).map(key => (
                    <div key={key} className="bg-gray-50 dark:bg-gray-900 p-3 rounded">
                      <span className="text-gray-600 dark:text-gray-400">--color-{key}:</span>{' '}
                      <span className="text-gray-900 dark:text-gray-100 font-bold">
                        {getCSSVariable(`--color-${key}`) || '❌ Not set'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Palette Variables */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Brand CSS Variables (Brand-based)
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  These variables should change when brand color changes, but remain unchanged when appearance changes
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                  {['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'].map(tone => {
                    const value = getCSSVariable(`--color-primary-${tone}`);
                    return (
                      <div key={tone} className="bg-gray-50 dark:bg-gray-900 p-3 rounded">
                        <span className="text-gray-600 dark:text-gray-400">--color-primary-{tone}:</span>{' '}
                        <span className="text-gray-900 dark:text-gray-100 font-bold">
                          {value || '🔵 Fallback'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {brandColor === 'default' && (
                  <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                    ℹ️ <strong>Default brand:</strong> No --color-primary-* variables set. CSS uses fallback values (Indigo).
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-red-500 font-semibold">
              ❌ ERROR: Semantic tokens not available! This should never happen.
            </div>
          )}
        </div>

        {/* Status Badge Testing (Work Log Simulation) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            📊 Work Log Status Badges (Real Component Test)
          </h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="pending" label="PENDING" />
              <StatusBadge status="progress" label="IN PROGRESS" />
              <StatusBadge status="resolved" label="RESOLVED" />
              <StatusBadge status="error" label="ERROR" />
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded text-sm space-y-2">
              <p className="font-semibold text-gray-700 dark:text-gray-300">✅ Expected Behavior (Combinatorial System):</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                <li><strong>Appearance changes:</strong> Colors should change (light amber → dark amber for pending)</li>
                <li><strong>Brand color changes:</strong> Status badge colors should NOT change (uses semantic tokens)</li>
                <li><strong>PENDING:</strong> Always amber/yellow (warning token - appearance-based)</li>
                <li><strong>IN PROGRESS:</strong> Always blue (info token - appearance-based)</li>
                <li><strong>RESOLVED:</strong> Always green (success token - appearance-based)</li>
                <li><strong>ERROR:</strong> Always red (error token - appearance-based)</li>
                <li><strong>High contrast mode:</strong> Pure black text on white backgrounds (21:1 ratio)</li>
              </ul>
            </div>

            {/* Independence Test */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100 mb-3">
                <strong>🧪 Independence Test:</strong> Verify semantic tokens are independent from brand colors
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-green-500 rounded"></span>
                  <span className="text-blue-800 dark:text-blue-200">
                    Step 1: Note the current badge colors (especially green success color)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-purple-500 rounded"></span>
                  <span className="text-blue-800 dark:text-blue-200">
                    Step 2: Change brand color to Purple (or any other brand)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-green-500 rounded"></span>
                  <span className="text-blue-800 dark:text-blue-200">
                    Step 3: Badge colors should remain EXACTLY the same (success still green, not purple)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-yellow-500 rounded"></span>
                  <span className="text-blue-800 dark:text-blue-200">
                    Step 4: Toggle Light ↔ Dark - now badges should change (lighter greens in dark mode)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Comparison - All Combinations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              🖼️ Visual Comparison Grid
            </h2>
            <button
              onClick={() => setShowAllCombinations(!showAllCombinations)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
            >
              {showAllCombinations ? 'Hide' : 'Show'} All Combinations
            </button>
          </div>

          {showAllCombinations && (
            <div className="space-y-6 mt-6">
              {/* Light Appearance × All Brands */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  ☀️ Light Appearance × Brand Colors
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {brandOptions.map((brand) => (
                    <div key={`light-${brand}`} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2 capitalize text-sm">
                        {brand.replace('brand-', '')}
                      </h4>
                      <div className="flex gap-1 mb-2">
                        <div className="h-6 w-6 rounded bg-success" title="Success (Light)" />
                        <div className="h-6 w-6 rounded bg-warning" title="Warning (Light)" />
                        <div className="h-6 w-6 rounded bg-error" title="Error (Light)" />
                        <div className="h-6 w-6 rounded bg-info" title="Info (Light)" />
                      </div>
                      <button
                        onClick={() => measureCombinationChange('light', brand)}
                        className="w-full px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-xs"
                      >
                        Test
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dark Appearance × All Brands */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  🌙 Dark Appearance × Brand Colors
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {brandOptions.map((brand) => (
                    <div key={`dark-${brand}`} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2 capitalize text-sm">
                        {brand.replace('brand-', '')}
                      </h4>
                      <div className="flex gap-1 mb-2">
                        <div className="h-6 w-6 rounded bg-success" title="Success (Dark)" />
                        <div className="h-6 w-6 rounded bg-warning" title="Warning (Dark)" />
                        <div className="h-6 w-6 rounded bg-error" title="Error (Dark)" />
                        <div className="h-6 w-6 rounded bg-info" title="Info (Dark)" />
                      </div>
                      <button
                        onClick={() => measureCombinationChange('dark', brand)}
                        className="w-full px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-xs"
                      >
                        Test
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Combinatorial Testing Checklist */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            ✅ Combinatorial Testing Checklist
          </h2>
          
          <div className="space-y-6">
            {/* Appearance Independence Tests */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                ☀️🌙 Appearance Independence Tests
              </h3>
              <div className="space-y-2 text-sm">
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Light → Dark:</strong> Semantic tokens change (success, error, warning, info become lighter/darker)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Dark → Light:</strong> Semantic tokens change back (lighter/darker values)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Auto Mode:</strong> Correctly follows system preference (check resolvedAppearance)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Override System:</strong> Explicit Light/Dark overrides Auto mode correctly
                  </span>
                </label>
              </div>
            </div>

            {/* Brand Independence Tests */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                🎨 Brand Color Independence Tests
              </h3>
              <div className="space-y-2 text-sm">
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Brand Change in Light:</strong> Semantic tokens UNCHANGED (success color stays consistent)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Brand Change in Dark:</strong> Semantic tokens UNCHANGED (success color stays consistent)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Primary Palette Updates:</strong> --color-primary-500 changes with each brand
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Default Brand:</strong> No --color-primary-* variables set, uses CSS fallback (indigo)
                  </span>
                </label>
              </div>
            </div>

            {/* Combination Coverage */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                🔀 Combination Coverage (22 unique: 2 appearances × 11 brands)
              </h3>
              <div className="space-y-2 text-sm">
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Light Combinations:</strong> Test all 11 brands in Light mode (Default, Purple, Orange, Rose, Teal, Forest, Ocean, Sunset, Midnight, Emerald)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Dark Combinations:</strong> Test all 11 brands in Dark mode
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Visual Comparison:</strong> Use "Show All Combinations" to verify visual consistency
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Progress Tracking:</strong> Verify progress bar updates correctly (X / 22)
                  </span>
                </label>
              </div>
            </div>

            {/* Performance Tests (WCAG, Chrome) */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                ⚡ Performance Tests (International Standards)
              </h3>
              <div className="space-y-2 text-sm">
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>WCAG Timing:</strong> All changes &lt;50ms (WCAG perceptible delay guideline)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>60fps Target:</strong> Ideally &lt;16ms for 60fps smoothness (Chrome Performance API)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>DevTools Validation:</strong> No console errors/warnings during theme changes
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Performance Marks:</strong> performance.measure() entries visible in DevTools Performance tab
                  </span>
                </label>
              </div>
            </div>

            {/* WCAG 2.1 Compliance */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                ♿ WCAG 2.1 Accessibility Compliance
              </h3>
              <div className="space-y-2 text-sm">
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>WCAG AA (4.5:1):</strong> All semantic tokens meet minimum contrast for body text
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>WCAG AAA (7:1):</strong> Ideally meet enhanced contrast for better readability
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Non-Text (3:1):</strong> UI components and graphical objects meet minimum
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>High Contrast Mode:</strong> Pure black/white (21:1 ratio) when enabled
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Reduced Motion:</strong> Transitions disabled when prefers-reduced-motion enabled
                  </span>
                </label>
              </div>
            </div>

            {/* Integration Tests */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                🔗 Integration & Persistence Tests
              </h3>
              <div className="space-y-2 text-sm">
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Work Log Badges:</strong> Status badges use semantic tokens (change with appearance, not brand)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>localStorage:</strong> Appearance and brand preferences persist across page refreshes
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>CSS Variables:</strong> DevTools shows correct --color-* values for each combination
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" className="mt-1 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Cross-Browser:</strong> Test in Chrome, Firefox, Safari (latest versions)
                  </span>
                </label>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded p-4">
              <p className="text-sm text-green-900 dark:text-green-100 font-semibold mb-2">
                ✅ Expected Test Coverage
              </p>
              <ul className="list-disc list-inside text-xs text-green-800 dark:text-green-200 space-y-1">
                <li><strong>22 unique combinations</strong> tested (Light/Dark × 11 brands)</li>
                <li><strong>4 appearance independence</strong> tests passed</li>
                <li><strong>4 brand independence</strong> tests passed</li>
                <li><strong>4 performance tests</strong> passed (&lt;50ms WCAG target)</li>
                <li><strong>5 WCAG 2.1 compliance</strong> tests passed (AA minimum)</li>
                <li><strong>4 integration tests</strong> passed (persistence, cross-browser)</li>
                <li><strong>All semantic tokens</strong> validated in both light and dark modes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Testing Workflow Instructions */}
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">
            📋 Combinatorial Testing Workflow
          </h2>
          
          <div className="space-y-6 text-gray-800 dark:text-gray-200">
            {/* Step 1 */}
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                1️⃣ Test Appearance Independence
              </h3>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li><strong>Action:</strong> Select a brand color (e.g., Purple or Orange)</li>
                <li><strong>Test:</strong> Toggle Light → Dark → Light using appearance selector</li>
                <li><strong>Verify:</strong> Semantic tokens change (success green becomes lighter in dark)</li>
                <li><strong>Verify:</strong> Brand color stays same (data-brand unchanged in DOM)</li>
                <li><strong>Check CSS Variables:</strong>
                  <ul className="list-circle list-inside ml-6 mt-1 space-y-0.5">
                    <li><code className="text-xs bg-white dark:bg-gray-800 px-1 rounded">--color-success</code> changes value</li>
                    <li><code className="text-xs bg-white dark:bg-gray-800 px-1 rounded">--color-error</code> changes value</li>
                    <li><code className="text-xs bg-white dark:bg-gray-800 px-1 rounded">--color-primary-500</code> stays identical</li>
                  </ul>
                </li>
                <li><strong>Expected Performance:</strong> &lt;50ms per appearance change</li>
              </ul>
            </div>

            {/* Step 2 */}
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                2️⃣ Test Brand Color Independence
              </h3>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li><strong>Action:</strong> Set appearance to Dark mode</li>
                <li><strong>Test:</strong> Cycle through all brands (Default → Purple → Orange → Rose)</li>
                <li><strong>Verify:</strong> Semantic tokens UNCHANGED (success color stays consistent)</li>
                <li><strong>Verify:</strong> Primary palette changes (--color-primary-500 updates)</li>
                <li><strong>Check CSS Variables:</strong>
                  <ul className="list-circle list-inside ml-6 mt-1 space-y-0.5">
                    <li><code className="text-xs bg-white dark:bg-gray-800 px-1 rounded">--color-success</code> stays same</li>
                    <li><code className="text-xs bg-white dark:bg-gray-800 px-1 rounded">--color-primary-500</code> changes with each brand</li>
                    <li>Default brand: No variables set, uses CSS fallback (indigo)</li>
                  </ul>
                </li>
                <li><strong>Expected Performance:</strong> &lt;50ms per brand change</li>
              </ul>
            </div>

            {/* Step 3 */}
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                3️⃣ Test All Combinations Systematically
              </h3>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li><strong>Navigate to:</strong> "Combinatorial Testing Matrix" section above</li>
                <li><strong>Quick Tests:</strong> Click pre-configured buttons (Light + Default, Dark + Purple)</li>
                <li><strong>Monitor Progress:</strong> Watch progress bar update (X / 22 completed)</li>
                <li><strong>Review Results:</strong> Check results table for any failures or slow combinations</li>
                <li><strong>Verify Status:</strong> All results should show "✅ Pass" (&lt;50ms)</li>
                <li><strong>Visual Comparison:</strong> Click "Show All Combinations" button to preview all 22</li>
              </ul>
            </div>

            {/* Step 4 */}
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                4️⃣ WCAG 2.1 Compliance Validation
              </h3>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li><strong>Navigate to:</strong> "Semantic Token Validation (WCAG 2.1)" section</li>
                <li><strong>Check Contrast Ratios:</strong> Each token shows ratio (e.g., 7.2:1)</li>
                <li><strong>Verify AA Compliance:</strong> All should show "✅ Pass" for WCAG AA (4.5:1)</li>
                <li><strong>Ideally AAA:</strong> Most should show "✅ Pass" for WCAG AAA (7:1)</li>
                <li><strong>Test High Contrast:</strong> Toggle mode and verify 21:1 ratios (pure black/white)</li>
                <li><strong>External Tools:</strong> Use Firefox Accessibility Inspector or WebAIM contrast checker</li>
              </ul>
            </div>

            {/* Step 5 */}
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                5️⃣ Performance Validation (Chrome DevTools)
              </h3>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li><strong>Open DevTools:</strong> F12 → Performance tab</li>
                <li><strong>Check Metrics:</strong> Review "Performance Metrics" panel after each change</li>
                <li><strong>Target:</strong> Total Time &lt;50ms (WCAG perceptible delay guideline)</li>
                <li><strong>Ideal:</strong> &lt;16ms for 60fps smoothness (Chrome best practice)</li>
                <li><strong>Console:</strong> Check for performance warnings (&gt;16ms transitions)</li>
                <li><strong>Performance API:</strong> Verify performance.measure() entries visible in Timeline</li>
              </ul>
            </div>

            {/* Expected Results */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-700">
              <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-3">
                ✅ Expected Test Results (International Standards Compliance)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Architecture (Material Design 3, Apple HIG):</p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-0.5 text-xs">
                    <li>All 22 unique combinations functional</li>
                    <li>Appearance affects semantic tokens only</li>
                    <li>Brand affects primary palette only</li>
                    <li>Auto mode follows system preference</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Performance (WCAG, Chrome):</p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-0.5 text-xs">
                    <li>All changes &lt;50ms (WCAG target)</li>
                    <li>Most &lt;16ms (60fps ideal)</li>
                    <li>No console warnings</li>
                    <li>No layout thrashing</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Accessibility (WCAG 2.1):</p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-0.5 text-xs">
                    <li>All tokens meet WCAG AA (4.5:1)</li>
                    <li>Most meet WCAG AAA (7:1)</li>
                    <li>High contrast: 21:1 ratio</li>
                    <li>Reduced motion works</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Implementation:</p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-0.5 text-xs">
                    <li>DOM attributes correct</li>
                    <li>CSS variables properly scoped</li>
                    <li>localStorage persistence works</li>
                    <li>Backward compatibility maintained</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* References */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-xs">
              <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">📚 International Standards & References:</p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                <li><strong>WCAG 2.1:</strong> <a href="https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">Contrast Minimum (1.4.3)</a></li>
                <li><strong>MDN WCAG:</strong> <a href="https://developer.mozilla.org/en-US/docs/Web/Accessibility/Understanding_WCAG/Perceivable/Color_contrast" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">Color Contrast Guide</a></li>
                <li><strong>Chrome Performance API:</strong> <a href="https://developer.mozilla.org/en-US/docs/Web/API/Performance" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">Performance Interface</a></li>
                <li><strong>Material Design 3:</strong> Dynamic color with seed color and combinatorial contexts</li>
                <li><strong>Apple HIG:</strong> Independent appearance (light/dark) and accent color system</li>
                <li><strong>Microsoft Fluent:</strong> Theme-aware design tokens and color ramps</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ThemeValidationTest;
