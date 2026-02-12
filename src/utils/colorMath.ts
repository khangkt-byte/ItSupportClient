/**
 * Core Color Mathematics Utilities
 *
 * Single source of truth for all color conversion, luminance,
 * contrast ratio, and WCAG compliance calculations.
 *
 * All other modules (colorGenerator, accessibilityReport, colorValidation)
 * MUST import from this module instead of reimplementing these functions.
 *
 * @module colorMath
 *
 * @reference
 * - WCAG 2.0 Relative Luminance: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 * - WCAG 2.0 Contrast Ratio: https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 * - WCAG 2.1 Level AA: https://www.w3.org/WAI/WCAG21/quickref/?showtechniques=143#contrast-minimum
 * - WCAG 2.1 Level AAA: https://www.w3.org/WAI/WCAG21/quickref/?showtechniques=143#contrast-enhanced
 * - CSS Color Specification: https://www.w3.org/TR/css-color-3/#html4
 * - WebAIM Contrast: https://webaim.org/articles/contrast/
 */

// ============================================================
// Types
// ============================================================

/** RGB color representation */
export interface RGB {
    r: number;
    g: number;
    b: number;
}

/** HSL color representation */
export interface HSL {
    h: number;
    s: number;
    l: number;
}

// ============================================================
// Validation
// ============================================================

/**
 * Validates hex color format (3 or 6 digit, with or without #)
 */
export function isValidHexColor(hex: string): boolean {
    return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

// ============================================================
// Color Conversions
// ============================================================

/**
 * Parse hex color to RGB.
 * Returns null for invalid hex (safe version for optional chaining).
 *
 * @param hex - Hex color value (#RRGGBB or #RGB)
 * @returns RGB object or null if invalid
 */
export function hexToRgb(hex: string): RGB | null {
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
 * Parse hex color to RGB.
 * Throws on invalid hex (strict version for validation pipelines).
 *
 * @param hex - Hex color value (#RRGGBB or #RGB)
 * @returns RGB object
 * @throws Error if hex format is invalid
 */
export function hexToRgbStrict(hex: string): RGB {
    if (!isValidHexColor(hex)) {
        throw new Error(`Invalid hex color: ${hex}`);
    }
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map((c) => c + c).join('');
    }
    return {
        r: parseInt(cleanHex.substring(0, 2), 16),
        g: parseInt(cleanHex.substring(2, 4), 16),
        b: parseInt(cleanHex.substring(4, 6), 16),
    };
}

/**
 * Convert RGB to hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (v: number): string => {
        const hex = v.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
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
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
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
export function hslToRgb(h: number, s: number, l: number): RGB {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    let r: number, g: number, b: number;

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
        r: Math.round(r! * 255),
        g: Math.round(g! * 255),
        b: Math.round(b! * 255),
    };
}

// ============================================================
// Luminance & Contrast (WCAG)
// ============================================================

/**
 * Calculate relative luminance per WCAG 2.0 formula.
 *
 * @reference https://www.w3.org/TR/WCAG20/#relativeluminancedef
 * @returns Luminance value 0–1 (0 = black, 1 = white)
 */
export function getRelativeLuminance(hex: string): number {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    const toLin = (v: number) => {
        const n = v / 255;
        return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * toLin(rgb.r) + 0.7152 * toLin(rgb.g) + 0.0722 * toLin(rgb.b);
}

/**
 * Calculate brightness (0–255) using relative luminance.
 * Useful for quick light/dark checks.
 */
export function calculateBrightness(hex: string): number {
    const rgb = hexToRgb(hex);
    if (!rgb) return 128;
    const toLin = (v: number) => {
        const n = v / 255;
        return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
    };
    const L = 0.2126 * toLin(rgb.r) + 0.7152 * toLin(rgb.g) + 0.0722 * toLin(rgb.b);
    return Math.round(L * 255);
}

/**
 * Calculate WCAG contrast ratio between two colors.
 *
 * @reference https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 * @returns Contrast ratio (1:1 to 21:1)
 */
export function getContrastRatio(color1: string, color2: string): number {
    const l1 = getRelativeLuminance(color1);
    const l2 = getRelativeLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if two colors meet WCAG contrast standard.
 *
 * @param color1 - First hex color
 * @param color2 - Second hex color
 * @param level - 'AA' or 'AAA'
 * @param isLargeText - Large text uses relaxed thresholds
 */
export function meetsWCAGStandard(
    color1: string,
    color2: string,
    level: 'AA' | 'AAA' = 'AA',
    isLargeText: boolean = false,
): boolean {
    const ratio = getContrastRatio(color1, color2);
    if (level === 'AA') {
        return isLargeText ? ratio >= 3 : ratio >= 4.5;
    }
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Check WCAG standard using a pre-computed ratio.
 * Useful when the ratio has already been calculated.
 */
export function meetsWCAGRatio(
    ratio: number,
    level: 'AA' | 'AAA',
    isLargeText: boolean = false,
): boolean {
    if (level === 'AA') {
        return isLargeText ? ratio >= 3 : ratio >= 4.5;
    }
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Check if a color is light (luminance > 0.5).
 */
export function isLightColor(hex: string): boolean {
    return getRelativeLuminance(hex) > 0.5;
}
