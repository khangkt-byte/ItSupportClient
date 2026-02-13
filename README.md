
  # IT Support Management Web App

  This is a code bundle for IT Support Management Web App. The original project is available at https://www.figma.com/design/zKglpxmBBpSWG0vumNSlNG/IT-Support-Management-Web-App.

  ## Overview

  The app uses React + TypeScript, Vite, Tailwind CSS v4, Jest, and Playwright.
  The color system is SSOT-driven from palettes.ts and injected at runtime via CSS variables.

  ## Requirements

  - Node.js LTS (latest LTS recommended)
  - npm

  ## Install

  ```bash
  npm i
  ```

  ## Run (development)

  ```bash
  npm run dev
  ```

  Open the URL printed in the terminal (usually https://localhost:3000).

  ## Build (production)

  ```bash
  npm run build
  ```

  This command runs:
  1) `npm run validate:themes`
  2) `npm run generate:themes`
  3) `vite build`

  For a faster build (skip validate/generate), use:

  ```bash
  npm run build:fast
  ```

  ## Test

  ### Unit tests (Jest)

  ```bash
  npm run test
  ```

  Watch mode:

  ```bash
  npm run test:watch
  ```

  Coverage:

  ```bash
  npm run test:coverage
  ```

  Theme-related tests:

  ```bash
  npm run test:theme
  npm run test:phase2
  ```

  ### E2E tests (Playwright)

  ```bash
  npm run test:e2e
  ```

  Playwright starts the dev server automatically if one is not running (see [playwright.config.ts](playwright.config.ts)).

  ## Lint

  Lint the codebase:

  ```bash
  npm run lint
  ```

  Auto-fix (when possible):

  ```bash
  npm run lint:fix
  ```

  Check hardcoded colors (required for the color system):

  ```bash
  npm run lint:colors
  ```

  ## Commands and explanations

  - `npm run dev`: Start the Vite dev server.
  - `npm run build`: Validate themes, generate CSS from palettes.ts, then build production.
  - `npm run build:fast`: Build production quickly, skipping validate/generate.
  - `npm run generate:themes`: Generate [src/styles/generated-themes.css](src/styles/generated-themes.css) from palettes.ts.
  - `npm run validate:themes`: Validate theme tokens and a11y constraints before build.
  - `npm run test`: Run all unit tests (Jest).
  - `npm run test:watch`: Run unit tests in watch mode.
  - `npm run test:coverage`: Run unit tests with coverage.
  - `npm run test:theme`: Run the theme hook test suite.
  - `npm run test:phase2`: Run phase 2 theme tests with verbose output.
  - `npm run test:e2e`: Run end-to-end tests with Playwright.
  - `npm run lint`: Run ESLint across the codebase.
  - `npm run lint:fix`: Auto-fix lint issues where possible.
  - `npm run lint:colors`: Detect hardcoded colors in src.
  - `npm run prepare`: Set up Husky hooks on install.

  ## Troubleshooting

  - Dev server fails to start on HTTPS: ensure port 3000 is free or change the port in [vite.config.ts](vite.config.ts) and [playwright.config.ts](playwright.config.ts).
  - E2E tests fail with a browser not found error: run `npx playwright install` and retry `npm run test:e2e`.
  - E2E tests fail due to a running server: stop any existing dev server or align `baseURL` in [playwright.config.ts](playwright.config.ts).
  - Build fails on theme validation: run `npm run validate:themes` and inspect any token or contrast errors.
  - Lint errors about hardcoded colors: replace the literal color with a semantic token (see [Guide/SEMANTIC_TOKENS_GUIDE.md](Guide/SEMANTIC_TOKENS_GUIDE.md)).
  - Tests are slow in CI: set `CI=true` and avoid watch mode (do not use `npm run test:watch` in CI).

  ## CI/CD basics (lint/test/e2e)

  Use these steps in your pipeline for consistent checks:

  ```bash
  npm ci
  npm run lint
  npm run test
  npx playwright install --with-deps
  npm run test:e2e
  npm run build
  ```

  Notes:
  - Set `CI=true` for predictable test behavior.
  - If your CI cannot run HTTPS locally, update `baseURL` and `webServer` in [playwright.config.ts](playwright.config.ts).
  - Keep [src/styles/generated-themes.css](src/styles/generated-themes.css) in source control if your build uses it at runtime.

  ## Color system documentation

  Start here:
  - [Guide/COLOR_SYSTEM_USER_GUIDE.md](Guide/COLOR_SYSTEM_USER_GUIDE.md)

  More detail:
  - [Guide/DYNAMIC_COLORS_RUNTIME.md](Guide/DYNAMIC_COLORS_RUNTIME.md)
  - [Guide/SEMANTIC_COLORS_SSOT.md](Guide/SEMANTIC_COLORS_SSOT.md)
  - [Guide/SEMANTIC_TOKENS_GUIDE.md](Guide/SEMANTIC_TOKENS_GUIDE.md)
  - [Guide/COLORS_QUICK_REFERENCE.md](Guide/COLORS_QUICK_REFERENCE.md)
  - [Guide/THEME_TESTING_CHECKLIST.md](Guide/THEME_TESTING_CHECKLIST.md)

  ## Best practices and references

  - npm scripts best practices: https://docs.npmjs.com/cli/v10/using-npm/scripts
  - Vite guide: https://vitejs.dev/guide/
  - Playwright testing: https://playwright.dev/docs/intro
  - Jest testing: https://jestjs.io/docs/getting-started
  - ESLint usage: https://eslint.org/docs/latest/use/
  - Tailwind CSS v4 theme: https://tailwindcss.com/docs/theme
  