# Accessibility Best Practices Guide

## What is Web Accessibility?

Web accessibility means creating digital products that work for **everyone**, including people with:
- Vision impairments (blind, low vision, color blind)
- Hearing impairments (deaf, hard of hearing)
- Motor impairments (limited dexterity, paralysis)
- Cognitive impairments (dyslexia, ADHD, learning disabilities)

---

## Why Accessibility Matters

### Legal & Compliance
- **ADA** (Americans with Disabilities Act) - US requirement
- **GDPR** - EU accessibility requirements
- **AODA** (Accessibility for Ontarians with Disabilities Act) - Canada
- Risk of lawsuits if your site is inaccessible

### Business Benefits
- **Larger audience** - ~1 in 4 adults have disabilities
- **Better SEO** - Search engines prefer accessible sites
- **Better UX** - Accessibility features help everyone
- **Brand reputation** - Shows you care about inclusion

### Ethical Reasons
- Everyone deserves access to information
- People with disabilities spend billions online
- Digital inclusion is a moral imperative

---

## WCAG Standards Explained

WCAG = Web Content Accessibility Guidelines (by W3C)

### Three Levels

**Level A** - Minimum standard
- Basic accessibility
- Usually insufficient
- Don't aim for this

**Level AA** ← **WE TARGET THIS**
- Standard web accessibility
- Legally required in many places
- Good balance of accessibility and design
- Focuses on: contrast, text, keyboard nav

**Level AAA** - Enhanced accessibility
- For specialized sites (medical, education)
- More restrictive design requirements
- Harder to achieve

---

## Color Accessibility

### The Contrast Ratio

Contrast ratio measures how different two colors are.

**Formula:**
```
Contrast = (Lighter luminance + 0.05) / (Darker luminance + 0.05)
```

**Range:** 1:1 to 21:1

### WCAG AA Contrast Requirements

#### Normal Text
| Requirement | Ratio | Example |
|------------|-------|---------|
| AA Pass | 4.5:1 | Black text on white |
| AAA Pass | 7:1 | Darker background |

#### Large Text (18pt+ or 14pt bold)
| Requirement | Ratio | Example |
|------------|-------|---------|
| AA Pass | 3:1 | Lower threshold |
| AAA Pass | 4.5:1 | Higher threshold |

#### Graphics & UI Components
| Requirement | Ratio |
|------------|-------|
| AA Pass | 3:1 |
| AAA Pass | 4.5:1 |

### Testing Contrast

**Online Tools:**
- https://contrast-ratio.com - Simple, quick
- https://webaim.org/resources/contrastchecker/ - Detailed
- Built-in: Use our Access Report feature

**In Our App:**
1. Admin Dashboard → Appearance → Accessibility Report
2. Shows every color pair
3. Highlights violations
4. Suggests fixes

### Fix Low Contrast

**Problem:** Light gray text on white background
- Contrast: 1.5:1
- Users can't read it

**Solutions:**
1. **Darken text** → Use dark gray instead
2. **Lighten background** → Probably not for white BG
3. **Use different color** → Black/dark text is most readable

**Code Example:**
```css
/* ❌ BAD: 1.5:1 contrast */
.text {
  color: #c4b5fd;      /* light purple */
  background: #ffffff;  /* white */
}

/* ✓ GOOD: 7.5:1 contrast */
.text {
  color: #6d28d9;      /* dark purple */
  background: #ffffff;  /* white */
}
```

---

## Color Blindness Considerations

### Types of Color Blindness

**Red-Green** (most common, ~8% of males)
- Can't distinguish red from green
- Appears as brown, yellow, gray
- Solution: Don't rely on red/green alone

**Blue-Yellow** (rare, ~0.1%)
- Confusion with blue and yellow
- Blue appears purple
- Yellow appears pink

**Monochromacy** (rarest, ~0.001%)
- See only in grayscale
- Rely entirely on brightness/contrast
- Solution: Maximum contrast + patterns/icons

### Design with Color Blindness

```tsx
// ❌ BAD: Only uses color to indicate status
<div style={{ backgroundColor: '#22c55e' }}>
  Success
</div>

// ✓ GOOD: Color + text + icon
<div style={{ 
  backgroundColor: '#22c55e',
  padding: '1rem'
}}>
  ✓ <strong>Success:</strong> Changes saved
</div>

// ✓ BETTER: Pattern + color + text
<div style={{ 
  backgroundColor: '#22c55e',
  borderLeft: '4px solid #16a34a'
}}>
  ✓ Success: Changes saved
</div>
```

### Testing Color Blindness

Tools:
- Chrome DevTools: Emulate color vision deficiencies
- https://www.color-blindness.com/coblis-color-blindness-simulator/
- Accessibility tools in our app support this

---

## Semantic Colors in Accessibility

Our semantic colors are **designed** for accessibility.

### Success (Green)
- ✓ Designed with enough contrast
- ✓ Distinguishable from warning/error
- ✓ Accessible on light and dark backgrounds

### Warning (Orange)
- ⚠ Distinct from success and error
- ⚠ Never use with red or green alone
- ⚠ Always pair with text label

### Error (Red)
- ✗ High contrast against backgrounds
- ✗ Clear visual dominance
- ✗ Always paired with explanation

### Info (Blue)
- ℹ Neutral, non-threatening color
- ℹ Good contrast on all backgrounds
- ℹ Doesn't suggest urgency

### Usage Pattern

```tsx
// ✓ GOOD: Color + icon + text
<Alert type="error">
  <XIcon /> {/* ✗ icon */}
  Error: Invalid email format
</Alert>

// ✓ GOOD: Color + border + pattern
<div className="alert-warning">
  ⚠ {/* ⚠ icon */}
  This action cannot be undone
</div>

// ❌ BAD: Color alone
<div style={{ backgroundColor: '#ef4444' }} />
{/* Users with color blindness can't read this */}
```

---

## Contrast Accessibility Report

### What It Checks

For each semantic color, tests:
- Contrast on light backgrounds
- Contrast on dark backgrounds
- WCAG AA compliance (4.5:1)
- WCAG AAA compliance (7:1)

### How to Use the Report

1. **Go to:** Admin Dashboard → Appearance
2. **Tab:** Accessibility Report
3. **Review:**
   - Summary stats (violations)
   - Individual color pairs
   - Suggested fixes

### Interpreting Results

```
✓ SUCCESS: Color pair passes WCAG AA
  → Safe to use

◐ WARNING: Passes AA but not AAA
  → Use for normal text only
  → NOT for links (special rules apply)

✗ FAILURE: Doesn't meet AA
  → Do NOT use this combination
  → Violates accessibility laws
```

### Fixing Violations

**If you see violations:**

1. **Accept report as requirement** - Must fix before deploy
2. **View suggested fixes** - Click violation for suggestions
3. **Try the suggestions:**
   - Darken foreground color
   - Lighten background
   - Change both proportionally
4. **Update color tokens** - Change CSS variables
5. **Re-check** - Run report again
6. **Verify** - Test in layout

---

## Text and Typography

### Font Size

**Minimum sizes:**
- Body text: 14px
- Captions/help: 12px

**For accessibility:**
- 16px or larger is easier to read
- Especially on mobile devices

**Don't ever:**
- Use text smaller than 12px (excluding icons)
- Use all-caps for long text (harder to scan)

### Line Height

Proper spacing makes text readable:

```css
/* Good line height for accessibility */
p {
  line-height: 1.5;      /* At least 1.5x font size */
  letter-spacing: 0.02em; /* Some letter spacing */
}
```

### Font Choice

**Accessible fonts:**
- Arial, Helvetica
- Verdana
- Tahoma
- Georgia (serif)
- System fonts (-apple-system, system-ui)

**Avoid:**
- Thin/light fonts (low contrast)
- Excessive styling (italic, underline simultaneously)
- Decorative fonts for body text

### Dyslexia-Friendly

Consider dyslexia with:
- Sans-serif fonts (clearer shapes)
- Wider letter spacing
- Taller line height
- Left-aligned text (not justified)
- Good color contrast

```css
/* Dyslexia-friendly styling */
.accessible-text {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  letter-spacing: 0.05em;
  text-align: left;
}
```

---

## Interactive Elements

### Keyboard Navigation

**All interactive elements must work with keyboard:**

```tsx
// ✓ GOOD: Works with Tab, Enter, Space
<button onClick={handleClick}>
  Submit
</button>

// ❌ BAD: Only works with mouse click
<div onClick={handleClick} role="button">
  Submit
</div>

// ✓ GOOD: Custom element with accessibility
<div 
  role="button"
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter') handleClick();
  }}
  tabIndex={0}
>
  Submit
</div>
```

### Focus Indicators

Users navigating by keyboard need to see where they are:

```css
/* ✓ GOOD: Clear focus indicator */
button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* ❌ BAD: Outline removed */
button:focus {
  outline: none; /* Don't do this! */
}

/* ❌ BAD: Invisible focus */
button:focus {
  outline: 1px solid white; /* On white bg = invisible */
}
```

### Button Sizes

Make touch targets large enough:

```css
/* Good minimum: 44x44px */
button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}
```

---

## Testing for Accessibility

### Browser Testing

**Chrome DevTools:**
1. Right-click page → Inspect
2. DevTools → Accessibility tab
3. Shows aria labels, roles, contrast issues

**Firefox:**
1. Developer Tools → Inspector
2. Accessibility tab
3. Similar features to Chrome

### Keyboard Navigation Testing

1. Unplug mouse
2. Use Tab to navigate
3. Check:
   - Can reach all interactive elements
   - Focus indicators visible
   - Tab order makes sense
   - No keyboard traps (can't escape)

### Color Blindness Testing

**Chrome DevTools:**
1. DevTools → Rendering tab
2. Emulate CSS media feature prefers-color-scheme
3. Check color vision deficiency simulation

**Firefox:**
1. Inspector → Accessibility panel
2. Simulate color blindness

### Screen Reader Testing

Popular screen readers:
- **NVDA** (Windows, free)
- **JAWS** (Windows, commercial)
- **VoiceOver** (Mac, built-in)
- **TalkBack** (Android, built-in)

**What to test:**
- Can navigate menus
- Can read form fields
- Can interact with buttons
- Headings make sense
- Images have alt text

---

## Common Accessibility Mistakes

### 1. Color Alone for Information

```tsx
// ❌ BAD
<div style={{ color: '#ef4444' }}>
  Error in form
</div>

// ✓ GOOD
<div style={{ color: '#ef4444' }}>
  ✗ Error in form: Email is invalid
</div>
```

### 2. Placeholder as Label

```tsx
// ❌ BAD: Placeholder disappears, user forgets what field is
<input placeholder="Email address" />

// ✓ GOOD: Label + optional placeholder
<label htmlFor="email">Email address</label>
<input id="email" placeholder="user@example.com" />
```

### 3. Missing Alt Text

```tsx
// ❌ BAD: Screen readers see nothing
<img src="success-icon.svg" />

// ✓ GOOD: Describes the image
<img src="success-icon.svg" alt="Success: Changes saved" />

// ALSO OK: Decorative images
<img src="decorative-line.svg" alt="" />
```

### 4. Keyboard Traps

```tsx
// ❌ BAD: Tab into modal, can't tab out
<Modal>
  <input />
</Modal>

// ✓ GOOD: Focus trap but with escape key to exit
<Modal onEscapeKey={handleClose}>
  <input />
</Modal>
```

### 5. Unclear Links

```tsx
// ❌ BAD: "Click here" doesn't describe where it goes
<a href="/privacy">Click here</a>

// ✓ GOOD: Link text describes destination
<a href="/privacy">Privacy Policy</a>

// ✓ GOOD: Aria-label when visual text isn't enough
<a href="/next" aria-label="Go to next page">
  →
</a>
```

---

## Accessibility Checklist

### Colors
- [ ] Text contrast >= 4.5:1 (AA normal)
- [ ] Large text contrast >= 3:1 (AA large)
- [ ] Semantic colors pass WCAG checks
- [ ] Information not conveyed by color alone
- [ ] Color blindness-safe (test with simulator)

### Typography
- [ ] Body text >= 14px (16px better)
- [ ] Line height >= 1.5  
- [ ] Readable font (sans-serif for body)
- [ ] Clear visual hierarchy
- [ ] Not all-caps for long text

### Interactive Elements
- [ ] All buttons keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators visible (2px+ outline)
- [ ] Touch targets >= 44x44px
- [ ] No keyboard traps

### Forms
- [ ] All fields have labels
- [ ] Error messages clear
- [ ] Error locations visible (color + text)
- [ ] Help text associated with fields
- [ ] Required fields marked clearly

### Images & Media
- [ ] Meaningful images have alt text
- [ ] Decorative images have alt=""
- [ ] Videos have captions
- [ ] Audio has transcripts

### Content
- [ ] Headings in correct nesting (h1 → h2 → h3)
- [ ] Meaningful link text
- [ ] Text is scannable (short paragraphs)
- [ ] Important info not embedded in images

---

## Making Your Dynamic Theme Accessible

### When Changing Colors

Ensure new colors are still accessible:

```tsx
// Before changing color
const newColor = getUserColor(); // From color picker

// Check accessibility first
const reportData = generateAccessibilityReport(
  themeName,
  [
    { name: 'Success', value: newColor, usage: 'UI' },
    // ... other colors
  ],
  'AA'
);

// Only apply if no critical violations
if (reportData.summary.critical === 0) {
  applyTheme(newColor);
} else {
  showError('Color combination is not accessible');
}
```

### Real-Time Accessibility

Our app provides:
- **Accessibility Report Tab** - Check any theme
- **Custom Color Builder** - Shows accessibility status
- **Report Viewer** - Detailed violation analysis

---

## Resources & Tools

### Contrast Checking
- https://contrast-ratio.com
- https://www.tpgi.com/color-contrast-checker/
- Built-in: Our app's Accessibility Report

### Color Simulation
- Chrome DevTools emulate vision deficiencies
- https://www.color-blindness.com/coblis-color-blindness-simulator/

### Accessibility Testing
- WAVE browser extension
- Axe DevTools
- Lighthouse (in Chrome DevTools)

### Learning
- Web Accessibility by Google (free course)
- A11ycasts (YouTube series)
- https://www.w3.org/WAI/

### Standards
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Accessible Names & Descriptions
- ARIA Authoring Practices Guide

---

## Common Questions

### Q: Does accessibility make sites look bad?
**A:** No! Good accessibility = good design for everyone. Users with disabilities benefit, but so do:
- People using mobile networks (slow)
- People in bright sunlight (need contrast)
- Older people (prefer larger text)
- Non-native speakers (clear language)

### Q: Do I need AAA or AA?
**A:** Aim for AA. AAA is much more restrictive and limits design options. Unless you're building for medical/education sites, AA is sufficient and legally required.

### Q: We already have color, why change?
**A:** You're probably not accessibility-compliant. Our semantic tokens and reports help you identify and fix issues before they become legal problems.

### Q: Will users appreciate accessibility?
**A:** Yes! 1 in 4 adults experience some disability. Many more benefit from accessible design (elderly, parents with kids, etc.). It's also legally required.

### Q: How long does accessibility take?
**A:** If built-in from start: minimal extra effort. If retrofitting: significant. That's why we've built accessibility checks into our theme system.

---

## Summary

**Accessibility isn't optional.** It's:
- **Legal** - Required by law in many places
- **Ethical** - Includes people with disabilities
- **Business-smart** - Reaches more customers
- **Easier** - Built into our tools

**Our tools help by:**
- Checking color contrast automatically
- Generating semantically correct colors
- Testing against WCAG standards
- Suggesting fixes for violations
- Guiding best practices

Start with **WCAG AA as minimum**, test with our tools, and iterate with feedback!
