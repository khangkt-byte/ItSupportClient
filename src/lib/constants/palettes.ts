/**
 * Color Palettes Definition
 * Each palette contains:
 * - Primary (chủ đạo): 50-950 tones
 * - Secondary (phụ): optional accent color
 * - Neutral (trung tính): gray tones consistent across all themes
 * 
 * Based on Tailwind Color System
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

export interface ThemePalette {
    primary: ColorPalette;
    secondary?: ColorPalette;
    neutral: ColorPalette;
}

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
    } as ThemePalette,
};

// Theme export for use
export type BrandTheme = keyof typeof palettes;
