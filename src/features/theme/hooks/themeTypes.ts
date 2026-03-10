import type { BrandTheme } from '@/constants/palettes';
import type { SemanticTokens } from '@/constants/palettes';

// Appearance choice independent of brand color.
export type Appearance = 'light' | 'dark' | 'auto';

// Brand color can be applied on top of any appearance.
export type BrandColorTheme = 'default' | BrandTheme;

// Legacy combined theme shape kept for compatibility.
export type Theme = 'light' | 'dark' | BrandTheme;

export type AccessibilityMode = 'default' | 'highContrast';

export interface UseThemeReturn {
    appearance: Appearance;
    brandColor: BrandColorTheme;
    theme: Theme;
    resolvedAppearance: 'light' | 'dark';
    accessibilityMode: AccessibilityMode;
    prefersReducedMotion: boolean;
    setAppearance: (appearance: Appearance) => void;
    setBrandColor: (brandColor: BrandColorTheme) => void;
    changeTheme: (theme: Theme) => void;
    setAccessibilityMode: (mode: AccessibilityMode) => void;
    getSemanticTokens: () => SemanticTokens | null;
    getPrimaryColor: () => string | null;
    getSecondaryColor: () => string | null;
    resetToDefaults: () => void;
}
