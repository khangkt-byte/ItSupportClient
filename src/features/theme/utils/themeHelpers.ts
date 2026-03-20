import { BrandTheme, palettes } from '@/constants/palettes';
import type { Appearance, BrandColorTheme, Theme } from './themeTypes';

export const resolveSystemAppearance = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const getActualAppearance = (
    appearance: Appearance,
    resolvedAppearance: 'light' | 'dark'
): 'light' | 'dark' => {
    return appearance === 'auto' ? resolvedAppearance : appearance;
};

export const getAllAvailableThemes = (): Theme[] => {
    return ['light', 'dark', ...(Object.keys(palettes) as BrandTheme[])];
};

export const getAllBrandColors = (): BrandColorTheme[] => {
    return ['default', ...(Object.keys(palettes) as BrandTheme[])];
};

export const isValidTheme = (value: string): value is Theme => {
    return getAllAvailableThemes().includes(value as Theme);
};

export const isValidBrandColor = (value: string): value is BrandColorTheme => {
    return getAllBrandColors().includes(value as BrandColorTheme);
};
