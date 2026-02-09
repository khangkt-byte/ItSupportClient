# Theme & Palette System Guide

## Overview

The application now includes a comprehensive theme system with 12 themes total:
- 2 Base themes: Light, Dark
- 10 Brand themes: Purple, Red, Blue, Green, Orange, Teal, Indigo, Violet, Pink, Cyan

## Palette Structure

Each brand theme palette contains:

### 1. **Primary Color (Chủ đạo)**
The main brand color with 11 tones (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950)
```
50   - Lightest (backgrounds, overlays)
100  - Very Light
200  - Light
300  - Light-medium
400  - Medium-light
500  - Main/Core color
600  - Medium-dark
700  - Dark
800  - Darker
900  - Very dark
950  - Darkest (text, strong elements)
```

### 2. **Secondary Color (Màu phụ)** - Optional
An accent color that complements the primary color, providing visual variety and supporting different UI needs.

### 3. **Neutral Colors (Màu trung tính)**
Gray tones consistent across all themes for:
- Text (gray-900 dark mode, gray-600 light mode)
- Borders (gray-200 light, gray-700 dark)
- Backgrounds (gray-50 light, gray-800 dark)
- Hover states

## Available Themes

### Base Themes
| Theme | Usage |
|-------|-------|
| **Light** | Clean, bright interface for daytime use |
| **Dark** | Dark interface for low-light environments |

### Brand Themes with Primary Colors
| Theme | Primary | Secondary | Use Case |
|-------|---------|-----------|----------|
| **Purple** | #695CFE | Green | Professional, Premium |
| **Red** | #ef4444 | Pink | Alert, Important, Energy |
| **Blue** | #3b82f6 | Cyan | Trust, Corporate, Tech |
| **Green** | #22c55e | Cyan | Growth, Success, Health |
| **Orange** | #ea580c | Pink | Warmth, Friendly, Energy |
| **Teal** | #14b8a6 | Cyan | Calm, Fresh, Modern |
| **Indigo** | #6366f1 | Pink | Tech, Creative, Premium |
| **Violet** | #a855f7 | Green | Magic, Creative, Premium |
| **Pink** | #ec4899 | Red | Playful, Modern, Creative |
| **Cyan** | #1e88ff | Green | Tech, Modern, Professional |

## File Locations

### 1. Palette Definitions
**File:** `src/lib/constants/palettes.ts`

Contains:
- `ColorPalette` interface (11 tone definitions)
- `ThemePalette` interface (primary + secondary + neutral)
- `palettes` object with all 10 brand themes
- `BrandTheme` type union

```typescript
// Access palettes
import { palettes, BrandTheme } from '@/lib/constants/palettes';

// Get a specific palette
const purplePalette = palettes['brand-purple'];
const primaryColor = purplePalette.primary[500]; // #695CFE
```

### 2. CSS Theme Variables
**File:** `src/index.css`

Defines CSS custom properties for each theme:
```css
:root[data-theme="brand-purple"] {
  --color-primary-50: #f5f3ff;
  --color-primary-100: #ede9fe;
  /* ... 50-950 tones ... */
}
```

### 3. React Component
**File:** `src/components/Sidebar.tsx`

- Theme selector dropdown
- Modal for choosing themes
- Theme persistence to localStorage
- System preference detection

## Using Themes in Components

### Via CSS Variables
```tsx
<div className="bg-[var(--color-primary-500)] text-[var(--color-primary-50)]">
  Primary color background with light text
</div>
```

### Via Tailwind Classes
```tsx
<div className="bg-primary-500 text-primary-50 dark:bg-primary-900">
  Uses Tailwind primary color definitions
</div>
```

### Accessing Palette Data in Code
```typescript
import { palettes } from '@/lib/constants/palettes';

// Get the current theme's palette
const currentTheme = 'brand-purple';
const palette = palettes[currentTheme];

// Access specific tones
const lightBackground = palette.primary[50];
const mainColor = palette.primary[500];
const darkText = palette.primary[900];

// Secondary colors for accents
const accentColor = palette.secondary?.[500];

// Neutral colors
const borderColor = palette.neutral[200];
```

## Color Tone Usage Guidelines

| Tone | Typical Use |
|------|------------|
| **50-100** | Very light backgrounds, disabled states |
| **100-200** | Light backgrounds, input fields |
| **200-300** | Borders, dividers, subtle elements |
| **300-400** | Secondary text, placeholders |
| **400-500** | Interactive elements, hover states |
| **500** | Primary color, main buttons, icons |
| **600-700** | Active states, darker text |
| **700-800** | Strong emphasis, dark text |
| **800-900** | Very dark text, strong contrast |
| **950** | Darkest, maximum contrast |

## Customizing Themes

### Add a New Theme

1. **Add palette to `palettes.ts`:**
```typescript
'brand-teal': {
  primary: {
    50: '#f0fdfa',
    // ... 50-950 tones
  },
  secondary: { /* optional */ },
  neutral: neutralGray,
}
```

2. **Add CSS variables to `index.css`:**
```css
:root[data-theme="brand-teal"] {
  --color-primary-50: #f0fdfa;
  /* ... all tones ... */
}
```

3. **Add theme option to Sidebar:**
```typescript
{
  value: 'brand-teal',
  label: 'Teal',
  icon: <Palette className="w-4 h-4 text-teal-500" />,
  materialIcon: 'palette',
  color: '#14b8a6'
}
```

### Modify Existing Theme

Edit both `palettes.ts` and `index.css` with the new color values.

## Theme Implementation Details

### Data Flow
1. User selects theme in modal
2. `changeTheme()` applies theme to DOM:
   - Sets `data-theme` attribute on `<html>` and `<body>`
   - Saves selection to localStorage
3. CSS custom properties update automatically
4. Components re-render with new colors

### Persistence
- Theme selection saved to `localStorage['theme']`
- On app load, checks:
  1. localStorage for saved preference
  2. System preference (prefers-color-scheme)
  3. Defaults to 'light'

### CSS Architecture
```css
/* Light theme (default) */
:root {
  --color-primary-50: #f5f3ff;
  /* ... */
}

/* Brand themes */
:root[data-theme="brand-purple"] {
  --color-primary-50: #f5f3ff;
  /* ... */
}
```

## Best Practices

1. **Use CSS variables for consistency:**
   - ✅ `bg-[var(--color-primary-500)]`
   - ❌ `bg-purple-500` (hardcoded)

2. **Respect color hierarchy:**
   - Primary 500 for main actions
   - Primary 600+ for hover/active
   - Primary 100-300 for backgrounds
   - Neutral colors for text/borders

3. **Maintain contrast:**
   - 50-100 with 900-950 text
   - 500-600 with 50-100 text
   - Check WCAG AA compliance

4. **Use secondary colors sparingly:**
   - Accent elements only
   - Not primary backgrounds/text

## Troubleshooting

### Theme not applying
- Clear browser cache
- Check `data-theme` attribute on `<html>`
- Verify CSS variables are defined

### Colors look wrong
- Check if using hardcoded colors instead of variables
- Verify tone selection (50-950)
- Check contrast ratio

### New theme not showing
- Verify both `palettes.ts` and `index.css` updated
- Add to `themeOptions` in Sidebar.tsx
- Rebuild project: `npm run build`

## Color Inspiration

Palettes created using:
- Tailwind Color System
- Material Design 3 principles
- WCAG AA/AAA contrast compliance
- Industry-standard color psychology

For custom colors, tools like:
- [Tailwind Palette Generator](https://uicolors.app)
- [Material Design Color Generator](https://material-ui.com/customization/color/)
- [Coolors.co](https://coolors.co)
