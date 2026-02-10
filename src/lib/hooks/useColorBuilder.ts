import { useState, useCallback, useMemo } from 'react';
import {
    generateColorScale,
    generateSemanticColors,
    generateComplementaryColor,
    generateAnalogousColors,
    meetsWCAGStandard,
    exportAsCSSVariables,
    exportAsJavaScript,
} from '../utils/colorGenerator';

/**
 * Hook for managing custom color builder functionality
 * Build brand themes with visual previews and accessibility checks
 * 
 * Features:
 * - Generate color scales from base color
 * - Generate semantic colors (success, warning, error, info)
 * - Color harmony suggestions (complementary, analogous)
 * - Accessibility checking (WCAG AA/AAA)
 * - Export as CSS variables or JavaScript
 * - Save to localStorage
 * 
 * @returns Color builder utilities
 */
export function useColorBuilder() {
    const [baseColor, setBaseColor] = useState('#2563eb'); // Blue
    const [themeName, setThemeName] = useState('Custom Brand');
    const [lightBg, setLightBg] = useState('#ffffff');
    const [darkBg, setDarkBg] = useState('#1f2937');
    const [savedThemes, setSavedThemes] = useState<Array<{
        id: string;
        name: string;
        baseColor: string;
        timestamp: number;
    }>>([]);

    // Load saved themes on mount
    useMemo(() => {
        const saved = localStorage.getItem('custom-themes');
        if (saved) {
            try {
                setSavedThemes(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load saved themes', e);
            }
        }
    }, []);

    /**
     * Generate color scale from base color
     */
    const colorScale = useMemo(() => {
        return generateColorScale(baseColor, 5);
    }, [baseColor]);

    /**
     * Generate semantic colors
     */
    const semanticColors = useMemo(() => {
        return generateSemanticColors(baseColor);
    }, [baseColor]);

    /**
     * Generate harmony colors
     */
    const harmonyColors = useMemo(() => {
        return {
            complementary: generateComplementaryColor(baseColor),
            analogous: generateAnalogousColors(baseColor),
        };
    }, [baseColor]);

    /**
     * Check accessibility of semantic colors against backgrounds
     */
    const accessibilityCheck = useMemo(() => {
        const checks = {
            successLight: meetsWCAGStandard(semanticColors.success, lightBg, 'AA'),
            successDark: meetsWCAGStandard(semanticColors.success, darkBg, 'AA'),
            warningLight: meetsWCAGStandard(semanticColors.warning, lightBg, 'AA'),
            warningDark: meetsWCAGStandard(semanticColors.warning, darkBg, 'AA'),
            errorLight: meetsWCAGStandard(semanticColors.error, lightBg, 'AA'),
            errorDark: meetsWCAGStandard(semanticColors.error, darkBg, 'AA'),
            infoLight: meetsWCAGStandard(semanticColors.info, lightBg, 'AA'),
            infoDark: meetsWCAGStandard(semanticColors.info, darkBg, 'AA'),
        };

        const passed = Object.values(checks).filter(v => v).length;
        const total = Object.values(checks).length;

        return {
            checks,
            passed,
            total,
            passedAA: passed === total,
        };
    }, [semanticColors, lightBg, darkBg]);

    /**
     * Get all generated colors as object
     */
    const allColors = useMemo(() => {
        return {
            'primary-light': colorScale[0],
            'primary': baseColor.toUpperCase(),
            'primary-dark': colorScale[colorScale.length - 1],
            'success': semanticColors.success,
            'warning': semanticColors.warning,
            'error': semanticColors.error,
            'info': semanticColors.info,
            'complementary': harmonyColors.complementary,
            'analogous-left': harmonyColors.analogous.left,
            'analogous-right': harmonyColors.analogous.right,
            'bg-light': lightBg,
            'bg-dark': darkBg,
        };
    }, [baseColor, colorScale, semanticColors, harmonyColors, lightBg, darkBg]);

    /**
     * Export colors as CSS variables
     */
    const exportCSS = useCallback(() => {
        return exportAsCSSVariables(allColors);
    }, [allColors]);

    /**
     * Export colors as JavaScript
     */
    const exportJS = useCallback(() => {
        return exportAsJavaScript(allColors);
    }, [allColors]);

    /**
     * Save theme to localStorage
     */
    const saveTheme = useCallback(() => {
        const newTheme = {
            id: Date.now().toString(),
            name: themeName,
            baseColor,
            timestamp: Date.now(),
        };

        const updated = [...savedThemes, newTheme];
        setSavedThemes(updated);
        localStorage.setItem('custom-themes', JSON.stringify(updated));

        // Also save the full theme config
        localStorage.setItem(`custom-theme-${newTheme.id}`, JSON.stringify({
            ...newTheme,
            colors: allColors,
        }));

        return newTheme;
    }, [themeName, baseColor, allColors, savedThemes]);

    /**
     * Load saved theme
     */
    const loadTheme = useCallback((id: string) => {
        const saved = localStorage.getItem(`custom-theme-${id}`);
        if (!saved) return null;

        try {
            const theme = JSON.parse(saved);
            setBaseColor(theme.baseColor);
            setThemeName(theme.name);
            return theme;
        } catch (e) {
            console.error('Failed to load theme', e);
            return null;
        }
    }, []);

    /**
     * Delete saved theme
     */
    const deleteTheme = useCallback((id: string) => {
        const updated = savedThemes.filter(t => t.id !== id);
        setSavedThemes(updated);
        localStorage.setItem('custom-themes', JSON.stringify(updated));
        localStorage.removeItem(`custom-theme-${id}`);
    }, [savedThemes]);

    /**
     * Reset to default brand color
     */
    const reset = useCallback(() => {
        setBaseColor('#2563eb');
        setThemeName('Custom Brand');
        setLightBg('#ffffff');
        setDarkBg('#1f2937');
    }, []);

    /**
     * Get color scale with labels
     */
    const getLabeledScale = useCallback(() => {
        const labels = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
        return colorScale.map((color, index) => ({
            label: labels[index],
            color,
        }));
    }, [colorScale]);

    return {
        // State
        baseColor,
        themeName,
        lightBg,
        darkBg,
        savedThemes,

        // Setters
        setBaseColor,
        setThemeName,
        setLightBg,
        setDarkBg,

        // Generated colors
        colorScale,
        semanticColors,
        harmonyColors,
        allColors,

        // Accessibility
        accessibilityCheck,

        // Utilities
        getLabeledScale,
        exportCSS,
        exportJS,
        saveTheme,
        loadTheme,
        deleteTheme,
        reset,
    };
}

export type UseColorBuilderReturn = ReturnType<typeof useColorBuilder>;
