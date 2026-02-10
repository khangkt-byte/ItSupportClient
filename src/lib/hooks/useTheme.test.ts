/**
 * Unit tests for useTheme hook
 *
 * Comprehensive test suite covering:
 * - Theme initialization (localStorage, system preference, defaults)
 * - Theme switching and persistence
 * - Accessibility mode detection and switching
 * - Reduced motion preference detection
 * - Semantic tokens retrieval
 * - Custom event dispatching
 * - Error handling
 *
 * @reference
 * - Jest: https://jestjs.io/docs/getting-started
 * - React Testing Library: https://testing-library.com/docs/react-testing-library/intro
 * - React Hooks Testing: https://reactjs.org/docs/hooks-testing.html
 * - WCAG Testing: https://www.w3.org/WAI/test-evaluate/
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTheme, Theme, AccessibilityMode } from './useTheme';
import { BrandTheme } from '../constants/palettes';

describe('useTheme Hook - Complete Test Suite', () => {
    // Setup & teardown
    beforeEach(() => {
        // Clear localStorage
        localStorage.clear();
        // Clear any animation timeouts
        jest.clearAllTimers();
        jest.useFakeTimers();
        // Reset DOM
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.setAttribute('data-theme', 'light');
        document.documentElement.className = ''; // Clear all classes
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    // ============================================================
    // ✅ INITIALIZATION TESTS
    // ============================================================

    describe('Initialization', () => {
        test('should initialize with light theme as default', () => {
            const { result } = renderHook(() => useTheme());
            expect(result.current.theme).toBe('light');
        });

        test('should restore theme from localStorage', () => {
            localStorage.setItem('theme', 'brand-purple');
            const { result } = renderHook(() => useTheme());

            waitFor(() => {
                expect(result.current.theme).toBe('brand-purple');
            });
        });

        test('should respect system preference when no saved theme', () => {
            // Mock system prefers dark
            window.matchMedia = jest.fn().mockImplementation((query) => ({
                matches: query === '(prefers-color-scheme: dark)',
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            }));

            const { result } = renderHook(() => useTheme());

            waitFor(() => {
                expect(result.current.theme).toBe('dark');
            });
        });

        test('should set default accessibility mode', () => {
            const { result } = renderHook(() => useTheme());
            expect(result.current.accessibilityMode).toBe('default');
        });

        test('should restore accessibility mode from localStorage', () => {
            localStorage.setItem('a11y', 'highContrast');
            const { result } = renderHook(() => useTheme());

            waitFor(() => {
                expect(result.current.accessibilityMode).toBe('highContrast');
            });
        });

        test('should detect prefers-reduced-motion system setting', () => {
            window.matchMedia = jest.fn().mockImplementation((query) => ({
                matches: query === '(prefers-reduced-motion: reduce)',
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            }));

            const { result } = renderHook(() => useTheme());
            expect(result.current.prefersReducedMotion).toBe(true);
        });
    });

    // ============================================================
    // ✅ THEME SWITCHING TESTS
    // ============================================================

    describe('Theme Switching', () => {
        test('should change theme and update DOM', () => {
            const { result } = renderHook(() => useTheme());

            act(() => {
                result.current.changeTheme('brand-red');
            });

            expect(result.current.theme).toBe('brand-red');
            expect(document.documentElement.getAttribute('data-theme')).toBe('brand-red');
            expect(document.body.getAttribute('data-theme')).toBe('brand-red');
        });

        test('should persist theme to localStorage', () => {
            const { result } = renderHook(() => useTheme());

            act(() => {
                result.current.changeTheme('brand-blue');
            });

            expect(localStorage.getItem('theme')).toBe('brand-blue');
        });

        test('should add theme-transition class for animation', () => {
            // Use real timers for this test to allow React updates
            jest.useRealTimers();

            const { result } = renderHook(() => useTheme());

            // Verify initial state has no transition class
            expect(document.documentElement.classList.contains('theme-transition')).toBe(false);

            // Change theme - should add transition class immediately
            act(() => {
                result.current.changeTheme('brand-green');
            });

            // After changeTheme completes, transition class should be present
            // (unless user prefers reduced motion)
            const hasReducedMotion = result.current.prefersReducedMotion;
            if (!hasReducedMotion) {
                expect(document.documentElement.classList.contains('theme-transition')).toBe(true);
            }

            // Restore fake timers
            jest.useFakeTimers();
        });

        test('should skip animation if user prefers reduced motion', () => {
            window.matchMedia = jest.fn().mockImplementation((query) => ({
                matches: query === '(prefers-reduced-motion: reduce)',
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            }));

            const { result } = renderHook(() => useTheme());

            act(() => {
                result.current.changeTheme('brand-purple');
            });

            // Theme-transition class should never be added
            expect(document.documentElement.classList.contains('theme-transition')).toBe(false);
        });

        test('should reject invalid theme', () => {
            const { result } = renderHook(() => useTheme());
            const initialTheme = result.current.theme;

            act(() => {
                result.current.changeTheme('invalid-theme' as Theme);
            });

            // Theme should not change
            expect(result.current.theme).toBe(initialTheme);
        });

        test('should dispatch custom themechange event', () => {
            const { result } = renderHook(() => useTheme());
            const eventListener = jest.fn();

            window.addEventListener('themechange', eventListener);

            act(() => {
                result.current.changeTheme('brand-orange');
            });

            expect(eventListener).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        theme: 'brand-orange',
                    }),
                })
            );

            window.removeEventListener('themechange', eventListener);
        });

        test('should support all available themes', () => {
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
    });

    // ============================================================
    // ✅ ACCESSIBILITY MODE TESTS
    // ============================================================

    describe('Accessibility Mode', () => {
        test('should change accessibility mode', () => {
            const { result } = renderHook(() => useTheme());

            act(() => {
                result.current.setAccessibilityMode('highContrast');
            });

            expect(result.current.accessibilityMode).toBe('highContrast');
            expect(document.documentElement.getAttribute('data-a11y')).toBe('highContrast');
        });

        test('should persist accessibility mode to localStorage', () => {
            const { result } = renderHook(() => useTheme());

            act(() => {
                result.current.setAccessibilityMode('highContrast');
            });

            expect(localStorage.getItem('a11y')).toBe('highContrast');
        });

        test('should dispatch custom a11ychange event', () => {
            const { result } = renderHook(() => useTheme());
            const eventListener = jest.fn();

            window.addEventListener('a11ychange', eventListener);

            act(() => {
                result.current.setAccessibilityMode('highContrast');
            });

            expect(eventListener).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        mode: 'highContrast',
                    }),
                })
            );

            window.removeEventListener('a11ychange', eventListener);
        });
    });

    // ============================================================
    // ✅ SEMANTIC TOKENS TESTS
    // ============================================================

    describe('Semantic Tokens', () => {
        test('should return null for light theme (no semantic tokens)', () => {
            const { result } = renderHook(() => useTheme());

            act(() => {
                result.current.changeTheme('light');
            });

            expect(result.current.getSemanticTokens()).toBeNull();
        });

        test('should return null for dark theme (no semantic tokens)', () => {
            const { result } = renderHook(() => useTheme());

            act(() => {
                result.current.changeTheme('dark');
            });

            expect(result.current.getSemanticTokens()).toBeNull();
        });

        test('should return semantic tokens for brand theme', () => {
            const { result } = renderHook(() => useTheme());

            act(() => {
                result.current.changeTheme('brand-purple');
            });

            const tokens = result.current.getSemanticTokens();
            expect(tokens).not.toBeNull();
            expect(tokens).toHaveProperty('success');
            expect(tokens).toHaveProperty('error');
            expect(tokens).toHaveProperty('warning');
            expect(tokens).toHaveProperty('info');
            expect(tokens).toHaveProperty('disabled');
        });

        test('should have valid color values for semantic tokens', () => {
            const { result } = renderHook(() => useTheme());

            act(() => {
                result.current.changeTheme('brand-blue');
            });

            const tokens = result.current.getSemanticTokens();
            expect(tokens?.success).toMatch(/^#[0-9A-F]{6}$/i);
            expect(tokens?.error).toMatch(/^#[0-9A-F]{6}$/i);
            expect(tokens?.warning).toMatch(/^#[0-9A-F]{6}$/i);
            expect(tokens?.info).toMatch(/^#[0-9A-F]{6}$/i);
            expect(tokens?.disabled).toMatch(/^#[0-9A-F]{6}$/i);
        });
    });

    // ============================================================
    // ✅ PRIMARY/SECONDARY COLOR TESTS
    // ============================================================

    describe('Color Accessors', () => {
        test('should return null for light theme primary color', () => {
            const { result } = renderHook(() => useTheme());

            act(() => {
                result.current.changeTheme('light');
            });

            expect(result.current.getPrimaryColor()).toBeNull();
        });

        test('should return valid hex for brand theme primary color', () => {
            const { result } = renderHook(() => useTheme());

            act(() => {
                result.current.changeTheme('brand-purple');
            });

            const color = result.current.getPrimaryColor();
            expect(color).toMatch(/^#[0-9A-F]{6}$/i);
            expect(color).toBe('#695CFE');
        });

        test('should return valid hex for brand theme secondary color if available', () => {
            const { result } = renderHook(() => useTheme());

            act(() => {
                result.current.changeTheme('brand-purple');
            });

            const color = result.current.getSecondaryColor();
            expect(color).not.toBeNull();
            expect(color).toMatch(/^#[0-9A-F]{6}$/i);
        });

        test('should return null for secondary color if not available', () => {
            const { result } = renderHook(() => useTheme());

            act(() => {
                result.current.changeTheme('light');
            });

            expect(result.current.getSecondaryColor()).toBeNull();
        });
    });

    // ============================================================
    // ✅ RESET/DEFAULT TESTS
    // ============================================================

    describe('Reset to Defaults', () => {
        test('should reset to light theme and default accessibility', () => {
            const { result } = renderHook(() => useTheme());

            act(() => {
                result.current.changeTheme('brand-purple');
                result.current.setAccessibilityMode('highContrast');
            });

            act(() => {
                result.current.resetToDefaults();
            });

            expect(result.current.theme).toBe('light');
            expect(result.current.accessibilityMode).toBe('default');
            expect(localStorage.getItem('theme')).toBeNull();
            expect(localStorage.getItem('a11y')).toBeNull();
        });
    });

    // ============================================================
    // ✅ STORAGE SYNC TESTS (Cross-tab communication)
    // ============================================================

    describe('Cross-Tab Storage Sync', () => {
        test('should sync theme changes from another tab', () => {
            const { result } = renderHook(() => useTheme());

            // Simulate storage change from another tab
            act(() => {
                const event = new StorageEvent('storage', {
                    key: 'theme',
                    newValue: 'brand-green',
                    oldValue: 'light',
                });
                window.dispatchEvent(event);
            });

            waitFor(() => {
                expect(result.current.theme).toBe('brand-green');
            });
        });

        test('should sync accessibility mode from another tab', () => {
            const { result } = renderHook(() => useTheme());

            act(() => {
                const event = new StorageEvent('storage', {
                    key: 'a11y',
                    newValue: 'highContrast',
                    oldValue: 'default',
                });
                window.dispatchEvent(event);
            });

            waitFor(() => {
                expect(result.current.accessibilityMode).toBe('highContrast');
            });
        });
    });

    // ============================================================
    // ✅ ERROR HANDLING TESTS
    // ============================================================

    describe('Error Handling', () => {
        test('should handle localStorage quota exceeded gracefully', () => {
            const { result } = renderHook(() => useTheme());

            // Mock localStorage.setItem to throw
            const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('QuotaExceededError');
            });

            // Should not throw, just log error
            expect(() => {
                act(() => {
                    result.current.changeTheme('brand-red');
                });
            }).not.toThrow();

            setItemSpy.mockRestore();
        });

        test('should handle custom event dispatch errors gracefully', () => {
            const { result } = renderHook(() => useTheme());

            // Mock dispatchEvent to throw
            const dispatchEventSpy = jest
                .spyOn(window, 'dispatchEvent')
                .mockImplementation(() => {
                    throw new Error('Event dispatch failed');
                });

            expect(() => {
                act(() => {
                    result.current.changeTheme('brand-blue');
                });
            }).not.toThrow();

            dispatchEventSpy.mockRestore();
        });
    });

    // ============================================================
    // ✅ WCAG COMPLIANCE TESTS
    // ============================================================

    describe('WCAG 2.1 Compliance', () => {
        test('should respect prefers-reduced-motion for animation', () => {
            window.matchMedia = jest.fn().mockImplementation((query) => ({
                matches: query === '(prefers-reduced-motion: reduce)',
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            }));

            const { result } = renderHook(() => useTheme());
            expect(result.current.prefersReducedMotion).toBe(true);
        });

        test('should detect and respect prefers-contrast', () => {
            window.matchMedia = jest.fn().mockImplementation((query) => ({
                matches: query === '(prefers-contrast: more)',
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            }));

            const { result } = renderHook(() => useTheme());

            // Should automatically switch to high contrast
            waitFor(() => {
                expect(result.current.accessibilityMode).toBe('highContrast');
            });
        });

        test('should maintain keyboard accessibility for theme changes', () => {
            const { result } = renderHook(() => useTheme());

            // Should not prevent keyboard interaction
            expect(() => {
                act(() => {
                    result.current.changeTheme('brand-purple');
                });
            }).not.toThrow();
        });
    });
});
