# 🎨 Colors Quick Reference

**Bạn muốn thay đổi màu?** Làm theo hướng dẫn này.

---

## 🚀 Quick Start

### ✏️ Để Thay Đổi Một Màu

1. Mở `src/constants/palettes.ts`
2. Tìm color token bạn muốn thay:
   ```typescript
   export const defaultSemanticTokens = {
       success: '#22c55e',    // ← Sửa ở đây
       error: '#ef4444',
       warning: '#f59e0b',
       info: '#3b82f6',
   };
   ```
3. Thay đổi hex color
4. **Lưu file** (không cần rebuild!)
5. Reload trình duyệt (F5)

### Xong! ✅
Tất cả components sử dụng color đó sẽ tự động cập nhật.

---

## 📍 Các Loại Color

### Semantic Colors (Ý Nghĩa)
Dùng cho trạng thái & ý nghĩa:

```typescript
// Light mode
export const defaultSemanticTokens = {
    success: '#22c55e',    // ✅ Thành công (xanh)
    error: '#ef4444',      // ❌ Lỗi (đỏ)
    warning: '#f59e0b',    // ⚠️ Cảnh báo (cam)
    info: '#3b82f6',       // ℹ️ Thông tin (xanh dương)
    disabled: '#6b7280',   // 🚫 Tắt (xám)
};

// Dark mode (màu sáng hơn cho dark background)
export const darkSemanticTokens = {
    success: '#4ade80',    // Green-400
    error: '#f87171',      // Red-400
    warning: '#fbbf24',    // Amber-400
    info: '#60a5fa',       // Blue-400
    disabled: '#9ca3af',   // Gray-400
};
```

### Variant Colors (Biến Thể)
Dùng cho foreground/background/border:

```typescript
export const lightSemanticVariants = {
    // Success
    successForeground: '#166534',   // Dark green text
    successBackground: '#f0fdf4',   // Light green bg
    successBorder: '#bbf7d0',       // Light green border
    
    // Error
    errorForeground: '#991b1b',      // Dark red text
    errorBackground: '#fef2f2',      // Light red bg
    errorBorder: '#fecaca',          // Light red border
    
    // Warning
    warningForeground: '#92400e',    // Dark amber text
    warningBackground: '#fffbeb',    // Light amber bg
    warningBorder: '#fde68a',        // Light amber border
    
    // Info
    infoForeground: '#1e40af',       // Dark blue text
    infoBackground: '#eff6ff',       // Light blue bg
    infoBorder: '#bfdbfe',           // Light blue border
};
```

### Brand Colors (10 themes)
Mỗi brand có color palette riêng:

```typescript
// Ví dụ: Purple (mặc định)
'brand-purple': {
    primary: { 50, 100, 200, ... 950 },      // 11 tones
    secondary: { 50, 100, 200, ... 950 },
    neutral: { 50, 100, 200, ... 950 },
}

// Ví dụ: Red
'brand-red': {
    primary: { 50: '#fef2f2', ... 950: '#450a0a' },
    // ...
}

// Thêm 8 theme khác:
// brand-blue, brand-green, brand-orange, brand-teal
// brand-indigo, brand-violet, brand-pink, brand-cyan
```

### High Contrast Colors (WCAG AAA)
Cho chế độ accessibility:

```typescript
export const highContrastLightSemanticTokens = {
    success: '#000000',      // Pure black
    error: '#000000',
    warning: '#000000',
    info: '#000000',
    disabled: '#808080',     // Gray
};

export const highContrastDarkSemanticTokens = {
    success: '#ffffff',      // Pure white
    error: '#ffffff',
    warning: '#ffffff',
    info: '#ffffff',
    disabled: '#808080',     // Gray
};
```

---

## 🎯 Sử Dụng Trong Components

### Với Tailwind Utilities
```tsx
// ✅ Đúng - sử dụng semantic color
<div className="bg-success text-success-foreground border border-success-border">
    Thành công!
</div>

// ✅ Đúng - sử dụng variant
<div className="bg-error-background text-error-foreground">
    Lỗi
</div>

// ✅ Đúng - sử dụng brand color
<div className="bg-primary-500">
    Màu chủ đạo
</div>

// ❌ Sai - hardcoded color
<div className="bg-green-600 text-white">
    KHÔNG LÀM NHƯ THẾ
</div>
```

### Với CSS Variables
```tsx
// ✅ Đúng - sử dụng CSS variable
<div style={{ 
    backgroundColor: 'var(--color-success)',
    color: 'var(--color-success-foreground)'
}}>
    Thành công
</div>

// ❌ Sai - hardcoded hex
<div style={{ 
    backgroundColor: '#22c55e'  // KHÔNG
}}>
```

---

## 📊 Color Map

### Semantic → Tailwind Classes

```
palettes.ts                    Tailwind Class
┌──────────────────────────────────────────────┐
│ success: '#22c55e'        → .bg-success
│                           → .text-success
│                           → .border-success
│                           → .fill-success
│                           → .stroke-success
│
│ successForeground: '#166534' → .text-success-foreground
│ successBackground: '#f0fdf4' → .bg-success-background
│ successBorder: '#bbf7d0'     → .border-success-border
│
│ error: '#ef4444'          → .bg-error
│                           → .text-error
│                           → .border-error
│
│ errorForeground: '#991b1b' → .text-error-foreground
│ errorBackground: '#fef2f2' → .bg-error-background
│ errorBorder: '#fecaca'    → .border-error-border
│
│ warning, info, disabled   → tương tự
└──────────────────────────────────────────────┘
```

### Brand → Primary Colors

```
palettes.ts                    Tailwind Class
┌──────────────────────────────────────────────┐
│ primary[50]: '#f5f3ff'    → .bg-primary-50
│ primary[100]: '#ede9fe'   → .bg-primary-100
│ primary[500]: '#695CFE'   → .bg-primary-500 ⭐ (mặc định)
│ primary[900]: '#3730a3'   → .bg-primary-900
│
│ secondary[50]: '#f0fdf4'  → .bg-secondary-50
│ secondary[500]: '#22c55e' → .bg-secondary-500
│
│ neutral[50]: '#f9fafb'    → .bg-neutral-50
│ neutral[500]: '#6b7280'   → .bg-neutral-500
│ neutral[950]: '#030712'   → .bg-neutral-950
└──────────────────────────────────────────────┘
```

---

## 🔄 Các Trường Hợp Thông Dụng

### Trường Hợp 1: Làm Màu Success Sáng Hơn

**Trước**:
```typescript
success: '#22c55e'  // Green-500
```

**Sau**:
```typescript
success: '#10b981'  // Emerald-500 (sáng hơn)
```

**Lưu** → **Reload** → ✅ Tất cả `.bg-success`, `.text-success` cập nhật

---

### Trường Hợp 2: Thay Dark Mode Error Color

**Trước**:
```typescript
export const darkSemanticTokens = {
    error: '#f87171',  // Red-400
};
```

**Sau**:
```typescript
export const darkSemanticTokens = {
    error: '#fca5a5',  // Red-300 (nhạt hơn)
};
```

**Lưu** → **Reload với dark mode** → ✅ Màu error dark cập nhật

---

### Trường Hợp 3: Tạo Brand Theme Mới

1. Thêm vào `palettes.ts`:
```typescript
'brand-custom': {
    primary: {
        50: '#f5f3ff',
        100: '#ede9fe',
        // ... 11 tones
        950: '#1e1b4b',
    },
    secondary: { /* ... */ },
    neutral: neutralGray,
    semantic: defaultSemanticTokens,
}
```

2. Rebuild:
```bash
npm run build
```

3. Dùng:
```tsx
<ThemeSelector onSelectBrand="brand-custom" />
```

---

### Trường Hợp 4: Thêm Semantic Color Mới (ví dụ: premium)

1. Cập nhật `palettes.ts`:
```typescript
export interface SemanticTokens {
    success: string;
    error: string;
    warning: string;
    info: string;
    disabled: string;
    premium: string;  // ← THÊM
}

export const defaultSemanticTokens = {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    disabled: '#6b7280',
    premium: '#fbbf24',  // ← THÊM
};

export const darkSemanticTokens = {
    success: '#4ade80',
    // ...
    premium: '#f9a825',  // ← THÊM
};
```

2. Cập nhật `themeTokens.ts`:
```typescript
export function generateSemanticVars(...) {
    return {
        // ... existing
        '--color-premium': tokens.premium,  // ← THÊM
    };
}
```

3. Cập nhật `theme.css`:
```css
@theme {
    /* ... existing */
    --color-premium: #fbbf24;  // ← THÊM (build-time default)
}
```

4. Rebuild:
```bash
npm run build
```

5. Dùng:
```tsx
<div className="bg-premium">Premium Feature</div>
```

---

## 🚨 Những Điều CẤM

### ❌ KHÔNG Hardcode Hex Trong CSS
```css
/* ❌ SAI */
.success { color: #22c55e; }
```

### ❌ KHÔNG Sửa theme.css Trực Tiếp
```css
/* ❌ SAI - sẽ bị ghi đè lúc runtime */
:root {
    --color-success: #custom;
}
```

### ❌ KHÔNG Tạo Color Constants Duplicate
```typescript
/* ❌ SAI - tách SSOT */
const MY_SUCCESS = '#22c55e';
```

### ❌ KHÔNG Rebuild Cho Mỗi Color Change
```bash
# ❌ KHÔNG CẦN
npm run build

# ✅ ChỈ CẦN
F5  (reload trình duyệt)
```

---

## 🧪 Kiểm Tra Màu

### Browser Console
```javascript
// Xem giá trị runtime của color variable
getComputedStyle(document.documentElement)
    .getPropertyValue('--color-success')
    // Output: " #22c55e"

// Xem current theme
localStorage.getItem('brandColor')      // "brand-purple"
localStorage.getItem('appearance')      // "light" | "dark"

// Xem DOM attributes
document.documentElement.getAttribute('data-appearance')  // "light" | "dark"
document.documentElement.getAttribute('data-brand')       // theme name
```

### DevTools
1. F12 → Styles
2. Sau element → See `style="--color-*"`
3. Or Inspector → see Applied Styles

---

## ❓ FAQ

**Q: Tôi phải rebuild sau khi thay color không?**  
A: Không! Chỉ cần reload trình duyệt.

**Q: Colors tự động thay đổi lúc dark/light mode?**  
A: Có! `applyThemeTokens()` tự động gọi `darkSemanticTokens` hoặc `defaultSemanticTokens`.

**Q: Tôi có thể animate color change không?**  
A: Có! CSS custom properties hỗ trợ transition:
```css
html.theme-transition {
    transition: background-color 150ms ease;
}
```

**Q: Nếu localStorage xóa thì sao?**  
A: Fallback về system preference hoặc default "auto".

---

## 📚 Tài Liệu Chi Tiết

- [DYNAMIC_COLORS_RUNTIME.md](./DYNAMIC_COLORS_RUNTIME.md) - Architecture detail
- [SEMANTIC_COLORS_SSOT.md](./SEMANTIC_COLORS_SSOT.md) - Color system reference

---

## 🎯 TL;DR (Tóm Tắt)

| Tác Vụ | Nơi | Cách Làm |
|--------|-----|---------|
| Thay color | `palettes.ts` | Edit hex → Save → Reload |
| Thêm semantic color | `palettes.ts` + `themeTokens.ts` + `theme.css` | Edit → Build → Reload |
| Thêm brand theme | `palettes.ts` | Edit → Build |
| Dùng color | Component | `className="bg-success"` |
| Kiểm tra | DevTools | Check `--color-*` variables |

