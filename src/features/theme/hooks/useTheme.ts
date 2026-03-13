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
import { BrandTheme, palettes, SemanticTokens } from '@/constants/palettes';
import { applyThemeTokens, GLOBAL_SEMANTIC_TOKENS, DARK_SEMANTIC_TOKENS } from '@/utils/themeTokens';
import {
  getActualAppearance,
  isValidBrandColor,
  isValidTheme,
  resolveSystemAppearance,
} from '@/features/theme/hooks/themeHelpers';
import type {
  AccessibilityMode,
  Appearance,
  BrandColorTheme,
  Theme,
  UseThemeReturn,
} from '@/features/theme/hooks/themeTypes';

export type {
  AccessibilityMode,
  Appearance,
  BrandColorTheme,
  Theme,
  UseThemeReturn,
} from '@/features/theme/hooks/themeTypes';

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
 * @example Option A Architecture (Recommended)
 * ```tsx
 * const { appearance, brandColor, setAppearance, setBrandColor } = useTheme();
 * return (
 *   <>
 *     <button onClick={() => setAppearance('light')}>Light</button>
 *     <button onClick={() => setAppearance('dark')}>Dark</button>
 *     <button onClick={() => setAppearance('auto')}>Auto</button>
 *     
 *     <button onClick={() => setBrandColor('default')}>Default</button>
 *     <button onClick={() => setBrandColor('brand-purple')}>Purple</button>
 *   </>
 * );
 * ```
 *
 * @example Legacy Usage (Backwards Compatible)
 * ```tsx
 * const { theme, changeTheme } = useTheme();
 * return (
 *   <button onClick={() => changeTheme('brand-purple')}>
 *     Switch to {theme}
 *   </button>
 * );
 * ```
 */
export const useTheme = (): UseThemeReturn => {
  const THEME_TRANSITION_MS = 150;
  const THEME_TRANSITION_DOM_LIMIT = 1400;
  const VIEW_TRANSITION_DOM_LIMIT = 900;

  // NEW: Combinatorial state (Option A)
  const [appearance, setAppearanceState] = useState<Appearance>('auto');
  const [brandColor, setBrandColorState] = useState<BrandColorTheme>('default');
  const [resolvedAppearance, setResolvedAppearance] = useState<'light' | 'dark'>('light');

  // Legacy state for backwards compatibility
  const [theme, setTheme] = useState<Theme>('light');
  const [accessibilityMode, setAccessibilityMode] = useState<AccessibilityMode>('default');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  type ViewTransitionDocument = Document & {
    startViewTransition?: (updateCallback: () => void) => unknown;
  };

  /**
   * Compute actual theme string from appearance + brand color combination
   * Examples:
   * - light + default = 'light'
   * - dark + brand-purple = 'brand-purple' (brand themes handle dark/light internally)
   * - auto + brand-red = 'brand-red' (brand themes handle dark/light internally)
   * 
   * @param {Appearance} appearance - Current appearance setting
   * @param {BrandColorTheme} brand - Current brand color
   * @param {('light'|'dark')} resolved - Resolved system appearance (if auto)
   * @returns {Theme} Computed theme string
   * @internal
   */
  const computeTheme = useCallback(
    (appearance: Appearance, brand: BrandColorTheme, resolved: 'light' | 'dark'): Theme => {
      // If brand color is set, use it (brand themes contain both light/dark variants)
      if (brand !== 'default') {
        return brand as Theme;
      }

      // Otherwise use appearance (resolved if auto)
      if (appearance === 'auto') {
        return resolved;
      }

      return appearance as Theme;
    },
    []
  );

  /**
   * Apply theme to document
   * 
   * PERFORMANCE OPTIMIZATIONS (Google/Microsoft/Apple Standards):
   * 1. Batched DOM operations via requestAnimationFrame
   * 2. GPU acceleration hints with will-change
   * 3. Reduced transition time: 150ms (was 300ms)
   * 4. Performance monitoring in development
   * 
   * NEW: Sets data-appearance and data-brand attributes for combinatorial theming.
   * Also maintains legacy data-theme for backwards compatibility.
   * 
   * Architecture:
   * - data-appearance: light | dark (resolved from auto if needed)
   * - data-brand: default | brand-purple | brand-red | ...
   * - data-theme: legacy computed theme value
   * 
   * CSS can target either:
   * - :root[data-appearance="dark"][data-brand="brand-purple"]
   * - :root[data-theme="brand-purple"] (legacy)
   *
   * @param {Theme} nextTheme - Theme to apply (computed from appearance + brand)
   * @param {('light'|'dark')} currentAppearance - Resolved appearance value
   * @param {BrandColorTheme} currentBrand - Brand color selection
   * @param {AccessibilityMode} [mode='default'] - Accessibility mode
   *
   * @reference
   * - HTML data attributes: https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes
   * - CSS attribute selectors: https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors
   * - Apple HIG Dark Mode: https://developer.apple.com/design/human-interface-guidelines/dark-mode/
   * - Chrome Rendering Performance: https://web.dev/rendering-performance/
   *
   * @internal
   */
  const applyTheme = useCallback(
    (
      nextTheme: Theme,
      currentAppearance: 'light' | 'dark',
      currentBrand: BrandColorTheme,
      mode: AccessibilityMode = 'default'
    ) => {
      try {
        // Apply attributes immediately to avoid extra frame delay during theme toggles.
        document.documentElement.setAttribute('data-appearance', currentAppearance);
        document.body.setAttribute('data-appearance', currentAppearance);
        document.documentElement.setAttribute('data-brand', currentBrand);
        document.body.setAttribute('data-brand', currentBrand);

        // Legacy: Set combined theme attribute for backwards compatibility
        document.documentElement.setAttribute('data-theme', nextTheme);
        document.body.setAttribute('data-theme', nextTheme);
        document.documentElement.setAttribute('data-a11y', mode);
        document.body.setAttribute('data-a11y', mode);

        // Apply all CSS variables from design tokens (Phase 1 - Runtime Injection)
        // This handles primary palette + semantic tokens + foreground/background/border
        // ALL values sourced from palettes.ts via themeTokens.ts
        // NEW: Pass appearance and brand separately for combinatorial theming
        applyThemeTokens(nextTheme, currentAppearance, currentBrand);
      } catch (error) {
        console.error('Failed to apply theme:', error);
      }
    },
    []
  );

  const triggerThemeTransition = useCallback(() => {
    if (prefersReducedMotion) {
      return;
    }

    document.documentElement.classList.add('theme-transition');

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    transitionTimeoutRef.current = setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
      transitionTimeoutRef.current = null;
    }, THEME_TRANSITION_MS);
  }, [prefersReducedMotion, THEME_TRANSITION_MS]);

  const runThemeMutation = useCallback(
    (mutation: () => void) => {
      if (prefersReducedMotion) {
        mutation();
        return;
      }

      // Skip animation paths on large trees to avoid expensive full-page snapshots/repaints.
      const nodeCount = document.body?.getElementsByTagName('*').length ?? 0;
      if (nodeCount > THEME_TRANSITION_DOM_LIMIT) {
        mutation();
        return;
      }

      const doc = document as ViewTransitionDocument;

      if (typeof doc.startViewTransition === 'function' && nodeCount <= VIEW_TRANSITION_DOM_LIMIT) {
        doc.startViewTransition(() => {
          mutation();
        });
        return;
      }

      triggerThemeTransition();
      mutation();
    },
    [prefersReducedMotion, triggerThemeTransition, THEME_TRANSITION_DOM_LIMIT, VIEW_TRANSITION_DOM_LIMIT]
  );

  /**
   * Initialize theme from multiple sources with priority order
   * NEW: Loads appearance (light/dark/auto) and brand color separately
   * Priority: localStorage > system preference > default (auto + default)
   *
   * @reference
   * - prefers-color-scheme: https://www.w3.org/TR/prefers-color-scheme/
   * - localStorage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
   * - Apple HIG: https://developer.apple.com/design/human-interface-guidelines/dark-mode/
   *
   * @internal
   */
  useEffect(() => {
    // Load saved preferences (NEW: appearance + brandColor stored separately)
    const rawSavedAppearance = localStorage.getItem('appearance');
    const rawSavedBrandColor = localStorage.getItem('brandColor');
    const savedAccessibility = localStorage.getItem('a11y') as AccessibilityMode | null;

    // Fallback: Check legacy 'theme' for migration
    const savedTheme = localStorage.getItem('theme') as Theme | null;

    const savedAppearance =
      rawSavedAppearance === 'light' || rawSavedAppearance === 'dark' || rawSavedAppearance === 'auto'
        ? rawSavedAppearance
        : null;

    const savedBrandColor = rawSavedBrandColor && isValidBrandColor(rawSavedBrandColor)
      ? rawSavedBrandColor
      : null;

    // Initialize appearance
    let initialAppearance: Appearance = savedAppearance || 'auto';
    if (!savedAppearance && savedTheme) {
      // Migrate legacy theme to appearance
      initialAppearance = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'auto';
    }

    // Initialize brand color
    let initialBrandColor: BrandColorTheme = savedBrandColor || 'default';
    if (!savedBrandColor && savedTheme && savedTheme !== 'light' && savedTheme !== 'dark') {
      // Migrate legacy brand theme
      initialBrandColor = savedTheme as BrandColorTheme;
    }

    // Detect system preference for auto mode
    const systemResolvedAppearance = resolveSystemAppearance();

    // Resolve actual appearance
    const actualAppearance = getActualAppearance(initialAppearance, systemResolvedAppearance);

    // Compute combined theme (for legacy applyThemeTokens)
    const computedTheme = computeTheme(initialAppearance, initialBrandColor, actualAppearance);

    // Update state
    setAppearanceState(initialAppearance);
    setBrandColorState(initialBrandColor);
    setResolvedAppearance(actualAppearance);
    setTheme(computedTheme);
    setAccessibilityMode(savedAccessibility || 'default');

    // Apply to DOM
    applyTheme(computedTheme, actualAppearance, initialBrandColor, savedAccessibility || 'default');
  }, [applyTheme, computeTheme]);

  /**
   * Listen for system color scheme changes (NEW: for auto mode)
   * When appearance is set to 'auto', automatically update when system changes
   *
   * @reference
   * - prefers-color-scheme: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
   * - Apple HIG: https://developer.apple.com/design/human-interface-guidelines/dark-mode/
   *
   * @internal
   */
  useEffect(() => {
    const colorSchemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleColorSchemeChange = (e: MediaQueryListEvent) => {
      const systemResolvedAppearance: 'light' | 'dark' = e.matches ? 'dark' : 'light';
      setResolvedAppearance(systemResolvedAppearance);

      // Only auto-update if appearance is set to 'auto'
      if (appearance === 'auto') {
        const computedTheme = computeTheme(appearance, brandColor, systemResolvedAppearance);
        setTheme(computedTheme);
        applyTheme(computedTheme, systemResolvedAppearance, brandColor, accessibilityMode);
      }
    };

    colorSchemeMediaQuery.addEventListener('change', handleColorSchemeChange);

    return () => {
      colorSchemeMediaQuery.removeEventListener('change', handleColorSchemeChange);
    };
  }, [appearance, brandColor, accessibilityMode, applyTheme, computeTheme]);

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
   * NEW: Handles both appearance and brandColor changes
   *
   * @reference
   * - Storage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
   *
   * @internal
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // NEW: Handle appearance changes
      if (e.key === 'appearance' && e.newValue) {
        if (e.newValue !== 'light' && e.newValue !== 'dark' && e.newValue !== 'auto') {
          return;
        }

        const newAppearance = e.newValue;
        const actualAppearance = getActualAppearance(newAppearance, resolvedAppearance);
        const computedTheme = computeTheme(newAppearance, brandColor, actualAppearance);

        setAppearanceState(newAppearance);
        setTheme(computedTheme);
        applyTheme(computedTheme, actualAppearance, brandColor, accessibilityMode);
      }

      // NEW: Handle brand color changes
      if (e.key === 'brandColor' && e.newValue) {
        if (!isValidBrandColor(e.newValue)) {
          return;
        }

        const newBrandColor = e.newValue;
        const actualAppearance = getActualAppearance(appearance, resolvedAppearance);
        const computedTheme = computeTheme(appearance, newBrandColor, actualAppearance);

        setBrandColorState(newBrandColor);
        setTheme(computedTheme);
        applyTheme(computedTheme, actualAppearance, newBrandColor, accessibilityMode);
      }

      // Legacy: Handle theme changes (for backwards compatibility)
      if (e.key === 'theme' && e.newValue) {
        const newTheme = e.newValue;
        if (isValidTheme(newTheme)) {
          const actualAppearance = getActualAppearance(appearance, resolvedAppearance);
          setTheme(newTheme);
          applyTheme(newTheme, actualAppearance, brandColor, accessibilityMode);
        }
      }

      // Accessibility mode changes
      if (e.key === 'a11y' && e.newValue) {
        const newMode = e.newValue as AccessibilityMode;
        const actualAppearance = getActualAppearance(appearance, resolvedAppearance);
        setAccessibilityMode(newMode);
        applyTheme(theme, actualAppearance, brandColor, newMode);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [theme, appearance, brandColor, resolvedAppearance, accessibilityMode, applyTheme, computeTheme]);

  /**
   * NEW: Set appearance independently (light/dark/auto)
   * Follows Apple HIG and Material Design 3 best practices
   *
   * PERFORMANCE OPTIMIZATIONS:
   * - Reduced transition timeout: 150ms (was 300ms) for 60fps
   * - GPU hints via CSS will-change
   * - Batched DOM operations in requestAnimationFrame
   *
   * @param {Appearance} newAppearance - Appearance to set (light/dark/auto)
   *
   * @description
   * - Applies appearance to DOM
   * - Persists to localStorage  
   * - Respects system preference if auto
   * - Dispatches custom event for components
   *
   * @fires appearancechange - Custom event with appearance data
   *
   * @reference
   * - Apple HIG Dark Mode: https://developer.apple.com/design/human-interface-guidelines/dark-mode/
   * - Material Design 3 Dark Theme: https://m3.material.io/styles/color/dark-theme/overview
   * - Chrome Rendering Performance: https://web.dev/rendering-performance/
   *
   * @example
   * const { setAppearance } = useTheme();
   * setAppearance('auto'); // Follow system preference
   *
   * @internal
   */
  const setAppearance = useCallback(
    (newAppearance: Appearance) => {
      // PERFORMANCE: Mark start for monitoring
      const startTime = performance.now();

      // Resolve actual appearance if auto
      const actualAppearance = getActualAppearance(newAppearance, resolvedAppearance);

      // Compute combined theme
      const computedTheme = computeTheme(newAppearance, brandColor, actualAppearance);

      // No-op when selection is unchanged to avoid redundant renders and DOM work.
      if (newAppearance === appearance && computedTheme === theme) {
        return;
      }

      runThemeMutation(() => {
        // Update state
        setAppearanceState(newAppearance);
        setTheme(computedTheme);
        applyTheme(computedTheme, actualAppearance, brandColor, accessibilityMode);
      });

      // Persist to localStorage
      try {
        localStorage.setItem('appearance', newAppearance);
        // Legacy: Also update theme for backwards compatibility
        localStorage.setItem('theme', computedTheme);
      } catch (error) {
        console.error('Failed to save appearance preference:', error);
      }

      // Dispatch custom event
      try {
        window.dispatchEvent(
          new CustomEvent('appearancechange', {
            detail: {
              appearance: newAppearance,
              resolvedAppearance: actualAppearance,
              brandColor,
              timestamp: Date.now(),
            },
          })
        );
      } catch (error) {
        console.error('Failed to dispatch appearance change event:', error);
      }

      // PERFORMANCE: Log in development if slow
      if (process.env.NODE_ENV === 'development') {
        const duration = performance.now() - startTime;
        if (duration > 16) { // 60fps threshold
          console.warn(`⚠️ setAppearance took ${duration.toFixed(2)}ms (target: <16ms for 60fps)`);
        }
      }
    },
    [appearance, theme, brandColor, resolvedAppearance, accessibilityMode, applyTheme, computeTheme, runThemeMutation]
  );

  /**
   * NEW: Set brand color independently
   * Follows Material Design 3 seed color / brand color best practices
   *
   * PERFORMANCE OPTIMIZATIONS:
   * - Reduced transition timeout: 150ms (was 300ms)
   * - Performance monitoring in development
   *
   * @param {BrandColorTheme} newBrandColor - Brand color to set
   *
   * @description
   * - Applies brand color within current appearance
   * - Persists to localStorage
   * - Works with any appearance (light/dark/auto)
   * - Dispatches custom event for components
   *
   * @fires brandcolorchange - Custom event with brand color data
   *
   * @reference
   * - Material Design 3 Color Roles: https://m3.material.io/styles/color/roles
   * - Chrome Rendering Performance: https://web.dev/rendering-performance/
   *
   * @example
   * const { setBrandColor } = useTheme();
   * setBrandColor('brand-purple'); // Apply purple brand color
   *
   * @internal
   */
  const setBrandColor = useCallback(
    (newBrandColor: BrandColorTheme) => {
      // PERFORMANCE: Mark start for monitoring
      const startTime = performance.now();

      // Validate brand color exists
      if (!isValidBrandColor(newBrandColor)) {
        console.warn(`Invalid brand color: ${newBrandColor}`);
        return;
      }

      // Resolve actual appearance
      const actualAppearance = getActualAppearance(appearance, resolvedAppearance);

      // Compute combined theme
      const computedTheme = computeTheme(appearance, newBrandColor, actualAppearance);

      // No-op when selection is unchanged to avoid redundant renders and DOM work.
      if (newBrandColor === brandColor && computedTheme === theme) {
        return;
      }

      runThemeMutation(() => {
        // Update state
        setBrandColorState(newBrandColor);
        setTheme(computedTheme);
        applyTheme(computedTheme, actualAppearance, newBrandColor, accessibilityMode);
      });

      // Persist to localStorage
      try {
        localStorage.setItem('brandColor', newBrandColor);
        // Legacy: Also update theme for backwards compatibility
        localStorage.setItem('theme', computedTheme);
      } catch (error) {
        console.error('Failed to save brand color preference:', error);
      }

      // Dispatch custom event
      try {
        window.dispatchEvent(
          new CustomEvent('brandcolorchange', {
            detail: {
              brandColor: newBrandColor,
              appearance,
              resolvedAppearance: actualAppearance,
              timestamp: Date.now(),
            },
          })
        );
      } catch (error) {
        console.error('Failed to dispatch brand color change event:', error);
      }

      // PERFORMANCE: Log in development if slow
      if (process.env.NODE_ENV === 'development') {
        const duration = performance.now() - startTime;
        if (duration > 16) { // 60fps threshold
          console.warn(`⚠️ setBrandColor took ${duration.toFixed(2)}ms (target: <16ms for 60fps)`);
        }
      }
    },
    [appearance, theme, brandColor, resolvedAppearance, accessibilityMode, applyTheme, computeTheme, runThemeMutation]
  );

  /**
   * LEGACY: Change theme with optional animation and cross-device sync
   * @deprecated Use setAppearance + setBrandColor instead
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
      if (!isValidTheme(newTheme)) {
        console.warn(`Invalid theme: ${newTheme}`);
        return;
      }

      if (newTheme === theme) {
        return;
      }

      // Convert legacy theme to appearance + brand color
      let newAppearance: Appearance;
      let newBrandColor: BrandColorTheme;

      if (newTheme === 'light' || newTheme === 'dark') {
        newAppearance = newTheme;
        newBrandColor = 'default';
      } else {
        newAppearance = 'auto'; // Keep current appearance preference
        newBrandColor = newTheme as BrandColorTheme;
      }

      // Resolve actual appearance
      const actualAppearance = getActualAppearance(newAppearance, resolvedAppearance);

      runThemeMutation(() => {
        // Update state
        setAppearanceState(newAppearance);
        setBrandColorState(newBrandColor);
        setTheme(newTheme);
        applyTheme(newTheme, actualAppearance, newBrandColor, accessibilityMode);
      });

      // Persist to localStorage
      try {
        localStorage.setItem('appearance', newAppearance);
        localStorage.setItem('brandColor', newBrandColor);
        localStorage.setItem('theme', newTheme); // Legacy
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }

      // Dispatch custom event for other components
      try {
        window.dispatchEvent(
          new CustomEvent('themechange', {
            detail: {
              theme: newTheme,
              appearance: newAppearance,
              brandColor: newBrandColor,
              accessibilityMode,
              timestamp: Date.now(),
            },
          })
        );
      } catch (error) {
        console.error('Failed to dispatch theme change event:', error);
      }
    },
    [theme, accessibilityMode, resolvedAppearance, applyTheme, runThemeMutation]
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
      if (mode === accessibilityMode) {
        return;
      }

      // Resolve actual appearance
      const actualAppearance = getActualAppearance(appearance, resolvedAppearance);

      setAccessibilityMode(mode);
      applyTheme(theme, actualAppearance, brandColor, mode);
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
    [accessibilityMode, theme, appearance, resolvedAppearance, brandColor, applyTheme]
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
   * - Semantic Tokens: https://design-tokens.github.io/community-group/format/
   * - Material Design 3: https://m3.material.io/styles/color/system/overview
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
    // Use centralized semantic token constants (Phase 1 - SSOT)
    if (theme === 'light') {
      return GLOBAL_SEMANTIC_TOKENS;
    }

    if (theme === 'dark') {
      return DARK_SEMANTIC_TOKENS;
    }

    // Brand themes use semantic tokens from palettes
    const palette = palettes[theme as BrandTheme];
    return palette.semantic || GLOBAL_SEMANTIC_TOKENS;
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
   * NEW: Resets to auto appearance + default brand color
   *
   * @reference
   * - Apple HIG: Respect system preference by default
   *
   * @internal
   */
  const resetToDefaults = useCallback(() => {
    const systemResolved = resolveSystemAppearance();

    setAppearanceState('auto');
    setBrandColorState('default');
    setResolvedAppearance(systemResolved);
    setTheme(systemResolved);
    setAccessibilityMode('default');
    applyTheme(systemResolved, systemResolved, 'default', 'default');
    localStorage.removeItem('appearance');
    localStorage.removeItem('brandColor');
    localStorage.removeItem('theme'); // Legacy
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
    // NEW: Combinatorial state (Option A)
    appearance,
    brandColor,
    resolvedAppearance,
    // Legacy: For backwards compatibility
    theme,
    // Common state
    accessibilityMode,
    prefersReducedMotion,
    // NEW: Combinatorial setters (Option A)
    setAppearance,
    setBrandColor,
    // Legacy: For backwards compatibility
    changeTheme,
    // Common methods
    setAccessibilityMode: setAccessibilityModeHandler,
    getSemanticTokens,
    getPrimaryColor,
    getSecondaryColor,
    resetToDefaults,
  };
};
