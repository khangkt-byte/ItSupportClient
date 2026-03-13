/**
 * Color Palettes Definition
 *
 * Implements Material Design 3 color system per:
 * https://m3.material.io/styles/color/the-color-system/color-roles
 *
 * Each palette contains:
 * - Primary (chủ đạo): 50-950 tones for main UI elements
 * - Secondary (phụ): optional accent color for secondary elements
 * - Neutral (trung tính): gray tones consistent across all themes
 * - Semantic tokens: Named colors for success, error, warning, info, disabled
 *
 * All colors follow Material Design 3 11-tone color scale.
 * Contrast ratios validated against WCAG 2.1 Level AA standards.
 *
 * @reference
 * - Material Design 3: https://m3.material.io/
 * - Tailwind Color System: https://tailwindcss.com/docs/customizing-colors
 * - WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
 */

/**
 * Color palette with 11-tone scale (50-950)
 *
 * Tone progression:
 * - 50: Lightest (for hover states, light backgrounds)
 * - 100-200: Light shades
 * - 300-400: Medium-light shades
 * - 500-600: Primary mid-range (most readable for text)
 * - 700-800: Dark shades
 * - 900-950: Darkest (for text on light backgrounds)
 *
 * @interface ColorPalette
 */
export interface ColorPalette {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
}

/**
 * Semantic color tokens
 *
 * Named colors for common UI states and purposes.
 * These provide semantic meaning independent of specific hues.
 *
 * @interface SemanticTokens
 * @reference
 * - Semantic tokens pattern: https://design-tokens.github.io/community-group/format/
 * - WCAG Success colors: https://www.w3.org/WAI/WCAG21/Understanding/status-messages
 */
export interface SemanticTokens {
    /** Success state: positive actions, confirmations (green) */
    success: string;
    /** Error state: destructive actions, failures (red) */
    error: string;
    /** Warning state: caution, alerts (orange) */
    warning: string;
    /** Info state: information, neutral messages (blue) */
    info: string;
    /** Disabled state: inactive, disabled elements (gray) */
    disabled: string;
}

/**
 * Semantic variant tokens for foreground, background, and border colors
 *
 * These provide the extended semantic color system for UI states.
 * Light/dark mode each have a dedicated set of variants from Tailwind's color scale.
 *
 * @interface SemanticVariantTokens
 * @reference
 * - Material Design 3 Color Roles: https://m3.material.io/styles/color/roles
 * - Fluent 2 Design Tokens: https://fluent2.microsoft.design/design-tokens
 */
export interface SemanticVariantTokens {
    successForeground: string;
    successBackground: string;
    successBorder: string;
    errorForeground: string;
    errorBackground: string;
    errorBorder: string;
    warningForeground: string;
    warningBackground: string;
    warningBorder: string;
    infoForeground: string;
    infoBackground: string;
    infoBorder: string;
}

/**
 * Complete theme palette
 *
 * @interface ThemePalette
 */
export interface ThemePalette {
    primary: ColorPalette;
    secondary?: ColorPalette;
    neutral: ColorPalette;
    semantic?: SemanticTokens;
}

// ========================================
// SHARED SEMANTIC TOKENS — Single Source of Truth
// All brand themes share these values.
// To change semantic colors globally, edit ONLY these constants.
// ========================================

/**
 * Default (light mode) semantic tokens
 * Used by ALL themes (light, dark, brand-*)
 *
 * @constant
 * @see https://tailwindcss.com/docs/colors (Green-500, Red-500, Amber-500, Blue-500, Gray-500)
 */
export const defaultSemanticTokens: SemanticTokens = {
    success: '#22c55e',    // Green-500 (WCAG AA compliant)
    error: '#ef4444',      // Red-500
    warning: '#f59e0b',    // Amber-500
    info: '#3b82f6',       // Blue-500
    disabled: '#4b5563',   // Gray-600 (WCAG AAA on white surfaces)
};

/**
 * Dark mode semantic tokens
 * Lighter variants (400-shade) for better contrast on dark backgrounds
 *
 * @constant
 */
export const darkSemanticTokens: SemanticTokens = {
    success: '#4ade80',    // Green-400
    error: '#f87171',      // Red-400
    warning: '#fbbf24',    // Amber-400
    info: '#60a5fa',       // Blue-400
    disabled: '#a0a8b5',   // Custom cool gray (WCAG AAA on --color-background)
};

/**
 * Light mode semantic variant tokens
 * Hand-picked from Tailwind color scale for optimal contrast.
 *
 * - foreground: 800-shade (dark) for text on light backgrounds
 * - background: 50-shade for subtle tinted backgrounds
 * - border: 200-shade for borders
 *
 * @constant
 */
export const lightSemanticVariants: SemanticVariantTokens = {
    successForeground: '#166534',   // green-800
    successBackground: '#f0fdf4',   // green-50
    successBorder: '#bbf7d0',       // green-200
    errorForeground: '#991b1b',     // red-800
    errorBackground: '#fef2f2',     // red-50
    errorBorder: '#fecaca',         // red-200
    warningForeground: '#92400e',   // amber-800
    warningBackground: '#fffbeb',   // amber-50
    warningBorder: '#fde68a',       // amber-200
    infoForeground: '#1e40af',      // blue-800
    infoBackground: '#eff6ff',      // blue-50
    infoBorder: '#bfdbfe',          // blue-200
};

/**
 * Dark mode semantic variant tokens
 * Uses 200-shade for foreground (light text on dark),
 * and semi-transparent base colors for background/border.
 *
 * @constant
 */
export const darkSemanticVariants: SemanticVariantTokens = {
    successForeground: '#bbf7d0',                   // green-200
    successBackground: 'rgba(34, 197, 94, 0.2)',    // green-500 @ 20%
    successBorder: 'rgba(34, 197, 94, 0.3)',        // green-500 @ 30%
    errorForeground: '#fecaca',                     // red-200
    errorBackground: 'rgba(239, 68, 68, 0.2)',      // red-500 @ 20%
    errorBorder: 'rgba(239, 68, 68, 0.3)',          // red-500 @ 30%
    warningForeground: '#fde68a',                   // amber-200
    warningBackground: 'rgba(245, 158, 11, 0.2)',   // amber-500 @ 20%
    warningBorder: 'rgba(245, 158, 11, 0.3)',       // amber-500 @ 30%
    infoForeground: '#bfdbfe',                      // blue-200
    infoBackground: 'rgba(59, 130, 246, 0.2)',      // blue-500 @ 20%
    infoBorder: 'rgba(59, 130, 246, 0.3)',          // blue-500 @ 30%
};

// Neutral Gray - Used across all themes
const neutralGray: ColorPalette = {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
};

// Brand Palettes
export const palettes = {
    // Default/Purple (Existing primary)
    'brand-purple': {
        primary: {
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
        },
        secondary: {
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
        },
        neutral: neutralGray,
        semantic: defaultSemanticTokens,
    } as ThemePalette,

    // Red
    'brand-red': {
        primary: {
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
        },
        secondary: {
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f8b4d8',
            400: '#f472b6',
            500: '#ec4899',
            600: '#db2777',
            700: '#be185d',
            800: '#9d174d',
            900: '#831843',
            950: '#500724',
        },
        neutral: neutralGray,
        semantic: defaultSemanticTokens,
    } as ThemePalette,

    // Blue
    'brand-blue': {
        primary: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554',
        },
        secondary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#06b6d4',
            600: '#0891b2',
            700: '#0e7490',
            800: '#155e75',
            900: '#164e63',
            950: '#082f49',
        },
        neutral: neutralGray,
        semantic: defaultSemanticTokens,
    } as ThemePalette,

    // Green
    'brand-green': {
        primary: {
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
        },
        secondary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#06b6d4',
            600: '#0891b2',
            700: '#0e7490',
            800: '#155e75',
            900: '#164e63',
            950: '#082f49',
        },
        neutral: neutralGray,
        semantic: defaultSemanticTokens,
    } as ThemePalette,

    // Orange
    'brand-orange': {
        primary: {
            50: '#fff7ed',
            100: '#fed7aa',
            200: '#fdba74',
            300: '#fb923c',
            400: '#f97316',
            500: '#ea580c',
            600: '#c2410c',
            700: '#9a3412',
            800: '#7c2d12',
            900: '#431407',
            950: '#2c0f04',
        },
        secondary: {
            50: '#fef2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f8b4d8',
            400: '#f472b6',
            500: '#ec4899',
            600: '#db2777',
            700: '#be185d',
            800: '#9d174d',
            900: '#831843',
            950: '#500724',
        },
        neutral: neutralGray,
        semantic: defaultSemanticTokens,
    } as ThemePalette,

    // Teal
    'brand-teal': {
        primary: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
            950: '#0d3331',
        },
        secondary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#06b6d4',
            600: '#0891b2',
            700: '#0e7490',
            800: '#155e75',
            900: '#164e63',
            950: '#082f49',
        },
        neutral: neutralGray,
        semantic: defaultSemanticTokens,
    } as ThemePalette,

    // Indigo
    'brand-indigo': {
        primary: {
            50: '#eef2ff',
            100: '#e0e7ff',
            200: '#c7d2fe',
            300: '#a5b4fc',
            400: '#818cf8',
            500: '#6366f1',
            600: '#4f46e5',
            700: '#4338ca',
            800: '#3730a3',
            900: '#312e81',
            950: '#1e1b4b',
        },
        secondary: {
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f8b4d8',
            400: '#f472b6',
            500: '#ec4899',
            600: '#db2777',
            700: '#be185d',
            800: '#9d174d',
            900: '#831843',
            950: '#500724',
        },
        neutral: neutralGray,
        semantic: defaultSemanticTokens,
    } as ThemePalette,

    // Violet
    'brand-violet': {
        primary: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#a855f7',
            600: '#9333ea',
            700: '#7e22ce',
            800: '#6b21a8',
            900: '#581c87',
            950: '#3f0f5c',
        },
        secondary: {
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
        },
        neutral: neutralGray,
        semantic: defaultSemanticTokens,
    } as ThemePalette,

    // Pink
    'brand-pink': {
        primary: {
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f8b4d8',
            400: '#f472b6',
            500: '#ec4899',
            600: '#db2777',
            700: '#be185d',
            800: '#9d174d',
            900: '#831843',
            950: '#500724',
        },
        secondary: {
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
        },
        neutral: neutralGray,
        semantic: defaultSemanticTokens,
    } as ThemePalette,

    // Cyan
    'brand-cyan': {
        primary: {
            50: '#ecf8ff',
            100: '#d9f0ff',
            200: '#b3e0ff',
            300: '#7ecbff',
            400: '#4ca8ff',
            500: '#1e88ff',
            600: '#1565c0',
            700: '#0d47a1',
            800: '#09369e',
            900: '#07287f',
            950: '#051957',
        },
        secondary: {
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
        },
        neutral: neutralGray,
        semantic: defaultSemanticTokens,
    } as ThemePalette,
};

// Theme export for use
export type BrandTheme = keyof typeof palettes;
