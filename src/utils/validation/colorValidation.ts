/**
 * Color Validation & WCAG Compliance Utilities
 *
 * Provides tools for validating color choices against WCAG accessibility standards.
 * Implements contrast ratio calculation and compliance checking.
 *
 * Core math functions are imported from colorMath.ts (SSOT).
 *
 * @module colorValidation
 * @description
 * Utilities for:
 * - Validating entire color palettes
 * - Checking lightness progression
 * - WCAG AA and AAA compliance validation
 *
 * @reference
 * - WCAG 2.0 Contrast Formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 * - WCAG 2.1 Level AA: https://www.w3.org/WAI/WCAG21/quickref/?showtechniques=143#contrast-minimum
 * - WCAG 2.1 Level AAA: https://www.w3.org/WAI/WCAG21/quickref/?showtechniques=143#contrast-enhanced
 * - WebAIM Contrast: https://webaim.org/articles/contrast/
 * - MDN Color Format: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
 */

import {
  type RGB,
  type HSL,
  isValidHexColor,
  hexToRgbStrict as hexToRgb,
  rgbToHex,
  rgbToHsl,
  getRelativeLuminance,
  getContrastRatio,
} from '@/utils/colorMath';

// Re-export core functions for consumers that import from this file
export { isValidHexColor, rgbToHex, rgbToHsl, getRelativeLuminance, getContrastRatio };
export type { RGB, HSL };

/**
 * Color contrast validation result
 * @interface ContrastResult
 */
export interface ContrastResult {
  /** Contrast ratio (1:1 to 21:1) */
  ratio: number;
  /** Passes WCAG AA (4.5:1 for normal text, 3:1 for large text) */
  wcagAA: boolean;
  /** Passes WCAG AAA (7:1 for normal text, 4.5:1 for large text) */
  wcagAAA: boolean;
  /** Human-readable compliance level */
  level: 'fail' | 'AA' | 'AAA';
}

/**
 * Palette validation result
 * @interface PaletteValidationResult
 */
export interface PaletteValidationResult {
  /** Overall palette passes AA standards */
  isValidAA: boolean;
  /** Overall palette passes AAA standards */
  isValidAAA: boolean;
  /** Lightness values are properly progressive */
  lightnessProgressive: boolean;
  /** Issues found during validation */
  issues: string[];
  /** Warnings for potential improvements */
  warnings: string[];
  /** Number of color pairs checked */
  pairsChecked: number;
  /** Contract ratios for each pair */
  contrastRatios: Record<string, number>;
}

/**
 * hexToRgb re-exported from colorMath.ts (strict version that throws on invalid)
 * For the safe version (returns null), import from '@/utils/colorMath' directly.
 */
export { hexToRgb };

/**
 * Validate contrast between two colors
 *
 * Returns detailed WCAG compliance information.
 * WCAG AA minimum:
 * - Normal text: 4.5:1
 * - Large text (18pt+ or 14pt+ bold): 3:1
 *
 * WCAG AAA minimum:
 * - Normal text: 7:1
 * - Large text: 4.5:1
 *
 * @param {string} foreground - Text/foreground color hex
 * @param {string} background - Background color hex
 * @param {boolean} [isLargeText=false] - Is text large (18pt+ or 14pt+ bold)?
 * @returns {ContrastResult} Detailed contrast information
 *
 * @reference
 * - WCAG 2.1 Contrast Minimum: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 * - WCAG 2.1 Contrast Enhanced: https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced
 *
 * @example
 * const result = validateContrast('#000000', '#FFFFFF');
 * console.log(result.wcagAA); // true
 * console.log(result.level);  // 'AAA'
 *
 * @internal
 */
export const validateContrast = (
  foreground: string,
  background: string,
  isLargeText: boolean = false
): ContrastResult => {
  const ratio = getContrastRatio(foreground, background);

  // WCAG AA thresholds
  const aaThreshold = isLargeText ? 3 : 4.5;
  // WCAG AAA thresholds
  const aaaThreshold = isLargeText ? 4.5 : 7;

  const wcagAA = ratio >= aaThreshold;
  const wcagAAA = ratio >= aaaThreshold;

  let level: 'fail' | 'AA' | 'AAA' = 'fail';
  if (wcagAAA) {
    level = 'AAA';
  } else if (wcagAA) {
    level = 'AA';
  }

  return {
    ratio: Math.round(ratio * 100) / 100, // Round to 2 decimals
    wcagAA,
    wcagAAA,
    level,
  };
};

/**
 * Validate entire color palette for accessibility
 *
 * Checks:
 * 1. Adjacent color contrast (progressive steps should have sufficient contrast)
 * 2. Lightness progression (values should increase monotonically)
 * 3. WCAG AA compliance for common pairs
 *
 * @param {Record<number, string>} palette - Color palette object (50, 100, 200, ..., 950)
 * @param {string} [paletteName] - Name for error reporting
 * @returns {PaletteValidationResult} Validation results with detailed analysis
 *
 * @reference
 * - Material Design 3 Palette: https://m3.material.io/styles/color/the-color-system/color-roles
 *
 * @example
 * const palette = { 50: '#f5f3ff', 100: '#ede9fe', ..., 950: '#2d0a4e' };
 * const result = validatePalette(palette, 'brand-purple');
 * if (!result.isValidAA) {
 *   console.warn('Accessibility issues:', result.issues);
 * }
 *
 * @internal
 */
export const validatePalette = (
  palette: Record<number | string, string>,
  paletteName: string = 'unknown'
): PaletteValidationResult => {
  const issues: string[] = [];
  const warnings: string[] = [];
  const contrastRatios: Record<string, number> = {};
  const lightnessValues: number[] = [];

  const tones = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  // Validate format and lightness
  try {
    for (const tone of tones) {
      const color = palette[tone];
      if (!color) {
        issues.push(`Missing tone: ${tone}`);
        continue;
      }

      if (!isValidHexColor(color)) {
        issues.push(`Invalid hex format at tone ${tone}: ${color}`);
        continue;
      }

      const rgb = hexToRgb(color);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      lightnessValues.push(hsl.l);
    }

    // Check lightness progression
    for (let i = 1; i < lightnessValues.length; i++) {
      if (lightnessValues[i] >= lightnessValues[i - 1]) {
        warnings.push(
          `Lightness not strictly decreasing: tone ${tones[i]} (${lightnessValues[i]}%) >= tone ${tones[i - 1]} (${lightnessValues[i - 1]}%)`
        );
      }
    }

    // Check contrast between adjacent tones
    for (let i = 0; i < tones.length - 1; i++) {
      const tone1 = tones[i];
      const tone2 = tones[i + 1];
      const color1 = palette[tone1];
      const color2 = palette[tone2];

      const contrast = getContrastRatio(color1, color2);
      contrastRatios[`${tone1}-${tone2}`] = Math.round(contrast * 100) / 100;

      // Adjacent tones should have some visual separation
      if (contrast < 1.5) {
        warnings.push(`Low contrast between tones ${tone1} and ${tone2}: ${contrast.toFixed(2)}`);
      }
    }

    // Check common color pair contrasts (light text on dark background, etc.)
    const lightColor = palette[50];
    const darkColor = palette[950];

    if (lightColor && darkColor) {
      const lightOnDarkResult = validateContrast(lightColor, darkColor);
      if (!lightOnDarkResult.wcagAA) {
        issues.push(
          `Light text on dark background fails WCAG AA: ${lightOnDarkResult.ratio}:1 (requires 4.5:1)`
        );
      }

      const darkOnLightResult = validateContrast(darkColor, lightColor);
      if (!darkOnLightResult.wcagAA) {
        issues.push(
          `Dark text on light background fails WCAG AA: ${darkOnLightResult.ratio}:1 (requires 4.5:1)`
        );
      }
    }
  } catch (error) {
    issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const isValidAA = issues.length === 0;
  const isValidAAA = issues.length === 0 && warnings.length === 0;

  return {
    isValidAA,
    isValidAAA,
    lightnessProgressive: warnings.filter((w) => w.includes('strictly')).length === 0,
    issues,
    warnings,
    pairsChecked: tones.length - 1,
    contrastRatios,
  };
};

/**
 * Get WCAG compliance level as percentage
 *
 * Useful for displaying overall accessibility score.
 *
 * @param {ContrastResult} result - Contrast validation result
 * @returns {string} Compliance level: 'AAA', 'AA', or 'FAIL'
 *
 * @internal
 */
export const getComplianceLevel = (result: ContrastResult): string => {
  return result.level === 'fail' ? 'FAIL' : result.level;
};
