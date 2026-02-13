# Theme Testing Checklist - Combinatorial Theming System

**Architecture:** Option A - Appearance (Light/Dark/Auto) + Brand Color (Independent)  
**Date:** February 13, 2026  
**Status:** Ready for testing

---

## 🎯 Testing Objectives

1. ✅ Verify combinatorial theming (Appearance × Brand Color)
2. ✅ Test all 3 appearance modes (Light, Dark, Auto)
3. ✅ Test all 11 brand colors (Default + 10 brands)
4. ✅ Verify CSS attributes (`data-appearance`, `data-brand`)
5. ✅ Check CSS variables injected properly
6. ✅ Test theme persistence (localStorage)
7. ✅ Verify no console errors
8. ✅ Check accessibility compliance

---

## 📋 Pre-Testing Setup

### Step 1: Open Browser
```
URL: https://localhost:3002/
Browser: Chrome/Edge (recommended for DevTools)
```

### Step 2: Open Developer Tools
```
Press: F12 or Ctrl+Shift+I
Tabs needed:
  - Console (check for errors)
  - Elements (inspect CSS variables and attributes)
  - Application (check localStorage)
```

### Step 3: Login (if required)
```
Navigate to login page
Enter credentials
Access theme selector
```

---

## 🧪 Part 1: Appearance Testing (Light/Dark/Auto)

### 1.1 Light Appearance ☀️

**Steps:**
- [ ] Open theme selector
- [ ] Click "Light" in Appearance section
- [ ] Ensure Brand Color is set to "Default"

**Expected Results:**
- [ ] White/light background, dark text
- [ ] Check DevTools Console: No errors
- [ ] Check Elements → `<html>`:
  - `data-appearance="light"` ✅
  - `data-brand="default"` ✅
  - `data-theme="light"` (legacy) ✅
- [ ] Check localStorage:
  - `appearance: "light"` ✅
  - `brandColor: "default"` ✅

**CSS Variables (Semantic Tokens - Light Mode):**
```css
--color-success: #22c55e
--color-error: #ef4444
--color-warning: #f59e0b
--color-info: #3b82f6
--color-background: #ffffff
--color-foreground: #111827
```

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** _____________________________

---

### 1.2 Dark Appearance 🌙

**Steps:**
- [ ] Click "Dark" in Appearance section
- [ ] Ensure Brand Color is still "Default"

**Expected Results:**
- [ ] Dark background, light text
- [ ] Check Elements → `<html>`:
  - `data-appearance="dark"` ✅
  - `data-brand="default"` ✅
  - `data-theme="dark"` (legacy) ✅

**CSS Variables (Semantic Tokens - Dark Mode):**
```css
--color-success: #4ade80
--color-error: #f87171
--color-warning: #fbbf24
--color-info: #60a5fa
--color-background: #111827
--color-foreground: #f9fafb
```

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** _____________________________

---

### 1.3 Auto Appearance 🖥️

**Steps:**
- [ ] Click "Auto" in Appearance section
- [ ] Check that it follows system preference

**Expected Results:**
- [ ] Check Elements → `<html>`:
  - `data-appearance="light"` or `"dark"` (based on system) ✅
  - `data-brand="default"` ✅
- [ ] Open DevTools → Settings → Rendering
- [ ] Toggle "Emulate CSS media prefers-color-scheme: dark"
- [ ] Theme should switch automatically

**System Preference Test:**
- [ ] When system is light → appearance="light"
- [ ] When system is dark → appearance="dark"
- [ ] Auto icon (🖥️) should be visible in selector

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** _____________________________

---

## 🧪 Part 2: Brand Color Testing (11 Brands)

**Note:** Test each brand color in BOTH Light and Dark appearances

### 2.1 Default Brand Color (Neutral)

**Steps:**
- [ ] Set Appearance: Light
- [ ] Click "Default" in Brand Colors section

**Expected Results:**
- [ ] Neutral Indigo colors (#6366f1)
- [ ] Check `data-brand="default"` ✅
- [ ] Check `data-theme="light"` (legacy) ✅
- [ ] No `--color-primary-*` CSS variables (uses CSS fallback)
- [ ] Sidebar uses Indigo color

**Dark Mode Test:**
- [ ] Set Appearance: Dark
- [ ] Check `data-appearance="dark"` + `data-brand="default"` ✅
- [ ] Sidebar still uses Indigo (lighter tone)

**Result:** ✅ PASS / ❌ FAIL

---

### 2.2 Brand Purple 💜

**Light Mode:**
- [ ] Appearance: Light
- [ ] Brand Color: Purple
- [ ] Check `data-appearance="light"` + `data-brand="brand-purple"` ✅
- [ ] Check CSS variables:
  ```css
  --color-primary-50: #f5f3ff
  --color-primary-500: #695CFE
  --color-primary-950: #1e1b4b
  ```
- [ ] Primary buttons are purple
- [ ] Links are purple
- [ ] Sidebar logo/accents are purple

**Dark Mode:**
- [ ] Appearance: Dark
- [ ] Brand Color: Purple (same)
- [ ] Check `data-appearance="dark"` + `data-brand="brand-purple"` ✅
- [ ] Dark semantic tokens (success: #4ade80) ✅
- [ ] Purple brand colors still applied ✅
- [ ] Sidebar uses purple (lighter tone for dark mode)

**Persistence:**
- [ ] Reload page → Purple brand persists
- [ ] Appearance persists separately

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** _____________________________

---

### 2.3 Brand Red 🔴

**Combinatorial Test:**
- [ ] Light + Red: `data-appearance="light"` + `data-brand="brand-red"`
- [ ] Dark + Red: `data-appearance="dark"` + `data-brand="brand-red"`
- [ ] Check `--color-primary-500: #ef4444`
- [ ] Buttons/links are red in both modes

**Result:** ✅ PASS / ❌ FAIL

---

### 2.4 Brand Blue 🔵

**Combinatorial Test:**
- [ ] Light + Blue: Check primary color #3b82f6
- [ ] Dark + Blue: Same brand, different semantic tokens
- [ ] Check `data-brand="brand-blue"`

**Result:** ✅ PASS / ❌ FAIL

---

### 2.5 Brand Green 🟢

**Combinatorial Test:**
- [ ] Light + Green: Primary #22c55e
- [ ] Dark + Green: Same primary, light semantic tokens
- [ ] Check `data-brand="brand-green"`

**Result:** ✅ PASS / ❌ FAIL

---

### 2.6 Brand Orange 🟠

**Combinatorial Test:**
- [ ] Light + Orange: Primary #f97316
- [ ] Dark + Orange: Same brand palette applies
- [ ] Check `data-brand="brand-orange"`
- [ ] Sidebar uses orange

**Result:** ✅ PASS / ❌ FAIL

---

### 2.7 Brand Teal 🟦

**Combinatorial Test:**
- [ ] Light + Teal: Primary #14b8a6
- [ ] Dark + Teal: Check color adaptation
- [ ] Check `data-brand="brand-teal"`

**Result:** ✅ PASS / ❌ FAIL

---

### 2.8 Brand Indigo 🟣

**Combinatorial Test:**
- [ ] Light + Indigo: Primary #6366f1
- [ ] Dark + Indigo: Same as default but as brand
- [ ] Check `data-brand="brand-indigo"`

**Result:** ✅ PASS / ❌ FAIL

---

### 2.9 Brand Violet 💟

**Combinatorial Test:**
- [ ] Light + Violet: Primary #8b5cf6
- [ ] Dark + Violet: Check color consistency
- [ ] Check `data-brand="brand-violet"`

**Result:** ✅ PASS / ❌ FAIL

---

### 2.10 Brand Pink 🩷

**Combinatorial Test:**
- [ ] Light + Pink: Primary #ec4899
- [ ] Dark + Pink: Check UI elements
- [ ] Check `data-brand="brand-pink"`

**Result:** ✅ PASS / ❌ FAIL

---

### 2.11 Brand Cyan 🩵

**Combinatorial Test:**
- [ ] Light + Cyan: Primary #06b6d4
- [ ] Dark + Cyan: Check semantic + brand separation
- [ ] Check `data-brand="brand-cyan"`

**Result:** ✅ PASS / ❌ FAIL

---

## 🧪 Part 3: Combinatorial Permutations (Critical)

**Test Matrix:** 3 Appearances × 11 Brand Colors = 33 combinations

### High Priority Combinations:

| # | Appearance | Brand Color | data-appearance | data-brand | Expected Primary |
|---|------------|-------------|-----------------|------------|------------------|
| 1 | Light | Default | light | default | #6366f1 (Indigo fallback) |
| 2 | Dark | Default | dark | default | #818cf8 (Indigo lighter) |
| 3 | Light | Purple | light | brand-purple | #695CFE |
| 4 | Dark | Purple | dark | brand-purple | #695CFE |
| 5 | Auto (Light) | Orange | light | brand-orange | #f97316 |
| 6 | Auto (Dark) | Orange | dark | brand-orange | #f97316 |

**Test Each Row:**
- [ ] Row 1: ✅ PASS / ❌ FAIL
- [ ] Row 2: ✅ PASS / ❌ FAIL
- [ ] Row 3: ✅ PASS / ❌ FAIL ⭐ (Previously broken)
- [ ] Row 4: ✅ PASS / ❌ FAIL ⭐ (Critical fix)
- [ ] Row 5: ✅ PASS / ❌ FAIL
- [ ] Row 6: ✅ PASS / ❌ FAIL

---

## 🧪 Part 4: Persistence Testing

### 4.1 localStorage Verification

**Steps:**
- [ ] Set Appearance: Dark
- [ ] Set Brand Color: Purple
- [ ] Open DevTools → Application → Local Storage
- [ ] Check keys:
  ```javascript
  appearance: "dark"
  brandColor: "brand-purple"
  theme: "brand-purple" // Legacy
  ```

**Reload Test:**
- [ ] Hard reload (Ctrl+Shift+R)
- [ ] Appearance stays Dark ✅
- [ ] Brand Color stays Purple ✅
- [ ] Both attributes present on `<html>` ✅

**Result:** ✅ PASS / ❌ FAIL

---

### 4.2 Cross-Tab Sync

**Steps:**
- [ ] Open two tabs with the app
- [ ] Tab 1: Change appearance to Dark
- [ ] Tab 2: Should update automatically
- [ ] Tab 1: Change brand to Red
- [ ] Tab 2: Should update to Red

**Result:** ✅ PASS / ❌ FAIL

---

## 🧪 Part 5: Performance Testing

### 5.1 Theme Switch Speed

**Expected Performance (After Optimization):**
- Target: <50ms total
- CSS Update: <25ms
- Theme Change: <20ms

**Test:**
- [ ] Open DevTools → Performance
- [ ] Toggle Dark ↔ Light multiple times
- [ ] Check flame chart for theme operations
- [ ] Look for console warnings: "Theme change took Xms"
- [ ] Should be <50ms per switch

**Results:**
- [ ] Light → Dark: _____ ms
- [ ] Dark → Light: _____ ms
- [ ] Performance: ✅ <50ms / ⚠️ 50-100ms / ❌ >100ms

**Notes:** _____________________________

---

### 5.2 Brand Color Switch Speed

**Test:**
- [ ] Switch between brand colors rapidly
- [ ] Check console for performance warnings
- [ ] Should feel instant (<50ms)

**Result:** ✅ PASS / ❌ FAIL

---

## 🧪 Part 6: CSS Variables Inspection

### 6.1 Semantic Tokens (Appearance-based)

**Light Appearance:**
```css
:root[data-appearance="light"] {
  --color-success: #22c55e;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  --color-info: #3b82f6;
}
```

**Dark Appearance:**
```css
:root[data-appearance="dark"] {
  --color-success: #4ade80;
  --color-error: #f87171;
  --color-warning: #fbbf24;
  --color-info: #60a5fa;
}
```

**Verification:**
- [ ] In Light mode, check computed `--color-success` = #22c55e
- [ ] In Dark mode, check computed `--color-success` = #4ade80
- [ ] Semantic tokens change with appearance ✅

---

### 6.2 Brand Palette (Brand-based)

**Purple Brand:**
```css
:root[data-brand="brand-purple"] {
  --color-primary-50: #f5f3ff;
  --color-primary-500: #695CFE;
  --color-primary-950: #1e1b4b;
  /* ... 11 tones total */
}
```

**Verification:**
- [ ] Select Purple brand in Light mode
- [ ] Check `--color-primary-500` = #695CFE ✅
- [ ] Switch to Dark appearance
- [ ] Check `--color-primary-500` still #695CFE ✅ (brand persists)
- [ ] But `--color-success` changed ✅ (semantic updated)

---

### 6.3 CSS Fallback Pattern (Sidebar)

**Default Brand:**
```css
/* When data-brand="default", no --color-primary-* variables set */
/* Sidebar CSS uses fallback: */
--sidebar-color-logo: var(--color-primary-500, #6366f1);
/* Falls back to Indigo */
```

**Purple Brand:**
```css
/* When data-brand="brand-purple", --color-primary-500 exists */
--sidebar-color-logo: var(--color-primary-500, #6366f1);
/* Uses brand purple #695CFE */
```

**Verification:**
- [ ] Default brand → Sidebar is Indigo (#6366f1) ✅
- [ ] Purple brand → Sidebar is Purple (#695CFE) ✅
- [ ] CSS fallback working correctly ✅

---

## 🧪 Part 7: Accessibility Testing

### 7.1 Keyboard Navigation

**Test:**
- [ ] Open theme selector with keyboard (Tab)
- [ ] Navigate appearance options with Arrow keys
- [ ] Select with Enter/Space
- [ ] Navigate brand colors with Tab
- [ ] All focusable elements have visible focus ring

**Result:** ✅ PASS / ❌ FAIL

---

### 7.2 Screen Reader

**Test:**
- [ ] Enable NVDA/JAWS
- [ ] Navigate to theme selector
- [ ] Appearance options announced correctly
- [ ] Brand color options announced with color names
- [ ] Current selection state announced

**Result:** ✅ PASS / ❌ FAIL

---

### 7.3 Reduced Motion

**Test:**
- [ ] Enable Windows Settings → Accessibility → Reduce Motion
- [ ] Switch themes
- [ ] No transition animations should occur
- [ ] Check CSS: `transition-duration: 0ms !important`

**Result:** ✅ PASS / ❌ FAIL

---

### 7.4 High Contrast Mode

**Test:**
- [ ] Enable Windows High Contrast Mode
- [ ] App should respect system colors
- [ ] Theme selector still functional
- [ ] Check `data-a11y` attribute updates

**Result:** ✅ PASS / ❌ FAIL

---

## 🧪 Part 8: Edge Cases

### 8.1 Invalid localStorage Data

**Test:**
- [ ] Open DevTools → Application → localStorage
- [ ] Set `appearance` to invalid value: "invalid"
- [ ] Reload page
- [ ] Should fallback to "auto" or "light"
- [ ] No crashes or console errors

**Result:** ✅ PASS / ❌ FAIL

---

### 8.2 Missing localStorage

**Test:**
- [ ] Clear all localStorage
- [ ] Reload page
- [ ] Should initialize with defaults:
  - Appearance: "auto"
  - Brand Color: "default"
- [ ] Works correctly

**Result:** ✅ PASS / ❌ FAIL

---

### 8.3 System Preference Change (Auto mode)

**Test:**
- [ ] Set Appearance: Auto
- [ ] Open Windows Settings → Personalization → Colors
- [ ] Change "Choose your mode" Light ↔ Dark
- [ ] App should update automatically
- [ ] Check media query listener working

**Result:** ✅ PASS / ❌ FAIL

---

## 📊 Summary Checklist

### Architecture Verification

- [ ] **Option A Implemented:** Appearance + Brand Color independent ✅
- [ ] **DOM Attributes Correct:**
  - `data-appearance` (light/dark) ✅
  - `data-brand` (default/brand-*) ✅
  - `data-theme` (legacy) ✅
- [ ] **CSS Selectors Work:**
  - `:root[data-appearance="dark"]` ✅
  - `:root[data-brand="brand-purple"]` ✅
  - Both can match simultaneously ✅

### Functional Requirements

- [ ] All 3 appearance modes work (Light/Dark/Auto)
- [ ] All 11 brand colors work (Default + 10 brands)
- [ ] Dark mode + Brand colors work together (33 combinations)
- [ ] Persistence working (localStorage)
- [ ] Cross-tab synchronization working
- [ ] System preference respected (Auto mode)

### Performance Requirements

- [ ] Theme switching <50ms
- [ ] No layout thrashing
- [ ] GPU acceleration active (will-change)
- [ ] requestAnimationFrame batching working
- [ ] Performance monitoring in console (dev mode)

### Accessibility Requirements

- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Reduced motion respected
- [ ] High contrast mode compatible
- [ ] Focus indicators visible

### Browser Compatibility

- [ ] Chrome/Edge (Chromium): ✅ PASS / ❌ FAIL
- [ ] Firefox: ✅ PASS / ❌ FAIL
- [ ] Safari: ✅ PASS / ❌ FAIL

---

## 🐛 Known Issues Log

**Issue Template:**
```
Issue #X: [Title]
Severity: Critical / High / Medium / Low
Steps to Reproduce:
1. 
2. 
Expected: 
Actual: 
Browser: 
Screenshot: 
```

**Logged Issues:**

_[No issues logged yet]_

---

## ✅ Sign-Off

**Tested By:** _____________________________  
**Date:** _____________________________  
**Overall Result:** ✅ PASS / ❌ FAIL  
**Ready for Production:** YES / NO

**Notes:**
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

---

## 📚 References

- **Architecture Decision:** Option A (Combinatorial)
- **Apple HIG Dark Mode:** https://developer.apple.com/design/human-interface-guidelines/dark-mode/
- **Material Design 3:** https://m3.material.io/styles/color/system/overview
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/
- **Chrome Performance:** https://web.dev/rendering-performance/
- **Implementation Guide:** `/Guide/THEME_SYSTEM_IMPLEMENTATION_GUIDE.md`
