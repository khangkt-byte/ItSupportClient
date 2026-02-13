# Dynamic Runtime Color System

Last Updated: 2026-02-13
Status: Implemented

## Executive Summary

All runtime colors come from src/constants/palettes.ts.
CSS files contain temporary defaults so Tailwind can generate utilities, but
applyThemeTokens() overwrites those values at runtime.

## Architecture Flow

palettes.ts (SSOT)
  -> useTheme() (src/features/theme/hooks/useTheme.ts)
  -> applyThemeTokens() (src/utils/themeTokens.ts)
  -> document.documentElement.style.setProperty(...)
  -> Tailwind utilities (bg-*, text-*, border-*)

## Build-Time vs Runtime

### Build-Time

- Tailwind v4 scans @theme values in:
  - src/styles/theme.css
  - src/index.css (primary palette defaults)
- This enables utility generation like bg-success and text-primary-500.

### Runtime

- The app calls applyThemeTokens() on load and on theme changes.
- CSS variables are overwritten with values from palettes.ts.
- No manual CSS edits are required.

## Where to Edit Colors

- Semantic tokens: src/constants/palettes.ts
- Brand palettes: src/constants/palettes.ts

After editing, reload the app to see updates.

If you need build-time CSS (SSR or static fallback) to match, run:

npm run generate:themes
npm run build

## Key Files

- src/constants/palettes.ts (SSOT)
- src/utils/themeTokens.ts (runtime injection)
- src/features/theme/hooks/useTheme.ts (integration)
- src/styles/theme.css (build-time @theme values)
- src/index.css (primary palette defaults + imports generated-themes.css)
- src/styles/generated-themes.css (auto-generated fallback)

## Verification

In the browser console:

getComputedStyle(document.documentElement)
  .getPropertyValue('--color-success')

This should match palettes.ts for the current appearance.

## Rules

- Do not hardcode colors in components.
- Do not edit generated-themes.css manually.
- Use semantic utilities for state colors and brand utilities for accents.
