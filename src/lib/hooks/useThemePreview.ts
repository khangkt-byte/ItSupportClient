import { useState, useCallback, useEffect } from 'react';
import { useTheme } from './useTheme';
import type { Theme } from './useTheme';

/**
 * Hook for managing theme preview functionality
 * Provides state management for the theme selector component
 * 
 * Features:
 * - Preview themes without applying
 * - Track theme history
 * - Undo/redo functionality
 * - Performance tracking
 * 
 * @returns Theme preview utilities
 */
interface ThemeHistoryEntry {
    theme: Theme;
    timestamp: number;
}

export function useThemePreview() {
    const { theme: currentTheme, changeTheme } = useTheme();
    const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
    const [history, setHistory] = useState<ThemeHistoryEntry[]>([
        { theme: currentTheme, timestamp: Date.now() }
    ]);
    const [performanceMetrics, setPerformanceMetrics] = useState<{
        lastChangeTime: number;
        averageChangeTime: number;
        changeTimes: number[];
    }>({
        lastChangeTime: 0,
        averageChangeTime: 0,
        changeTimes: [],
    });

    // Track when current theme changes from useTheme hook
    useEffect(() => {
        setHistory(prev => {
            const lastEntry = prev[prev.length - 1];
            if (lastEntry.theme !== currentTheme) {
                return [...prev, { theme: currentTheme, timestamp: Date.now() }];
            }
            return prev;
        });
    }, [currentTheme]);

    /**
     * Apply a theme and track in history
     */
    const applyTheme = useCallback((newTheme: Theme) => {
        const startTime = performance.now();

        changeTheme(newTheme);
        setPreviewTheme(null);

        const endTime = performance.now();
        const duration = endTime - startTime;

        // Track performance
        setPerformanceMetrics(prev => {
            const newTimes = [...prev.changeTimes, duration];
            const average = newTimes.reduce((a, b) => a + b, 0) / newTimes.length;

            return {
                lastChangeTime: duration,
                averageChangeTime: average,
                changeTimes: newTimes.slice(-10), // Keep last 10
            };
        });
    }, [changeTheme]);

    /**
     * Undo to previous theme in history
     */
    const undo = useCallback(() => {
        if (history.length > 1) {
            const newHistory = history.slice(0, -1);
            const previousTheme = newHistory[newHistory.length - 1].theme;

            changeTheme(previousTheme);
            setHistory(newHistory);
        }
    }, [history, changeTheme]);

    /**
     * Redo (re-apply the theme we just undid)
     */
    const redo = useCallback(() => {
        if (history.length > 0) {
            const lastTheme = history[history.length - 1].theme;
            applyTheme(lastTheme);
        }
    }, [history, applyTheme]);

    /**
     * Reset to light theme
     */
    const reset = useCallback(() => {
        applyTheme('light');
    }, [applyTheme]);

    /**
     * Clear history
     */
    const clearHistory = useCallback(() => {
        setHistory([{ theme: currentTheme, timestamp: Date.now() }]);
    }, [currentTheme]);

    /**
     * Get theme at specific point in history
     */
    const getHistoryTheme = useCallback((index: number): Theme | null => {
        if (index >= 0 && index < history.length) {
            return history[index].theme;
        }
        return null;
    }, [history]);

    /**
     * Jump to specific theme in history
     */
    const jumpToHistoryPoint = useCallback((index: number) => {
        const theme = getHistoryTheme(index);
        if (theme) {
            const newHistory = history.slice(0, index + 1);
            changeTheme(theme);
            setHistory(newHistory);
        }
    }, [history, getHistoryTheme, changeTheme]);

    return {
        // State
        previewTheme,
        history,
        currentTheme,
        performanceMetrics,

        // Actions
        setPreviewTheme,
        applyTheme,
        undo,
        redo,
        reset,
        clearHistory,
        getHistoryTheme,
        jumpToHistoryPoint,

        // Derived state
        canUndo: history.length > 1,
        canRedo: false, // Simplified for now - full redo requires additional tracking
        historyLength: history.length,
    };
}

export type UseThemePreviewReturn = ReturnType<typeof useThemePreview>;