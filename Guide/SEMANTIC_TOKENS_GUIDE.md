# Semantic Tokens Guide

## What Are Semantic Tokens?

Semantic tokens are design tokens that carry **meaning** rather than just color values. Instead of using specific hex codes like `#22c55e`, we use meaningful names like `color-success` that convey the **intent** and **purpose** of the color.

### Why Use Semantic Tokens?

1. **Consistency** - All success states use the same color across the app
2. **Maintainability** - Change the success color once, affects everywhere
3. **Theming** - Easy to create light/dark theme variants
4. **Accessibility** - Ensures colors meet WCAG standards
5. **Scalability** - Team size doesn't matter, colors stay consistent

## Core Semantic Colors

### Success Color `--color-success`

**Purpose:** Indicates successful completion, validation, or confirmation

**Usage Examples:**
- ✓ Form validation success states
- ✓ Checkmark icons
- ✓ Success badges
- ✓ Positive trend indicators
- ✓ Completed task markers

**Light Theme:** `#22c55e`  
**Dark Theme:** `#16a34a`

**React Usage:**
```tsx
<div style={{ color: 'var(--color-success)' }}>
  ✓ Changes saved successfully
</div>
```

**CSS Usage:**
```css
.success-message {
  color: var(--color-success);
  background: linear-gradient(
    to right,
    var(--color-success),
    transparent
  );
}
```

---

### Warning Color `--color-warning`

**Purpose:** Alerts users to potential issues or requires caution

**Usage Examples:**
- ⚠ Warning messages
- ⚠ Disabled state indicators
- ⚠ Pending operations
- ⚠ Attention-required badges
- ⚠ Mild issues or deprecations

**Light Theme:** `#f59e0b`  
**Dark Theme:** `#d97706`

**React Usage:**
```tsx
<Alert severity="warning">
  Note: This action cannot be undone
</Alert>
```

**CSS Usage:**
```css
.warning-border {
  border-left: 4px solid var(--color-warning);
}
```

---

### Error Color `--color-error`

**Purpose:** Indicates errors, failures, or dangerous actions

**Usage Examples:**
- ✗ Error messages
- ✗ Form validation failures
- ✗ Danger zone buttons
- ✗ Failed statuses
- ✗ Destructive action confirmations

**Light Theme:** `#ef4444`  
**Dark Theme:** `#dc2626`

**React Usage:**
```tsx
<input 
  style={{ 
    borderColor: error ? 'var(--color-error)' : 'transparent' 
  }} 
/>
```

**CSS Usage:**
```css
.error-text {
  color: var(--color-error);
  font-weight: 600;
}
```

---

### Info Color `--color-info`

**Purpose:** Provides informational content without urgency

**Usage Examples:**
- ℹ Informational messages
- ℹ Help text or tooltips
- ℹ Info badges
- ℹ Neutral notifications
- ℹ Feature highlights

**Light Theme:** `#3b82f6`  
**Dark Theme:** `#2563eb`

**React Usage:**
```tsx
<div className="info-box">
  <Info icon /> This feature is experimental
</div>
```

**CSS Usage:**
```css
.info-badge {
  background: var(--color-info);
  color: white;
}
```

---

## Text and Background Tokens

### Primary Text `--color-text-primary`

**Purpose:** Main body text and content

**Light Theme:** `#1F2936` (near-black for readability)  
**Dark Theme:** `#F3F4F6` (near-white for readability)

**Usage:**
```css
body {
  color: var(--color-text-primary);
}
```

### Secondary Text `--color-text-secondary`

**Purpose:** Supporting text, help text, captions

**Light Theme:** `#6B7280` (medium gray)  
**Dark Theme:** `#D1D5DB` (lighter gray)

**Usage:**
```css
.caption {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}
```

---

### Primary Background `--color-bg-primary`

**Purpose:** Main page/container background

**Light Theme:** `#FFFFFF` (white)  
**Dark Theme:** `#111827` (very dark gray)

**Usage:**
```css
.page {
  background: var(--color-bg-primary);
}
```

### Secondary Background `--color-bg-secondary`

**Purpose:** Card, panel, or section backgrounds

**Light Theme:** `#F9FAFB` (off-white)  
**Dark Theme:** `#1F2937` (dark gray)

**Usage:**
```css
.card {
  background: var(--color-bg-secondary);
  border-radius: 0.5rem;
}
```

---

## Color Scale Tokens

Beyond semantic colors, we also provide a **color scale** for nuanced designs:

```
50   → Lightest tint
100  → Very light
200  → Light
300  → Light-medium
400  → Medium-light
500  → Base color (most saturated)
600  → Medium-dark
700  → Dark
800  → Very dark
900  → Darkest shade
```

**Example - Success Scale:**
```css
--color-success-50  → #f0fdf4  (very light green)
--color-success-500 → #22c55e  (full saturation)
--color-success-900 → #15803d  (very dark green)
```

---

## What NOT to Do

### ❌ Don't use hardcoded hex colors:
```tsx
// ❌ WRONG - Not maintainable
<div style={{ color: '#22c55e' }}>Success</div>

// ✅ RIGHT - Uses semantic token
<div style={{ color: 'var(--color-success)' }}>Success</div>
```

### ❌ Don't mix tokens and raw colors:
```tsx
// ❌ WRONG - Inconsistent
<div style={{
  color: 'var(--color-success)',
  backgroundColor: '#ffffff' // ❌ Raw color
}}>
  Success
</div>

// ✅ RIGHT - All semantic
<div style={{
  color: 'var(--color-success)',
  backgroundColor: 'var(--color-bg-primary)'
}}>
  Success
</div>
```

### ❌ Don't create custom colors when tokens exist:
```tsx
// ❌ WRONG - Using custom warning color
<div style={{ color: '#ff9800' }}>Warning</div>

// ✅ RIGHT - Uses standard warning token
<div style={{ color: 'var(--color-warning)' }}>Warning</div>
```

---

## Using Tokens in React Components

### In Inline Styles:
```tsx
function SuccessMessage() {
  return (
    <div style={{ 
      color: 'var(--color-success)',
      background: 'var(--color-bg-secondary)',
      padding: '1rem',
      borderRadius: '0.5rem'
    }}>
      ✓ Operation completed
    </div>
  );
}
```

### In CSS Modules:
```css
/* components/Alert.module.css */
.success {
  color: var(--color-success);
  background: var(--color-bg-secondary);
  border-left: 4px solid var(--color-success);
  padding: 1rem;
}
```

```tsx
import styles from './Alert.module.css';

function Alert({ type, message }) {
  return <div className={styles[type]}>{message}</div>;
}
```

### In Tailwind CSS:
```tsx
// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      error: 'var(--color-error)',
      // ... etc
    }
  }
}

// Usage in JSX
<div className="bg-success text-white p-4">
  Success message
</div>
```

---

## Theming with Semantic Tokens

### Dark Mode Example:
```css
:root {
  --color-success: #22c55e;      /* Light: bright green */
  --color-text-primary: #1F2936;  /* Light: dark text */
  --color-bg-primary: #ffffff;    /* Light: white bg */
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-success: #16a34a;      /* Dark: darker green */
    --color-text-primary: #F3F4F6; /* Dark: light text */
    --color-bg-primary: #111827;   /* Dark: dark bg */
  }
}
```

### Manual Theme Switching:
```tsx
function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.setProperty(
      '--color-success',
      theme === 'dark' ? '#16a34a' : '#22c55e'
    );
  }, [theme]);

  return (
    <div>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <div className="content">Content here</div>
    </div>
  );
}
```

---

## Brand Colors and Custom Tokens

You can create custom semantic tokens for your brand:

```css
/* Custom brand colors */
--color-brand-primary: #2563eb;
--color-brand-secondary: #7c3aed;
--color-brand-accent: #ec4899;

/* Map to use cases */
--color-primary-action: var(--color-brand-primary);
--color-secondary-action: var(--color-brand-secondary);
--color-highlight: var(--color-brand-accent);
```

### Adding Brand Colors in Code:
```tsx
// brandTokens.ts
export const brandTokens = {
  primary: '#2563eb',
  secondary: '#7c3aed', 
  accent: '#ec4899',
};

// Applied to root
Object.entries(brandTokens).forEach(([key, value]) => {
  document.documentElement.style.setProperty(
    `--color-brand-${key}`,
    value
  );
});
```

---

## Common Integration Patterns

### Form Validation:
```tsx
function FormField({ error, value }) {
  return (
    <div>
      <input 
        value={value}
        style={{
          borderColor: error 
            ? 'var(--color-error)'
            : 'var(--color-success)'
        }}
      />
      {error && (
        <span style={{ color: 'var(--color-error)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
```

### Status Indicators:
```tsx
function StatusBadge({ status }) {
  const statusColors = {
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-error)',
    info: 'var(--color-info)',
  };

  return (
    <span style={{
      backgroundColor: statusColors[status],
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px'
    }}>
      {status}
    </span>
  );
}
```

### Accessibility with Tokens:
```tsx
function AccessibleButton({ disabled }) {
  return (
    <button
      disabled={disabled}
      style={{
        backgroundColor: disabled 
          ? 'var(--color-bg-secondary)' // Lower contrast OK
          : 'var(--color-success)',      // High contrast
        color: disabled
          ? 'var(--color-text-secondary)'
          : 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1
      }}
    >
      Click me
    </button>
  );
}
```

---

## Testing Tokens

### Unit Test Example:
```typescript
describe('Semantic Tokens', () => {
  it('should have high contrast success color on white', () => {
    const success = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-success');
    
    const ratio = calculateContrastRatio(success, '#ffffff');
    expect(ratio).toBeGreaterThanOrEqual(4.5); // WCAG AA
  });

  it('should apply token to elements', () => {
    const element = document.getElementById('success-message');
    const color = window.getComputedStyle(element).color;
    
    const token = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-success');
    
    expect(color).toContain(token);
  });
});
```

---

## Troubleshooting

### Colors not updating when theme changes?
```tsx
// Make sure colors are CSS variables, not hardcoded
// ❌ Wrong - won't update
const color = colors[theme].success; // Static value

// ✅ Right - updates dynamically
const color = 'var(--color-success)'; // CSS variable
```

### Tokens not applying to nested elements?
```tsx
// ✅ Define tokens on root or parent
const root = document.documentElement;
root.style.setProperty('--color-success', '#22c55e');

// Tokens automatically cascade to children
```

### Can't find the color I need?
```tsx
// Check THEME_PALETTE_GUIDE.md for complete color reference
// Or create a custom token for your specific use case
// Custom tokens should always be mapped to semantic colors
```

---

## Best Practices Summary

1. **Always use semantic tokens** - Never hardcode colors
2. **Map tokens to meaning** - Use colors that convey intent
3. **Test for accessibility** - Ensure WCAG AA minimum contrast
4. **Keep themes consistent** - Light and dark should match intent
5. **Document custom tokens** - Explain why they exist
6. **Use CSS variables** - Enables dynamic theming and live updates
7. **Avoid inline styles where possible** - Prefer CSS classes for reusability
8. **Plan color scales** - Think about light, medium, dark variants

---

## Resources

- **Color Accessibility Report** - Use the app's built-in accessibility checker
- **WCAG Guidelines** - https://www.w3.org/WAI/WCAG21/
- **Color Tools** - https://colorhexa.com, https://contrast-ratio.com
- **Design Tokens** - https://specifyprotocol.com/blog/design-tokens
