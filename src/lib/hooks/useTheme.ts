/**
 * Theme Management Hook
 *
 * Custom React hook for managing application themes with full accessibility support.
 * Implements Material Design 3 color system and WCAG 2.1 Level AA standards.
 *
 * @module useTheme
 * @description
 * Manages theme state, persistence, and accessibility modes. Supports:
 * - Theme switching (light, dark, brand themes)
 * - localStorage persistence
 * - System preference detection (prefers-color-scheme, prefers-contrast)
 * - Reduced motion awareness
 * - Custom event dispatching
 * - Semantic tokens
 *
 * @reference
 * - React Hooks: https://react.dev/reference/react/hooks
 * - WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
 * - Material Design 3: https://m3.material.io/
 * - MDN prefers-color-scheme: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
 * - MDN prefers-contrast: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast
 * - MDN prefers-reduced-motion: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
 *
 * @example
 * const { theme, changeTheme, accessibilityMode } = useTheme();
 * changeTheme('brand-purple');
 * setAccessibilityMode('highContrast');
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { BrandTheme, palettes, SemanticTokens } from '../constants/palettes';

/**
 * Theme type union
 * Includes base themes (light, dark) and all brand themes
 * @type {string} Theme
 */
export type Theme = 'light' | 'dark' | BrandTheme;

/**
 * Accessibility mode options
 * - default: Standard color contrast (WCAG AA minimum 4.5:1)
 * - highContrast: Enhanced contrast for visibility impaired (WCAG AAA minimum 7:1) * @type {string} AccessibilityMode
 * @reference https://www.w3.org/TR/WCAG21-Understanding/contrast-enhanced.html
 */
export type AccessibilityMode = 'default' | 'highContrast';

/**
 * Theme state and methods interface
 * @interface UseThemeReturn
 */
export interface UseThemeReturn {
  /** Current active theme */
  theme: Theme;
  /** Current accessibility mode */
  accessibilityMode: AccessibilityMode;
  /** Whether reduced motion is preferred by user */
  prefersReducedMotion: boolean;
  /** Change active theme and persist selection */
  changeTheme: (theme: Theme) => void;
  /** Set accessibility mode for current theme */
  setAccessibilityMode: (mode: AccessibilityMode) => void;
  /** Get semantic tokens for current theme */
  getSemanticTokens: () => SemanticTokens | null;
  /** Get primary color of current theme */
  getPrimaryColor: () => string | null;
  /** Get secondary color of current theme if available */
  getSecondaryColor: () => string | null;
  /** Reset to default theme and mode */
  resetToDefaults: () => void;
}

/**
 * Custom hook for theme management
 *
 * @function useTheme
 * @returns {UseThemeReturn} Theme state and control methods
 *
 * @description
 * This hook provides complete theme management with:
 * 1. Multi-theme support (light, dark, 10 brand themes)
 * 2. Accessibility-first approach (high contrast, reduced motion)
 * 3. localStorage persistence
 * 4. System preference detection
 * 5. Semantic tokens generation
 * 6. Custom event dispatching
 *
 * Security & Performance:
 * - No eval or dynamic code execution
 * - Efficient DOM updates with proper cleanup
 * - No memory leaks (proper event listener cleanup)
 * - Type-safe throughout
 *
 * @example Basic Usage
 * const { theme, changeTheme } = useTheme();
 * return (
 *   <button onClick={() => changeTheme('brand-purple')}>
 *     Switch to {theme}
 *   </button>
 * );
 *
 * @example With Accessibility
 * const { accessibilityMode, setAccessibilityMode } = useTheme();
 * return (
 *   <button onClick={() => setAccessibilityMode('highContrast')}>
 *     High Contrast: {accessibilityMode === 'highContrast' ? 'ON' : 'OFF'}
 *   </button>
 * );
 */
export const useTheme = (): UseThemeReturn => {
  const [theme, setTheme] = useState<Theme>('light');
  const [accessibilityMode, setAccessibilityMode] = useState<AccessibilityMode>('default');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Apply theme to document
   * 
   * Sets data-theme attribute on both html and body tags for cross-browser compatibility.
   * This allows CSS to react to theme changes via attribute selectors:
   * :root[data-theme="brand-purple"] { --color-primary-500: #695CFE; }
   *
   * @param {Theme} nextTheme - Theme to apply
   * @param {AccessibilityMode} [mode='default'] - Accessibility mode
   *
   * @reference
   * - HTML data attributes: https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes
   * - CSS attribute selectors: https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors
   *
   * @internal
   */
  const applyTheme = useCallback(
    (nextTheme: Theme, mode: AccessibilityMode = 'default') => {
      try {
        // Set on both html and body for comprehensive coverage
        document.documentElement.setAttribute('data-theme', nextTheme);
        document.body.setAttribute('data-theme', nextTheme);
        document.documentElement.setAttribute('data-a11y', mode);
        document.body.setAttribute('data-a11y', mode);
      } catch (error) {
        console.error('Failed to apply theme:', error);
      }
    },
    []
  );

  /**
   * Initialize theme from multiple sources with priority order
   * Priority: localStorage > system preference > default (light)
   *
   * @reference
   * - prefers-color-scheme: https://www.w3.org/TR/prefers-color-scheme/
   * - localStorage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
   *
   * @internal
   */
  useEffect(() => {
    // 1. Check localStorage first
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const savedAccessibility = localStorage.getItem('a11y') as AccessibilityMode | null;

    // Validate saved theme exists in available themes
    const allAvailableThemes: Theme[] = ['light', 'dark', ...Object.keys(palettes) as BrandTheme[]];
    const initialTheme = savedTheme && allAvailableThemes.includes(savedTheme) ? savedTheme : null;

    // 2. Check system preference if no saved preference
    if (!initialTheme) {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme: Theme = systemPrefersDark ? 'dark' : 'light';
      setTheme(systemTheme);
      applyTheme(systemTheme, savedAccessibility || 'default');
    } else {
      setTheme(initialTheme);
      applyTheme(initialTheme, savedAccessibility || 'default');
    }

    setAccessibilityMode(savedAccessibility || 'default');
  }, [applyTheme]);

  /**
   * Detect system accessibility preferences
   *
   * @reference
   * - prefers-contrast: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast
   * - prefers-reduced-motion: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
   *
   * @internal
   */
  useEffect(() => {
    // High contrast preference detection
    const highContrastMediaQuery = window.matchMedia('(prefers-contrast: more)');
    const prefersHighContrast = highContrastMediaQuery.matches;

    if (prefersHighContrast) {
      setAccessibilityMode('highContrast');
      document.documentElement.setAttribute('data-a11y', 'highContrast');
    }

    // Reduced motion preference detection
    const reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = reducedMotionMediaQuery.matches;
    setPrefersReducedMotion(prefersReducedMotion);

    // Handle changes in system preferences
    const handleContrastChange = (e: MediaQueryListEvent) => {
      const newMode: AccessibilityMode = e.matches ? 'highContrast' : 'default';
      setAccessibilityMode(newMode);
      document.documentElement.setAttribute('data-a11y', newMode);
      localStorage.setItem('a11y', newMode);
    };

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    // Modern browsers use addEventListener, older ones use addListener
    highContrastMediaQuery.addEventListener('change', handleContrastChange);
    reducedMotionMediaQuery.addEventListener('change', handleReducedMotionChange);

    return () => {
      highContrastMediaQuery.removeEventListener('change', handleContrastChange);
      reducedMotionMediaQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  /**
   * Listen for storage changes from other tabs/windows
   *
   * @reference
   * - Storage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
   *
   * @internal
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue) {
        const newTheme = e.newValue as Theme;
        const allAvailableThemes: Theme[] = ['light', 'dark', ...Object.keys(palettes) as BrandTheme[]];
        if (allAvailableThemes.includes(newTheme)) {
          setTheme(newTheme);
          applyTheme(newTheme, accessibilityMode);
        }
      }
      if (e.key === 'a11y' && e.newValue) {
        const newMode = e.newValue as AccessibilityMode;
        setAccessibilityMode(newMode);
        applyTheme(theme, newMode);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [theme, accessibilityMode, applyTheme]);

  /**
   * Change theme with optional animation and cross-device sync
   *
   * @param {Theme} newTheme - Theme to switch to
   *
   * @description
   * - Applies theme to DOM
   * - Persists to localStorage
   * - Adds smooth transition unless reduced motion is preferred
   * - Dispatches custom event for components to listen to
   *
   * @fires themechange - Custom event with theme data
   *
   * @reference
   * - Custom Events: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
   *
   * @example
   * const { changeTheme } = useTheme();
   * changeTheme('brand-purple');
   *
   * @internal
   */
  const changeTheme = useCallback(
    (newTheme: Theme) => {
      // Validate theme exists
      const allAvailableThemes: Theme[] = ['light', 'dark', ...Object.keys(palettes) as BrandTheme[]];
      if (!allAvailableThemes.includes(newTheme)) {
        console.warn(`Invalid theme: ${newTheme}`);
        return;
      }

      // Add transition animation if user allows motion
      if (!prefersReducedMotion) {
        document.documentElement.classList.add('theme-transition');

        // Clear any pending timeout
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }

        // Remove transition class after animation completes
        transitionTimeoutRef.current = setTimeout(() => {
          document.documentElement.classList.remove('theme-transition');
        }, 300);
      }

      // Update state
      setTheme(newTheme);
      applyTheme(newTheme, accessibilityMode);

      // Persist to localStorage
      try {
        localStorage.setItem('theme', newTheme);
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }

      // Dispatch custom event for other components
      try {
        window.dispatchEvent(
          new CustomEvent('themechange', {
            detail: {
              theme: newTheme,
              accessibilityMode,
              timestamp: Date.now(),
            },
          })
        );
      } catch (error) {
        console.error('Failed to dispatch theme change event:', error);
      }
    },
    [accessibilityMode, prefersReducedMotion, applyTheme]
  );

  /**
   * Set accessibility mode
   *
   * @param {AccessibilityMode} mode - Mode to set
   *
   * @reference
   * - WCAG 2.1 Contrast Enhanced: https://www.w3.org/TR/WCAG21/#contrast-enhanced
   *
   * @internal
   */
  const setAccessibilityModeHandler = useCallback(
    (mode: AccessibilityMode) => {
      setAccessibilityMode(mode);
      applyTheme(theme, mode);
      localStorage.setItem('a11y', mode);

      window.dispatchEvent(
        new CustomEvent('a11ychange', {
          detail: {
            mode,
            timestamp: Date.now(),
          },
        })
      );
    },
    [theme, applyTheme]
  );

  /**
   * Get semantic tokens for current theme
   *
   * Semantic tokens provide consistent naming for common UI purposes:
   * - success: For positive/success states
   * - warning: For warning/caution states
   * - error: For error/danger states
   * - info: For information states
   * - disabled: For disabled elements
   *
   * @returns {SemanticTokens | null} Semantic token colors or null if not available
   *
   * @reference
   * - Semantic Tokens: https://www.w3.org/WAI/WCAG21/Techniques/
   *
   * @example
   * const tokens = getSemanticTokens();
   * if (tokens) {
   *   console.log(tokens.error); // '#ef4444'
   * }
   *
   * @internal
   */
  const getSemanticTokens = useCallback((): SemanticTokens | null => {
    if (theme === 'light' || theme === 'dark') {
      return null;
    }

    const palette = palettes[theme as BrandTheme];
    return palette.semantic || null;
  }, [theme]);

  /**
   * Get primary color of current theme
   *
   * @returns {string | null} Primary color hex code or null
   *
   * @internal
   */
  const getPrimaryColor = useCallback((): string | null => {
    if (theme === 'light' || theme === 'dark') {
      return null;
    }

    const palette = palettes[theme as BrandTheme];
    return palette.primary[500];
  }, [theme]);

  /**
   * Get secondary color of current theme if available
   *
   * @returns {string | null} Secondary color hex code or null
   *
   * @internal
   */
  const getSecondaryColor = useCallback((): string | null => {
    if (theme === 'light' || theme === 'dark') {
      return null;
    }

    const palette = palettes[theme as BrandTheme];
    return palette.secondary?.['500'] || null;
  }, [theme]);

  /**
   * Reset theme and accessibility to defaults
   *
   * @internal
   */
  const resetToDefaults = useCallback(() => {
    setTheme('light');
    setAccessibilityMode('default');
    applyTheme('light', 'default');
    localStorage.removeItem('theme');
    localStorage.removeItem('a11y');
  }, [applyTheme]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  return {
    theme,
    accessibilityMode,
    prefersReducedMotion,
    changeTheme,
    setAccessibilityMode: setAccessibilityModeHandler,
    getSemanticTokens,
    getPrimaryColor,
    getSecondaryColor,
    resetToDefaults,
  };
};
