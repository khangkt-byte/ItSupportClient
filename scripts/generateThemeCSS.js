/**
 * Theme CSS Generator - Build-time Optimization
 * 
 * Auto-generates CSS custom properties from TypeScript design tokens.
 * This eliminates manual CSS synchronization and ensures consistency.
 * 
 * Follows industry best practices:
 * - Material Design 3 (Google): Build-time token generation
 * - Carbon Design System (IBM): Auto-generated SCSS from JSON
 * - Shopify Polaris: Multi-format token generation
 * 
 * Usage:
 *   npm run generate:themes
 * 
 * Output:
 *   src/styles/generated-themes.css (DO NOT EDIT - Auto-generated)
 * 
 * @see https://github.com/material-components/material-web/blob/main/tokens/README.md
 * @see https://github.com/carbon-design-system/carbon/tree/main/packages/themes
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read palettes.ts and extract color values
// Since we can't directly import TypeScript in Node.js without compilation,
// we'll parse the file content
const palettesPath = join(__dirname, '../src/constants/palettes.ts');
const palettesContent = readFileSync(palettesPath, 'utf-8');

/**
 * Extract brand theme definitions from palettes.ts
 * Parses the TypeScript file to get theme names and colors
 */
function extractThemes() {
  const themes = {};
  
  // Regex to match brand theme definitions
  // Matches: 'brand-name': { primary: { 50: '#...', ... } }
  const themeRegex = /'(brand-[a-z]+)':\s*\{[\s\S]*?primary:\s*\{([\s\S]*?)\}/g;
  
  let match;
  while ((match = themeRegex.exec(palettesContent)) !== null) {
    const themeName = match[1];
    const primaryBlock = match[2];
    
    // Extract color values
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
 * Extract semantic tokens from palettes.ts
 */
function extractSemanticTokens() {
  // Match defaultSemanticTokens constant first
  const defaultRegex = /export\s+const\s+defaultSemanticTokens\s*:\s*SemanticTokens\s*=\s*\{[\s\S]*?success:\s*'(#[0-9a-fA-F]{6})',[\s\S]*?error:\s*'(#[0-9a-fA-F]{6})',[\s\S]*?warning:\s*'(#[0-9a-fA-F]{6})',[\s\S]*?info:\s*'(#[0-9a-fA-F]{6})',[\s\S]*?disabled:\s*'(#[0-9a-fA-F]{6})'/;
  
  const match = defaultRegex.exec(palettesContent);
  
  if (match) {
    return {
      success: match[1],
      error: match[2],
      warning: match[3],
      info: match[4],
      disabled: match[5],
    };
  }
  
  // Fallback: match any semantic block
  const semanticRegex = /semantic:\s*\{[\s\S]*?success:\s*'(#[0-9a-fA-F]{6})',[\s\S]*?error:\s*'(#[0-9a-fA-F]{6})',[\s\S]*?warning:\s*'(#[0-9a-fA-F]{6})',[\s\S]*?info:\s*'(#[0-9a-fA-F]{6})',[\s\S]*?disabled:\s*'(#[0-9a-fA-F]{6})'/;
  
  const fallbackMatch = semanticRegex.exec(palettesContent);
  
  if (fallbackMatch) {
    return {
      success: fallbackMatch[1],
      error: fallbackMatch[2],
      warning: fallbackMatch[3],
      info: fallbackMatch[4],
      disabled: fallbackMatch[5],
    };
  }
  
  console.warn('⚠️ Could not parse defaultSemanticTokens from palettes.ts, using fallback');
  return {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    disabled: '#6b7280',
  };
}

/**
 * Extract dark semantic tokens from palettes.ts
 */
function extractDarkSemanticTokens() {
  const darkRegex = /export\s+const\s+darkSemanticTokens\s*:\s*SemanticTokens\s*=\s*\{[\s\S]*?success:\s*'(#[0-9a-fA-F]{6})',[\s\S]*?error:\s*'(#[0-9a-fA-F]{6})',[\s\S]*?warning:\s*'(#[0-9a-fA-F]{6})',[\s\S]*?info:\s*'(#[0-9a-fA-F]{6})',[\s\S]*?disabled:\s*'(#[0-9a-fA-F]{6})'/;
  
  const match = darkRegex.exec(palettesContent);
  
  if (match) {
    return {
      success: match[1],
      error: match[2],
      warning: match[3],
      info: match[4],
      disabled: match[5],
    };
  }
  
  console.warn('⚠️ Could not parse darkSemanticTokens from palettes.ts, using fallback');
  return {
    success: '#4ade80',
    error: '#f87171',
    warning: '#fbbf24',
    info: '#60a5fa',
    disabled: '#9ca3af',
  };
}

/**
 * Extract high contrast light semantic tokens from palettes.ts
 */
function extractHighContrastLightSemanticTokens() {
  const hcLightRegex = /export\s+const\s+highContrastLightSemanticTokens\s*:\s*SemanticTokens\s*=\s*\{[\s\S]*?success:\s*'(#[0-9a-fA-F]{6})',[\s\S]*?error:\s*'(#[0-9a-fA-F]{6})',[\s\S]*?warning:\s*'(#[0-9a-fA-F]{6})',[\s\S]*?info:\s*'(#[0-9a-fA-F]{6})',[\s\S]*?disabled:\s*'(#[0-9a-fA-F]{6})'/;
  
  const match = hcLightRegex.exec(palettesContent);
  
  if (match) {
    return {
      success: match[1],
      error: match[2],
      warning: match[3],
      info: match[4],
      disabled: match[5],
    };
  }
  
  console.warn('⚠️ Could not parse highContrastLightSemanticTokens from palettes.ts, using fallback');
  return {
    success: '#000000',
    error: '#000000',
    warning: '#000000',
    info: '#000000',
    disabled: '#808080',
  };
}

/**
 * Extract high contrast dark semantic tokens from palettes.ts
 */
function extractHighContrastDarkSemanticTokens() {
  const hcDarkRegex = /export\s+const\s+highContrastDarkSemanticTokens\s*:\s*SemanticTokens\s*=\s*\{[\s\S]*?success:\s*'(#[0-9a-fA-F]{6})',[\s\S]*?error:\s*'(#[0-9a-fA-F]{6})',[\s\S]*?warning:\s*'(#[0-9a-fA-F]{6})',[\s\S]*?info:\s*'(#[0-9a-fA-F]{6})',[\s\S]*?disabled:\s*'(#[0-9a-fA-F]{6})'/;
  
  const match = hcDarkRegex.exec(palettesContent);
  
  if (match) {
    return {
      success: match[1],
      error: match[2],
      warning: match[3],
      info: match[4],
      disabled: match[5],
    };
  }
  
  console.warn('⚠️ Could not parse highContrastDarkSemanticTokens from palettes.ts, using fallback');
  return {
    success: '#ffffff',
    error: '#ffffff',
    warning: '#ffffff',
    info: '#ffffff',
    disabled: '#808080',
  };
}

/**
 * Extract semantic variant tokens (foreground, background, border) from palettes.ts
 */
function extractSemanticVariants(varName) {
  // Build regex to match the named export
  const regex = new RegExp(
    `export\\s+const\\s+${varName}\\s*:\\s*SemanticVariantTokens\\s*=\\s*\\{([\\s\\S]*?)\\};`
  );
  
  const match = regex.exec(palettesContent);
  if (!match) {
    console.warn(`⚠️ Could not parse ${varName} from palettes.ts`);
    return null;
  }
  
  const block = match[1];
  const result = {};
  
  // Match key: 'value' or key: "value"
  const propRegex = /(\w+):\s*'([^']+)'/g;
  let propMatch;
  while ((propMatch = propRegex.exec(block)) !== null) {
    result[propMatch[1]] = propMatch[2];
  }
  
  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Generate CSS for a single brand theme
 */
function generateThemeCSS(themeName, colors) {
  // Use data-brand attribute for combinatorial theming (appearance + brand independent)
  let css = `:root[data-brand="${themeName}"] {\n`;
  
  // Sort tones numerically (50, 100, 200, ..., 950)
  const sortedTones = Object.keys(colors).sort((a, b) => Number(a) - Number(b));
  
  sortedTones.forEach(tone => {
    css += `  --color-primary-${tone}: ${colors[tone]};\n`;
  });
  
  css += '}\n';
  
  return css;
}

/**
 * Generate complete CSS file with all themes
 */
function generateCSS() {
  const themes = extractThemes();
  const semanticTokens = extractSemanticTokens();
  const darkSemanticTokens = extractDarkSemanticTokens();
  const lightVariants = extractSemanticVariants('lightSemanticVariants');
  const darkVariants = extractSemanticVariants('darkSemanticVariants');
  const hcLightSemanticTokens = extractHighContrastLightSemanticTokens();
  const hcDarkSemanticTokens = extractHighContrastDarkSemanticTokens();
  const hcLightVariants = extractSemanticVariants('highContrastLightVariants');
  const hcDarkVariants = extractSemanticVariants('highContrastDarkVariants');
  
  const timestamp = new Date().toISOString();
  const themeCount = Object.keys(themes).length;
  
  let css = `/**
 * AUTO-GENERATED THEME CSS
 * 
 * ⚠️ DO NOT EDIT THIS FILE MANUALLY ⚠️
 * 
 * This file is automatically generated from design tokens in:
 * @see src/constants/palettes.ts
 * 
 * To update theme colors:
 * 1. Edit src/constants/palettes.ts
 * 2. Run: npm run generate:themes
 * 3. Commit both palettes.ts and this generated file
 * 
 * Generation info:
 * - Generated: ${timestamp}
 * - Themes: ${themeCount}
 * - Source: scripts/generateThemeCSS.js
 * 
 * Industry standard approach from:
 * - Material Design 3 (Google): Build-time token compilation
 * - Carbon Design System (IBM): Auto-generated theme files
 * - Shopify Polaris: Token build pipeline
 */

/* ========================================
 * BASE SEMANTIC TOKENS (light mode defaults)
 * Source: palettes.ts → defaultSemanticTokens + lightSemanticVariants
 * ======================================== */

:root {
  --color-success: ${semanticTokens.success};
  --color-error: ${semanticTokens.error};
  --color-warning: ${semanticTokens.warning};
  --color-info: ${semanticTokens.info};
  --color-disabled: ${semanticTokens.disabled};
`;

  // Add light semantic variants
  if (lightVariants) {
    css += `  --color-success-foreground: ${lightVariants.successForeground};\n`;
    css += `  --color-success-background: ${lightVariants.successBackground};\n`;
    css += `  --color-success-border: ${lightVariants.successBorder};\n`;
    css += `  --color-error-foreground: ${lightVariants.errorForeground};\n`;
    css += `  --color-error-background: ${lightVariants.errorBackground};\n`;
    css += `  --color-error-border: ${lightVariants.errorBorder};\n`;
    css += `  --color-warning-foreground: ${lightVariants.warningForeground};\n`;
    css += `  --color-warning-background: ${lightVariants.warningBackground};\n`;
    css += `  --color-warning-border: ${lightVariants.warningBorder};\n`;
    css += `  --color-info-foreground: ${lightVariants.infoForeground};\n`;
    css += `  --color-info-background: ${lightVariants.infoBackground};\n`;
    css += `  --color-info-border: ${lightVariants.infoBorder};\n`;
  }

  css += `}

/* ========================================
 * DARK MODE SEMANTIC TOKENS
 * Source: palettes.ts → darkSemanticTokens + darkSemanticVariants
 * Uses data-appearance attribute for combinatorial theming
 * ======================================== */

:root[data-appearance="dark"] {
  --color-success: ${darkSemanticTokens.success};
  --color-error: ${darkSemanticTokens.error};
  --color-warning: ${darkSemanticTokens.warning};
  --color-info: ${darkSemanticTokens.info};
  --color-disabled: ${darkSemanticTokens.disabled};
`;

  // Add dark semantic variants
  if (darkVariants) {
    css += `  --color-success-foreground: ${darkVariants.successForeground};\n`;
    css += `  --color-success-background: ${darkVariants.successBackground};\n`;
    css += `  --color-success-border: ${darkVariants.successBorder};\n`;
    css += `  --color-error-foreground: ${darkVariants.errorForeground};\n`;
    css += `  --color-error-background: ${darkVariants.errorBackground};\n`;
    css += `  --color-error-border: ${darkVariants.errorBorder};\n`;
    css += `  --color-warning-foreground: ${darkVariants.warningForeground};\n`;
    css += `  --color-warning-background: ${darkVariants.warningBackground};\n`;
    css += `  --color-warning-border: ${darkVariants.warningBorder};\n`;
    css += `  --color-info-foreground: ${darkVariants.infoForeground};\n`;
    css += `  --color-info-background: ${darkVariants.infoBackground};\n`;
    css += `  --color-info-border: ${darkVariants.infoBorder};\n`;
  }

  css += `}

/* ========================================
 * HIGH CONTRAST LIGHT MODE SEMANTIC TOKENS
 * Source: palettes.ts → highContrastLightSemanticTokens + highContrastLightVariants
 * WCAG AAA 21:1 contrast ratio compliance
 * ======================================== */

html[data-a11y="highContrast"] {
  --color-success: ${hcLightSemanticTokens.success};
  --color-error: ${hcLightSemanticTokens.error};
  --color-warning: ${hcLightSemanticTokens.warning};
  --color-info: ${hcLightSemanticTokens.info};
  --color-disabled: ${hcLightSemanticTokens.disabled};
`;

  // Add HC light semantic variants
  if (hcLightVariants) {
    css += `  --color-success-foreground: ${hcLightVariants.successForeground};\n`;
    css += `  --color-success-background: ${hcLightVariants.successBackground};\n`;
    css += `  --color-success-border: ${hcLightVariants.successBorder};\n`;
    css += `  --color-error-foreground: ${hcLightVariants.errorForeground};\n`;
    css += `  --color-error-background: ${hcLightVariants.errorBackground};\n`;
    css += `  --color-error-border: ${hcLightVariants.errorBorder};\n`;
    css += `  --color-warning-foreground: ${hcLightVariants.warningForeground};\n`;
    css += `  --color-warning-background: ${hcLightVariants.warningBackground};\n`;
    css += `  --color-warning-border: ${hcLightVariants.warningBorder};\n`;
    css += `  --color-info-foreground: ${hcLightVariants.infoForeground};\n`;
    css += `  --color-info-background: ${hcLightVariants.infoBackground};\n`;
    css += `  --color-info-border: ${hcLightVariants.infoBorder};\n`;
  }

  css += `}

/* ========================================
 * HIGH CONTRAST DARK MODE SEMANTIC TOKENS
 * Source: palettes.ts → highContrastDarkSemanticTokens + highContrastDarkVariants
 * WCAG AAA 21:1 contrast ratio compliance
 * ======================================== */

html[data-a11y="highContrast"][data-appearance="dark"] {
  --color-success: ${hcDarkSemanticTokens.success};
  --color-error: ${hcDarkSemanticTokens.error};
  --color-warning: ${hcDarkSemanticTokens.warning};
  --color-info: ${hcDarkSemanticTokens.info};
  --color-disabled: ${hcDarkSemanticTokens.disabled};
`;

  // Add HC dark semantic variants
  if (hcDarkVariants) {
    css += `  --color-success-foreground: ${hcDarkVariants.successForeground};\n`;
    css += `  --color-success-background: ${hcDarkVariants.successBackground};\n`;
    css += `  --color-success-border: ${hcDarkVariants.successBorder};\n`;
    css += `  --color-error-foreground: ${hcDarkVariants.errorForeground};\n`;
    css += `  --color-error-background: ${hcDarkVariants.errorBackground};\n`;
    css += `  --color-error-border: ${hcDarkVariants.errorBorder};\n`;
    css += `  --color-warning-foreground: ${hcDarkVariants.warningForeground};\n`;
    css += `  --color-warning-background: ${hcDarkVariants.warningBackground};\n`;
    css += `  --color-warning-border: ${hcDarkVariants.warningBorder};\n`;
    css += `  --color-info-foreground: ${hcDarkVariants.infoForeground};\n`;
    css += `  --color-info-background: ${hcDarkVariants.infoBackground};\n`;
    css += `  --color-info-border: ${hcDarkVariants.infoBorder};\n`;
  }

  css += `}

/* ========================================
 * BRAND THEME PALETTES
 * Each theme defines 11 primary color tones
 * ======================================== */

`;
  
  // Generate CSS for each theme
  Object.entries(themes).forEach(([themeName, colors]) => {
    css += generateThemeCSS(themeName, colors);
    css += '\n';
  });
  
  return css;
}

/**
 * Main execution
 */
function main() {
  try {
    console.log('🎨 Generating theme CSS from design tokens...\n');
    
    // Generate CSS content
    const css = generateCSS();
    
    // Write to output file
    const outputPath = join(__dirname, '../src/styles/generated-themes.css');
    writeFileSync(outputPath, css, 'utf-8');
    
    // Count brand themes (using data-brand selector)
    const themeCount = (css.match(/data-brand="/g) || []).length;
    const lineCount = css.split('\n').length;
    
    console.log('✅ Theme CSS generated successfully!\n');
    console.log(`   Output: src/styles/generated-themes.css`);
    console.log(`   Themes: ${themeCount} brand themes`);
    console.log(`   Lines:  ${lineCount}\n`);
    console.log('📝 Next steps:');
    console.log('   1. Import in index.css: @import "./styles/generated-themes.css";');
    console.log('   2. Build project: npm run build');
    console.log('   3. Commit changes\n');
    
  } catch (error) {
    console.error('❌ Failed to generate theme CSS:\n', error);
    process.exit(1);
  }
}

main();
