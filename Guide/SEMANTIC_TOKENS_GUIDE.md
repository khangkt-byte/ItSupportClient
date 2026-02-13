# Semantic Tokens Guide

Last Updated: 2026-02-13

## What Are Semantic Tokens

Semantic tokens are purpose-based colors like success, error, warning, and info.
They describe meaning instead of a specific hue.

## Where Tokens Live

All semantic token values are defined in:
- src/constants/palettes.ts

Runtime injection is handled by:
- src/utils/themeTokens.ts
- src/features/theme/hooks/useTheme.ts

## How To Use Tokens

### Tailwind utilities

- bg-success
- text-success-foreground
- border-success-border

### CSS variables

color: var(--color-success)
background-color: var(--color-success-background)

## Light and Dark Behavior

- Light mode uses defaultSemanticTokens and lightSemanticVariants.
- Dark mode uses darkSemanticTokens and darkSemanticVariants.
- High contrast mode overrides semantic tokens for WCAG AAA.

## Example

<div className="bg-success-background text-success-foreground border border-success-border">
  Operation successful
</div>

## Adding A New Semantic Token

1. Add the token to palettes.ts (light and dark).
2. Add variants in palettes.ts.
3. Update generateSemanticVars() in src/utils/themeTokens.ts.
4. Add build-time defaults in src/styles/theme.css.
5. Reload the app. If you add new utilities, rebuild to let Tailwind scan them.

## Do and Do Not

Do:
- Use semantic tokens for status and feedback
- Keep all definitions in palettes.ts

Do not:
- Hardcode colors in components
- Edit generated-themes.css manually
