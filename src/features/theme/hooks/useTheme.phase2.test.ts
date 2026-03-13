import { act, renderHook } from '@testing-library/react';
import { palettes, BrandTheme } from '@/constants/palettes';
import { useTheme } from './useTheme';

export const allThemes = ['light', 'dark', ...Object.keys(palettes)] as const;

describe('Theme Validation - Phase 2', () => {
  describe('Semantic tokens', () => {
    it('returns valid semantic tokens for all themes', () => {
      allThemes.forEach((theme) => {
        const { result } = renderHook(() => useTheme());

        act(() => {
          result.current.changeTheme(theme as any);
        });

        const tokens = result.current.getSemanticTokens();
        expect(tokens).not.toBeNull();
        expect(tokens?.success).toMatch(/^#[0-9A-F]{6}$/i);
        expect(tokens?.error).toMatch(/^#[0-9A-F]{6}$/i);
        expect(tokens?.warning).toMatch(/^#[0-9A-F]{6}$/i);
        expect(tokens?.info).toMatch(/^#[0-9A-F]{6}$/i);
        expect(tokens?.disabled).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('Theme switching', () => {
    it('switches between all themes successfully', () => {
      const { result } = renderHook(() => useTheme());

      allThemes.forEach((theme) => {
        act(() => {
          result.current.changeTheme(theme as any);
        });

        expect(result.current.theme).toBe(theme);
      });
    });

    it('syncs data-theme attribute when theme changes', () => {
      const { result } = renderHook(() => useTheme());

      allThemes.forEach((theme) => {
        act(() => {
          result.current.changeTheme(theme as any);
        });

        expect(document.documentElement.getAttribute('data-theme')).toBe(theme);
        expect(document.body.getAttribute('data-theme')).toBe(theme);
      });
    });
  });

  describe('Color values', () => {
    it('uses expected semantic colors in light and dark mode', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.changeTheme('light');
      });
      expect(result.current.getSemanticTokens()?.success).toBe('#22c55e');

      act(() => {
        result.current.changeTheme('dark');
      });
      expect(result.current.getSemanticTokens()?.success).toBe('#4ade80');
    });

    it('keeps semantic token shape for all brand themes', () => {
      const brandThemes = Object.keys(palettes) as BrandTheme[];

      brandThemes.forEach((theme) => {
        const { result } = renderHook(() => useTheme());

        act(() => {
          result.current.changeTheme(theme);
        });

        const tokens = result.current.getSemanticTokens();
        expect(tokens).toHaveProperty('success');
        expect(tokens).toHaveProperty('error');
        expect(tokens).toHaveProperty('warning');
        expect(tokens).toHaveProperty('info');
      });
    });
  });

  describe('Persistence and performance', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('persists theme selection to localStorage', () => {
      const { result } = renderHook(() => useTheme());

      // Ensure first iteration is not a no-op on initial light theme.
      act(() => {
        result.current.changeTheme('dark');
      });

      allThemes.forEach((theme) => {
        act(() => {
          result.current.changeTheme(theme as any);
        });

        expect(localStorage.getItem('theme')).toBe(theme);
      });
    });

    it('changes themes within budget in test environment', () => {
      const { result } = renderHook(() => useTheme());

      allThemes.forEach((theme) => {
        const start = performance.now();

        act(() => {
          result.current.changeTheme(theme as any);
        });

        expect(performance.now() - start).toBeLessThan(100);
      });
    });
  });
});
