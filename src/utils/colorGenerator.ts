/**
 * Color Generation Utilities
 * 
 * Algorithms for generating color scales and semantic colors
 * Based on Material Design 3 color system
 * 
 * Core math functions (hexToRgb, rgbToHex, rgbToHsl, hslToRgb,
 * getRelativeLuminance, getContrastRatio, meetsWCAGStandard) are
 * imported from colorMath.ts — the single source of truth.
 * 
 * @module colorGenerator
 */

import { defaultSemanticTokens } from '@/constants/palettes';
import {
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    hslToRgb,
    getRelativeLuminance,
    meetsWCAGStandard,
    isLightColor,
} from '@/utils/colorMath';

// Re-export core functions so existing consumers don't break
export {
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    hslToRgb,
    getRelativeLuminance,
    meetsWCAGStandard,
    isLightColor,
};

/**
 * Re-export calculateContrastRatio as alias of getContrastRatio
 * for backward compatibility with existing consumers
 */
export { getContrastRatio as calculateContrastRatio } from '@/utils/colorMath';

/**
 * Generate a color scale from a base color
 * Creates tints (lighter) and shades (darker)
 * 
 * @param baseColor - Hex color to generate scale from
 * @param steps - Number of steps in each direction (default: 5)
 * @returns Array of hex colors from light to dark
 */
export function generateColorScale(baseColor: string, steps: number = 5): string[] {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return [];

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const colors: string[] = [];

    // Lighter tints (increased lightness)
    for (let i = steps; i > 0; i--) {
        const lightness = Math.min(hsl.l + (100 - hsl.l) * (i / steps), 95);
        const newRgb = hslToRgb(hsl.h, hsl.s, lightness);
        colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    }

    // Base color
    colors.push(baseColor.toUpperCase());

    // Darker shades (decreased lightness)
    for (let i = 1; i <= steps; i++) {
        const lightness = Math.max(hsl.l * (1 - i / steps * 0.8), 5);
        const newRgb = hslToRgb(hsl.h, hsl.s, lightness);
        colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    }

    return colors;
}

/**
 * Generate semantic colors based on base color
 * Maps emotional meanings to colors
 */
export function generateSemanticColors(baseColor: string): {
    success: string;
    warning: string;
    error: string;
    info: string;
} {
    const rgb = hexToRgb(baseColor);
    if (!rgb) {
        // Fallback to SSOT semantic tokens from palettes.ts
        return {
            success: defaultSemanticTokens.success,
            warning: defaultSemanticTokens.warning,
            error: defaultSemanticTokens.error,
            info: defaultSemanticTokens.info,
        };
    }

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Success: Green, keep saturation, adjust hue to ~120 degrees
    const successRgb = hslToRgb(120, Math.max(hsl.s, 50), Math.max(hsl.l, 45));

    // Warning: Yellow/Orange, hue ~45 degrees
    const warningRgb = hslToRgb(45, Math.max(hsl.s, 70), Math.max(hsl.l, 50));

    // Error: Red, hue ~0 degrees
    const errorRgb = hslToRgb(0, Math.max(hsl.s, 75), Math.max(hsl.l, 45));

    // Info: Blue, hue ~210 degrees
    const infoRgb = hslToRgb(210, Math.max(hsl.s, 60), Math.max(hsl.l, 50));

    return {
        success: rgbToHex(successRgb.r, successRgb.g, successRgb.b),
        warning: rgbToHex(warningRgb.r, warningRgb.g, warningRgb.b),
        error: rgbToHex(errorRgb.r, errorRgb.g, errorRgb.b),
        info: rgbToHex(infoRgb.r, infoRgb.g, infoRgb.b),
    };
}

/**
 * Generate complementary color (opposite on color wheel)
 */
export function generateComplementaryColor(baseColor: string): string {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return '#000000';

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const complementaryHue = (hsl.h + 180) % 360;

    const complementaryRgb = hslToRgb(complementaryHue, hsl.s, hsl.l);
    return rgbToHex(complementaryRgb.r, complementaryRgb.g, complementaryRgb.b);
}

/**
 * Generate analogous colors (adjacent on color wheel)
 */
export function generateAnalogousColors(baseColor: string): { left: string; right: string } {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return { left: '#000000', right: '#000000' };

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const leftHue = (hsl.h - 30 + 360) % 360;
    const rightHue = (hsl.h + 30) % 360;

    const leftRgb = hslToRgb(leftHue, hsl.s, hsl.l);
    const rightRgb = hslToRgb(rightHue, hsl.s, hsl.l);

    return {
        left: rgbToHex(leftRgb.r, leftRgb.g, leftRgb.b),
        right: rgbToHex(rightRgb.r, rightRgb.g, rightRgb.b),
    };
}

/**
 * Export colors as CSS variables string
 */
export function exportAsCSSVariables(colors: Record<string, string>): string {
    let css = ':root {\n';

    Object.entries(colors).forEach(([key, value]) => {
        css += `  --color-${key}: ${value};\n`;
    });

    css += '}\n';
    return css;
}

/**
 * Export colors as JavaScript object
 */
export function exportAsJavaScript(colors: Record<string, string>): string {
    return `export const brandColors = ${JSON.stringify(colors, null, 2)};`;
}

/**
 * Extract dominant hue from hex color
 */
export function getDominantHue(hex: string): number {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return hsl.h;
}
