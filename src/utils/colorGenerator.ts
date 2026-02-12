/**
 * Color Generation Utilities
 * 
 * Algorithms for generating color scales and semantic colors
 * Based on Material Design 3 color system
 * 
 * @module colorGenerator
 */

/**
 * Parse hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
}

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
        // Fallback colors
        return {
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
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
 * Get relative luminance (for contrast calculation)
 */
export function getRelativeLuminance(hex: string): number {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const luminance = (value: number) => {
        const v = value / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };

    const l1 = luminance(rgb.r);
    const l2 = luminance(rgb.g);
    const l3 = luminance(rgb.b);

    return 0.2126 * l1 + 0.7152 * l2 + 0.0722 * l3;
}

/**
 * Calculate contrast ratio between two colors
 */
export function calculateContrastRatio(color1: string, color2: string): number {
    const l1 = getRelativeLuminance(color1);
    const l2 = getRelativeLuminance(color2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if two colors meet WCAG standards
 */
export function meetsWCAGStandard(
    color1: string,
    color2: string,
    level: 'AA' | 'AAA' = 'AA',
    isLargeText: boolean = false
): boolean {
    const ratio = calculateContrastRatio(color1, color2);

    if (level === 'AA') {
        return isLargeText ? ratio >= 3 : ratio >= 4.5;
    } else {
        return isLargeText ? ratio >= 4.5 : ratio >= 7;
    }
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
 * Extract dominant color from hex using simple brightness
 */
export function getDominantHue(hex: string): number {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return hsl.h;
}

/**
 * Check if color is light or dark (for text color selection)
 */
export function isLightColor(hex: string): boolean {
    const luminance = getRelativeLuminance(hex);
    return luminance > 0.5;
}
