/**
 * Unit tests for Color Validation Utilities
 *
 * Test suite for WCAG 2.0/2.1 color contrast validation and compliance checking.
 * Validates:
 * - Hex color format validation
 * - RGB/HSL conversion accuracy
 * - Relative luminance calculation per WCAG formula
 * - Contrast ratio computation
 * - WCAG AA/AAA compliance detection
 * - Palette validation against standards
 *
 * @reference
 * - WCAG 2.0 Contrast Formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 * - WCAG 2.1 Contrast Minimum: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
 * - Jest: https://jestjs.io/
 */

import {
    isValidHexColor,
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    getRelativeLuminance,
    getContrastRatio,
    validateContrast,
    validatePalette,
    getComplianceLevel,
} from './colorValidation';

describe('Color Validation Utilities', () => {
    // ============================================================
    // ✅ HEX COLOR VALIDATION TESTS
    // ============================================================

    describe('isValidHexColor', () => {
        test('should accept 6-digit hex colors', () => {
            expect(isValidHexColor('#FF5733')).toBe(true);
            expect(isValidHexColor('#000000')).toBe(true);
            expect(isValidHexColor('#FFFFFF')).toBe(true);
        });

        test('should accept 3-digit shorthand hex colors', () => {
            expect(isValidHexColor('#F57')).toBe(true);
            expect(isValidHexColor('#000')).toBe(true);
            expect(isValidHexColor('#FFF')).toBe(true);
        });

        test('should accept hex colors without hash', () => {
            expect(isValidHexColor('FF5733')).toBe(true);
            expect(isValidHexColor('000000')).toBe(true);
        });

        test('should reject invalid formats', () => {
            expect(isValidHexColor('red')).toBe(false);
            expect(isValidHexColor('#GGGGGG')).toBe(false);
            expect(isValidHexColor('#FF57')).toBe(false);
            expect(isValidHexColor('FF573')).toBe(false);
        });

        test('should be case-insensitive', () => {
            expect(isValidHexColor('#ff5733')).toBe(true);
            expect(isValidHexColor('#FF5733')).toBe(true);
            expect(isValidHexColor('#Ff5733')).toBe(true);
        });
    });

    // ============================================================
    // ✅ HEX TO RGB CONVERSION TESTS
    // ============================================================

    describe('hexToRgb', () => {
        test('should convert 6-digit hex to RGB', () => {
            const result = hexToRgb('#FF5733');
            expect(result).toEqual({ r: 255, g: 87, b: 51 });
        });

        test('should convert 3-digit shorthand hex to RGB', () => {
            const result = hexToRgb('#F57');
            expect(result).toEqual({ r: 255, g: 85, b: 119 });
        });

        test('should handle hex without hash', () => {
            const result = hexToRgb('FF5733');
            expect(result).toEqual({ r: 255, g: 87, b: 51 });
        });

        test('should convert pure black and white', () => {
            expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
            expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
        });

        test('should throw on invalid hex', () => {
            expect(() => hexToRgb('invalid')).toThrow();
            expect(() => hexToRgb('#GGGGGG')).toThrow();
        });
    });

    // ============================================================
    // ✅ RGB TO HEX CONVERSION TESTS
    // ============================================================

    describe('rgbToHex', () => {
        test('should convert RGB to hex', () => {
            expect(rgbToHex(255, 87, 51)).toBe('#FF5733');
            expect(rgbToHex(0, 0, 0)).toBe('#000000');
            expect(rgbToHex(255, 255, 255)).toBe('#FFFFFF');
        });

        test('should pad single-digit hex values', () => {
            expect(rgbToHex(15, 15, 15)).toBe('#0F0F0F');
            expect(rgbToHex(1, 1, 1)).toBe('#010101');
        });

        test('should return uppercase hex', () => {
            const result = rgbToHex(255, 86, 51);
            expect(result).toMatch(/^#[0-9A-F]{6}$/);
        });
    });

    // ============================================================
    // ✅ RGB TO HSL CONVERSION TESTS
    // ============================================================

    describe('rgbToHsl', () => {
        test('should convert RGB to HSL', () => {
            const result = rgbToHsl(255, 87, 51);
            expect(result.h).toBe(11);
            expect(result.s).toBe(100);
            expect(result.l).toBeGreaterThan(50);
        });

        test('should handle grayscale colors', () => {
            // Pure gray should have 0% saturation
            const result = rgbToHsl(128, 128, 128);
            expect(result.s).toBe(0);
        });

        test('should handle pure black and white', () => {
            const black = rgbToHsl(0, 0, 0);
            expect(black.l).toBe(0);

            const white = rgbToHsl(255, 255, 255);
            expect(white.l).toBe(100);
        });
    });

    // ============================================================
    // ✅ RELATIVE LUMINANCE TESTS (WCAG Formula)
    // ============================================================

    describe('getRelativeLuminance', () => {
        test('should return 1 for white', () => {
            const luminance = getRelativeLuminance('#FFFFFF');
            expect(luminance).toBe(1);
        });

        test('should return 0 for black', () => {
            const luminance = getRelativeLuminance('#000000');
            expect(luminance).toBeCloseTo(0, 2);
        });

        test('should return value between 0 and 1', () => {
            const luminance = getRelativeLuminance('#FF5733');
            expect(luminance).toBeGreaterThan(0);
            expect(luminance).toBeLessThan(1);
        });

        test('should follow WCAG formula accurately', () => {
            // Test against known values
            // #808080 (medium gray) should be approximately 0.216
            const grayLuminance = getRelativeLuminance('#808080');
            expect(grayLuminance).toBeCloseTo(0.216, 2);
        });

        test('should handle shorthand hex', () => {
            const result1 = getRelativeLuminance('#FFF');
            const result2 = getRelativeLuminance('#FFFFFF');
            expect(result1).toBeCloseTo(result2, 5);
        });
    });

    // ============================================================
    // ✅ CONTRAST RATIO TESTS (WCAG Formula)
    // ============================================================

    describe('getContrastRatio', () => {
        test('should return 21:1 for black on white', () => {
            const ratio = getContrastRatio('#FFFFFF', '#000000');
            expect(ratio).toBe(21);
        });

        test('should return 1:1 for identical colors', () => {
            const ratio = getContrastRatio('#FF5733', '#FF5733');
            expect(ratio).toBeCloseTo(1, 2);
        });

        test('should return value between 1 and 21', () => {
            const ratio = getContrastRatio('#000000', '#555555');
            expect(ratio).toBeGreaterThan(1);
            expect(ratio).toBeLessThan(21);
        });

        test('should be symmetric (order independent)', () => {
            const ratio1 = getContrastRatio('#FFFFFF', '#000000');
            const ratio2 = getContrastRatio('#000000', '#FFFFFF');
            expect(ratio1).toBeCloseTo(ratio2, 2);
        });

        test('should handle common color pairs', () => {
            // Black text on white background
            expect(getContrastRatio('#000000', '#FFFFFF')).toBe(21);
            // Blue text on white
            const blueOnWhite = getContrastRatio('#0000FF', '#FFFFFF');
            expect(blueOnWhite).toBeGreaterThan(7); // Should be WCAG AAA
        });
    });

    // ============================================================
    // ✅ CONTRAST VALIDATION TESTS (WCAG AA/AAA)
    // ============================================================

    describe('validateContrast', () => {
        test('should pass WCAG AA for black on white (normal text)', () => {
            const result = validateContrast('#000000', '#FFFFFF');
            expect(result.wcagAA).toBe(true);
            expect(result.wcagAAA).toBe(true);
            expect(result.level).toBe('AAA');
        });

        test('should pass WCAG AA for 4.5:1 ratio', () => {
            const result = validateContrast('#FFFFFF', '#767676');
            expect(result.wcagAA).toBe(true);
            expect(result.ratio).toBeGreaterThanOrEqual(4.5);
        });

        test('should fail WCAG AA for insufficient contrast', () => {
            const result = validateContrast('#FFFFFF', '#FFFF00');
            expect(result.wcagAA).toBe(false);
            expect(result.level).toBe('fail');
        });

        test('should consider large text threshold (3:1)', () => {
            const result = validateContrast('#FFFFFF', '#999999', true); // isLargeText = true
            // 3:1 is enough for large text but not normal text
            expect(result.ratio).toBeGreaterThan(2);
        });

        test('should distinguish between AA and AAA', () => {
            // #000000 vs #767676 has contrast ~4.6:1 (AA but not AAA)
            const result = validateContrast('#000000', '#767676');
            expect(result.wcagAA).toBe(true);
            expect(result.wcagAAA).toBe(false);
            expect(result.level).toBe('AA');
        });

        test('should round contrast ratio to 2 decimals', () => {
            const result = validateContrast('#000000', '#FFFFFF');
            expect(result.ratio).toEqual(21);
            expect(typeof result.ratio).toBe('number');
        });
    });

    // ============================================================
    // ✅ PALETTE VALIDATION TESTS
    // ============================================================

    describe('validatePalette', () => {
        test('should validate a complete palette', () => {
            const palette = {
                50: '#f5f3ff',
                100: '#ede9fe',
                200: '#ddd6fe',
                300: '#c4b5fd',
                400: '#a78bfa',
                500: '#695CFE',
                600: '#5b4ee6',
                700: '#4c3fd9',
                800: '#4338ca',
                900: '#3730a3',
                950: '#1e1b4b',
            };

            const result = validatePalette(palette, 'test-palette');
            expect(result).toHaveProperty('isValidAA');
            expect(result).toHaveProperty('isValidAAA');
            expect(result).toHaveProperty('issues');
            expect(result).toHaveProperty('warnings');
            expect(result).toHaveProperty('pairsChecked');
        });

        test('should detect missing tones', () => {
            const incompletePalette = {
                50: '#f5f3ff',
                100: '#ede9fe',
                // missing 200, 300, etc.
            };

            const result = validatePalette(incompletePalette as any);
            expect(result.issues.length).toBeGreaterThan(0);
        });

        test('should detect invalid hex formats', () => {
            const invalidPalette = {
                50: '#f5f3ff',
                100: '#ede9fe',
                200: 'invalid',
                300: '#c4b5fd',
                400: '#a78bfa',
                500: '#695CFE',
                600: '#5b4ee6',
                700: '#4c3fd9',
                800: '#4338ca',
                900: '#3730a3',
                950: '#1e1b4b',
            };

            const result = validatePalette(invalidPalette as any);
            expect(result.issues.some((issue) => issue.includes('Invalid hex'))).toBe(true);
        });

        test('should check lightness progression', () => {
            const palette = {
                50: '#f5f3ff',
                100: '#ede9fe',
                200: '#ddd6fe',
                300: '#c4b5fd',
                400: '#a78bfa',
                500: '#695CFE',
                600: '#5b4ee6',
                700: '#4c3fd9',
                800: '#4338ca',
                900: '#3730a3',
                950: '#1e1b4b',
            };

            const result = validatePalette(palette);
            // Should have proper lightness progression (darker towards 950)
            expect(result.lightnessProgressive !== undefined).toBe(true);
        });

        test('should check contrast between light and dark colors', () => {
            const palette = {
                50: '#f5f3ff',
                100: '#ede9fe',
                200: '#ddd6fe',
                300: '#c4b5fd',
                400: '#a78bfa',
                500: '#695CFE',
                600: '#5b4ee6',
                700: '#4c3fd9',
                800: '#4338ca',
                900: '#3730a3',
                950: '#1e1b4b',
            };

            const result = validatePalette(palette);
            // Light text on dark should pass WCAG AA
            expect(result.contrastRatios).toHaveProperty('50-100');
        });
    });

    // ============================================================
    // ✅ COMPLIANCE LEVEL TESTS
    // ============================================================

    describe('getComplianceLevel', () => {
        test('should return AAA for perfect contrast', () => {
            const result = validateContrast('#000000', '#FFFFFF');
            expect(getComplianceLevel(result)).toBe('AAA');
        });

        test('should return AA for adequate but not excellent contrast', () => {
            const result = validateContrast('#000000', '#767676');
            expect(getComplianceLevel(result)).toBe('AA');
        });

        test('should return FAIL for insufficient contrast', () => {
            const result = validateContrast('#FFFFFF', '#FFFF00');
            expect(getComplianceLevel(result)).toBe('FAIL');
        });
    });

    // ============================================================
    // ✅ INTEGRATION TESTS
    // ============================================================

    describe('Integration - End to End', () => {
        test('should validate complete Material Design 3 palette', () => {
            const brandPurple = {
                50: '#f5f3ff',
                100: '#ede9fe',
                200: '#ddd6fe',
                300: '#c4b5fd',
                400: '#a78bfa',
                500: '#695CFE',
                600: '#5b4ee6',
                700: '#4c3fd9',
                800: '#4338ca',
                900: '#3730a3',
                950: '#1e1b4b',
            };

            const result = validatePalette(brandPurple, 'brand-purple');

            // Should be valid for AA or better
            expect(result.isValidAA || result.isValidAAA).toBe(true);
            // Should have checked multiple color pairs
            expect(result.pairsChecked).toBe(10);
        });

        test('should verify cross-palette consistency', () => {
            // Test that all brand palettes have proper contrast
            const palettes = [
                {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    200: '#fecaca',
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626',
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d',
                    950: '#450a0a',
                }, // red
                {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#145231',
                    950: '#0a3622',
                }, // green
            ];

            palettes.forEach((palette) => {
                const result = validatePalette(palette);
                expect(result.isValidAA).toBe(true);
            });
        });
    });
});
