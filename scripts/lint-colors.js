#!/usr/bin/env node

/**
 * Advanced Theme Color Linter
 * 
 * Context-aware color detection with false-positive prevention
 * 
 * **Design Principles (Industry Standards):**
 * 
 * 1. **ESLint Methodology** - AST-based analysis with context awareness
 *    Source: https://eslint.org/docs/latest/extend/custom-rules
 * 
 * 2. **Stylelint Approach** - CSS-specific linting rules
 *    Source: https://stylelint.io/developer-guide/rules
 * 
 * 3. **Google Error Prone** - Pattern matching with semantic understanding
 *    Source: https://errorprone.info/docs/patternmatching
 * 
 * 4. **SonarQube Quality Gates** - Configurable rules with severity levels
 *    Source: https://docs.sonarsource.com/sonarqube/latest/user-guide/rules/
 * 
 * **False Positive Prevention:**
 * - TypeScript enum values (e.g., ColorType.Red = "Red")
 * - String literals in non-CSS contexts
 * - Comments and JSDoc
 * - Test files and documentation
 * - Icon/image names (e.g., "blue-icon.png")
 * 
 * **Real-world Examples:**
 * - Airbnb ESLint Config: https://github.com/airbnb/javascript
 * - Google Closure Linter: https://github.com/google/closure-linter
 * - Facebook's Flow: https://flow.org/en/docs/linting/
 * 
 * @author IT Support Team
 * @version 2.0.0 (Enhanced with Context Awareness)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuration (Best Practice: External config file)
 * Based on Stylelint and ESLint configuration patterns
 */
const CONFIG = {
    // File patterns to exclude (Google/Airbnb style)
    excludePatterns: [
        '**/node_modules/**',
        '**/build/**',
        '**/dist/**',
        '**/.git/**',
        '**/*.test.{ts,tsx,js,jsx}',
        '**/*.spec.{ts,tsx,js,jsx}',
        '**/__tests__/**',
        '**/coverage/**',
        '**/*.md',
        '**/*.json',
        // Documentation and guides
        '**/Guide/**',
        '**/Ref/**',
        '**/docs/**',
        // Type definitions that may contain color examples
        '**/*.d.ts',
    ],
    
    // Files to scan
    includeExtensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss'],
    
    // Allowed CSS color keywords (W3C Standard)
    allowedColors: [
        'transparent',
        'inherit',
        'currentColor',
        'initial',
        'unset',
        'revert',
        'revert-layer',
    ],
    
    // Context-specific exclusions
    ignoreInContexts: [
        'enum',           // TypeScript enums
        'type',           // Type definitions
        'interface',      // Interface definitions
        'comment',        // Comments and JSDoc
        'import',         // Import statements
        'const',          // Const declarations (may be design tokens)
        'readonly',       // Readonly values
    ],
};

/**
 * Color regex patterns (W3C CSS Color Module Level 4)
 * Source: https://www.w3.org/TR/css-color-4/
 */
const COLOR_PATTERNS = {
    // Hex colors: #RGB, #RRGGBB, #RRGGBBAA
    hex: /#[0-9a-fA-F]{3,8}\b/g,
    
    // RGB/RGBA (legacy and modern syntax)
    rgb: /rgba?\(\s*[\d.]+%?\s*,?\s*[\d.]+%?\s*,?\s*[\d.]+%?\s*(\/\s*[\d.]+%?\s*)?\)/gi,
    
    // HSL/HSLA (legacy and modern syntax)
    hsl: /hsla?\(\s*[\d.]+(?:deg|grad|rad|turn)?\s*,?\s*[\d.]+%\s*,?\s*[\d.]+%\s*(\/\s*[\d.]+%?\s*)?\)/gi,
    
    // Named colors (CSS Level 3 + Level 4)
    // Only common ones that are likely false positives
    named: /\b(red|blue|green|yellow|orange|purple|pink|brown|gray|grey|black|white|cyan|magenta|lime|navy|teal|olive|maroon|aqua|fuchsia|silver)\b/gi,
};

/**
 * Smart Context Detection
 * Based on ESLint's AST traversal methodology
 */
class ContextAnalyzer {
    /**
     * Check if line is in a comment
     * @param {string} line 
     */
    static isComment(line) {
        const trimmed = line.trim();
        return trimmed.startsWith('//') || 
               trimmed.startsWith('/*') || 
               trimmed.startsWith('*') ||
               trimmed.includes('*/');
    }
    
    /**
     * Check if match is in a TypeScript enum
     * Pattern: enum ColorType { Red = "Red", Blue = "Blue" }
     * @param {string} content 
     * @param {number} index 
     */
    static isInEnum(content, index) {
        // Get surrounding context (200 chars before and after)
        const before = content.substring(Math.max(0, index - 200), index);
        const after = content.substring(index, Math.min(content.length, index + 200));
        
        // Check for enum declaration
        const enumPattern = /enum\s+\w+\s*{/;
        const hasEnumBefore = enumPattern.test(before);
        const hasClosingBrace = after.includes('}');
        
        // Check if we're in enum value assignment
        const assignmentPattern = /\w+\s*=\s*["']/;
        const isAssignment = assignmentPattern.test(before.substring(before.length - 50));
        
        return hasEnumBefore && hasClosingBrace && isAssignment;
    }
    
    /**
     * Check if match is in a type definition
     * @param {string} content 
     * @param {number} index 
     */
    static isInTypeDefinition(content, index) {
        const before = content.substring(Math.max(0, index - 100), index);
        
        return /type\s+\w+\s*=/.test(before) ||
               /interface\s+\w+/.test(before) ||
               /:\s*["']$/.test(before); // Type annotation
    }
    
    /**
     * Check if match is in a CSS context
     * This is where we WANT to detect colors
     * @param {string} line 
     * @param {string} match 
     */
    static isCSSContext(line, match) {
        // CSS property patterns
        const cssPropertyPattern = /(?:color|background|border|fill|stroke|shadow|outline)[-\w]*\s*[:=]/i;
        
        // className or style prop
        const classNamePattern = /className\s*=\s*["'`]/;
        const stylePattern = /style\s*=\s*{/;
        
        // Tailwind classes
        const tailwindPattern = /(?:bg|text|border)-\[var\(--/;
        
        // Direct CSS in styled-components or CSS files
        const styledPattern = /styled\.\w+`|css`/;
        
        return cssPropertyPattern.test(line) ||
               classNamePattern.test(line) ||
               stylePattern.test(line) ||
               tailwindPattern.test(line) ||
               styledPattern.test(line);
    }
    
    /**
     * Check if match is a string literal (not CSS)
     * Pattern: const name = "Red"; or label="Blue"
     * @param {string} line 
     */
    static isStringLiteral(line) {
        // Variable assignment
        const varPattern = /(?:const|let|var)\s+\w+\s*=\s*["']/;
        
        // Function argument
        const argPattern = /\w+\s*\(\s*["']/;
        
        // Object property
        const propPattern = /\w+\s*:\s*["']/;
        
        // JSX prop (non-style)
        const jsxPropPattern = /\w+\s*=\s*["'](?!.*(?:color|bg|background))/;
        
        return varPattern.test(line) ||
               argPattern.test(line) ||
               propPattern.test(line) ||
               jsxPropPattern.test(line);
    }
    
    /**
     * Check if match is in an import statement
     * @param {string} line 
     */
    static isImportStatement(line) {
        return /^import\s/.test(line.trim()) ||
               /from\s+["']/.test(line);
    }
    
    /**
     * Check if color is part of a file/asset name
     * Pattern: "blue-icon.png", "red-logo.svg"
     * @param {string} match 
     * @param {string} line 
     */
    static isAssetName(match, line) {
        const assetPattern = new RegExp(`${match}[-_]\\w+\\.(png|jpg|svg|gif|ico|webp)`, 'i');
        return assetPattern.test(line);
    }
}

/**
 * Enhanced file scanner with context awareness
 * Inspired by ESLint's Linter class
 */
class ColorLinter {
    constructor(config = CONFIG) {
        this.config = config;
        this.violations = [];
    }
    
    /**
     * Check if file should be excluded
     * @param {string} filePath 
     */
    shouldExcludeFile(filePath) {
        return this.config.excludePatterns.some(pattern => {
            const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
            return regex.test(filePath);
        });
    }
    
    /**
     * Scan single file for color violations
     * @param {string} filePath 
     */
    scanFile(filePath) {
        if (this.shouldExcludeFile(filePath)) {
            return [];
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const fileViolations = [];
        
        // Skip if file already uses semantic tokens
        if (content.includes('var(--color-') || content.includes('var(--sidebar-color-')) {
            return [];
        }
        
        const lines = content.split('\n');
        
        // Scan each line
        lines.forEach((line, lineIndex) => {
            const lineNum = lineIndex + 1;
            
            // Skip comments
            if (ContextAnalyzer.isComment(line)) {
                return;
            }
            
            // Skip import statements
            if (ContextAnalyzer.isImportStatement(line)) {
                return;
            }
            
            // Find all color matches in this line
            Object.entries(COLOR_PATTERNS).forEach(([type, pattern]) => {
                const matches = [...line.matchAll(pattern)];
                
                matches.forEach(match => {
                    const color = match[0];
                    const col = match.index + 1;
                    const globalIndex = lines.slice(0, lineIndex).join('\n').length + match.index;
                    
                    // Skip allowed colors
                    if (this.config.allowedColors.includes(color.toLowerCase())) {
                        return;
                    }
                    
                    // Context-based filtering (FALSE POSITIVE PREVENTION)
                    
                    // 1. Skip TypeScript enums
                    if (ContextAnalyzer.isInEnum(content, globalIndex)) {
                        return;
                    }
                    
                    // 2. Skip type definitions
                    if (ContextAnalyzer.isInTypeDefinition(content, globalIndex)) {
                        return;
                    }
                    
                    // 3. Skip asset names
                    if (ContextAnalyzer.isAssetName(color, line)) {
                        return;
                    }
                    
                    // 4. For named colors, only report if in CSS context
                    if (type === 'named') {
                        // Named colors are common in code, only flag in CSS
                        if (!ContextAnalyzer.isCSSContext(line, color)) {
                            return;
                        }
                    }
                    
                    // 5. Skip string literals (non-CSS)
                    if (ContextAnalyzer.isStringLiteral(line) && !ContextAnalyzer.isCSSContext(line, color)) {
                        return;
                    }
                    
                    // If we get here, it's a real violation
                    fileViolations.push({
                        file: filePath,
                        line: lineNum,
                        col,
                        type,
                        color,
                        context: line.trim(),
                        message: `Hardcoded ${type} color: ${color}`,
                    });
                });
            });
        });
        
        return fileViolations;
    }
    
    /**
     * Scan directory recursively
     * @param {string} dir 
     */
    scanDirectory(dir) {
        this.violations = [];
        
        const walk = (currentPath) => {
            const items = fs.readdirSync(currentPath);
            
            for (const item of items) {
                const fullPath = path.join(currentPath, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    // Skip excluded directories
                    if (this.shouldExcludeFile(fullPath)) {
                        continue;
                    }
                    walk(fullPath);
                } else if (stat.isFile()) {
                    const ext = path.extname(fullPath);
                    if (this.config.includeExtensions.includes(ext)) {
                        const fileViolations = this.scanFile(fullPath);
                        this.violations.push(...fileViolations);
                    }
                }
            }
        };
        
        walk(dir);
        return this.violations;
    }
    
    /**
     * Format violations as human-readable report
     */
    formatReport() {
        if (this.violations.length === 0) {
            return '✅ No hardcoded colors found!\n';
        }
        
        let report = `\n🚨 Found ${this.violations.length} hardcoded color(s):\n`;
        report += `${'='.repeat(60)}\n\n`;
        
        // Group by file
        const byFile = this.violations.reduce((acc, v) => {
            if (!acc[v.file]) acc[v.file] = [];
            acc[v.file].push(v);
            return acc;
        }, {});
        
        Object.entries(byFile).forEach(([file, fileViolations]) => {
            const relativePath = path.relative(process.cwd(), file);
            report += `📄 ${relativePath}\n`;
            report += `${'─'.repeat(60)}\n`;
            
            fileViolations.forEach(v => {
                report += `  Line ${v.line}:${v.col} - ${v.message}\n`;
                report += `  Context: ${v.context.substring(0, 80)}${v.context.length > 80 ? '...' : ''}\n\n`;
            });
        });
        
        report += `${'='.repeat(60)}\n`;
        report += `💡 Suggestion: Use semantic tokens like var(--color-success)\n`;
        report += `📚 See TAILWIND_VS_CSS_VARIABLES_GUIDE.md for migration guide\n`;
        report += `📚 See THEME_PALETTE_GUIDE.md for available tokens\n\n`;
        
        return report;
    }
}

/**
 * CLI interface
 */
async function main() {
    const args = process.argv.slice(2);
    const srcDir = args[0] || './src';
    
    console.log('🎨 Advanced Color Linter v2.0.0');
    console.log('Context-aware detection with false-positive prevention\n');
    console.log(`🔍 Scanning ${srcDir} for hardcoded colors...\n`);
    
    const linter = new ColorLinter();
    linter.scanDirectory(srcDir);
    const report = linter.formatReport();
    
    console.log(report);
    
    // Exit with error if violations found
    if (linter.violations.length > 0) {
        console.log('❌ Linting failed. Please fix the issues above.\n');
        process.exit(1);
    } else {
        console.log('✅ All checks passed!\n');
        process.exit(0);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(err => {
        console.error('💥 Error:', err.message);
        console.error(err.stack);
        process.exit(1);
    });
}

// Export for testing
export { ColorLinter, ContextAnalyzer, CONFIG };

