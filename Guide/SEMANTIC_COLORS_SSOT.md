# Semantic Colors SSOT

Last Updated: 2026-02-13

## Single Source of Truth

All semantic colors are defined in:
- src/constants/palettes.ts

This includes:
- defaultSemanticTokens (light)
- darkSemanticTokens (dark)
- lightSemanticVariants (foreground/background/border)
- darkSemanticVariants
- high contrast tokens and variants

## How They Reach The UI

1. useTheme() resolves appearance and brand.
2. applyThemeTokens() generates CSS variables from palettes.ts.
3. CSS variables are applied to document.documentElement.
4. Tailwind utilities read the variables.

## Example Utilities

- bg-success
- text-success-foreground
- border-success-border

## Do and Do Not

Do:
- Update palettes.ts for semantic changes
- Use semantic utilities for status colors

Do not:
- Hardcode colors in components
- Edit generated-themes.css manually

## Related Docs

- Guide/DYNAMIC_COLORS_RUNTIME.md
- Guide/SEMANTIC_TOKENS_GUIDE.md
- Guide/COLORS_QUICK_REFERENCE.md
