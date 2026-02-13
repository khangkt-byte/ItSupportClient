# Theme Preview Best Practices & Color Standards

## Problem Statement

When implementing theme selectors with visual previews, using CSS variables for preview colors creates inconsistent user experiences. CSS variables resolve to the current active theme, causing all preview cards to display identical colors instead of showing what each theme actually looks like.

### Example of the Problem

```tsx
// ❌ INCORRECT: Uses CSS variables that change with current theme
<div
  style={{
    backgroundColor: option.category === 'light'
      ? 'var(--color-bg-primary)'  // Shows current theme's primary color
      : 'var(--color-bg-accent)',   // Shows current theme's accent color
  }}
/>
```

**Issue:** When Light theme is active, both Light and Dark cards show light backgrounds. When Dark theme is active, both show dark backgrounds.

### Solution

```tsx
// ✅ CORRECT: Uses static preview colors
// Source brand colors from palettes.ts (SSOT) when available
<div
  style={{
    backgroundColor: option.previewColor || '#FFFFFF'
  }}
/>
```

**Result:** Light card always shows white, Dark card always shows dark gray, regardless of current theme.

---

## Industry Standards for Theme Colors

### Material Design 3 (Google)

**Official Documentation:** https://m3.material.io/styles/color/the-color-system/tokens

#### Light Theme
- **Surface (Elevation 0):** `#FEFBFF` or `#FFFFFF`
- **Background:** `#FFFBFE`
- **On Surface:** `#1C1B1F`

#### Dark Theme
- **Surface (Elevation 0):** `#1C1B1F`
- **Background (Baseline):** `#121212`
- **On Surface:** `#E6E1E5`

**Rationale:** Google's research shows `#121212` provides optimal contrast without being harsh like pure black.

---

### Fluent 2 Design System (Microsoft)

**Official Documentation:** https://fluent2.microsoft.design/color

#### Light Theme
- **Background:** `#FFFFFF`
- **Card Background:** `#F5F5F5`
- **Text:** `#242424`

#### Dark Theme
- **Background:** `#1F1F1F` or `#292929`
- **Card Background:** `#323232`
- **Text:** `#FFFFFF`

**Key Principle:** Microsoft emphasizes accessibility with minimum 4.5:1 contrast ratios.

---

### shadcn/ui (Vercel)

**Official Documentation:** https://ui.shadcn.com/themes

#### Light Theme
```css
--background: 0 0% 100%;        /* #FFFFFF */
--foreground: 222.2 84% 4.9%;  /* #020817 */
--card: 0 0% 100%;             /* #FFFFFF */
```

#### Dark Theme
```css
--background: 240 10% 3.9%;    /* #09090B */
--foreground: 0 0% 98%;        /* #FAFAFA */
--card: 240 10% 3.9%;          /* #09090B */
```

**Alternative Dark (Slate):**
```css
--background: 224 71.4% 4.1%;  /* #020817 */
--card: 224 71.4% 4.1%;
```

**Philosophy:** Semantic tokens allow theme switching without component changes.

---

### Tailwind CSS

**Official Documentation:** https://tailwindcss.com/docs/customizing-colors

#### Light Theme
- **Background:** `white` (`#FFFFFF`)
- **Text:** `slate-900` (`#0F172A`)

#### Dark Theme Options
- **Gray Scale:** `gray-950` (`#030712`)
- **Slate Scale:** `slate-950` (`#020617`)
- **Zinc Scale:** `zinc-950` (`#09090B`)

**Usage Pattern:**
```tsx
<div className="bg-white dark:bg-gray-950">
  {/* Content */}
</div>
```

---

### Ant Design (Alibaba)

**Official Documentation:** https://ant.design/docs/spec/colors

#### Light Theme
- **Background:** `#FFFFFF`
- **Component:** `#FAFAFA`
- **Border:** `#D9D9D9`

#### Dark Theme
- **Background:** `#141414`
- **Component:** `#1F1F1F`
- **Border:** `#434343`

**Note:** Ant Design uses `#141414` for primary dark backgrounds with layered elevations.

---

### Carbon Design System (IBM)

**Official Documentation:** https://carbondesignsystem.com/guidelines/color/overview

#### Light Theme (White)
- **UI Background:** `#FFFFFF`
- **UI 01:** `#F4F4F4`
- **Text Primary:** `#161616`

#### Dark Theme (Gray 100)
- **UI Background:** `#161616`
- **UI 01:** `#262626`
- **Text Primary:** `#F4F4F4`

**Carbon Layers:** Implements elevation system with subtle background variations.

---

### Apple Human Interface Guidelines

**Platform:** iOS, macOS, watchOS, tvOS

#### Light Theme
- **System Background:** White (`#FFFFFF`)
- **Secondary Background:** `#F2F2F7` (iOS)
- **Tertiary Background:** `#FFFFFF`

#### Dark Theme
- **System Background:** Black (`#000000` on OLED, `#1C1C1E` on LCD)
- **Secondary Background:** `#2C2C2E`
- **Tertiary Background:** `#3A3A3C`

**Key Feature:** Adaptive colors that automatically adjust based on system appearance.

---

## Best Practices Summary

### ✅ DO:

1. **Use Static Preview Colors**
```tsx
const themeOptions = [
  { 
    value: 'light', 
    previewColor: '#FFFFFF',  // Static, never changes
  },
  { 
    value: 'dark', 
    previewColor: '#121212',  // Static, never changes
  },
];
```

2. **Add Visual Borders for Light Previews**
```tsx
<div
  className={isLightColor ? 'border-2 border-gray-300' : ''}
  style={{ backgroundColor: previewColor }}
/>
```

3. **Use Industry-Standard Colors**
   - Light: `#FFFFFF` (universal)
   - Dark: `#121212` (Material Design), `#161616` (Carbon), or `#1F1F1F` (Fluent)

4. **Provide Accessible Contrast**
   - Minimum 4.5:1 for normal text
   - Minimum 3:1 for large text
   - Minimum 3:1 for UI components

5. **Document Color Choices**
```tsx
/**
 * Preview Colors:
 * - Light: #FFFFFF (Material Design, Fluent, shadcn/ui)
 * - Dark: #121212 (Material Design baseline)
 * 
 * @see https://m3.material.io/styles/color/the-color-system/tokens
 */
```

---

### ❌ DON'T:

1. **Never Use CSS Variables for Previews**
```tsx
// ❌ BAD: Changes with current theme
backgroundColor: 'var(--color-bg-primary)'
```

2. **Don't Use Pure Black Unless Necessary**
```tsx
// ❌ BAD: Too harsh on eyes
backgroundColor: '#000000'  

// ✅ GOOD: Softer, follows Material Design
backgroundColor: '#121212'
```

3. **Don't Forget Hover States**
```tsx
// ❌ BAD: No feedback
<button onClick={changeTheme}>

// ✅ GOOD: Clear interaction
<button 
  onClick={changeTheme}
  className="hover:scale-105 transition-transform"
>
```

4. **Don't Ignore Accessibility**
```tsx
// ❌ BAD: No keyboard access
<div onClick={changeTheme}>

// ✅ GOOD: Proper button element
<button onClick={changeTheme}>
```

---

## Implementation Example

### Complete ThemeCard Component

```tsx
interface ThemeOption {
  value: Theme;
  label: string;
  category: 'light' | 'dark' | 'brand';
  color?: string;
  previewColor?: string; // Static preview color
  description?: string;
}

const themeOptions: ThemeOption[] = [
  { 
    value: 'light', 
    label: 'Light', 
    category: 'light', 
    previewColor: '#FFFFFF',
    description: 'Clean, bright interface' 
  },
  { 
    value: 'dark', 
    label: 'Dark', 
    category: 'dark', 
    previewColor: '#121212',
    description: 'Easy on the eyes' 
  },
  { 
    value: 'brand-purple', 
    label: 'Purple', 
    category: 'brand', 
    color: '#695CFE',
    description: 'Professional purple' 
  },
];

function ThemeCard({ option, isActive, onClick }: ThemeCardProps) {
  // Determine static preview color
  const getPreviewColor = () => {
    if (option.category === 'brand' && option.color) {
      return option.color; // Brand color
    }
    return option.previewColor || '#FFFFFF'; // Static preview
  };

  const previewColor = getPreviewColor();
  const isLightColor = option.category === 'light' || 
                       option.previewColor === '#FFFFFF';

  return (
    <button
      onClick={onClick}
      className={`group relative rounded-lg overflow-hidden 
                  transition-all transform hover:scale-105 
                  focus:outline-none focus:ring-2 
                  focus:ring-primary-500
                  ${isActive ? 'ring-2 ring-primary-600' : ''}`}
      title={option.description}
    >
      {/* Static Preview Background */}
      <div
        className={`w-full h-20 rounded-lg transition-all ${
          isLightColor ? 'border-2 border-gray-300 dark:border-gray-600' : ''
        }`}
        style={{ backgroundColor: previewColor }}
      />

      {/* Hover Label */}
      <div className="absolute inset-0 flex items-center justify-center 
                      bg-black/40 opacity-0 group-hover:opacity-100 
                      transition-opacity">
        <p className="text-white font-semibold">{option.label}</p>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute top-2 right-2 w-3 h-3 
                        bg-green-500 rounded-full 
                        border-2 border-white shadow-lg" />
      )}
    </button>
  );
}
```

---

## Accessibility Considerations

### WCAG 2.1 Compliance

1. **Contrast Ratios**
   - Normal text (< 18pt): 4.5:1 minimum
   - Large text (≥ 18pt): 3.0:1 minimum
   - UI components: 3.0:1 minimum

2. **Keyboard Navigation**
```tsx
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick();
    }
  }}
  tabIndex={0}
  aria-label={`Select ${option.label} theme`}
>
```

3. **Screen Reader Support**
```tsx
<button
  aria-label={`${option.label} theme. ${option.description}`}
  aria-current={isActive ? 'true' : 'false'}
>
```

4. **Focus Indicators**
```tsx
className="focus:outline-none focus:ring-2 focus:ring-primary-500"
```

---

## Testing Checklist

- [ ] Light preview shows white (`#FFFFFF`) in all theme modes
- [ ] Dark preview shows dark gray (`#121212`) in all theme modes
- [ ] Brand colors display correctly with exact hex values
- [ ] Light preview has visible border for contrast
- [ ] Hover states provide clear visual feedback
- [ ] Active theme has clear indicator
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Screen readers announce theme changes
- [ ] Color contrast meets WCAG 2.1 AA standards
- [ ] Preview independent of currently active theme

---

## References

### Official Documentation
1. **Material Design 3:** https://m3.material.io/styles/color/the-color-system/tokens
2. **Fluent 2:** https://fluent2.microsoft.design/color
3. **shadcn/ui:** https://ui.shadcn.com/themes
4. **Tailwind CSS:** https://tailwindcss.com/docs/customizing-colors
5. **Ant Design:** https://ant.design/docs/spec/colors
6. **Carbon Design:** https://carbondesignsystem.com/guidelines/color/overview
7. **Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/color

### Standards
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices:** https://www.w3.org/WAI/ARIA/apg/

### Tools
- **Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Color Review:** https://color.review/
- **Coolors:** https://coolors.co/contrast-checker

---

## Conclusion

Theme preview components must use **static, hard-coded colors** rather than CSS variables to provide accurate visual representations. The industry consensus for standard themes is:

- **Light Theme:** `#FFFFFF` (pure white with visible border)
- **Dark Theme:** `#121212` (Material Design) or `#161616` (Carbon Design)

This approach ensures consistent, predictable previews that help users make informed theme choices regardless of their current theme selection.
