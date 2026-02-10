# Automated Color Linting Setup

## Overview

This project includes automated linting to prevent hardcoded colors and enforce semantic token usage.

---

## What Gets Checked

The linter detects:
- ✅ **Hex colors** - `#fff`, `#22c55e`, `#000000`
- ✅ **RGB/RGBA** - `rgb(255, 0, 0)`, `rgba(0, 0, 0, 0.5)`
- ✅ **HSL/HSLA** - `hsl(120, 100%, 50%)`
- ✅ **Named colors** - `red`, `blue`, `green`, etc.

**Allowed exceptions:**
- `transparent`
- `inherit`
- `currentColor`
- `initial`
- `unset`

---

## How to Use

### Manual Check

Run the color linter manually:

```bash
npm run lint:colors
```

**Output:**
```
🔍 Scanning ./src for hardcoded colors...

🚨 Found 3 hardcoded color(s):

📄 src/components/Button.tsx
  Line 15:10 - Hardcoded hex color: #22c55e
  Line 20:15 - Hardcoded named color: red

💡 Suggestion: Replace with semantic tokens like var(--color-success)
📚 See Guide/SEMANTIC_TOKENS_GUIDE.md for more info
```

### Pre-Commit Hook

The linter runs automatically before every commit:

```bash
git add .
git commit -m "Add new feature"

# Automatically runs:
🎨 Checking for hardcoded colors...
✅ No hardcoded colors found!
```

**If violations detected:**
```bash
❌ Commit rejected: Hardcoded colors detected!
Please use semantic tokens instead:
  • var(--color-success) for green
  • var(--color-error) for red
  • var(--color-warning) for yellow/orange
  • var(--color-info) for blue
```

### CI/CD Integration

GitHub Actions runs color linting on every push/PR:

**Workflow:** `.github/workflows/lint-colors.yml`

On push to `main` or `develop`:
1. Checks out code
2. Installs dependencies
3. Runs `npm run lint:colors`
4. Fails build if violations found

---

## ESLint Rule Configuration

### Location
`.eslintrc.cjs` - Main ESLint config

### Rule Options

```javascript
{
  rules: {
    'no-hardcoded-colors': ['error', {
      allowTransparent: true,    // Allow 'transparent'
      allowInherit: true,         // Allow 'inherit'
      ignorePatterns: [           // Custom ignore patterns
        'transparent',
        'currentColor',
      ],
    }],
  }
}
```

### Disable for Specific Lines

```tsx
// eslint-disable-next-line no-hardcoded-colors
const color = '#fff'; // Exception: Library requirement
```

### Disable for File

```tsx
/* eslint-disable no-hardcoded-colors */
// Entire file exempt (avoid if possible)
```

---

## Custom ESLint Rule

### Location
`.eslint/rules/no-hardcoded-colors.js`

### How It Works

1. **Scans JSX style props**
   ```tsx
   // ❌ Detected
   <div style={{ color: '#fff' }}>
   
   // ✅ Allowed
   <div style={{ color: 'var(--color-text-primary)' }}>
   ```

2. **Scans CSS-in-JS**
   ```tsx
   // ❌ Detected
   const Button = styled.button`
     color: #22c55e;
   `;
   
   // ✅ Allowed
   const Button = styled.button`
     color: var(--color-success);
   `;
   ```

3. **Scans object literals**
   ```tsx
   // ❌ Detected
   const styles = {
     color: '#ef4444',
   };
   
   // ✅ Allowed
   const styles = {
     color: 'var(--color-error)',
   };
   ```

4. **Provides auto-fix suggestions**
   - Suggests semantic token replacement
   - Shows nearest matching token
   - One-click fix in VSCode

---

## Script Details

### Color Linter Script
**Location:** `scripts/lint-colors.js`

**Features:**
- Scans all `.ts`, `.tsx`, `.js`, `.jsx`, `.css` files
- Skips `node_modules`, `build`, `.git`
- Groups violations by file
- Provides line/column numbers
- Exit code 1 if violations found

**Usage:**
```bash
node scripts/lint-colors.js [directory]

# Default: scans ./src
node scripts/lint-colors.js

# Custom directory
node scripts/lint-colors.js ./components
```

---

## Fixing Violations

### Step 1: Find Violations

```bash
npm run lint:colors
```

### Step 2: Replace with Tokens

**Example violation:**
```tsx
// ❌ Before
<div style={{ backgroundColor: '#22c55e' }}>
  Success!
</div>

// ✅ After
<div style={{ backgroundColor: 'var(--color-success)' }}>
  Success!
</div>
```

### Step 3: Verify Fix

```bash
npm run lint:colors
# ✅ No hardcoded colors found!
```

---

## Common Replacements

| Hardcoded Color | Semantic Token |
|----------------|----------------|
| `#22c55e` (green) | `var(--color-success)` |
| `#ef4444` (red) | `var(--color-error)` |
| `#f59e0b` (orange) | `var(--color-warning)` |
| `#3b82f6` (blue) | `var(--color-info)` |
| `#1F2936` (dark text) | `var(--color-text-primary)` |
| `#6B7280` (gray text) | `var(--color-text-secondary)` |
| `#FFFFFF` (white bg) | `var(--color-bg-primary)` |
| `#F9FAFB` (light bg) | `var(--color-bg-secondary)` |

---

## Integration with VSCode

### Install ESLint Extension

1. Install "ESLint" extension by Microsoft
2. Reload VSCode
3. Violations show as red squiggles
4. Hover for suggestions
5. Cmd/Ctrl + . for quick fix

### Auto-fix on Save

Add to `.vscode/settings.json`:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

---

## Troubleshooting

### Q: Linter reports false positives
**A:** Add exception:
```tsx
// eslint-disable-next-line no-hardcoded-colors
const color = '#fff'; // Library requirement
```

### Q: How to ignore entire file?
**A:** Top of file:
```tsx
/* eslint-disable no-hardcoded-colors */
```
**Warning:** Avoid if possible. Use semantic tokens instead.

### Q: Linter not running in pre-commit
**A:** Reinstall Husky:
```bash
npm install husky --save-dev
npx husky install
```

### Q: Need to bypass for urgent fix
**A:** Use `--no-verify`:
```bash
git commit -m "Urgent fix" --no-verify
```
**Warning:** Create follow-up issue to fix properly.

### Q: How to add custom token suggestion?
**A:** Edit `.eslint/rules/no-hardcoded-colors.js`:
```javascript
const TOKEN_SUGGESTIONS = {
  '#YOUR_COLOR': '--color-your-token',
  // ...
};
```

---

## Performance

- **Speed:** <1 second for typical project
- **Memory:** Minimal overhead
- **CI/CD:** ~10-20 seconds including npm install

---

## Best Practices

1. **Run before committing**
   ```bash
   npm run lint:colors
   ```

2. **Fix violations immediately**
   - Don't accumulate technical debt
   - Easier to fix while context fresh

3. **Use semantic tokens from start**
   - Avoid hardcoded colors in new code
   - Refer to `Guide/SEMANTIC_TOKENS_GUIDE.md`

4. **Review pre-commit failures**
   - Don't bypass with `--no-verify`
   - Fix properly or add exception with comment

5. **Keep token list updated**
   - Add new brand colors to ESLint rule
   - Update suggestions as theme evolves

---

## Resources

- **Semantic Tokens Guide:** `Guide/SEMANTIC_TOKENS_GUIDE.md`
- **Theme Builder:** `Guide/THEME_BUILDER_TUTORIAL.md`
- **Accessibility:** `Guide/ACCESSIBILITY_BEST_PRACTICES.md`
- **ESLint Docs:** https://eslint.org/docs/latest/

---

## Summary

✅ **Automated linting prevents hardcoded colors**  
✅ **Pre-commit hooks catch violations early**  
✅ **CI/CD enforces standards**  
✅ **Auto-fix suggestions speed up remediation**  
✅ **Team stays consistent with semantic tokens**

Run `npm run lint:colors` to check your code now!
