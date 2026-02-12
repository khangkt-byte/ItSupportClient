// TODO: NOT_INTEGRATED — This hook is not imported by any production code.
// useTheme.ts already handles basic system preference detection in its init useEffect.
// This hook adds override capability but was never wired into the app.
// Remove or integrate before next release.

import { useEffect, useCallback, useState, useMemo } from 'react';
import { useTheme } from './useTheme';

/**
 * Hook for managing system color scheme preference
 * 
 * Features:
 * - Detect OS dark/light mode preference
 * - Auto-apply matching theme
 * - Listen for system preference changes
 * - Allow user override
 * - Persist override preference
 * - Graceful fallback for older browsers
 * 
 * @returns System preference utilities
 */
export function useSystemPreference() {
    const { theme, changeTheme } = useTheme();
    const [systemPreference, setSystemPreference] = useState<'light' | 'dark' | null>(null);
    const [userOverride, setUserOverride] = useState<'light' | 'dark' | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    // Check browser support for prefers-color-scheme
    useEffect(() => {
        const supported = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').media !== 'not all';
        setIsSupported(supported);

        if (supported) {
            // Try to load saved override from localStorage
            const savedOverride = localStorage.getItem('theme-override');
            if (savedOverride === 'light' || savedOverride === 'dark') {
                setUserOverride(savedOverride);
            }
        }
    }, []);

    /**
     * Detect current system preference
     */
    const detectSystemPreference = useCallback(() => {
        if (!isSupported) {
            setSystemPreference(null);
            return null;
        }

        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const preference = isDark ? 'dark' : 'light';
        setSystemPreference(preference);
        return preference;
    }, [isSupported]);

    /**
     * Set up listener for system preference changes
     */
    useEffect(() => {
        if (!isSupported) return;

        // Initial detection
        detectSystemPreference();

        // Listen for changes
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
            const preference = e.matches ? 'dark' : 'light';
            setSystemPreference(preference);
        };

        // Use addEventListener for better browser support
        if (darkModeQuery.addEventListener) {
            darkModeQuery.addEventListener('change', handleChange);
            return () => {
                darkModeQuery.removeEventListener('change', handleChange);
            };
        }
        // Fallback for older browsers
        else if (darkModeQuery.addListener) {
            darkModeQuery.addListener(handleChange);
            return () => {
                darkModeQuery.removeListener(handleChange);
            };
        }
    }, [isSupported, detectSystemPreference]);

    /**
     * Determine which theme to apply based on preference and override
     */
    const effectivePreference = useMemo(() => {
        if (userOverride) {
            return userOverride;
        }
        return systemPreference;
    }, [userOverride, systemPreference]);

    /**
     * Apply the effective preference as theme
     */
    useEffect(() => {
        if (!effectivePreference || !isSupported) return;

        // Only change theme if it doesn't match the preference
        const targetTheme = effectivePreference === 'dark' ? 'dark' : 'light';

        if (theme !== targetTheme) {
            changeTheme(targetTheme);
        }
    }, [effectivePreference, theme, changeTheme, isSupported]);

    /**
     * Override the system preference with user choice
     */
    const setPreferenceOverride = useCallback((preference: 'light' | 'dark' | null) => {
        if (!isSupported) return;

        if (preference === null) {
            // Clear override - use system preference
            localStorage.removeItem('theme-override');
            setUserOverride(null);
        } else {
            // Save override
            localStorage.setItem('theme-override', preference);
            setUserOverride(preference);
            changeTheme(preference);
        }
    }, [isSupported, changeTheme]);

    /**
     * Reset to system preference (clear override)
     */
    const resetToSystemPreference = useCallback(() => {
        setPreferenceOverride(null);
    }, [setPreferenceOverride]);

    /**
     * Check if currently using system preference (no override)
     */
    const isUsingSystemPreference = useMemo(() => {
        return userOverride === null && isSupported;
    }, [userOverride, isSupported]);

    /**
     * Get description of current state
     */
    const getStatusDescription = useCallback((): string => {
        if (!isSupported) {
            return 'System color preference detection not supported';
        }

        if (userOverride) {
            return `Using your preference: ${userOverride}`;
        }

        if (systemPreference) {
            return `Using system preference: ${systemPreference}`;
        }

        return 'Detecting system preference...';
    }, [isSupported, userOverride, systemPreference]);

    return {
        // State
        systemPreference,
        userOverride,
        isSupported,
        effectivePreference,
        isUsingSystemPreference,

        // Actions
        setPreferenceOverride,
        resetToSystemPreference,
        detectSystemPreference,

        // Utilities
        getStatusDescription,
    };
}

export type UseSystemPreferenceReturn = ReturnType<typeof useSystemPreference>;
