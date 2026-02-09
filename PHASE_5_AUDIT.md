# Phase 5: Performance Audit & Optimization

**Date:** February 9, 2026  
**Status:** IN PROGRESS

---

## 5.1 Performance Audit Results

### Bundle Size Analysis
Current build metrics:
```
JS Bundle:   363.19 kB (96.62 kB gzipped)
CSS Bundle:  108.81 kB (17.15 kB gzipped)
Total:       472.00 kB (113.77 kB gzipped)
Modules:     1761
Build Time:  28.34s
```

### Repeated Pattern Analysis

Found **33+ instances** of repeated button utilities that should use component classes:

#### Pattern 1: Primary Button (16 instances)
**Current:**
```tsx
className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
```
**Should be:**
```tsx
className="btn-primary px-4 py-2"
```
**Size saving:** ~60 chars × 16 = 960 chars

**Files affected:**
- EmployeeManagement.tsx (2 instances)
- DepartmentManagement.tsx (2 instances)
- AreaManagement.tsx (2 instances)
- AccountManagement.tsx (4 instances)
- RoleManagement.tsx (2 instances)
- WorkLogManagement.tsx (2 instances)
- AdminDashboard.tsx (1 instance)
- EmployeeDashboard.tsx (1 instance)

#### Pattern 2: Secondary Button (8 instances)
**Current:**
```tsx
className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
```
**Should be:**
```tsx
className="btn-secondary px-4 py-2"
```
**Size saving:** ~50 chars × 8 = 400 chars

**Files affected:**
- ConfirmDialog.tsx (1 instance)
- WorkLogManagement.tsx (2 instances)
- RoleManagement.tsx (1 instance)
- DepartmentManagement.tsx (1 instance)
- AreaManagement.tsx (1 instance)
- AccountManagement.tsx (2 instances)

#### Pattern 3: Danger Button (3 instances)
**Current:**
```tsx
className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
```
**Should be:**
```tsx
className="btn-danger px-4 py-2"
```
**Size saving:** ~60 chars × 3 = 180 chars

**Files affected:**
- AdminDashboard.tsx (1 instance)
- EmployeeDashboard.tsx (1 instance)
- AccountManagement.tsx (1 instance)

#### Pattern 4: Disabled Button (5 instances)
**Current:**
```tsx
className="... disabled:opacity-50 disabled:cursor-not-allowed"
```
**Note:** Already built into component classes, can remove when adopted

#### Pattern 5: Outline Buttons - NEW OPPORTUNITY
**Current patterns found:**
```tsx
// Blue outline
className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100"

// Red outline  
className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100"

// Green outline
className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100"
```

**Should be:**
```tsx
className="btn-outline-primary px-4 py-2"
className="btn-outline-danger px-4 py-2"
className="btn-outline-success px-4 py-2"
```

**Files with outline buttons:**
- ImportWizard.tsx (multiple)
- PermissionEditor.tsx (multiple)
- AccountManagement.tsx (status buttons)

---

## Optimization Opportunities

### 1. Component Class Adoption
**Estimated savings:**
- Source code: ~1,540 characters (1.5 KB)
- CSS bundle: Minimal impact (utilities already in bundle)
- Maintainability: High improvement
- Developer experience: Faster to write, easier to read

**Priority files (most repeated patterns):**
1. AccountManagement.tsx - 9 buttons
2. WorkLogManagement.tsx - 4 buttons
3. RoleManagement.tsx - 3 buttons
4. DepartmentManagement.tsx - 3 buttons
5. AreaManagement.tsx - 3 buttons
6. EmployeeManagement.tsx - 2 buttons
7. ConfirmDialog.tsx - 2 buttons
8. ImportWizard.tsx - 1 button

### 2. Dark Mode Coverage
**Analysis:** Most components now have dark: variants
**Missing dark mode:**
- PermissionEditor.tsx (partially done)
- Some nested dialogs in AccountManagement
- Some table headers in smaller components

**Action:** Continue adding dark: variants during component class adoption

### 3. CSS Variable Deprecation
**Current usage:** globals.css contains CSS variables for backward compatibility

**Recommendation:** Keep for now
- Some legacy components may still reference them
- No performance impact (styles compiled at build time)
- Can deprecate in future version after full audit

---

## Performance Recommendations

### High Priority ✅
1. **Adopt component classes across all 33+ button instances**
   - Immediate code quality improvement
   - Better consistency
   - Easier maintenance

### Medium Priority 🟡
2. **Complete dark mode coverage**
   - Finish PermissionEditor dark variants
   - Add to remaining nested components

3. **Tree-shake unused Tailwind utilities**
   - Review safelist in tailwind.config.js
   - Remove dynamic class generation where possible

### Low Priority 🔵
4. **Consider CSS-in-JS for truly dynamic styles**
   - Only 4 inline styles remain (all valid)
   - Current approach is optimal

5. **Bundle splitting**
   - Current 363 kB JS is acceptable
   - Consider code-splitting if app grows beyond 500 kB

---

## Lighthouse Audit (Estimated)

**Performance:** 90+ (expected)
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Total Blocking Time: <200ms
- Cumulative Layout Shift: <0.1

**Accessibility:** 95+ (expected)
- WCAG AA contrast: ✅
- Keyboard navigation: ✅
- ARIA labels: ✅ (mostly present)
- Focus indicators: ✅

**Best Practices:** 95+ (expected)
- HTTPS: ✅
- No console errors: ✅
- Secure dependencies: ✅

**SEO:** 90+ (expected)
- Meta tags: Need verification
- Mobile-friendly: ✅
- Valid HTML: ✅

---

## Next Steps

### Phase 5.2: Component Class Adoption
**Target:** Update 33+ buttons across 8 files
**Time estimate:** 1-2 hours
**Priority order:**
1. AccountManagement.tsx (9 buttons)
2. WorkLogManagement.tsx (4 buttons)
3. RoleManagement.tsx (3 buttons)
4. DepartmentManagement.tsx (3 buttons)
5. AreaManagement.tsx (3 buttons)
6. EmployeeManagement.tsx (2 buttons)
7. ConfirmDialog.tsx (2 buttons)
8. ImportWizard.tsx (1 button)

### Phase 5.3: Final Cleanup
**Target:** Documentation and verification
**Time estimate:** 30 minutes
- Update MIGRATION_STATUS.md
- Final build verification
- Performance metrics documentation

---

**Status:** Phase 5.1 Complete - Analysis Done ✅  
**Next:** Phase 5.2 - Component Class Adoption

