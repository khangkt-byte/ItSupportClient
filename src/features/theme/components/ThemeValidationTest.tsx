/**
 * Theme Validation & Testing Component
 * 
 * Interactive testing page for validating all theme combinations across:
 * - Visual appearance
 * - Semantic token colors
 * - Work Log status badges
 * - Accessibility modes
 * - Performance metrics
 * 
 * Used for Phase 2 validation and visual regression testing.
 * 
 * @reference
 * - Material Design 3 Testing: https://m3.material.io/foundations/accessible-design/testing
 * - WCAG Testing Tools: https://www.w3.org/WAI/test-evaluate/
 * - React Testing Best Practices: https://react.dev/learn/testing
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/features/theme/hooks/useTheme';
import { palettes, BrandTheme } from '@/constants/palettes';

interface PerformanceMetrics {
  themeChangeTime: number;
  cssVariableUpdateTime: number;
  rerenderTime: number;
  totalTime: number;
}

interface ColorContrastResult {
  ratio: number;
  wcagAA: 'pass' | 'fail';
  wcagAAA: 'pass' | 'fail';
}

export const ThemeValidationTest: React.FC = () => {
  const { 
    theme, 
    changeTheme, 
    accessibilityMode,
    setAccessibilityMode,
    getSemanticTokens,
    getPrimaryColor,
    prefersReducedMotion
  } = useTheme();

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [selectedTestTheme, setSelectedTestTheme] = useState<string>(theme);
  const [showAllThemes, setShowAllThemes] = useState(false);

  // All available themes
  const allThemes: string[] = ['light', 'dark', ...Object.keys(palettes) as BrandTheme[]];

  /**
   * Measure theme change performance
   * Tracks time for theme application, CSS variable updates, and re-renders
   */
  const measureThemeChange = useCallback((targetTheme: string) => {
    const startTime = performance.now();
    
    // Mark CSS variable update start
    const cssUpdateStart = performance.now();
    
    changeTheme(targetTheme as any);
    
    // Measure time after CSS variables are set (next animation frame)
    requestAnimationFrame(() => {
      const cssUpdateEnd = performance.now();
      
      // Measure time after re-render (second animation frame)
      requestAnimationFrame(() => {
        const endTime = performance.now();
        
        setPerformanceMetrics({
          cssVariableUpdateTime: cssUpdateEnd - cssUpdateStart,
          rerenderTime: endTime - cssUpdateEnd,
          themeChangeTime: cssUpdateEnd - startTime,
          totalTime: endTime - startTime,
        });
      });
    });
  }, [changeTheme]);

  /**
   * Calculate WCAG contrast ratio between two hex colors
   * Implementation follows WCAG 2.1 guidelines
   * @reference https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
   */
  const calculateContrast = (fg: string, bg: string): ColorContrastResult => {
    const getLuminance = (hex: string): number => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = ((rgb >> 16) & 0xff) / 255;
      const g = ((rgb >> 8) & 0xff) / 255;
      const b = (rgb & 0xff) / 255;
      
      const [rs, gs, bs] = [r, g, b].map(c => 
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      );
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(fg);
    const l2 = getLuminance(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

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
            🧪 Theme Validation & Testing Suite
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Phase 2: Visual regression testing, accessibility validation, and performance monitoring
          </p>
        </div>

        {/* Current Theme Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Current Theme</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">
              {theme}
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
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Accessibility Mode</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">
              {accessibilityMode === 'highContrast' ? 'High Contrast' : 'Default'}
            </p>
            <button
              onClick={() => setAccessibilityMode(accessibilityMode === 'default' ? 'highContrast' : 'default')}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
            >
              Toggle High Contrast
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Motion Preference</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {prefersReducedMotion ? 'Reduced' : 'Normal'}
            </p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {prefersReducedMotion ? '⚠️ System prefers reduced motion' : '✅ Animations enabled'}
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        {performanceMetrics && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              ⚡ Performance Metrics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Theme Change</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {performanceMetrics.themeChangeTime.toFixed(2)}ms
                </p>
                <p className="text-xs text-gray-500">
                  {performanceMetrics.themeChangeTime < 10 ? '✅ Excellent' : 
                   performanceMetrics.themeChangeTime < 50 ? '⚠️ Good' : '❌ Slow'}
                </p>
              </div>
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
              </div>
            </div>
          </div>
        )}

        {/* Theme Selector with Performance Testing */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🎨 Theme Selector (with Performance Testing)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {allThemes.map((t) => (
              <button
                key={t}
                onClick={() => measureThemeChange(t)}
                className={`px-4 py-3 rounded-lg border-2 transition-all capitalize ${
                  theme === t
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 font-bold'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                {t.replace('brand-', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Semantic Token Validation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🎯 Semantic Token Validation
          </h2>
          
          {tokens ? (
            <div className="space-y-6">
              {/* Token Colors Display */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Object.entries(tokens).map(([key, value]) => {
                  const bgVar = `--color-${key}-background`;
                  const fgVar = `--color-${key}-foreground`;
                  const bg = getCSSVariable(bgVar) || '#ffffff';
                  const fg = getCSSVariable(fgVar) || value;
                  
                  // Calculate contrast
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
                        <span className="text-white text-xs font-mono drop-shadow">
                          {value}
                        </span>
                      </div>
                      
                      {/* Background variant */}
                      <div 
                        className="h-16 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm font-medium"
                        style={{ 
                          backgroundColor: bg,
                          color: fg
                        }}
                      >
                        Text Preview
                      </div>
                      
                      {/* Contrast ratio */}
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
                  CSS Variables (from DOM)
                </h3>
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
              <p className="font-semibold text-gray-700 dark:text-gray-300">✅ Expected Behavior:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                <li>PENDING should show amber/yellow colors (warning semantic token)</li>
                <li>IN PROGRESS should show blue colors (info semantic token)</li>
                <li>RESOLVED should show green colors (success semantic token)</li>
                <li>ERROR should show red colors (error semantic token)</li>
                <li>Colors should change when switching themes</li>
                <li>High contrast mode should show pure black text on white backgrounds</li>
              </ul>
            </div>
          </div>
        </div>

        {/* All Themes Visual Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              🖼️ Visual Comparison (All Themes)
            </h2>
            <button
              onClick={() => setShowAllThemes(!showAllThemes)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
            >
              {showAllThemes ? 'Hide' : 'Show'} All Themes
            </button>
          </div>

          {showAllThemes && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {allThemes.map((t) => (
                <div key={t} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 capitalize">
                    {t.replace('brand-', '')}
                  </h3>
                  
                  {/* Screenshot area for each theme */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="h-8 w-8 rounded" style={{ backgroundColor: 'var(--color-success)' }} />
                      <div className="h-8 w-8 rounded" style={{ backgroundColor: 'var(--color-warning)' }} />
                      <div className="h-8 w-8 rounded" style={{ backgroundColor: 'var(--color-error)' }} />
                      <div className="h-8 w-8 rounded" style={{ backgroundColor: 'var(--color-info)' }} />
                    </div>
                    
                    <button
                      onClick={() => measureThemeChange(t)}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                    >
                      Switch to this theme
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Testing Checklist */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            ✅ Phase 2 Testing Checklist
          </h2>
          <div className="space-y-3 text-sm">
            <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
              <input type="checkbox" className="mt-1" />
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Visual Regression:</strong> Test all 12 themes (light, dark, 10 brand themes) and verify status badges display correct colors
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
              <input type="checkbox" className="mt-1" />
              <span className="text-gray-700 dark:text-gray-300">
                <strong>High Contrast Mode:</strong> Toggle high contrast and verify all text has 21:1 contrast ratio (pure black/white)
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
              <input type="checkbox" className="mt-1" />
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Performance:</strong> Verify theme changes complete in &lt;10ms for all themes
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
              <input type="checkbox" className="mt-1" />
              <span className="text-gray-700 dark:text-gray-300">
                <strong>WCAG Compliance:</strong> Verify all semantic tokens meet WCAG AA (4.5:1) minimum contrast
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
              <input type="checkbox" className="mt-1" />
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Cross-Browser:</strong> Test in Chrome, Firefox, and Safari (latest versions)
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
              <input type="checkbox" className="mt-1" />
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Work Log Integration:</strong> Verify status badges in actual WorkLogManagement component update correctly
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
              <input type="checkbox" className="mt-1" />
              <span className="text-gray-700 dark:text-gray-300">
                <strong>CSS Variables:</strong> Use DevTools to verify all --color-* variables are set correctly in DOM
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
              <input type="checkbox" className="mt-1" />
              <span className="text-gray-700 dark:text-gray-300">
                <strong>localStorage:</strong> Verify theme preference persists across page refreshes
              </span>
            </label>
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">
            📋 How to Use This Testing Page
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200 text-sm">
            <li>Click different theme buttons to test theme switching performance</li>
            <li>Observe the performance metrics - should be &lt;10ms for excellent performance</li>
            <li>Check semantic token colors match expected values (green=success, amber=warning, red=error, blue=info)</li>
            <li>Verify status badges change colors when switching themes</li>
            <li>Toggle High Contrast mode and verify pure black/white colors</li>
            <li>Check WCAG contrast ratios - all should pass AA (4.5:1), ideally AAA (7:1)</li>
            <li>Open DevTools Console to check for any errors during theme changes</li>
            <li>Take screenshots of each theme for visual regression comparison</li>
          </ol>
        </div>

      </div>
    </div>
  );
};

export default ThemeValidationTest;
