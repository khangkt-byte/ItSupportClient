import { act, renderHook } from '@testing-library/react';
import { Theme, useTheme } from './useTheme';

describe('useTheme hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    jest.useFakeTimers();
    document.documentElement.className = '';
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.setAttribute('data-theme', 'light');
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('initializes with light theme by default', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
    expect(result.current.appearance).toBe('auto');
    expect(result.current.brandColor).toBe('default');
  });

  it('restores legacy theme from localStorage', () => {
    localStorage.setItem('theme', 'brand-purple');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('brand-purple');
    expect(result.current.brandColor).toBe('brand-purple');
  });

  it('changes theme and updates DOM + storage', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.changeTheme('brand-red');
    });

    expect(result.current.theme).toBe('brand-red');
    expect(document.documentElement.getAttribute('data-theme')).toBe('brand-red');
    expect(document.body.getAttribute('data-theme')).toBe('brand-red');
    expect(localStorage.getItem('theme')).toBe('brand-red');
  });

  it('supports all declared themes', () => {
    const { result } = renderHook(() => useTheme());
    const themes: Theme[] = [
      'light',
      'dark',
      'brand-purple',
      'brand-red',
      'brand-blue',
      'brand-green',
      'brand-orange',
      'brand-teal',
      'brand-indigo',
      'brand-violet',
      'brand-pink',
      'brand-cyan',
    ];

    themes.forEach((theme) => {
      act(() => {
        result.current.changeTheme(theme);
      });
      expect(result.current.theme).toBe(theme);
    });
  });

  it('returns semantic tokens for light and dark themes', () => {
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

  it('returns primary and secondary color for brand theme', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.changeTheme('brand-purple');
    });

    expect(result.current.getPrimaryColor()).toBe('#695CFE');
    expect(result.current.getSecondaryColor()).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('setAppearance persists and resolves theme', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setAppearance('dark');
    });

    expect(result.current.appearance).toBe('dark');
    expect(result.current.theme).toBe('dark');
    expect(localStorage.getItem('appearance')).toBe('dark');
  });

  it('setBrandColor persists and resolves theme', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setBrandColor('brand-blue');
    });

    expect(result.current.brandColor).toBe('brand-blue');
    expect(result.current.theme).toBe('brand-blue');
    expect(localStorage.getItem('brandColor')).toBe('brand-blue');
  });

  it('handles invalid theme safely', () => {
    const { result } = renderHook(() => useTheme());
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    act(() => {
      result.current.changeTheme('invalid-theme' as Theme);
    });

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('resets to defaults and clears persisted keys', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setAppearance('dark');
      result.current.setBrandColor('brand-pink');
    });

    act(() => {
      result.current.resetToDefaults();
    });

    expect(result.current.appearance).toBe('auto');
    expect(result.current.brandColor).toBe('default');
    expect(localStorage.getItem('appearance')).toBeNull();
    expect(localStorage.getItem('brandColor')).toBeNull();
    expect(localStorage.getItem('theme')).toBeNull();
  });
});
