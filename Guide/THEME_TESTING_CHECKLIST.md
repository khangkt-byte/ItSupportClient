# Theme Testing Checklist - Phase 2 Verification

**Server:** https://localhost:3002/  
**Date:** February 12, 2026  
**Status:** Ready for testing

---

## 🎯 Testing Objectives

1. ✅ Verify all 10 brand themes render correctly
2. ✅ Confirm brand-purple theme works (was broken before)
3. ✅ Check CSS variables injected properly
4. ✅ Test theme persistence (localStorage)
5. ✅ Verify no console errors
6. ✅ Check accessibility compliance

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
  - Elements (inspect CSS variables)
  - Application (check localStorage)
```

### Step 3: Login (if required)
```
Navigate to login page
Enter credentials
Access theme selector
```

---

## 🧪 Theme Testing Checklist

### Base Themes

#### Light Theme ☀️
- [ ] Open theme selector
- [ ] Select "Light"
- [ ] **Expected:** White background, dark text
- [ ] Check DevTools Console: No errors
- [ ] Check Elements → `<html>` → `data-theme="light"`
- [ ] Check CSS variables:
  ```css
  --color-success: #22c55e
  --color-error: #ef4444
  --color-warning: #f59e0b
  --color-info: #3b82f6
  ```
- [ ] **Result:** ✅ PASS / ❌ FAIL

#### Dark Theme 🌙
- [ ] Select "Dark"
- [ ] **Expected:** Dark background, light text
- [ ] Check `data-theme="dark"`
- [ ] Check CSS variables (lighter semantic colors):
  ```css
  --color-success: #4ade80
  --color-error: #f87171
  ```
- [ ] **Result:** ✅ PASS / ❌ FAIL

---

### Brand Themes (10 Total)

#### 1. brand-purple 💜 ⭐ (PREVIOUSLY BROKEN)
- [ ] Select "Purple" theme
- [ ] **Expected:** Purple primary color (#695CFE)
- [ ] **Critical Test:** UI elements should be purple
- [ ] Check `data-theme="brand-purple"`
- [ ] Check CSS variables in Elements tab:
  ```css
  --color-primary-50: #f5f3ff
  --color-primary-500: #695CFE
  --color-primary-950: #1e1b4b
  ```
- [ ] Check buttons, links, accents are purple
- [ ] Reload page → theme persists
- [ ] **Result:** ✅ PASS / ❌ FAIL
- [ ] **Notes:** _____________________________

#### 2. brand-red 🔴
- [ ] Select "Red" theme
- [ ] **Expected:** Red primary color (#ef4444)
- [ ] Check `data-theme="brand-red"`
- [ ] Check CSS variables:
  ```css
  --color-primary-500: #ef4444
  ```
- [ ] UI elements are red
- [ ] **Result:** ✅ PASS / ❌ FAIL

#### 3. brand-blue 🔵
- [ ] Select "Blue" theme
- [ ] **Expected:** Blue primary color (#3b82f6)
- [ ] Check `data-theme="brand-blue"`
- [ ] Check CSS variables:
  ```css
  --color-primary-500: #3b82f6
  ```
- [ ] UI elements are blue
- [ ] **Result:** ✅ PASS / ❌ FAIL

#### 4. brand-green 🟢
- [ ] Select "Green" theme
- [ ] **Expected:** Green primary color (#22c55e)
- [ ] Check `data-theme="brand-green"`
- [ ] Check CSS variables:
  ```css
  --color-primary-500: #22c55e
  ```
- [ ] UI elements are green
- [ ] **Result:** ✅ PASS / ❌ FAIL

#### 5. brand-orange 🟠
- [ ] Select "Orange" theme
- [ ] **Expected:** Orange primary color (#ea580c)
- [ ] Check `data-theme="brand-orange"`
- [ ] Check CSS variables:
  ```css
  --color-primary-500: #ea580c
  ```
- [ ] UI elements are orange
- [ ] **Result:** ✅ PASS / ❌ FAIL

#### 6. brand-teal 🟦
- [ ] Select "Teal" theme
- [ ] **Expected:** Teal primary color (#14b8a6)
- [ ] Check `data-theme="brand-teal"`
- [ ] Check CSS variables:
  ```css
  --color-primary-500: #14b8a6
  ```
- [ ] UI elements are teal
- [ ] **Result:** ✅ PASS / ❌ FAIL

#### 7. brand-indigo 🟪
- [ ] Select "Indigo" theme
- [ ] **Expected:** Indigo primary color (#6366f1)
- [ ] Check `data-theme="brand-indigo"`
- [ ] Check CSS variables:
  ```css
  --color-primary-500: #6366f1
  ```
- [ ] UI elements are indigo
- [ ] **Result:** ✅ PASS / ❌ FAIL

#### 8. brand-violet 🔮
- [ ] Select "Violet" theme
- [ ] **Expected:** Violet primary color (#a855f7)
- [ ] Check `data-theme="brand-violet"`
- [ ] Check CSS variables:
  ```css
  --color-primary-500: #a855f7
  ```
- [ ] UI elements are violet
- [ ] **Result:** ✅ PASS / ❌ FAIL

#### 9. brand-pink 🩷
- [ ] Select "Pink" theme
- [ ] **Expected:** Pink primary color (#ec4899)
- [ ] Check `data-theme="brand-pink"`
- [ ] Check CSS variables:
  ```css
  --color-primary-500: #ec4899
  ```
- [ ] UI elements are pink
- [ ] **Result:** ✅ PASS / ❌ FAIL

#### 10. brand-cyan 🔷
- [ ] Select "Cyan" theme
- [ ] **Expected:** Cyan primary color (#1e88ff)
- [ ] Check `data-theme="brand-cyan"`
- [ ] Check CSS variables:
  ```css
  --color-primary-500: #1e88ff
  ```
- [ ] UI elements are cyan
- [ ] **Result:** ✅ PASS / ❌ FAIL

---

## 🔍 Advanced Verification

### CSS Variable Injection Test

1. **Open DevTools → Elements**
2. **Select `<html>` element**
3. **Check Styles panel**
4. **Look for inline styles:**
   ```html
   <html data-theme="brand-purple" style="--color-primary-500: #695CFE; ...">
   ```
5. **Verify CSS variables match palettes.ts:**
   - [ ] All 11 primary tones present (50-950)
   - [ ] Semantic tokens present (success, error, warning, info)
   - [ ] Values exactly match palettes.ts

### localStorage Persistence Test

1. **Select brand-purple theme**
2. **Open DevTools → Application → Local Storage**
3. **Check key:** `theme`
4. **Expected value:** `"brand-purple"`
5. **Reload page (F5)**
6. **Verify:** Theme persists as purple
7. **Result:** ✅ PASS / ❌ FAIL

### Console Error Test

1. **Open DevTools → Console**
2. **Switch between all themes rapidly**
3. **Expected:** No errors, no warnings
4. **Check for:**
   - [ ] No "theme not found" errors
   - [ ] No CSS variable undefined warnings
   - [ ] No React errors
5. **Result:** ✅ PASS / ❌ FAIL

---

## 🎨 Visual Quality Test

### UI Components to Check

For each theme, verify these components render correctly:

#### Buttons
- [ ] Primary button uses theme color
- [ ] Hover state works
- [ ] Disabled state visible

#### Links
- [ ] Links use theme color
- [ ] Hover underline works

#### Badges/Tags
- [ ] Background uses theme color
- [ ] Text readable (contrast)

#### Form Elements
- [ ] Focus rings use theme color
- [ ] Validation states separate (success/error)

#### Cards/Panels
- [ ] Borders use theme color
- [ ] Headers styled properly

#### Icons
- [ ] Icon colors match theme
- [ ] Consistent styling

---

## ♿ Accessibility Test

### Contrast Check (DevTools)

1. **Right-click any text element**
2. **Inspect**
3. **Check computed contrast ratio**
4. **Expected:**
   - Normal text: ≥ 4.5:1 (WCAG AA)
   - Large text: ≥ 3:1 (WCAG AA)

### Screen Reader Test (Optional)

1. **Enable Windows Narrator** (Win+Ctrl+Enter)
2. **Navigate through themed UI**
3. **Verify:**
   - [ ] All elements announced
   - [ ] Theme change announced
   - [ ] No aria errors

---

## 📸 Screenshot Documentation

Take screenshots of:

1. **brand-purple theme** (proof it works now)
2. **All 10 brand themes** (grid view)
3. **DevTools showing CSS variables**
4. **localStorage showing persistence**

Save to: `Guide/screenshots/phase2-testing/`

---

## 🐛 Issue Reporting

If any theme fails, document:

### Issue Template

```markdown
**Theme:** [brand-purple]
**Issue:** [Description]
**Expected:** [What should happen]
**Actual:** [What actually happens]
**Console Errors:** [Copy any errors]
**Screenshots:** [Attach if helpful]
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]
```

---

## ✅ Final Verification

### All Tests Complete

- [ ] **12 themes tested** (light, dark, 10 brands)
- [ ] **brand-purple works** ⭐ (critical fix verified)
- [ ] **CSS variables injected** (all themes)
- [ ] **localStorage persistence** (tested)
- [ ] **No console errors** (verified)
- [ ] **Accessibility checks** (passed)
- [ ] **Visual quality** (good)
- [ ] **Screenshots taken** (documented)

### Summary

**Total Themes:** 12  
**Passed:** _____ / 12  
**Failed:** _____ / 12  
**Critical Issues:** _____  
**Minor Issues:** _____  

### Sign-off

**Tester:** _____________________  
**Date:** February 12, 2026  
**Status:** ✅ APPROVED / ⚠️ WITH WARNINGS / ❌ FAILED  
**Notes:** _____________________

---

## 🎉 Success Criteria

**Phase 2 is COMPLETE if:**

- ✅ All 12 themes render correctly
- ✅ brand-purple theme works (was broken)
- ✅ CSS variables properly injected
- ✅ Theme persistence via localStorage
- ✅ Zero console errors
- ✅ WCAG AA accessibility compliance
- ✅ Visual quality acceptable

**If all criteria met:**
```
🎊 PHASE 2 IMPLEMENTATION VERIFIED ✅
Ready for production deployment!
```

---

## 📚 Additional Resources

- **Theme System Implementation Guide:** [Guide/THEME_SYSTEM_IMPLEMENTATION_GUIDE.md](THEME_SYSTEM_IMPLEMENTATION_GUIDE.md)
- **Theme System Quick Reference:** [Ref/THEME_SYSTEM_QUICK_REFERENCE.md](../Ref/THEME_SYSTEM_QUICK_REFERENCE.md)
- **palettes.ts (SSOT):** [src/constants/palettes.ts](../src/constants/palettes.ts)

---

## Phase 2 Validation Objectives (Merged)

### Visual Regression
- [ ] Test all themes (light, dark, 10 brand themes)
- [ ] Verify semantic token colors match specifications
- [ ] Test Work Log status badges in each theme
- [ ] Capture baseline screenshots (optional)

### Performance Targets
- [ ] Theme change < 50ms (acceptable), < 10ms (excellent)
- [ ] CSS variable update < 5ms
- [ ] Total change time < 20ms

### Accessibility
- [ ] WCAG AA contrast for text and UI (>= 4.5:1 text, >= 3:1 UI)
- [ ] High contrast mode works (21:1)
- [ ] Keyboard navigation + focus visible
- [ ] Reduced motion preference respected

### Cross-Browser
- [ ] Chrome, Edge, Firefox, Safari
- [ ] Windows + macOS

---

## Phase 3 UAT Checklist (Merged)

### Pre-Test Setup
- [ ] Dev server running
- [ ] Admin login available
- [ ] Theme testing page accessible
- [ ] DevTools open (Console + Elements)

### Theme Validation
- [ ] Light theme: white background, dark text
- [ ] Dark theme: dark background, light text
- [ ] Brand themes: primary color matches palette
- [ ] High contrast mode: pure black/white

### Performance
- [ ] No flicker during theme switch
- [ ] No UI lag
- [ ] Theme persists after refresh

### Documentation
- [ ] Record issues found
- [ ] Confirm fixes or open tickets

---

**Happy Testing! 🚀**
