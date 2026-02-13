# Theme Testing Checklist

Last Updated: 2026-02-13

## Pre-Check

- Start dev server: npm run dev
- Open: http://localhost:5173/
- Open DevTools (Console, Elements, Application)

## Appearance (Light / Dark / Auto)

- Set appearance to Light
  - data-appearance="light"
  - data-brand stays current
- Set appearance to Dark
  - data-appearance="dark"
- Set appearance to Auto
  - Toggle prefers-color-scheme in DevTools
  - data-appearance updates to light or dark

## Brand Colors

For each brand (default + 10 brands):
- Switch brand and verify data-brand updates
- Confirm --color-primary-500 changes

## Semantic Tokens

- Check --color-success in light and dark:
  - getComputedStyle(document.documentElement)
    .getPropertyValue('--color-success')
- Confirm it changes when appearance changes

## High Contrast Mode

- Enable high contrast mode in app
- Verify data-a11y="highContrast"
- Confirm semantic tokens switch to high contrast values

## Persistence

- Reload the page
- Verify localStorage contains appearance and brandColor
- Verify attributes are restored

## No Console Errors

- Confirm no errors when switching themes
