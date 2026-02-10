# Theme System - Quick Reference & Troubleshooting

**Date:** February 10, 2026  
**For:** Developers working with theme-aware colors and semantic tokens

---

## Quick Fix Summary

| Issue | Before | After | Status |
|-------|--------|-------|--------|
| Brand theme semantic tokens hardcoded | ❌ Missing CSS variables | ✅ CSS variables synced | 🔧 FIXED |
| Dark mode semantic inconsistent | ❌ Only light mode colors | ✅ Light & dark tokens | 🔧 FIXED |
| Semantic tokens not applied to DOM | ❌ Static CSS values | ✅ Dynamic via JavaScript | 🔧 FIXED |
| Work Log badges unresponsive to theme | ❌ Always same colors | ✅ Changes with theme | 🔧 FIXED |
| getSemanticTokens() incomplete | ❌ Returns null for light/dark | ✅ Returns tokens all themes | 🔧 FIXED |

---

## How to Verify the Fix

### ✅ Test 1: Work Log Status Badges React to Theme
```javascript
// Open browser Dev Tools > Console
// Method 1: Simple visual test

// Switch to brand-blue
document.documentElement.setAttribute('data-theme', 'brand-blue');
// Check: PENDING badge should still show amber (ok - semantic unchanged)
// Check: IN PROGRESS badge should show blue (ok - info color)
// Check: RESOLVED badge should show green (ok - success color)

// Value: Semantic tokens stay consistent across themes ✅
```

### ✅ Test 2: CSS Variables Actually Update
```javascript
// Check that CSS variables are applied to DOM
const root = document.documentElement;
const successColor = getComputedStyle(root).getPropertyValue('--color-success');
console.log(successColor);  // Should output: ' #22c55e' (with space in value)

// Test dark mode
document.documentElement.setAttribute('data-theme', 'dark');
const darkSuccessColor = getComputedStyle(root).getPropertyValue('--color-success');
console.log(darkSuccessColor);  // Should output: ' #4ade80' (lighter green)
```

### ✅ Test 3: useTheme Hook Returns Correct Tokens
```javascript
// In your React component
import { useTheme } from '@/lib/hooks/useTheme';

function MyComponent() {
  const { theme, getSemanticTokens } = useTheme();
  const tokens = getSemanticTokens();
  
  return (
    <>
      <div>Current Theme: {theme}</div>
      <div>Success Color: {tokens?.success}</div>
      <div>Warning Color: {tokens?.warning}</div>
      <div>Error Color: {tokens?.error}</div>
      <div>Info Color: {tokens?.info}</div>
    </>
  );
}
```

---

## Common Issues & Solutions

### ⚠️ Issue: "CSS Variables Not Updating in My Component"

**Cause:** Component renders before CSS variables are set

**Solution:** Wait for effect to run
```javascript
import { useEffect } from 'react';
import { useTheme } from '@/lib/hooks/useTheme';

export function MyComponent() {
  const { theme, getSemanticTokens } = useTheme();
  const tokens = getSemanticTokens();
  
  // ✅ This will have tokens after initialization
  return <div style={{ color: tokens?.success }} />;
}
```

### ⚠️ Issue: "Hardcoded Colors Still Override Theme"

**Cause:** Component using hardcoded Tailwind colors

**Wrong:**
```jsx
// ❌ Hardcoded colors bypass CSS variables
className="bg-green-50 text-green-800 ring-green-200"

// If theme changes, these colors don't update
// They always show green regardless of theme
```

**Correct:**
```jsx
// ✅ Uses CSS variables from theme
className="bg-success-background text-success-foreground ring-success-border"

// When theme changes, colors update automatically
```

### ⚠️ Issue: "High Contrast Mode Breaks Colors"

**Cause:** Hardcoded colors in components

**Solution:** High contrast mode uses CSS overrides automatically
```css
/* In src/index.css - ALREADY APPLIED */
html[data-a11y="highContrast"] .bg-green-50 {
  background-color: #ffffff !important;
}

/* No component changes needed - CSS takes care of it! */
```

---

## CSS Variables Reference

### Semantic Token Variables
These are the main CSS variables that update based on theme:

```css
/* Main semantic colors (primary foreground) */
--color-success: #22c55e;      /* Light: green-600 | Dark: green-400 */
--color-error: #ef4444;        /* Light: red-500 | Dark: red-400 */
--color-warning: #f59e0b;      /* Light: amber-500 | Dark: amber-400 */
--color-info: #3b82f6;         /* Light: blue-500 | Dark: blue-400 */
--color-disabled: #6b7280;     /* Light: gray-500 | Dark: gray-400 */

/* Foreground colors (for text in semantic backgrounds) */
--color-success-foreground: #166534;     /* Light: green-800 | Dark: green-200 */
--color-error-foreground: #991b1b;       /* Light: red-800 | Dark: red-200 */
--color-warning-foreground: #92400e;     /* Light: amber-800 | Dark: amber-200 */
--color-info-foreground: #1e40af;        /* Light: blue-800 | Dark: blue-200 */

/* Background colors (semantic-tinted backgrounds) */
--color-success-background: #f0fdf4;     /* Light: green-50 | Dark: rgba(34, 197, 94, 0.2) */
--color-error-background: #fef2f2;       /* Light: red-50 | Dark: rgba(239, 68, 68, 0.2) */
--color-warning-background: #fffbeb;     /* Light: amber-50 | Dark: rgba(245, 158, 11, 0.2) */
--color-info-background: #eff6ff;        /* Light: blue-50 | Dark: rgba(59, 130, 246, 0.2) */

/* Border colors (semantic-tinted borders) */
--color-success-border: #bbf7d0;         /* Light: green-200 | Dark: rgba(34, 197, 94, 0.3) */
--color-error-border: #fecaca;           /* Light: red-200 | Dark: rgba(239, 68, 68, 0.3) */
--color-warning-border: #fde68a;         /* Light: amber-200 | Dark: rgba(245, 158, 11, 0.3) */
--color-info-border: #bfdbfe;            /* Light: blue-200 | Dark: rgba(59, 130, 246, 0.3) */

/* Primary brand theme color (varies per theme) */
--color-primary-500: #695CFE;            /* Light: varies | Dark: varies */
```

### Where They're Defined
1. **CSS:** `src/index.css` (lines 119-250) - Static definitions
2. **JavaScript:** `src/lib/hooks/useTheme.ts` - Dynamic updates via `document.documentElement.style.setProperty()`

---

## Tailwind Color Utilities That Use These Variables

### Status/State Utilities
```jsx
// These automatically use the CSS variables above
className="bg-success-background"           // Uses --color-success-background
className="text-success-foreground"         // Uses --color-success-foreground
className="ring-success-border"             // Uses --color-success-border
className="border-success-border"           // Uses --color-success-border

// Same for warning, error, info, disabled
className="bg-warning-background text-warning-foreground ring-warning-border"
className="bg-error-background text-error-foreground ring-error-border"
className="bg-info-background text-info-foreground ring-info-border"
```

### Fallback Colors (in tailwind.config.js)
```javascript
// If CSS variable is not available, fallback to these
'success-background': 'var(--color-success-background, #f0fdf4)',
// Read: "Use CSS variable --color-success-background, 
//        or #f0fdf4 if the variable is not set"
```

---

## Testing Color Accessibility

### How to Check Contrast Ratios
```javascript
// Use the colorValidation utility (already in project)
import { 
  validateContrast,
  getContrastRatio 
} from '@/lib/utils/colorValidation';

const result = validateContrast('#000000', '#ffffff');
console.log(result.wcagAA);   // true (21:1 ratio - passes AA)
console.log(result.wcagAAA);  // true (21:1 ratio - passes AAA)
console.log(result.level);    // 'AAA'

// Check brand theme combinations
const brandBlueResult = validateContrast(
  '#eff6ff',  // bg-info-background (light blue)
  '#1e40af'   // text-info-foreground (dark blue)
);
console.log(brandBlueResult.wcagAA);  // Should be true
```

### Expected Contrast Ratios (WCAG Standards)
```
✅ WCAG AA minimum: 4.5:1 (normal text)
✅ WCAG AA minimum: 3:1 (large text 18pt+)
✅ WCAG AAA minimum: 7:1 (normal text)
✅ WCAG AAA minimum: 4.5:1 (large text)

Current ratios by semantic token:
- Success (green): ~7:1 (AA/AAA compliant)
- Warning (amber): ~5:1 (AA compliant)
- Error (red): ~7:1 (AA/AAA compliant)
- Info (blue): ~9:1 (AA/AAA compliant)
```

---

## Theme Switching Code Examples

### React Hook Usage
```jsx
import { useTheme } from '@/lib/hooks/useTheme';

export function ThemeSelector() {
  const { theme, changeTheme, getSemanticTokens } = useTheme();
  const tokens = getSemanticTokens();
  
  return (
    <select value={theme} onChange={(e) => changeTheme(e.target.value as Theme)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="brand-blue">Brand Blue</option>
      <option value="brand-red">Brand Red</option>
      // ... more options
    </select>
  );
}
```

### Direct DOM API (For Debugging)
```javascript
// Change theme via JavaScript (debugging only)
document.documentElement.setAttribute('data-theme', 'brand-blue');
document.body.setAttribute('data-theme', 'brand-blue');

// But use the useTheme hook in production for proper state management!
```

### Redux/Zustand Integration (If Needed)
```typescript
// Example with custom store
const useAppStore = create((set) => ({
  theme: 'light' as Theme,
  setTheme: (theme: Theme) => {
    const { changeTheme } = useTheme();
    changeTheme(theme);
    set({ theme });
  },
}));
```

---

## Performance Checklist

- [x] CSS variables defined at :root (cascade-friendly)
- [x] JavaScript updates only on theme change (efficient)
- [x] No React re-renders needed for theme change
- [x] CSS transitions already in place (smooth)
- [x] Fallback colors in Tailwind config (safe)
- [x] No eval() or dynamic code execution (secure)
- [x] Memory leaks prevented (proper cleanup)

---

## When to Use Each Color Type

### Use Semantic Token Colors (✅ PREFERRED)
```jsx
// For status/state indicators
className="bg-success-background"   // Success state
className="bg-warning-background"   // Pending/warning state
className="bg-error-background"     // Error/failed state
className="bg-info-background"      // Info/progress state

// Benefits:
// - Works across all themes automatically
// - Accessible and WCAG compliant
// - Consistent semantic meaning
// - Updates with theme changes
```

### Use Brand Primary Colors (✅ FOR BRAND ACCENTS)
```jsx
// For brand-specific elements
className="text-primary-600"        // Brand text
className="border-primary-300"      // Brand border
className="bg-primary-500"          // Brand background

// Note: Primary color varies per theme
// But semantic tokens stay consistent
```

### Never Hardcode Colors (❌ FORBIDDEN)
```jsx
// DON'T DO THIS
className="bg-green-50 text-green-800"
className="bg-red-500"
className="text-blue-600"

// Hardcoded colors:
// - Ignore theme changes
// - Don't update with user preference
// - Bypass accessibility overrides
// - Create inconsistent UX
```

---

## Where to Find More Info

1. **Theme System Audit Report**
   - File: `THEME_SYSTEM_AUDIT_REPORT.md`
   - Contains: Problem analysis and root causes

2. **Theme Implementation Guide**
   - File: `THEME_SYSTEM_IMPLEMENTATION_GUIDE.md`
   - Contains: What was fixed and how

3. **Color Palette Constants**
   - File: `src/lib/constants/palettes.ts`
   - Contains: All brand theme definitions

4. **useTheme Hook**
   - File: `src/lib/hooks/useTheme.ts`
   - Contains: Theme management logic

5. **CSS Variables**
   - File: `src/index.css` (lines 119-250)
   - Contains: CSS variable definitions

6. **Tailwind Config**
   - File: `tailwind.config.js`
   - Contains: Color utility mappings

---

## Quick Checklist: Am I Using Themes Correctly?

```
✅ Using semantic color utilities (bg-success-background, etc.)
✅ Using useTheme() hook for theme operations
✅ Colors update when theme changes (tested in browser)
✅ No hardcoded brand colors in components
✅ High contrast mode still works
✅ Dark mode still works
✅ Brand themes display correctly
```

If any of these is ❌, review the color usage in your component!

---

## Support

**For issues or questions:**
1. Check the troubleshooting section above
2. Review THEME_SYSTEM_IMPLEMENTATION_GUIDE.md
3. Check browser console for errors
4. Verify CSS variables in DevTools > Styles tab
5. Check that `applySemanticTokens()` was called (add debug log)

**To debug CSS variables:**
```javascript
// In browser console
const root = document.documentElement;
const styles = getComputedStyle(root);
console.table({
  success: styles.getPropertyValue('--color-success'),
  warning: styles.getPropertyValue('--color-warning'),
  error: styles.getPropertyValue('--color-error'),
  info: styles.getPropertyValue('--color-info'),
});
```

---

**Last Updated:** February 10, 2026  
**Version:** 1.0.0
