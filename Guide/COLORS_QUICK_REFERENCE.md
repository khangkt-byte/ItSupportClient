# Colors Quick Reference

Last Updated: 2026-02-13

## Change A Semantic Color

1. Edit src/constants/palettes.ts
2. Save the file
3. Reload the app

No CSS edits required.

## Change A Brand Palette Color

1. Edit src/constants/palettes.ts
2. Save the file
3. Reload the app

If you need build-time CSS to match, run:

npm run generate:themes
npm run build

## Common Utilities

Semantic:
- bg-success-background
- text-error-foreground
- border-warning-border
- text-info

Brand:
- bg-primary-500
- text-primary-600
- border-primary-300

## Debug In Browser

getComputedStyle(document.documentElement)
  .getPropertyValue('--color-success')

## Do Not

- Do not hardcode hex values in components
- Do not edit generated-themes.css manually
