# Tailwind CSS v4 Migration Guide

**Date:** February 10, 2026  
**Current Version:** Tailwind CSS v4.1.18  
**Migration Status:** ⚠️ REQUIRED - JavaScript config deprecated

---

## Executive Summary

Tailwind CSS v4 đã **thay đổi hoàn toàn** cách cấu hình theme:
- ❌ **JavaScript `tailwind.config.js`**: Deprecated (vẫn hoạt động nhưng không khuyến nghị)
- ✅ **CSS `@theme` directive**: Cấu hình chuẩn mới
- 🚀 **Performance**: 5x faster builds, 100x faster incremental builds

---

## Nguồn Tham Khảo Chính Thức

### Tài Liệu Official
1. **[Tailwind CSS v4.0 Beta Announcement](https://tailwindcss.com/blog/tailwindcss-v4-beta)**
   - "CSS-first configuration — a reimagined developer experience where you customize and extend the framework directly in CSS instead of a JavaScript configuration file."

2. **[Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)**
   - "JavaScript config files are still supported for backward compatibility, but they are no longer detected automatically in v4."
   - "If you still need to use a JavaScript config file, you can load it explicitly using the `@config` directive"

3. **[Theme Documentation](https://tailwindcss.com/docs/theme)**
   - Best practices cho @theme directive

### Best Practices từ Industry Leaders

**Vercel** (Next.js creators):
- Migrate toàn bộ sang CSS-first
- Sử dụng CSS custom properties cho theming
- Avoid JavaScript config overhead

**Shopify**:
- CSS variables cho performance
- Theme tokens trong CSS files
- Separation of concerns

**GitHub**:
- Semantic color tokens
- CSS-based configuration
- No runtime JavaScript for theming

---

## Breaking Changes trong v4

### 1. JavaScript Config No Longer Auto-Detected

**v3 (Old):**
```javascript
// tailwind.config.js - automatically detected ✅
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: '#3b82f6',
      }
    }
  }
}
```

**v4 (New):**
```css
/* Must use @config to load explicitly */
@config "../../tailwind.config.js";
@import "tailwindcss";
```

### 2. @theme Directive is the New Standard

**Recommended approach:**
```css
@import "tailwindcss";

@theme {
  --color-brand: #3b82f6;
  --color-brand-foreground: #1e40af;
  --color-brand-background: #eff6ff;
}
```

### 3. Removed/Changed Options

**No longer supported:**
- `corePlugins` - Cannot disable utilities
- `safelist` in JS config - Use `@source inline()` instead
- `separator` option

**Changed behavior:**
- `theme` - Still works but not recommended
- Prefixes now required for all variant combinations

---

## Migration Steps

### Step 1: Install v4 Dependencies

```bash
npm install tailwindcss@latest @tailwindcss/vite@latest
```

### Step 2: Update Vite Config

**Before (v3):**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js' // PostCSS plugin
  }
});
```

**After (v4):**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite'; // ✅ Dedicated Vite plugin

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // ✅ Better performance
  ],
});
```

### Step 3: Create Theme CSS File

Create `src/styles/theme.css`:

```css
@import "tailwindcss";

@theme {
  /* ========================================
   * SEMANTIC COLOR TOKENS
   * ======================================== */
  
  /* Success colors */
  --color-success: #22c55e;
  --color-success-foreground: #166534;
  --color-success-background: #f0fdf4;
  --color-success-border: #bbf7d0;
  
  /* Warning colors */
  --color-warning: #f59e0b;
  --color-warning-foreground: #92400e;
  --color-warning-background: #fffbeb;
  --color-warning-border: #fde68a;
  
  /* Error colors */
  --color-error: #ef4444;
  --color-error-foreground: #991b1b;
  --color-error-background: #fef2f2;
  --color-error-border: #fecaca;
  
  /* Info colors */
  --color-info: #3b82f6;
  --color-info-foreground: #1e40af;
  --color-info-background: #eff6ff;
  --color-info-border: #bfdbfe;
  
  /* ========================================
   * TYPOGRAPHY
   * ======================================== */
  
  /* Font families */
  --font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  --font-mono: ui-monospace, "SFMono-Regular", "Monaco", "Consolas", "Courier New";
  
  /* Font sizes */
  --text-xs: 0.75rem;
  --text-xs--line-height: 1rem;
  --text-sm: 0.875rem;
  --text-sm--line-height: 1.25rem;
  --text-base: 1rem;
  --text-base--line-height: 1.5rem;
  --text-lg: 1.125rem;
  --text-lg--line-height: 1.75rem;
  --text-xl: 1.25rem;
  --text-xl--line-height: 1.75rem;
  
  /* ========================================
   * SPACING & LAYOUT
   * ======================================== */
  
  /* Breakpoints */
  --breakpoint-3xl: 120rem; /* 1920px */
  
  /* Border radius */
  --radius-xs: 0.125rem;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-full: 9999px;
  
  /* ========================================
   * EFFECTS
   * ======================================== */
  
  /* Box shadows */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  
  /* ========================================
   * ANIMATIONS
   * ======================================== */
  
  /* Custom easing functions */
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
  
  /* Transition durations */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
}

/* ========================================
 * DARK MODE OVERRIDES
 * ======================================== */

[data-theme="dark"] {
  --color-success: #22c55e;
  --color-success-foreground: #86efac;
  --color-success-background: #14532d;
  --color-success-border: #166534;
  
  --color-warning: #f59e0b;
  --color-warning-foreground: #fde047;
  --color-warning-background: #78350f;
  --color-warning-border: #92400e;
  
  --color-error: #ef4444;
  --color-error-foreground: #fca5a5;
  --color-error-background: #7f1d1d;
  --color-error-border: #991b1b;
  
  --color-info: #3b82f6;
  --color-info-foreground: #93c5fd;
  --color-info-background: #1e3a8a;
  --color-info-border: #1e40af;
}
```

### Step 4: Update Main CSS Import

**Before (v3):**
```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**After (v4):**
```css
/* src/index.css */
@import "./styles/theme.css";
```

### Step 5: Migrate Safelist

**Before (v3):**
```javascript
// tailwind.config.js
module.exports = {
  safelist: [
    'bg-success-background',
    'text-success-foreground',
    'ring-success-border',
  ]
}
```

**After (v4):**
```css
/* app.css */
@source inline('[href="#safelist"]') {
  bg-success-background
  text-success-foreground
  ring-success-border
  bg-warning-background
  text-warning-foreground
  ring-warning-border
}
```

### Step 6: Delete Unnecessary Files

```bash
# Optional: Remove if fully migrated to CSS
Remove-Item tailwind.config.js

# Remove PostCSS config (no longer needed)
Remove-Item postcss.config.js
```

---

## Comparison: v3 vs v4

### Configuration Approach

| Feature | v3 (Old) | v4 (New) |
|---------|----------|----------|
| **Config file** | `tailwind.config.js` | `@theme` in CSS |
| **Auto-detection** | ✅ Yes | ❌ No (must use @config) |
| **Theme values** | JavaScript object | CSS variables |
| **Dark mode** | className/media | CSS `[data-theme]` |
| **Performance** | Baseline | 5x faster |
| **Bundle size** | Larger | Smaller |
| **Runtime** | JS overhead | Pure CSS |

### Import Syntax

**v3:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**v4:**
```css
@import "tailwindcss";
```

### Vite Integration

**v3 (PostCSS plugin):**
```typescript
// postcss.config.js needed
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
```

**v4 (Dedicated Vite plugin):**
```typescript
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()]
});
```

---

## Testing Migration

### 1. Build Test

```bash
npm run build
```

Expected output:
```
✓ built in XXXms
✓ No errors
```

### 2. Visual Regression Test

Check these areas:
- [ ] Theme colors (success/warning/error/info)
- [ ] Dark mode toggle
- [ ] Typography scales
- [ ] Spacing consistency
- [ ] Border radius
- [ ] Shadows

### 3. Performance Test

**Before migration:**
```bash
npm run build
# Time: ~5000ms
```

**After migration (expected):**
```bash
npm run build
# Time: ~1000ms (5x faster)
```

---

## Compatibility Notes

### Browser Requirements

**Tailwind v4 requires:**
- Safari 16.4+
- Chrome 111+
- Firefox 128+

**Reason:** Uses modern CSS features:
- `@property`
- `color-mix()`
- Native cascade layers
- Wide-gamut colors (oklch)

### If You Need Older Browser Support

**Option 1:** Stay on v3
```bash
npm install tailwindcss@3.4.17
```

**Option 2:** Wait for compatibility mode
- Tailwind team is working on compatibility mode
- Expected in future release

---

## Troubleshooting

### Issue 1: Config Not Detected

**Error:**
```
Tailwind CSS not finding configuration
```

**Solution:**
```css
/* Explicitly load config */
@config "../../tailwind.config.js";
@import "tailwindcss";
```

### Issue 2: CSS Variables Not Working

**Problem:** Using `theme()` function

**Before:**
```css
.my-class {
  background: theme(colors.red.500);
}
```

**After:**
```css
.my-class {
  background: var(--color-red-500);
}
```

### Issue 3: Safelist Not Working

**Problem:** Safelist in JS config

**Solution:** Use `@source inline()`:
```css
@source inline('[href="#safelist"]') {
  bg-success-background
  text-success-foreground
}
```

### Issue 4: Dark Mode Not Switching

**Problem:** Old className strategy

**Before:**
```javascript
darkMode: 'class'
```

**After:**
```css
/* Dark mode via data attribute */
[data-theme="dark"] {
  --color-bg: #000;
}
```

---

## Rollback Plan

If migration causes issues:

### Quick Rollback (Keep JS Config)

```css
/* app.css */
@config "../../tailwind.config.js";
@import "tailwindcss";
```

### Full Rollback to v3

```bash
npm install tailwindcss@3.4.17 --save-dev
```

Restore old config files:
```bash
git checkout package.json
git checkout tailwind.config.js
git checkout postcss.config.js
```

---

## Next Steps

### Immediate (This Sprint)
- [ ] Review this migration guide
- [ ] Test v4 in development branch
- [ ] Run visual regression tests
- [ ] Measure build performance
- [ ] Update team documentation

### Short-term (Next 2 weeks)
- [ ] Migrate to @theme directive
- [ ] Update safelist to @source inline()
- [ ] Remove tailwind.config.js
- [ ] Train team on new workflow
- [ ] Deploy to staging

### Long-term
- [ ] Monitor browser compatibility
- [ ] Optimize theme variables
- [ ] Leverage new v4 features:
  - Container queries
  - `@starting-style`
  - Wide-gamut colors (oklch)
  - Native cascade layers

---

## Resources

### Official Documentation
- **Main Docs:** https://tailwindcss.com/docs
- **Upgrade Guide:** https://tailwindcss.com/docs/upgrade-guide
- **Theme Guide:** https://tailwindcss.com/docs/theme
- **Blog Post:** https://tailwindcss.com/blog/tailwindcss-v4-beta

### Community Resources
- **GitHub Discussions:** https://github.com/tailwindlabs/tailwindcss/discussions
- **Discord:** https://tailwindcss.com/discord
- **Stack Overflow:** [tailwindcss-v4] tag

### Tools
- **Upgrade Tool:** `npx @tailwindcss/upgrade`
- **Playground:** https://play.tailwindcss.com/

---

## Summary

✅ **Tailwind v4 Breaking Changes:**
- JavaScript config deprecated
- CSS-first configuration is standard
- @theme directive replaces theme object
- 5x faster builds
- Modern browser requirements

⚠️ **Current Status:**
- tailwind.config.js still works with @config directive
- Recommended: Migrate to @theme in CSS
- Safelist needs migration to @source inline()

🚀 **Benefits:**
- Better performance (5x faster)
- Smaller bundle size
- No JavaScript runtime overhead
- Modern CSS features
- Better developer experience

**Decision:** Start migration planning. Test in development branch first.

---

**Last Updated:** February 10, 2026  
**Document Version:** 1.0  
**Review Status:** Approved for implementation
