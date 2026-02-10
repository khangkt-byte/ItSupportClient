# High Contrast Quick Reference

## 🎯 TL;DR - For Developers

### **Problem**
```css
/* ❌ OLD - Broken */
@media (prefers-contrast: more) {
  html[data-a11y="highContrast"] { /* ... */ }
}
```
→ Requires OS setting + app setting = **không hoạt động**

### **Solution**  
```css
/* ✅ NEW - Works immediately */
html[data-a11y="highContrast"] {
  forced-color-adjust: none;
  --color-text: #000000; /* Pure black */
  --color-bg: #FFFFFF;   /* Pure white */
  /* = 21:1 contrast (WCAG AAA++) */
}
```
→ User toggles in app = **instant effect**

---

## 📊 Standards Compliance

| Standard | Requirement | Our Implementation | Status |
|----------|-------------|-------------------|---------|
| WCAG 2.1 AA | 4.5:1 | 21:1 | ✅ Exceeds |
| WCAG 2.1 AAA | 7:1 | 21:1 | ✅ Exceeds |
| Microsoft Fluent | System colors | Implemented | ✅ |
| W3C Forced Colors | `forced-color-adjust` | Implemented | ✅ |

---

## 🏢 Sources - Industry Standards

### **Microsoft (Fluent UI)**
https://learn.microsoft.com/en-us/fluent-ui/web-components/design-system/high-contrast

**Key Points:**
- Use `forced-color-adjust: none`
- Use System Colors: `Canvas`, `CanvasText`, `ButtonFace`
- Test with Windows High Contrast

### **W3C (Web Standards)**
https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html

**Requirements:**
- AA: 4.5:1 (minimum)
- AAA: 7:1 (enhanced)
- Optimal: 21:1 (pure black/white)

### **Google Chrome / Microsoft Edge**
https://blogs.windows.com/msedgedev/2020/09/17/styling-for-windows-high-contrast-with-new-standards-for-forced-colors/

**New Standards (2020+):**
```css
@media (forced-colors: active) {
  /* Use system colors */
  background: Canvas;
  color: CanvasText;
}
```

---

## 🧪 Testing

### **App Toggle Test**
1. Open sidebar
2. Click "High Contrast"
3. ✅ **Expect:** Instant black/white

### **Windows High Contrast Test**
1. `Win + U` → High contrast → ON
2. ✅ **Expect:** System colors applied

### **Contrast Verification**
```bash
# Chrome DevTools
Right-click → Inspect → Accessibility → Contrast ratio
# Expected: ✅ Green checkmark (WCAG AAA)
```

---

## 📝 Code Reference

### **Current Implementation**
File: [`src/index.css`](src/index.css#L50-L130)

```css
/* App-controlled (user choice) */
html[data-a11y="highContrast"] {
  forced-color-adjust: none;
  --color-text-primary: #000000;
  --color-bg-primary: #ffffff;
}

/* Dark mode variant */
html[data-a11y="highContrast"][data-theme*="dark"] {
  --color-text-primary: #ffffff;
  --color-bg-primary: #000000;
}

/* System forced-colors (Windows) */
@media (forced-colors: active) {
  html { background: Canvas; color: CanvasText; }
}
```

### **Hook Usage**
File: [`src/lib/hooks/useTheme.ts`](src/lib/hooks/useTheme.ts)

```typescript
const { accessibilityMode, setAccessibilityMode } = useTheme();

// Toggle high contrast
setAccessibilityMode('highContrast'); // ✅ Works immediately
setAccessibilityMode('default');      // Back to normal
```

---

## 🎓 Learn More

**Complete Guide:** [HIGH_CONTRAST_IMPLEMENTATION.md](HIGH_CONTRAST_IMPLEMENTATION.md)

**Topics Covered:**
- Technical details
- Industry standards comparison  
- Testing guide
- Accessibility compliance
- Best practices

---

## ✅ Checklist for New Features

When adding UI components:

- [ ] Test with `html[data-a11y="highContrast"]`
- [ ] Verify contrast ratio ≥ 4.5:1 (AA minimum)
- [ ] Check dark mode variant
- [ ] Test with Windows High Contrast
- [ ] Validate with Chrome DevTools accessibility panel

---

**Last Updated:** February 10, 2026  
**Status:** ✅ Production Ready
