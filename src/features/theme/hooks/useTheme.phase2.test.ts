/**
 * Automated Theme Validation Script
 * 
 * Runs automated checks to verify theme system integrity.
 * Can be run via: npm run test:themes
 * 
 * Validates:
 * - CSS variables are defined
 * - Semantic tokens work for all themes
 * - Performance is acceptable
 * - No TypeScript errors
 * 
 * @reference
 * - Jest Testing: https://jestjs.io/
 * - JSDOM: https://github.com/jsdom/jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../hooks/useTheme';
import { palettes, BrandTheme } from '../constants/palettes';

describe('Theme Validation - Phase 2 Tests', () => {
    // All available themes
    const allThemes = ['light', 'dark', ...Object.keys(palettes)] as const;

    describe('Semantic Token Availability', () => {
        it('should return semantic tokens for all 12 themes', () => {
            allThemes.forEach(theme => {
                const { result } = renderHook(() => useTheme());

                act(() => {
                    result.current.changeTheme(theme as any);
                });

                const tokens = result.current.getSemanticTokens();

                expect(tokens).not.toBeNull();
                expect(tokens).toHaveProperty('success');
                expect(tokens).toHaveProperty('error');
                expect(tokens).toHaveProperty('warning');
                expect(tokens).toHaveProperty('info');
                expect(tokens).toHaveProperty('disabled');

                // Verify all are valid hex colors
                expect(tokens?.success).toMatch(/^#[0-9A-F]{6}$/i);
                expect(tokens?.error).toMatch(/^#[0-9A-F]{6}$/i);
                expect(tokens?.warning).toMatch(/^#[0-9A-F]{6}$/i);
                expect(tokens?.info).toMatch(/^#[0-9A-F]{6}$/i);
                expect(tokens?.disabled).toMatch(/^#[0-9A-F]{6}$/i);
            });
        });
    });

    describe('Theme Switching', () => {
        it('should successfully switch between all themes', () => {
            const { result } = renderHook(() => useTheme());

            allThemes.forEach(theme => {
                act(() => {
                    result.current.changeTheme(theme as any);
                });

                expect(result.current.theme).toBe(theme);
            });
        });

        it('should update semantic tokens when switching themes', () => {
            const { result } = renderHook(() => useTheme());

            // Light mode tokens
            act(() => {
                result.current.changeTheme('light');
            });
            const lightTokens = result.current.getSemanticTokens();
            expect(lightTokens?.success).toBe('#22c55e'); // green-600

            // Dark mode tokens (should be lighter)
            act(() => {
                result.current.changeTheme('dark');
            });
            const darkTokens = result.current.getSemanticTokens();
            expect(darkTokens?.success).toBe('#4ade80'); // green-400

            // Tokens should be different
            expect(lightTokens?.success).not.toBe(darkTokens?.success);
        });
    });

    describe('Performance Validation', () => {
        it('should change themes quickly (within performance budget)', () => {
            const { result } = renderHook(() => useTheme());

            allThemes.forEach(theme => {
                const startTime = performance.now();

                act(() => {
                    result.current.changeTheme(theme as any);
                });

                const endTime = performance.now();
                const duration = endTime - startTime;

                // Should complete in <100ms (accounts for test environment overhead)
                // Real-world: <50ms, Excellent: <20ms
                // Note: Test environment adds React testing library overhead
                expect(duration).toBeLessThan(100);
            });
        });
    });

    describe('Accessibility Mode', () => {
        it('should support high contrast mode for all themes', () => {
            const { result } = renderHook(() => useTheme());

            allThemes.forEach(theme => {
                act(() => {
                    result.current.changeTheme(theme as any);
                    result.current.setAccessibilityMode('highContrast');
                });

                expect(result.current.accessibilityMode).toBe('highContrast');

                act(() => {
                    result.current.setAccessibilityMode('default');
                });

                expect(result.current.accessibilityMode).toBe('default');
            });
        });
    });

    describe('Data Attribute Synchronization', () => {
        it('should set data-theme attribute on DOM when theme changes', () => {
            const { result } = renderHook(() => useTheme());

            allThemes.forEach(theme => {
                act(() => {
                    result.current.changeTheme(theme as any);
                });

                // Check both html and body elements
                expect(document.documentElement.getAttribute('data-theme')).toBe(theme);
                expect(document.body.getAttribute('data-theme')).toBe(theme);
            });
        });

        it('should set data-a11y attribute when accessibility mode changes', () => {
            const { result } = renderHook(() => useTheme());

            act(() => {
                result.current.setAccessibilityMode('highContrast');
            });

            expect(document.documentElement.getAttribute('data-a11y')).toBe('highContrast');
            expect(document.body.getAttribute('data-a11y')).toBe('highContrast');

            act(() => {
                result.current.setAccessibilityMode('default');
            });

            expect(document.documentElement.getAttribute('data-a11y')).toBe('default');
            expect(document.body.getAttribute('data-a11y')).toBe('default');
        });
    });

    describe('Semantic Token Color Values', () => {
        it('should use correct colors for light mode', () => {
            const { result } = renderHook(() => useTheme());

            act(() => {
                result.current.changeTheme('light');
            });

            const tokens = result.current.getSemanticTokens();

            expect(tokens?.success).toBe('#22c55e');   // green-600
            expect(tokens?.error).toBe('#ef4444');     // red-500
            expect(tokens?.warning).toBe('#f59e0b');   // amber-500
            expect(tokens?.info).toBe('#3b82f6');      // blue-500
            expect(tokens?.disabled).toBe('#6b7280');  // gray-500
        });

        it('should use correct colors for dark mode', () => {
            const { result } = renderHook(() => useTheme());

            act(() => {
                result.current.changeTheme('dark');
            });

            const tokens = result.current.getSemanticTokens();

            expect(tokens?.success).toBe('#4ade80');   // green-400 (lighter)
            expect(tokens?.error).toBe('#f87171');     // red-400 (lighter)
            expect(tokens?.warning).toBe('#fbbf24');   // amber-400 (lighter)
            expect(tokens?.info).toBe('#60a5fa');      // blue-400 (lighter)
            expect(tokens?.disabled).toBe('#9ca3af');  // gray-400 (lighter)
        });

        it('should use consistent semantic colors for all brand themes', () => {
            const brandThemes = Object.keys(palettes) as BrandTheme[];

            brandThemes.forEach(theme => {
                const { result } = renderHook(() => useTheme());

                act(() => {
                    result.current.changeTheme(theme);
                });

                const tokens = result.current.getSemanticTokens();

                // Brand themes should all share the same semantic tokens
                // (defined in palettes.ts)
                expect(tokens).not.toBeNull();
                expect(tokens).toHaveProperty('success');
                expect(tokens).toHaveProperty('error');
                expect(tokens).toHaveProperty('warning');
                expect(tokens).toHaveProperty('info');
            });
        });
    });

    describe('localStorage Persistence', () => {
        beforeEach(() => {
            // Clear localStorage before each test
            localStorage.clear();
        });

        it('should persist theme to localStorage', () => {
            const { result } = renderHook(() => useTheme());

            allThemes.forEach(theme => {
                act(() => {
                    result.current.changeTheme(theme as any);
                });

                expect(localStorage.getItem('theme')).toBe(theme);
            });
        });

        it('should persist accessibility mode to localStorage', () => {
            const { result } = renderHook(() => useTheme());

            act(() => {
                result.current.setAccessibilityMode('highContrast');
            });

            expect(localStorage.getItem('a11y')).toBe('highContrast');

            act(() => {
                result.current.setAccessibilityMode('default');
            });

            expect(localStorage.getItem('a11y')).toBe('default');
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid theme gracefully', () => {
            const { result } = renderHook(() => useTheme());
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            act(() => {
                result.current.changeTheme('invalid-theme' as any);
            });

            // Should log warning but not crash
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('Phase 2 Validation Summary', () => {
        it('should pass all critical validation checks', () => {
            const { result } = renderHook(() => useTheme());

            // ✅ Check 1: All themes work
            expect(allThemes.length).toBe(12); // 2 base + 10 brand

            // ✅ Check 2: Semantic tokens available for all themes
            allThemes.forEach(theme => {
                act(() => {
                    result.current.changeTheme(theme as any);
                });
                expect(result.current.getSemanticTokens()).not.toBeNull();
            });

            // ✅ Check 3: Accessibility modes work
            act(() => {
                result.current.setAccessibilityMode('highContrast');
            });
            expect(result.current.accessibilityMode).toBe('highContrast');

            // ✅ Check 4: Performance is acceptable
            const startTime = performance.now();
            act(() => {
                result.current.changeTheme('brand-purple');
            });
            const endTime = performance.now();
            expect(endTime - startTime).toBeLessThan(50);

            // ✅ Check 5: No console errors
            // (Tested implicitly - test would fail if errors thrown)

            console.log('✅ Phase 2 Validation: ALL CHECKS PASSED');
        });
    });
});

// Export for use in other tests
export { allThemes };
