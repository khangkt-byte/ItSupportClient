# Color System User Guide

Last Updated: 2026-02-13

## What This Covers

- Where colors live (single source of truth)
- How runtime theming works
- How to change colors safely
- How to verify changes in the browser

## Single Source of Truth (SSOT)

All colors are defined in:
- src/constants/palettes.ts

This file is the only place you should edit color values.

## Runtime Flow

1. App loads and the theme hook runs.
2. applyThemeTokens() reads values from palettes.ts.
3. CSS variables are written to document.documentElement.
4. Tailwind utilities (bg-*, text-*, border-*) read those variables.

Build-time CSS contains temporary defaults so Tailwind can generate utilities,
but runtime values always come from palettes.ts.

## How To Change A Color

### Change a semantic color (success/error/warning/info/disabled)

1. Edit src/constants/palettes.ts
2. Save the file
3. Reload the app in the browser

Result: Semantic utilities like bg-success and text-error update immediately.

### Change a brand palette color

1. Edit src/constants/palettes.ts
2. Save the file
3. Reload the app in the browser

If you need build-time CSS to match (for SSR or static fallback), also run:

npm run generate:themes
npm run build

## How To Use Colors In Components

### Prefer semantic utilities

- bg-success-background
- text-success-foreground
- border-success-border

### Brand utilities for accents

- bg-primary-500
- text-primary-600
- border-primary-300

### Do not hardcode

Avoid raw hex or Tailwind fixed colors like text-green-600.
Use semantic tokens or brand palette utilities instead.

## Quick Debug Checks

In the browser console:

getComputedStyle(document.documentElement)
  .getPropertyValue('--color-success')

Expect a non-empty value that matches palettes.ts.

## Related Docs

- Guide/DYNAMIC_COLORS_RUNTIME.md
- Guide/COLORS_QUICK_REFERENCE.md
- Guide/SEMANTIC_TOKENS_GUIDE.md
- Guide/THEME_TESTING_CHECKLIST.md
