# Theme Builder Tutorial

## Introduction

The Custom Color Builder is a visual tool that lets you create professional brand color schemes without writing code. This guide walks you through every feature.

---

## Getting Started

### Access the Theme Builder

1. Open the admin dashboard
2. Click **Settings** → **Appearance**
3. Click **Custom Color Builder** tab
4. Start designing!

---

## Step-by-Step Walkthrough

### Step 1: Choose Your Primary Brand Color

The primary color is the foundation of your theme.

**How to choose:**
1. Open the color picker (click the colored square)
2. Select your brand's primary color
3. Or enter a hex code (e.g., `#2563eb`)

**Tips:**
- Choose a color that represents your brand well
- Avoid pure black/white (harder to generate good scales)
- Mid-saturation colors work best for generating variations
- Test how it looks on both light and dark backgrounds

**Example Brands:**
- Tech Blue: `#2563eb` (professional, trust)
- Emerald Green: `#10b981` (growth, nature)
- Purple: `#a855f7` (creative, premium)
- Coral/Orange: `#ff6b6b` (energetic, friendly)

---

### Step 2: Set Theme Name

Give your theme a descriptive name:
- ✓ "Tech Blue 2024"
- ✓ "Brand Primary"
- ✓ "Company Green"

Why it matters:
- Helps you remember the theme when saved
- Appears in saved themes list
- Makes it easy to switch themes

---

### Step 3: Configure Background Colors

Background colors are used for testing accessibility.

**Light Background** (usually white):
- Default: `#ffffff`
- Leave as-is for standard web apps
- Adjust if your app has a tinted background

**Dark Background** (for dark mode):
- Default: `#1f2937` (dark gray)
- This is what dark mode backgrounds typically look like
- Adjust if your dark mode has a custom background

---

## Understanding the Color Scale

The color scale shows **tints** (lighter) and **shades** (darker) of your primary color.

### Why We Need Scales

A single color isn't enough. You need variations for:
- **Hover states** - Darker shade shows interactivity
- **Disabled states** - Lighter tint shows unavailable
- **Backgrounds** - Lightest tints for subtle backgrounds
- **Focus states** - Different shades for emphasis

### How Scales Work

```
50     = Lightest (almost white)
500    = Base (your primary color)
950    = Darkest (almost black)
```

### Using Scale Colors in Code

```tsx
// Button hover effects
<button 
  style={{
    backgroundColor: 'var(--color-primary)',           // Normal: 500
  }}
  onMouseOver={(e) => e.target.style.background = 'var(--color-primary-600)'} // Hover: darker
>
  Click me
</button>

// Text hierarchy
<h1 style={{ color: 'var(--color-primary-900)' }}>     {/* Darkest for maximum contrast */}
<h2 style={{ color: 'var(--color-primary-700)' }}>     {/* Very dark */}
<p style={{ color: 'var(--color-primary-600)' }}>      {/* Dark for body text */}
```

---

## Semantic Colors

Semantic colors give **meaning** to colors:

### Success (Green)
- Used for: checkmarks, confirmations, success states
- Communicates: approval, completion
- Example usage: ✓ Password is strong

### Warning (Orange/Yellow)
- Used for: cautions, pending actions, alerts
- Communicates: attention needed
- Example usage: ⚠ You have unsaved changes

### Error (Red)
- Used for: errors, failures, destructive actions
- Communicates: something went wrong
- Example usage: ✗ Invalid email format

### Info (Blue)
- Used for: informational content, help text
- Communicates: neutral information
- Example usage: ℹ This feature is new

**The builder auto-generates these** - you don't pick them manually! The algorithm ensures they're:
- Distinct from your brand color
- Appropriate intensity for their meaning
- Accessible against light and dark backgrounds

---

## Color Harmony

The builder shows complementary and analogous colors.

### Complementary Color
- Opposite on color wheel
- Maximum contrast
- Use for: CTAs, emphasis, callouts

### Analogous Colors
- Next to primary on color wheel
- Harmonious with primary
- Use for: related features, grouped actions

**Example:**
```css
/* Primary button */
button.primary {
  background: var(--color-primary);
}

/* Complementary accent */
button.accent {
  background: var(--color-complementary);
}
```

---

## Accessibility Checking

The **Accessibility** tab shows if your semanticcolors are readable.

### What Gets Checked

For each semantic color (success, warning, error, info), we test:
- Color on **light background** - WCAG AA compliant? ✓/✗
- Color on **dark background** - WCAG AA compliant? ✓/✗

### What WCAG AA Means

- WCAG AA is the standard web accessibility level
- Requires: 4.5:1 contrast ratio minimum
- Approximately: light color vs dark color

### Fixing Failed Colors

If a color fails accessibility:

1. **Try a different primary color**
   - Different primary → Different semantic colors
   - Sometimes a slight hue shift helps

2. **Darken the semantic color**
   - More contrast = more readable
   - Manual adjustment in custom color picker

3. **Change background colors tested**
   - If you know your light background isn't pure white, adjust it
   - This affects accessibility calculation

### Why This Matters

Inaccessible colors:
- ❌ Exclude users with color blindness
- ❌ Hurt readability in bright sunlight
- ❌ Violate legal accessibility requirements
- ❌ Poor user experience for everyone

Accessible colors:
- ✓ Help everyone, not just those with disabilities
- ✓ Required by law in many countries
- ✓ Better design quality overall

---

## Exporting Your Theme

### Option 1: CSS Variables

Perfect if you use CSS or TailwindCSS:

```css
:root {
  --color-primary-light: #dbeafe;
  --color-primary: #2563eb;
  --color-primary-dark: #1e40af;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  --color-complementary: #ff972d;
  --color-analogous-left: #2e5eb8;
  --color-analogous-right: #25b3d6;
  --color-bg-light: #ffffff;
  --color-bg-dark: #1f2937;
}
```

**How to use:**
```css
.button {
  background: var(--color-primary);
  color: white;
}

.button:hover {
  background: var(--color-primary-dark);
}
```

### Option 2: JavaScript Object

Perfect if you use JavaScript/TypeScript:

```javascript
export const brandColors = {
  "primary-light": "#dbeafe",
  "primary": "#2563eb",
  "primary-dark": "#1e40af",
  "success": "#22c55e",
  "warning": "#f59e0b",
  "error": "#ef4444",
  "info": "#3b82f6",
  "complementary": "#ff972d",
  "analogous-left": "#2e5eb8",
  "analogous-right": "#25b3d6",
  "bg-light": "#ffffff",
  "bg-dark": "#1f2937"
};

// Usage
const buttonColor = brandColors.primary;
```

### How to Export

1. Click **Export** button
2. Choose format: **CSS Variables** or **JavaScript**
3. Review the code
4. Click **Copy to Clipboard**
5. Paste into your project

---

## Saving Themes

### Save Your Theme

1. Name your theme (suggested auto-fill available)
2. Click **Save Theme**
3. Theme appears in "Saved Themes" section

### Why Save?

- Create multiple brand variations
- Quick switching between themes
- Compare different options
- Team collaboration reference

### Load a Saved Theme

1. Find theme in "Saved Themes" list
2. Click **Load**
3. All settings update to that theme

### Delete a Saved Theme

1. Find theme in list
2. Click **Delete** (trash icon)
3. Theme removed from localStorage

---

## Common Workflows

### Workflow 1: Create Light & Dark Variant

1. **Create Light Theme**
   - Primary color: `#2563eb`
   - Light BG: `#ffffff`
   - Dark BG: `#1f2937`
   - Save as "Blue - Light"

2. **Adjust for Dark**
   - Keep same primary
   - Light BG: `#f3f4f6` (lighter for dark mode)
   - Dark BG: `#030712` (darker variant)
   - Save as "Blue - Dark"

### Workflow 2: Create Brand Variation

1. **Main Brand**
   - Save: "Brand 2024"

2. **Q1 Campaign**
   - Change primary: `#ff6b6b` (coral)
   - Adjust light/dark for campaign
   - Save: "Campaign Q1"

3. **Quick Switch**
   - Load either theme
   - Colors update instantly

### Workflow 3: Accessibility-First

1. Choose primary color
2. Check Accessibility tab
3. If any color fails:
   - Try different primary
   - Repeat step 2
4. When all pass, save theme

---

## Tips & Tricks

### Tip 1: Start with Established Colors
Don't reinvent! Use colors that already work:
- Brand guidelines (your company)
- Material Design color palette
- Popular brand colors

### Tip 2: Test in Real App
- Save your theme
- Switch to it in the app
- View actual components
- Verify it looks good

### Tip 3: Get Feedback
- Show designers the color scale
- Ask about semantic colors
- Test with real users
- Refine based on feedback

### Tip 4: Consider All States
Do all these look good?
- Text on primary color
- Primary button hover state
- Disabled state (lighter)
- Small vs large text

### Tip 5: Mobile Testing
- Colors might look different on mobile
- Test on real device if possible
- Outdoor/bright light testing
- Low-brightness testing

---

## Troubleshooting

### Q: Colors look washed out in light theme
**A:** Increase saturation by choosing a more vivid primary color, or increase the lightness of semantic colors.

### Q: Dark theme colors are too bright
**A:** Make the dark background even darker, or adjust semantic colors to be less saturated.

### Q: Semantic colors don't match my brand
**A:** This is intentional - semantic colors communicates meaning, not brand. Use your primary color for brand identity.

### Q: WCAG checks keep failing
**A:** Try:
1. Different primary color (different semantic colors)
2. Adjust light/dark backgrounds tested
3. Increase saturation/contrast of primary

### Q: Changed a color and all semantic colors updated
**A:** This is correct! Semantic colors are auto-generated from your primary. Change primary color = all semantic colors adapt.

### Q: Can't find my saved theme
**A:** Themes are saved to browser's localStorage:
- Clear browser cache = themes deleted
- Different browser = themes not visible
- Check "Saved Themes" section

### Q: Want to export theme but don't see export button
**A:** Make sure you've:
1. Set a primary color
2. Set light and dark backgrounds
3. Clicked the export button (not save)

---

## Color Psychology Guide

**Choose colors that match your brand personality:**

| Color | Psychology | Use Case |
|-------|-----------|----------|
| Blue | Trust, stability, professional | SaaS, banks, corporate |
| Green | Growth, nature, health | Health, finance, eco |
| Purple | Creative, premium, mysterious | Design, tech, luxury |
| Red | Energy, passion, urgency | Action, sales, alerts |
| Orange | Friendly, warm, energetic | Social, fun, startup |
| Yellow | Happy, optimistic, caution | Warning, energy, youth |

---

## Integration Examples

### React Component
```tsx
import { brandColors } from './brandColors';

function Button({ variant = 'primary' }) {
  return (
    <button
      style={{
        backgroundColor: brandColors[variant],
        color: '#ffffff',
        padding: '10px 20px',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      Click Me
    </button>
  );
}
```

### TailwindCSS Config
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: brandColors.primary,
        success: brandColors.success,
        warning: brandColors.warning,
        error: brandColors.error,
      }
    }
  }
}
```

### CSS-in-JS
```javascript
const styles = {
  button: {
    primary: `
      background-color: ${brandColors.primary};
      color: white;
      &:hover {
        background-color: ${brandColors['primary-dark']};
      }
    `
  }
}
```

---

## Next Steps

1. **Create your first theme** - Follow Step 1-3
2. **Check accessibility** - Ensure all colors pass WCAG AA
3. **Export your colors** - Choose CSS or JS format
4. **Integrate in your app** - Update color definitions
5. **Save variations** - Create light, dark, campaign themes

---

## Resources

- **Accessibility Checker** - Built into theme builder
- **Color Picker Tools** - https://color.adobe.com
- **WCAG Contrast Checker** - https://contrast-ratio.com
- **Color Psychology** - https://www.smashingmagazine.com/2010/01/color-psychology
