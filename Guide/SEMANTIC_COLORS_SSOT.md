# Semantic Color System - Single Source of Truth (SSOT)

## 📋 Tổng quan

**Toàn bộ hệ thống màu của dự án được centralize trong một single source: `src/constants/palettes.ts`**

Tailwind CSS v4 tự động sinh `utility classes` từ các `@theme` definitions, loại bỏ hoàn toàn hardcoded colors.

---

## 🏗️ Architecture Flow

```
src/constants/palettes.ts (SSOT)
    ├─ defaultSemanticTokens (light mode)
    ├─ darkSemanticTokens (dark mode)
    ├─ lightSemanticVariants (light variants: foreground, background, border)
    ├─ darkSemanticVariants (dark variants: foreground, background, border)
    ├─ highContrastLightSemanticTokens
    ├─ highContrastDarkSemanticTokens
    └─ ...variants
         ↓
    scripts/generateThemeCSS.js
         ↓
    src/styles/generated-themes.css
    (Auto-generated CSS variables for all modes)
         ↓
    src/styles/theme.css (@theme block with light mode base)
         ↓
    Tailwind CSS v4
         ↓
    Automatic utility generation:
    .bg-success, .text-success, .border-success
    .bg-success-background, .text-success-foreground
    .bg-error, .text-error, ... và tất cả variants
```

---

## 📝 Semantic Color Tokens Defined in `palettes.ts`

### Light Mode (Default)
```typescript
export const defaultSemanticTokens: SemanticTokens = {
    success: '#22c55e',    // Green-500
    error: '#ef4444',      // Red-500
    warning: '#f59e0b',    // Amber-500
    info: '#3b82f6',       // Blue-500
    disabled: '#6b7280',   // Gray-500
};

export const lightSemanticVariants: SemanticVariantTokens = {
    successForeground: '#166534',      // green-800 (text on light bg)
    successBackground: '#f0fdf4',      // green-50 (light bg)
    successBorder: '#bbf7d0',          // green-200 (border)
    // ... error, warning, info variants
};
```

### Dark Mode
```typescript
export const darkSemanticTokens: SemanticTokens = {
    success: '#4ade80',    // Green-400 (lighter for dark mode)
    error: '#f87171',      // Red-400
    warning: '#fbbf24',    // Amber-400
    info: '#60a5fa',       // Blue-400
    disabled: '#9ca3af',   // Gray-400
};

export const darkSemanticVariants: SemanticVariantTokens = {
    successForeground: '#bbf7d0',           // green-200
    successBackground: 'rgba(34, 197, 94, 0.2)',  // 20% opacity
    successBorder: 'rgba(34, 197, 94, 0.3)',      // 30% opacity
    // ... error, warning, info variants
};
```

### High Contrast Mode
```typescript
export const highContrastLightSemanticTokens: SemanticTokens = {
    success: '#000000',    // Pure black (21:1 contrast)
    error: '#000000',
    warning: '#000000',
    info: '#000000',
    disabled: '#808080',   // Gray
};

export const highContrastDarkSemanticTokens: SemanticTokens = {
    success: '#ffffff',    // Pure white (21:1 contrast)
    error: '#ffffff',
    warning: '#ffffff',
    info: '#ffffff',
    disabled: '#808080',   // Gray
};
```

---

## 🎨 Generated Utilities

Tailwind **tự động sinh** các utilities theo pattern:
- Từ `--color-success`: `bg-success`, `text-success`, `border-success`, `fill-success`, `stroke-success`
- Từ `--color-success-background`: `bg-success-background`
- Từ `--color-success-foreground`: `text-success-foreground`
- Từ `--color-success-border`: `border-success-border`

**Ví dụ HTML:**
```html
<!-- Success component -->
<div class="bg-success-background text-success-foreground border border-success">
  ✅ Operation successful!
</div>

<!-- Error state -->
<div class="bg-error-background text-error-foreground border border-error">
  ❌ Error occurred
</div>

<!-- Using opacity modifiers -->
<div class="bg-success/10">Light success tint</div>
<div class="bg-success/50">50% opacity</div>
```

---

## 🔧 Cấu trúc CSS - Cách hoạt động

### 1. **`src/styles/theme.css` - Light Mode Base (@theme block)**
```css
@theme {
  /* Light mode defaults defined here */
  --color-success: #22c55e;
  --color-success-foreground: #166534;
  --color-success-background: #f0fdf4;
  --color-success-border: #bbf7d0;
  /* ... + error, warning, info variants */
}
```

### 2. **`src/styles/generated-themes.css` - Auto-generated overrides**
```css
/* Dark mode overrides */
:root[data-appearance="dark"] {
  --color-success: #4ade80;      /* Lighter for readability */
  --color-success-foreground: #bbf7d0;
  --color-success-background: rgba(34, 197, 94, 0.2);  /* Semi-transparent */
  --color-success-border: rgba(34, 197, 94, 0.3);
  /* ... + all other variants */
}

/* High Contrast Light Mode */
html[data-a11y="highContrast"] {
  --color-success: #000000;      /* Pure black - 21:1 contrast */
  /* ... */
}

/* High Contrast Dark Mode */
html[data-a11y="highContrast"][data-appearance="dark"] {
  --color-success: #ffffff;      /* Pure white - 21:1 contrast */
  /* ... */
}
```

### 3. **`src/index.css` - NO manual utilities**
❌ Không còn có:
```css
/* OLD - REMOVED ❌ */
@layer utilities {
  .text-success { color: var(--color-success); }
  .bg-success-background { background-color: var(--color-success-background); }
}
```

✅ Tailwind sinh tất cả automatically từ `@theme`

---

## 🚀 Workflow: Cách thay đổi màu

### Thay đổi màu từ A → Z

**Bước 1: Editor `src/constants/palettes.ts`**
```typescript
export const defaultSemanticTokens: SemanticTokens = {
    success: '#22c55e',  // ← Thay đổi giá trị ở đây
    error: '#ef4444',
    // ...
};
```

**Bước 2: Generate CSS từ TypeScript**
```bash
npm run generate:themes
```

**Bước 3: Verify & Build**
```bash
npm run lint:colors    # Kiểm tra 0 hardcoded colors
npm run build          # Build project
```

**Done!** ✅ Màu tự động update everywhere:
- CSS variables
- Tailwind utilities  
- All themes (light, dark, HC light, HC dark)
- All components

---

## ✅ SSOT Principles - Quy tắc

### 1. **Palette is Source of Truth**
- ✅ Thay đổi trong `palettes.ts`
- ❌ Không hardcode màu trong `.tsx` hay `.css`
- ❌ Không define utilities manually

### 2. **Auto-generation is mandatory**
- Chạy `npm run generate:themes` sau khi update `palettes.ts`
- `generated-themes.css` KHÔNG EDIT manually
- `theme.css @theme` block = light mode base only

### 3. **Build pipeline enforces SSOT**
```bash
npm run build → validate:themes → generate:themes → vite build
                                                     ↓
                               Kiểm tra lint:colors (0 violations)
```

### 4. **Mode variants are hierarchical**
```
Light Mode (default in @theme)
    ↓
Dark Mode (override in generated-themes.css)
    ↓
High Contrast Light (override in generated-themes.css)
    ↓
High Contrast Dark (override in generated-themes.css)
```

---

## 🎯 Best Practices vs Tailwind v4

| Aspect | ✅ Make | ❌ Don't |
|--------|---------|---------|
| **Define colors** | `palettes.ts` | CSS files, components |
| **Update colors** | Edit `palettes.ts` → `npm run generate:themes` | Hardcode values |
| **Use in HTML** | `.bg-success`, `.text-success` | `.bg-[#22c55e]` |
| **Variants** | Use defined tokens | Create custom utils |
| **Export** | Semantic names: `success`, `error` | RGB values |
| **Testing** | Change in one place | Multiple edits |

---

## 📊 Current Color Coverage

### Base Semantic Colors (All modes)
- ✅ Success → `#22c55e` (light), `#4ade80` (dark), `#000000` (HC light)
- ✅ Error → `#ef4444` (light), `#f87171` (dark), `#000000` (HC light)
- ✅ Warning → `#f59e0b` (light), `#fbbf24` (dark), `#000000` (HC light)
- ✅ Info → `#3b82f6` (light), `#60a5fa` (dark), `#000000` (HC light)
- ✅ Disabled → `#6b7280` (light), `#9ca3af` (dark), `#808080` (HC)

### Variant Tokens
- ✅ Foreground (text color)
- ✅ Background (light/semi-transparent tint)
- ✅ Border (outline color)

### Themes
- ✅ 10 Brand themes (brand-purple, brand-red, brand-blue, etc.)
- ✅ 4 Appearance modes (light, dark, HC light, HC dark)
- ✅ Combinatorial theming: brand + appearance = independent

---

## 🔗 References

- [Tailwind CSS v4 Theme Documentation](https://tailwindcss.com/docs/theme)
- [Material Design 3 Color System](https://m3.material.io/styles/color/the-color-system/color-roles)
- [Design Tokens Standard (W3C)](https://design-tokens.github.io/community-group/format/)
- [WCAG 2.1 Contrast Requirements](https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html)

---

## 📌 Cheat Sheet

**View current semantic tokens:**
```bash
# Inspect palettes.ts
grep -A 5 "defaultSemanticTokens" src/constants/palettes.ts

# Check generated CSS
cat src/styles/generated-themes.css | grep "color-success"
```

**Test color linting:**
```bash
npm run lint:colors  # Should show: ✅ No hardcoded colors found!
```

**Rebuild colors:**
```bash
npm run generate:themes && npm run build
```

**Check build sizes:**
```bash
du -sh build/assets/
# Should stay ~150KB CSS (semantic tokens = negligible overhead)
```

---

## ❓ FAQ

**Q: Tại sao không hardcode trong `@theme` block?**
A: Để dễ maintain. Nếu đổi color scheme, chỉ edit `palettes.ts` 1 chỗ.

**Q: `generated-themes.css` tại sao auto-generated?**
A: Vì dark mode variants complex (semi-transparent), không thể hardcode. Script tự generate từ `palettes.ts`.

**Q: Có thể dùng `.bg-success/10` (opacity)?**
A: Có! Tailwind hỗ trợ. `.bg-success/10` = 10% opacity của `--color-success`.

**Q: Khác nhau giữa `--color-success` vs `--color-success-background`?**
A: 
- `--color-success`: Base color (để dùng cho icon, accent)
- `--color-success-background`: Tinted background (nhạt hơn, dùng cho alert bg)

---

**Version**: Tailwind CSS v4.1.18  
**Last Updated**: 2026-02-13  
**Status**: ✅ SSOT Fully Implemented
