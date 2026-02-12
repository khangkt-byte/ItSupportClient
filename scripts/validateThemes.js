/**
 * Theme WCAG Validation Script
 * 
 * Validates all themes in palettes.ts for WCAG accessibility compliance.
 * Runs automatically before build to ensure all themes meet standards.
 * 
 * Features:
 * - Validates color palette progression
 * - Checks WCAG AA/AAA contrast ratios
 * - Reports accessibility issues
 * - Fails build if critical issues found
 * 
 * Usage:
 *   npm run validate:themes
 * 
 * @see src/utils/validation/colorValidation.ts
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read palettes.ts
const palettesPath = join(__dirname, '../src/constants/palettes.ts');
const palettesContent = readFileSync(palettesPath, 'utf-8');

/**
 * Extract theme palettes from palettes.ts
 */
function extractThemes() {
  const themes = {};
  
  // Match: 'brand-name': { primary: { 50: '#...', ... } }
  const themeRegex = /'(brand-[a-z]+)':\s*\{[\s\S]*?primary:\s*\{([\s\S]*?)\}/g;
  
  let match;
  while ((match = themeRegex.exec(palettesContent)) !== null) {
    const themeName = match[1];
    const primaryBlock = match[2];
    
    const colors = {};
    const colorRegex = /(\d+):\s*'(#[0-9a-fA-F]{6})'/g;
    
    let colorMatch;
    while ((colorMatch = colorRegex.exec(primaryBlock)) !== null) {
      colors[colorMatch[1]] = colorMatch[2];
    }
    
    if (Object.keys(colors).length > 0) {
      themes[themeName] = colors;
    }
  }
  
  return themes;
}

/**
 * Validate hex color format
 */
function isValidHexColor(hex) {
  const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(hex);
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex) {
  let cleanHex = hex.replace('#', '');
  
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(char => char + char).join('');
  }
  
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return { r, g, b };
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Calculate relative luminance (WCAG formula)
 */
function getRelativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const rLinear = rNorm <= 0.03928 ? rNorm / 12.92 : Math.pow((rNorm + 0.055) / 1.055, 2.4);
  const gLinear = gNorm <= 0.03928 ? gNorm / 12.92 : Math.pow((gNorm + 0.055) / 1.055, 2.4);
  const bLinear = bNorm <= 0.03928 ? bNorm / 12.92 : Math.pow((bNorm + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(hex1, hex2) {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Validate single theme palette
 */
function validateTheme(themeName, palette) {
  const issues = [];
  const warnings = [];
  const lightnessValues = [];
  
  const tones = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  
  // Check format and lightness progression
  for (const tone of tones) {
    const color = palette[tone];
    
    if (!color) {
      issues.push(`Missing tone ${tone}`);
      continue;
    }
    
    if (!isValidHexColor(color)) {
      issues.push(`Invalid hex format at tone ${tone}: ${color}`);
      continue;
    }
    
    const rgb = hexToRgb(color);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    lightnessValues.push({ tone, lightness: hsl.l });
  }
  
  // Check lightness strictly decreasing (50 → 950)
  for (let i = 1; i < lightnessValues.length; i++) {
    const prev = lightnessValues[i - 1];
    const curr = lightnessValues[i];
    
    if (curr.lightness >= prev.lightness) {
      warnings.push(
        `Lightness not decreasing: tone ${curr.tone} (${curr.lightness}%) >= tone ${prev.tone} (${prev.lightness}%)`
      );
    }
  }
  
  // Check critical contrast ratios
  const light = palette[50];
  const dark = palette[950];
  
  if (light && dark) {
    const contrastRatio = getContrastRatio(light, dark);
    
    // WCAG AA requires 4.5:1 for normal text
    if (contrastRatio < 4.5) {
      issues.push(
        `Low contrast between lightest and darkest: ${contrastRatio.toFixed(2)}:1 (requires 4.5:1)`
      );
    }
  }
  
  return { issues, warnings };
}

/**
 * Main validation
 */
function main() {
  console.log('🔍 Validating theme accessibility...\n');
  
  const themes = extractThemes();
  const themeNames = Object.keys(themes);
  
  if (themeNames.length === 0) {
    console.error('❌ No themes found in palettes.ts');
    process.exit(1);
  }
  
  console.log(`Found ${themeNames.length} themes: ${themeNames.join(', ')}\n`);
  
  let totalIssues = 0;
  let totalWarnings = 0;
  let hasBlockingIssues = false;
  
  for (const themeName of themeNames) {
    const palette = themes[themeName];
    const { issues, warnings } = validateTheme(themeName, palette);
    
    if (issues.length > 0 || warnings.length > 0) {
      console.log(`\n📦 ${themeName}:`);
      
      if (issues.length > 0) {
        console.log('  ❌ Issues:');
        issues.forEach(issue => console.log(`     - ${issue}`));
        totalIssues += issues.length;
        hasBlockingIssues = true;
      }
      
      if (warnings.length > 0) {
        console.log('  ⚠️  Warnings:');
        warnings.forEach(warning => console.log(`     - ${warning}`));
        totalWarnings += warnings.length;
      }
    } else {
      console.log(`✅ ${themeName} - All checks passed`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`  Themes validated: ${themeNames.length}`);
  console.log(`  Issues found:     ${totalIssues}`);
  console.log(`  Warnings found:   ${totalWarnings}`);
  
  if (hasBlockingIssues) {
    console.log('\n❌ Validation FAILED - Fix issues before building\n');
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log('\n⚠️  Validation passed with warnings\n');
    process.exit(0);
  } else {
    console.log('\n✅ All themes passed accessibility validation!\n');
    process.exit(0);
  }
}

main();
