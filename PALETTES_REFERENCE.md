# Theme Palettes - Color Reference

## Complete Palette Overview

### Brand Purple
**Primary:** #695CFE (Indigo-Purple)
**Secondary:** Green (#22c55e)
```
50:  #f5f3ff  | 100: #ede9fe  | 200: #ddd6fe  | 300: #c4b5fd  | 400: #a78bfa
500: #695CFE  | 600: #5b4ee6  | 700: #4c3fd9  | 800: #4338ca  | 900: #3730a3
950: #1e1b4b
```

### Brand Red
**Primary:** #ef4444 (Red)
**Secondary:** Pink (#ec4899)
```
50:  #fef2f2  | 100: #fee2e2  | 200: #fecaca  | 300: #fca5a5  | 400: #f87171
500: #ef4444  | 600: #dc2626  | 700: #b91c1c  | 800: #991b1b  | 900: #7f1d1d
950: #450a0a
```

### Brand Blue
**Primary:** #3b82f6 (Blue)
**Secondary:** Cyan (#06b6d4)
```
50:  #eff6ff  | 100: #dbeafe  | 200: #bfdbfe  | 300: #93c5fd  | 400: #60a5fa
500: #3b82f6  | 600: #2563eb  | 700: #1d4ed8  | 800: #1e40af  | 900: #1e3a8a
950: #172554
```

### Brand Green
**Primary:** #22c55e (Green)
**Secondary:** Cyan (#06b6d4)
```
50:  #f0fdf4  | 100: #dcfce7  | 200: #bbf7d0  | 300: #86efac  | 400: #4ade80
500: #22c55e  | 600: #16a34a  | 700: #15803d  | 800: #166534  | 900: #145231
950: #0a3622
```

### Brand Orange
**Primary:** #ea580c (Orange)
**Secondary:** Pink (#ec4899)
```
50:  #fff7ed  | 100: #fed7aa  | 200: #fdba74  | 300: #fb923c  | 400: #f97316
500: #ea580c  | 600: #c2410c  | 700: #9a3412  | 800: #7c2d12  | 900: #431407
950: #2c0f04
```

### Brand Teal
**Primary:** #14b8a6 (Teal)
**Secondary:** Cyan (#06b6d4)
```
50:  #f0fdfa  | 100: #ccfbf1  | 200: #99f6e4  | 300: #5eead4  | 400: #2dd4bf
500: #14b8a6  | 600: #0d9488  | 700: #0f766e  | 800: #115e59  | 900: #134e4a
950: #0d3331
```

### Brand Indigo
**Primary:** #6366f1 (Indigo)
**Secondary:** Pink (#ec4899)
```
50:  #eef2ff  | 100: #e0e7ff  | 200: #c7d2fe  | 300: #a5b4fc  | 400: #818cf8
500: #6366f1  | 600: #4f46e5  | 700: #4338ca  | 800: #3730a3  | 900: #312e81
950: #1e1b4b
```

### Brand Violet
**Primary:** #a855f7 (Violet)
**Secondary:** Green (#22c55e)
```
50:  #faf5ff  | 100: #f3e8ff  | 200: #e9d5ff  | 300: #d8b4fe  | 400: #c084fc
500: #a855f7  | 600: #9333ea  | 700: #7e22ce  | 800: #6b21a8  | 900: #581c87
950: #3f0f5c
```

### Brand Pink
**Primary:** #ec4899 (Pink)
**Secondary:** Red (#ef4444)
```
50:  #fdf2f8  | 100: #fce7f3  | 200: #fbcfe8  | 300: #f8b4d8  | 400: #f472b6
500: #ec4899  | 600: #db2777  | 700: #be185d  | 800: #9d174d  | 900: #831843
950: #500724
```

### Brand Cyan
**Primary:** #1e88ff (Cyan/Blue)
**Secondary:** Green (#22c55e)
```
50:  #ecf8ff  | 100: #d9f0ff  | 200: #b3e0ff  | 300: #7ecbff  | 400: #4ca8ff
500: #1e88ff  | 600: #1565c0  | 700: #0d47a1  | 800: #09369e  | 900: #07287f
950: #051957
```

### Neutral Gray (All Themes)
**Used for:** Text, borders, backgrounds
```
50:  #f9fafb  | 100: #f3f4f6  | 200: #e5e7eb  | 300: #d1d5db  | 400: #9ca3af
500: #6b7280  | 600: #4b5563  | 700: #374151  | 800: #1f2937  | 900: #111827
950: #030712
```

## Usage Matrix

| Tone | Light Theme | Dark Theme | Interactive |
|------|------------|-----------|------------|
| **50-100** | Light backgrounds | Disabled state | Badge backgrounds |
| **200-300** | Borders, dividers | Subtle emphasis | Hover hint |
| **400** | Placeholder text | Secondary text | Hover background |
| **500** | Primary button | Main action | Active state |
| **600** | Button hover | Hover text | Focused element |
| **700** | Active button | Strong text | Pressed state |
| **800-900** | Text | Bright text | - |
| **950** | Strong text | Background | - |

## Theme Selection Recommendations

| Use Case | Recommended Themes |
|----------|-------------------|
| Corporate/Professional | Blue, Purple, Cyan |
| Growth/Health | Green, Teal |
| Warning/Alert | Orange, Red |
| Creative/Modern | Violet, Pink, Indigo |
| Tech Products | Blue, Indigo, Cyan |
| Friendly/Casual | Green, Orange, Pink |

## Accessibility Notes

- All primary colors meet WCAG AA contrast ratios
- Use tone 50-300 for backgrounds
- Use tone 700-950 for text
- Maintain minimum 4.5:1 contrast ratio for text
- Consider color-blind friendly palettes (avoid red-green combinations in important UI)

## Files to Modify

When customizing themes:
1. **`src/lib/constants/palettes.ts`** - Update/add palette definitions
2. **`src/index.css`** - Add CSS custom properties
3. **`src/components/Sidebar.tsx`** - Add theme option to list

## CSS Custom Property Format

Each theme defines these CSS variables:
```css
--color-primary-50
--color-primary-100
--color-primary-200
--color-primary-300
--color-primary-400
--color-primary-500
--color-primary-600
--color-primary-700
--color-primary-800
--color-primary-900
--color-primary-950
```

Use in components:
```tsx
<div className="bg-[var(--color-primary-500)] text-[var(--color-primary-50)]">
  Content
</div>
```
