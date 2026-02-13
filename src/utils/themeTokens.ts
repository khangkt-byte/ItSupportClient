/**
 * Theme Token Generator Utilities
 * 
 * Generates CSS variables from TypeScript design tokens at runtime.
 * Follows industry best practices from:
 * - Ant Design (Alibaba): Runtime token injection
 * - Material Design 3 (Google): Token-based theming
 * - Fluent 2 (Microsoft): Design tokens as SSOT
 * 
 * This approach eliminates code duplication and ensures:
 * ✅ Single Source of Truth (palettes.ts)
 * ✅ No manual CSS synchronization needed
 * ✅ Easy to add/modify themes
 * ✅ Type-safe token references
 * 
 * @module themeTokens
 * @see palettes.ts - Central design token definitions
 */

import {
    palettes,
    type BrandTheme,
    type ColorPalette,
    type SemanticTokens,
    defaultSemanticTokens,
    darkSemanticTokens,
    lightSemanticVariants,
    darkSemanticVariants,
    type SemanticVariantTokens,
} from '@/constants/palettes';

/**
 * Global semantic tokens (theme-independent)
 * 
 * Re-exported from palettes.ts for backward compatibility.
 * DO NOT redefine here — palettes.ts is the Single Source of Truth.
 * 
 * @constant
 */
export const GLOBAL_SEMANTIC_TOKENS: SemanticTokens = defaultSemanticTokens;

/**
 * Dark mode semantic tokens
 * Re-exported from palettes.ts for backward compatibility.
 * 
 * @constant
 */
export const DARK_SEMANTIC_TOKENS: SemanticTokens = darkSemanticTokens;

/**
 * Generate CSS custom properties from color palette
 * 
 * Converts TypeScript color palette to CSS variable strings
 * 
 * @param palette - Color palette object with 11 tones (50-950)
 * @param prefix - CSS variable prefix (default: 'color-primary')
 * @returns Record of CSS variable names to hex values
 * 
 * @example
 * const vars = generatePaletteVars(palettes['brand-purple'].primary);
 * // Returns: { '--color-primary-500': '#695CFE', ... }
 */
export function generatePaletteVars(
    palette: ColorPalette,
    prefix: string = 'color-primary'
): Record<string, string> {
    const vars: Record<string, string> = {};

    Object.entries(palette).forEach(([tone, color]) => {
        vars[`--${prefix}-${tone}`] = color;
    });

    return vars;
}

/**
 * Generate CSS custom properties from semantic tokens + variant tokens
 * 
 * Uses hand-picked variant values from palettes.ts instead of computed
 * adjustBrightness() — this matches Tailwind's color scale exactly.
 * 
 * @param tokens - Semantic token object (base colors)
 * @param variants - Semantic variant tokens (foreground, background, border)
 * @returns Record of CSS variable names to values
 * 
 * @example
 * const vars = generateSemanticVars(defaultSemanticTokens, lightSemanticVariants);
 * // Returns: { '--color-success': '#22c55e', '--color-success-foreground': '#166534', ... }
 */
export function generateSemanticVars(
    tokens: SemanticTokens,
    variants: SemanticVariantTokens
): Record<string, string> {
    return {
        '--color-success': tokens.success,
        '--color-success-foreground': variants.successForeground,
        '--color-success-background': variants.successBackground,
        '--color-success-border': variants.successBorder,

        '--color-error': tokens.error,
        '--color-error-foreground': variants.errorForeground,
        '--color-error-background': variants.errorBackground,
        '--color-error-border': variants.errorBorder,

        '--color-warning': tokens.warning,
        '--color-warning-foreground': variants.warningForeground,
        '--color-warning-background': variants.warningBackground,
        '--color-warning-border': variants.warningBorder,

        '--color-info': tokens.info,
        '--color-info-foreground': variants.infoForeground,
        '--color-info-background': variants.infoBackground,
        '--color-info-border': variants.infoBorder,

        '--color-disabled': tokens.disabled,
    };
}

/**
 * Apply CSS variables to document root
 * 
 * Updates document.documentElement.style with CSS custom properties
 * This is the runtime approach used by Ant Design
 * 
 * @param vars - Record of CSS variable names to values
 * 
 * @example
 * const vars = generatePaletteVars(palettes['brand-purple'].primary);
 * applyCSSVars(vars);
 * // Now all --color-primary-* variables are available globally
 */
export function applyCSSVars(vars: Record<string, string>): void {
    const root = document.documentElement;

    Object.entries(vars).forEach(([name, value]) => {
        root.style.setProperty(name, value);
    });
}

/**
 * Generate and apply all theme CSS variables
 * 
 * Main function to apply a complete theme to the document
 * Combines primary palette and semantic tokens
 * 
 * @param themeName - Theme identifier ('light', 'dark', or brand theme)
 * 
 * @example
 * applyThemeTokens('brand-purple');
 * // Applies all purple theme CSS variables + semantic tokens
 * 
 * @example
 * applyThemeTokens('dark');
 * // Applies dark mode semantic tokens only
 */
/**
 * Apply theme tokens with combinatorial appearance + brand support
 * 
 * @param themeName - Legacy theme name (for backwards compatibility)
 * @param appearance - Appearance setting ('light' | 'dark')
 * @param brand - Brand color theme
 */
export function applyThemeTokens(
    themeName: 'light' | 'dark' | BrandTheme,
    appearance?: 'light' | 'dark',
    brand?: 'default' | BrandTheme
): void {
    let allVars: Record<string, string> = {};

    // NEW: Use appearance parameter if provided (combinatorial mode)
    // Otherwise fall back to legacy themeName detection
    const isDark = appearance === 'dark' || (appearance === undefined && (themeName === 'dark' || themeName.includes('dark')));

    // Apply semantic tokens based on appearance
    if (isDark) {
        allVars = {
            ...allVars,
            ...generateSemanticVars(DARK_SEMANTIC_TOKENS, darkSemanticVariants),
        };
    } else {
        allVars = {
            ...allVars,
            ...generateSemanticVars(GLOBAL_SEMANTIC_TOKENS, lightSemanticVariants),
        };
    }

    // NEW: Apply brand palette if brand is provided and not 'default'
    // Otherwise fall back to legacy themeName detection
    const brandToApply = brand && brand !== 'default'
        ? brand
        : (themeName !== 'light' && themeName !== 'dark' ? themeName : null);

    if (brandToApply) {
        const palette = palettes[brandToApply as BrandTheme];

        if (palette) {
            // Primary palette
            allVars = {
                ...allVars,
                ...generatePaletteVars(palette.primary, 'color-primary'),
            };

            // Secondary palette if exists
            if (palette.secondary) {
                allVars = {
                    ...allVars,
                    ...generatePaletteVars(palette.secondary, 'color-secondary'),
                };
            }

            // Neutral palette
            allVars = {
                ...allVars,
                ...generatePaletteVars(palette.neutral, 'color-neutral'),
            };

            // Override semantic tokens if theme has custom ones
            if (palette.semantic) {
                // Use correct semantic variants based on appearance (light/dark)
                const semanticVariants = isDark ? darkSemanticVariants : lightSemanticVariants;
                allVars = {
                    ...allVars,
                    ...generateSemanticVars(palette.semantic, semanticVariants),
                };
            }
        }
    } else {
        // When brand is 'default', clear brand palette variables
        // This allows CSS fallback values to work in sidebar
        const root = document.documentElement;
        const tones = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

        // Clear primary palette
        tones.forEach(tone => {
            root.style.removeProperty(`--color-primary-${tone}`);
        });

        // Clear secondary palette
        tones.forEach(tone => {
            root.style.removeProperty(`--color-secondary-${tone}`);
        });

        // Clear neutral palette  
        tones.forEach(tone => {
            root.style.removeProperty(`--color-neutral-${tone}`);
        });
    }

    // Apply all variables at once
    applyCSSVars(allVars);
}

/**
 * Remove all theme CSS variables
 * 
 * Cleanup function to remove all dynamically applied CSS variables
 * Useful when switching themes or resetting to default
 */
export function clearThemeTokens(): void {
    const root = document.documentElement;
    const style = root.style;

    // Get all custom properties
    for (let i = style.length - 1; i >= 0; i--) {
        const prop = style[i];
        if (prop.startsWith('--color-')) {
            root.style.removeProperty(prop);
        }
    }
}

/**
 * Get all available theme names
 * 
 * Returns array of all theme identifiers including base and brand themes
 * 
 * @returns Array of theme names
 */
export function getAllThemeNames(): Array<'light' | 'dark' | BrandTheme> {
    return ['light', 'dark', ...Object.keys(palettes)] as Array<'light' | 'dark' | BrandTheme>;
}

/**
 * Validate theme name
 * 
 * Check if a theme name is valid
 * 
 * @param themeName - Theme identifier to validate
 * @returns Whether theme exists
 */
export function isValidTheme(themeName: string): boolean {
    return getAllThemeNames().includes(themeName as any);
}

/**
 * Get theme metadata
 * 
 * Returns information about a theme including its palette
 * 
 * @param themeName - Theme identifier
 * @returns Theme metadata or null if not found
 */
export function getThemeMetadata(themeName: 'light' | 'dark' | BrandTheme | string) {
    if (themeName === 'light') {
        return {
            name: 'Light',
            category: 'base' as const,
            semantic: GLOBAL_SEMANTIC_TOKENS,
        };
    }

    if (themeName === 'dark') {
        return {
            name: 'Dark',
            category: 'base' as const,
            semantic: DARK_SEMANTIC_TOKENS,
        };
    }

    const palette = palettes[themeName as BrandTheme];
    if (palette) {
        return {
            name: themeName,
            category: 'brand' as const,
            palette,
        };
    }

    return null;
}
