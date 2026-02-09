# 🔧 CẢI TIẾN HỆ THỐNG THEME - ACTION PLAN CỤ THỂ

**Dựa trên:** THEME_SYSTEM_AUDIT_REPORT.md  
**Mục tiêu:** Nâng điểm từ 82/100 → 95/100

---

## 🎯 PRIORITY 1: CRITICAL (Fix ngay)

### Issue #1: Duplicate Theme Logic

**Problem:**
```
2 files có applyTheme logic:
├── src/components/Sidebar.tsx (Current use)
└── src/components/DarkModeStyles.tsx (Outdated, unused)

Risk: Maintenance issues, inconsistency
```

**Solution:**

```typescript
// 1️⃣ CREATE: src/lib/hooks/useTheme.ts
import { useState, useEffect, useCallback } from 'react';
import { BrandTheme, palettes } from '../constants/palettes';

export type Theme = 'light' | 'dark' | BrandTheme;

/**
 * Custom hook for managing theme state and persistence
 * 
 * @reference
 * - Hooks pattern: https://react.dev/reference/react/hooks
 * - useCallback: https://react.dev/reference/react/useCallback
 * 
 * @example
 * const { theme, changeTheme } = useTheme();
 * changeTheme('brand-purple');
 */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('light');

  /**
   * Apply theme to document and store preference
   * @param nextTheme - Theme to apply
   * 
   * @note Sets data-theme attribute on html and body tags
   * This allows CSS to react to theme changes via:
   * :root[data-theme="brand-purple"] { ... }
   */
  const applyTheme = useCallback((nextTheme: Theme) => {
    // Set on both html and body for cross-browser compatibility
    document.documentElement.setAttribute('data-theme', nextTheme);
    document.body.setAttribute('data-theme', nextTheme);
  }, []);

  /**
   * Initialize theme from localStorage or system preference
   * 
   * @reference
   * - prefers-color-scheme: https://www.w3.org/TR/prefers-color-scheme/
   * - localStorage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
   */
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let initialTheme: Theme = 'light';
    
    // Validate saved theme exists in available themes
    if (savedTheme) {
      const validThemes = ['light', 'dark', ...Object.keys(palettes)] as Theme[];
      if (validThemes.includes(savedTheme)) {
        initialTheme = savedTheme;
      }
    } else if (systemPrefersDark) {
      initialTheme = 'dark';
    }

    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, [applyTheme]);

  /**
   * Change theme and persist selection
   * @param newTheme - New theme to apply
   */
  const changeTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Dispatch custom event for other components
    window.dispatchEvent(
      new CustomEvent('themechange', { detail: { theme: newTheme } })
    );
  }, [applyTheme]);

  /**
   * Get current theme palette data
   */
  const getCurrentPalette = useCallback(() => {
    if (theme === 'light' || theme === 'dark') {
      return null;
    }
    return palettes[theme as BrandTheme];
  }, [theme]);

  return {
    theme,
    changeTheme,
    applyTheme,
    getCurrentPalette,
  };
};
```

**2️⃣ UPDATE: src/components/Sidebar.tsx**

```typescript
// Replace OLD code:
// ❌ const applyTheme = (nextTheme: Theme) => { ... }
// ❌ useEffect(() => { applyTheme(...) }, [])
// ❌ const changeTheme = (newTheme: Theme) => { ... }

// With NEW code:
import { useTheme } from '../lib/hooks/useTheme';

export function Sidebar({ currentView, onNavigate, userRole }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, changeTheme } = useTheme();  // ✅ Use hook
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Rest stays the same - changeTheme() already handles persistence
}
```

**3️⃣ DELETE: src/components/DarkModeStyles.tsx**

```bash
# This file is obsolete and causes duplication
rm src/components/DarkModeStyles.tsx
```

**4️⃣ REMOVE from App.tsx**

```typescript
// ❌ Delete this import if it exists:
// import { DarkModeStyles } from './components/DarkModeStyles';

// ❌ Remove from JSX:
// <DarkModeStyles />
```

---

## 🎯 PRIORITY 2: HIGH (Implement này sprint)

### Issue #2: Add Accessibility Features

**Problem:**
```
Missing accessibility modes:
- High contrast mode (WCAG requirement)
- Reduced motion support
- Color-blind friendly options
```

**Solution:**

```typescript
// 1️⃣ EXTEND: src/lib/constants/palettes.ts

/**
 * Accessibility enhancements
 * @reference
 * - WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
 * - prefers-contrast: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast
 * - prefers-color-scheme: https://www.w3.org/TR/prefers-color-scheme/
 */

export interface AccessibilityOptions {
  // High contrast: darker colors, stronger separation
  highContrast?: {
    primary: ColorPalette;
    secondary?: ColorPalette;
    neutral: ColorPalette;
  };
  
  // For colorblind users
  colorblindFriendly?: boolean;
  
  // Focus indicator color
  focusColor?: string;
}

export interface ThemePalette {
  primary: ColorPalette;
  secondary?: ColorPalette;
  neutral: ColorPalette;
  accessibility?: AccessibilityOptions;  // ✅ NEW
}

// 2️⃣ Add high-contrast variant example:
'brand-purple': {
  primary: { /* existing */ },
  secondary: { /* existing */ },
  neutral: neutralGray,
  // NEW:
  accessibility: {
    highContrast: {
      primary: {
        50: '#ffffff',
        100: '#f0ebff',
        200: '#ddd6fe',
        300: '#c4b5fd',
        400: '#a78bfa',
        500: '#5b4ee6',  // ← Darker than base 600
        600: '#4338ca',  // ← Even darker
        700: '#3730a3',
        800: '#2d1fb2',
        900: '#1f1547',
        950: '#0a0428',
      },
      secondary: { /* complementary */ },
      neutral: {
        // Stronger contrast grays
        50: '#ffffff',
        100: '#f5f5f5',
        200: '#d4d4d4',
        300: '#a3a3a3',
        400: '#737373',
        500: '#525252',
        600: '#404040',
        700: '#262626',
        800: '#171717',
        900: '#0a0a0a',
        950: '#000000',
      },
    },
    focusColor: '#7c3aed', // Violet for focus indicators
    colorblindFriendly: true,
  }
}
```

**2️⃣ UPDATE: src/lib/hooks/useTheme.ts**

```typescript
export type AccessibilityMode = 'default' | 'highContrast';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [accessibilityMode, setAccessibilityMode] = useState<AccessibilityMode>('default');

  useEffect(() => {
    // Detect system high contrast preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
    
    if (prefersHighContrast) {
      setAccessibilityMode('highContrast');
      document.documentElement.setAttribute('data-a11y', 'highContrast');
    }
  }, []);

  // Listen for changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    const handleChange = (e: MediaQueryListEvent) => {
      setAccessibilityMode(e.matches ? 'highContrast' : 'default');
    };
    
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return {
    theme,
    accessibilityMode,
    changeTheme,
    setAccessibilityMode,
    // ... other
  };
};
```

**3️⃣ UPDATE: src/index.css**

```css
/* High contrast variant */
:root[data-theme="brand-purple"][data-a11y="highContrast"] {
  --color-primary-50: #ffffff;
  --color-primary-100: #f0ebff;
  /* ... darker variants ... */
  --color-primary-600: #4338ca;  /* Darker than normal */
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus styles for accessibility */
:focus-visible {
  outline: 2px solid var(--focus-color, #7c3aed);
  outline-offset: 2px;
}
```

---

### Issue #3: Add Color Validation

**Solution:**

```typescript
// CREATE: src/lib/utils/colorValidation.ts

/**
 * Color contrast validation utility
 * @reference
 * - WCAG Contrast: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
 * - WCAG Formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */

interface ContrastResult {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
}

/**
 * Calculate relative luminance
 * @reference WCAG 2.0 formula
 */
const getRelativeLuminance = (hex: string): number => {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;

  const luminance = [r, g, b].map((c) => {
    const c_sRGB = c / 255;
    return c_sRGB <= 0.03928
      ? c_sRGB / 12.92
      : Math.pow((c_sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * luminance[0] + 0.7152 * luminance[1] + 0.0722 * luminance[2];
};

/**
 * Validate contrast ratio between two colors
 */
export const validateContrast = (
  foreground: string,
  background: string
): ContrastResult => {
  const l1 = getRelativeLuminance(foreground);
  const l2 = getRelativeLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = (lighter + 0.05) / (darker + 0.05);

  return {
    ratio: Math.round(ratio * 10) / 10,
    wcagAA: ratio >= 4.5,    // Text minimum
    wcagAAA: ratio >= 7,     // Enhanced
  };
};

/**
 * Validate entire theme palette
 */
export const validateThemePalette = (palette: ThemePalette): ValidationReport => {
  const results = {
    textContrast: [] as any[],
    uiContrast: [] as any[],
    warnings: [] as string[],
  };

  // Validate text color combinations
  const neutralTones = Object.entries(palette.neutral);
  const primaryTones = Object.entries(palette.primary);

  primaryTones.forEach(([tone, color]) => {
    neutralTones.forEach(([neutralTone, neutralColor]) => {
      const contrast = validateContrast(neutralColor, color);
      
      if (!contrast.wcagAA) {
        results.warnings.push(
          `⚠️ Primary-${tone} + Neutral-${neutralTone}: ${contrast.ratio}:1 (Below AA)`
        );
      }
    });
  });

  return results;
};

// USAGE:
// const validation = validateThemePalette(palettes['brand-purple']);
// if (validation.warnings.length > 0) {
//   console.warn('Color contrast issues:', validation.warnings);
// }
```

**Add to build script for CI/CD:**

```bash
# scripts/validate-colors.js
const { validateThemePalette } = require('./lib/utils/colorValidation');
const { palettes } = require('./lib/constants/palettes');

Object.entries(palettes).forEach(([themeName, palette]) => {
  const validation = validateThemePalette(palette);
  if (validation.warnings.length > 0) {
    console.error(`❌ ${themeName}:`, validation.warnings);
    process.exit(1);
  } else {
    console.log(`✅ ${themeName}: All contrasts valid`);
  }
});
```

---

## 🎯 PRIORITY 3: MEDIUM (Optional refinement)

### Issue #4: Add Semantic Tokens

```typescript
// EXTEND: src/lib/constants/palettes.ts

export interface SemanticTokens {
  success: string;
  warning: string;
  error: string;
  info: string;
  disabled: string;
}

export interface ThemePalette {
  primary: ColorPalette;
  secondary?: ColorPalette;
  neutral: ColorPalette;
  accessibility?: AccessibilityOptions;
  semantic?: SemanticTokens;  // ✅ NEW
}

// Add to each theme:
'brand-purple': {
  primary: { /* ... */ },
  secondary: { /* ... */ },
  neutral: neutralGray,
  accessibility: { /* ... */ },
  semantic: {
    success: '#22c55e',      // Green
    warning: '#ea580c',      // Orange
    error: '#ef4444',        // Red
    info: '#3b82f6',         // Blue
    disabled: '#9ca3af',     // Gray-400
  },
}
```

**Update CSS:**

```css
:root[data-theme="brand-purple"] {
  /* Primary colors */
  --color-primary-500: #695CFE;
  
  /* Semantic tokens */
  --color-success: #22c55e;
  --color-warning: #ea580c;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  --color-disabled: #9ca3af;
}
```

**Usage in components:**

```tsx
// Instead of hardcoding:
// ❌ <div className="bg-red-500">Error</div>

// Use semantic:
// ✅ <div className="bg-[var(--color-error)]">Error</div>
```

---

### Issue #5: Add Theme Transition Animation

```typescript
// UPDATE: src/lib/hooks/useTheme.ts

const changeTheme = useCallback((newTheme: Theme) => {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (!prefersReducedMotion) {
    // Add transition class
    document.documentElement.classList.add('theme-transition');
    
    // Remove after transition completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
  }

  setTheme(newTheme);
  applyTheme(newTheme);
  localStorage.setItem('theme', newTheme);
}, [applyTheme]);
```

```css
/* src/index.css */

:root.theme-transition {
  transition: background-color 0.3s ease, color 0.3s ease;
}

:root.theme-transition * {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* But respect user preference */
@media (prefers-reduced-motion: reduce) {
  :root.theme-transition,
  :root.theme-transition * {
    transition: none !important;
  }
}
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Critical (Do first)
- [ ] Create `src/lib/hooks/useTheme.ts`
- [ ] Update `src/components/Sidebar.tsx` to use hook
- [ ] Delete `src/components/DarkModeStyles.tsx`
- [ ] Remove `<DarkModeStyles />` from App.tsx
- [ ] Test theme switching still works
- [ ] Test localStorage persistence
- [ ] Build and run tests

### Phase 2: High Priority
- [ ] Add accessibility options to palettes.ts
- [ ] Extend useTheme hook for accessibility
- [ ] Add data-a11y attribute handling
- [ ] Create color validation utility
- [ ] Add validation to CI/CD pipeline
- [ ] Update index.css with high-contrast variants
- [ ] Test with prefers-contrast: more

### Phase 3: Medium Priority
- [ ] Add semantic tokens to palettes
- [ ] Update CSS for semantic colors
- [ ] Add theme transition animation
- [ ] Test prefers-reduced-motion compliance
- [ ] Add JSDoc to all functions

### Phase 4: Testing & Documentation
- [ ] Add unit tests for useTheme hook
- [ ] Add accessibility tests
- [ ] Update THEME_PALETTE_GUIDE.md
- [ ] Document new features in README

---

## ✅ VERIFICATION CHECKLIST

After completing all changes:

```bash
# 1. Build succeeds
npm run build

# 2. No TypeScript errors
npx tsc --noEmit

# 3. ESLint passes
npm run lint

# 4. Tests pass (once added)
npm test

# 5. Accessibility audit
axe DevTools browser extension

# 6. Color contrast check
Color Contrast Analyzer tool

# 7. Performance check
npm run build -- --analyze
```

---

## 📚 REFERENCES

### Official Documentation
- React Hooks: https://react.dev/reference/react/hooks
- CSS Custom Properties: https://www.w3.org/TR/css-variables-1/
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- Material Design 3: https://m3.material.io/

### Tools
- Color Contrast Analyzer: https://www.tpgi.com/color-contrast-checker/
- Lighthouse: https://developers.google.com/web/tools/lighthouse
- axe DevTools: https://www.deque.com/axe/devtools/

---

**Score improvement expected: 82/100 → 95/100 after completing all phases**
