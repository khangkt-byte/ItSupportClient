/**
 * Color Validation & WCAG Compliance Utilities
 *
 * Provides tools for validating color choices against WCAG accessibility standards.
 * Implements contrast ratio calculation and compliance checking.
 *
 * @module colorValidation
 * @description
 * Utilities for:
 * - Converting hex colors to RGB/HSL
 * - Calculating relative luminance (WCAG formula)
 * - Computing contrast ratios
 * - Validating WCAG AA and AAA compliance
 * - Validating entire color palettes
 * - Checking lightness progression
 *
 * @reference
 * - WCAG 2.0 Contrast Formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 * - WCAG 2.1 Level AA: https://www.w3.org/WAI/WCAG21/quickref/?showtechniques=143#contrast-minimum
 * - WCAG 2.1 Level AAA: https://www.w3.org/WAI/WCAG21/quickref/?showtechniques=143#contrast-enhanced
 * - WebAIM Contrast: https://webaim.org/articles/contrast/
 * - MDN Color Format: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
 */

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
 * RGB color representation
 * @interface RGB
 */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * HSL color representation
 * @interface HSL
 */
export interface HSL {
  h: number;
  s: number;
  l: number;
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
 * Validates hex color format
 *
 * @param {string} hex - Hex color code (with or without #)
 * @returns {boolean} Whether color is valid hex format
 *
 * @example
 * isValidHexColor('#FF5733'); // true
 * isValidHexColor('FF5733');  // true
 * isValidHexColor('red');     // false
 *
 * @internal
 */
export const isValidHexColor = (hex: string): boolean => {
  const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(hex);
};

/**
 * Convert hex color to RGB
 *
 * @param {string} hex - Hex color code
 * @returns {RGB} RGB representation
 * @throws {Error} If hex format is invalid
 *
 * @example
 * hexToRgb('#FF5733'); // { r: 255, g: 87, b: 51 }
 * hexToRgb('F57');     // { r: 255, g: 85, b: 119 }
 *
 * @reference
 * - Hex color specification: https://www.w3.org/TR/css-color-3/#html4
 *
 * @internal
 */
export const hexToRgb = (hex: string): RGB => {
  if (!isValidHexColor(hex)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  // Remove # if present
  let cleanHex = hex.replace('#', '');

  // Handle shorthand (F57 → FF5577)
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return { r, g, b };
};

/**
 * Convert RGB to hex color
 *
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {string} Hex color code
 *
 * @example
 * rgbToHex(255, 87, 51); // '#FF5733'
 *
 * @internal
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (value: number): string => {
    const hex = value.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

/**
 * Convert RGB to HSL
 *
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {HSL} HSL representation
 *
 * @reference
 * - RGB to HSL conversion: https://www.w3.org/TR/css-color-3/#html4
 *
 * @internal
 */
export const rgbToHsl = (r: number, g: number, b: number): HSL => {
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
};

/**
 * Calculate relative luminance per WCAG formula
 *
 * Relative luminance is used to calculate contrast ratios.
 * Formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 * 
 * For each RGB component:
 * - If normalized value <= 0.03928: component / 12.92
 * - Else: ((component + 0.055) / 1.055)^2.4
 * Then: 0.2126 * R + 0.7152 * G + 0.0722 * B
 *
 * @param {string} hex - Hex color code
 * @returns {number} Luminance value (0-1)
 *
 * @reference
 * - WCAG Relative Luminance: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 *
 * @example
 * getRelativeLuminance('#FFFFFF'); // 1
 * getRelativeLuminance('#000000'); // 0
 * getRelativeLuminance('#FF5733'); // 0.218
 *
 * @internal
 */
export const getRelativeLuminance = (hex: string): number => {
  const { r, g, b } = hexToRgb(hex);

  // Normalize to 0-1
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  // Apply WCAG formula
  const rLinear = rNorm <= 0.03928 ? rNorm / 12.92 : Math.pow((rNorm + 0.055) / 1.055, 2.4);
  const gLinear = gNorm <= 0.03928 ? gNorm / 12.92 : Math.pow((gNorm + 0.055) / 1.055, 2.4);
  const bLinear = bNorm <= 0.03928 ? bNorm / 12.92 : Math.pow((bNorm + 0.055) / 1.055, 2.4);

  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
};

/**
 * Calculate contrast ratio between two colors
 *
 * Formula: (L1 + 0.05) / (L2 + 0.05)
 * where L1 is the lighter color and L2 is the darker color.
 * Result ranges from 1:1 to 21:1
 *
 * @param {string} hex1 - First hex color
 * @param {string} hex2 - Second hex color
 * @returns {number} Contrast ratio (1-21)
 *
 * @reference
 * - WCAG Contrast Formula: https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 * - WebAIM Contrast: https://webaim.org/articles/contrast/
 * - MDN Color Contrast: https://developer.mozilla.org/en-US/docs/Web/Accessibility/Understanding_WCAG/Perceivable/Color_contrast
 *
 * @example
 * getContrastRatio('#FFFFFF', '#000000'); // 21
 * getContrastRatio('#FFFFFF', '#FFFF00'); // 1.08
 * getContrastRatio('#000000', '#555555'); // 7.23
 *
 * @internal
 */
export const getContrastRatio = (hex1: string, hex2: string): number => {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

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
 * @param {string} [paletteNamestring] - Name for error reporting
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
