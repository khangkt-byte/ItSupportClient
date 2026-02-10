#!/usr/bin/env node

/**
 * Theme Color Linter
 * 
 * Scans codebase for hardcoded colors and reports violations
 * Can be run manually or as part of CI/CD
 */

const fs = require('fs');
const path = require('path');
const { ESLint } = require('eslint');

// Color regex patterns
const COLOR_PATTERNS = {
    hex: /#[0-9a-fA-F]{3,6}\b/g,
    rgb: /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)/g,
    hsl: /hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+\s*)?\)/g,
    named: /\b(red|blue|green|yellow|orange|purple|pink|brown|gray|grey|black|white|cyan|magenta)\b/gi,
};

// Allowed colors
const ALLOWED_COLORS = ['transparent', 'inherit', 'currentColor', 'initial', 'unset'];

/**
 * Scan file for hardcoded colors
 */
function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const violations = [];
    
    // Skip if file uses var() already
    if (content.includes('var(--color-')) {
        return violations;
    }
    
    // Find all colors
    Object.entries(COLOR_PATTERNS).forEach(([type, pattern]) => {
        const matches = content.matchAll(pattern);
        
        for (const match of matches) {
            const color = match[0];
            
            // Skip allowed colors
            if (ALLOWED_COLORS.includes(color.toLowerCase())) continue;
            
            // Get line number
            const lines = content.substring(0, match.index).split('\n');
            const line = lines.length;
            const col = lines[lines.length - 1].length + 1;
            
            violations.push({
                file: filePath,
                line,
                col,
                type,
                color,
                message: `Hardcoded ${type} color: ${color}`,
            });
        }
    });
    
    return violations;
}

/**
 * Scan directory recursively
 */
function scanDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx', '.css']) {
    const violations = [];
    
    function walk(currentPath) {
        const items = fs.readdirSync(currentPath);
        
        for (const item of items) {
            const fullPath = path.join(currentPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                // Skip node_modules, build, etc.
                if (['node_modules', 'build', 'dist', '.git'].includes(item)) {
                    continue;
                }
                walk(fullPath);
            } else if (stat.isFile()) {
                const ext = path.extname(fullPath);
                if (extensions.includes(ext)) {
                    const fileViolations = scanFile(fullPath);
                    violations.push(...fileViolations);
                }
            }
        }
    }
    
    walk(dir);
    return violations;
}

/**
 * Format violations as report
 */
function formatReport(violations) {
    if (violations.length === 0) {
        return '✅ No hardcoded colors found!';
    }
    
    let report = `\n🚨 Found ${violations.length} hardcoded color(s):\n\n`;
    
    // Group by file
    const byFile = violations.reduce((acc, v) => {
        if (!acc[v.file]) acc[v.file] = [];
        acc[v.file].push(v);
        return acc;
    }, {});
    
    Object.entries(byFile).forEach(([file, fileViolations]) => {
        report += `\n📄 ${file}\n`;
        fileViolations.forEach(v => {
            report += `  Line ${v.line}:${v.col} - ${v.message}\n`;
        });
    });
    
    report += `\n💡 Suggestion: Replace with semantic tokens like var(--color-success)\n`;
    report += `📚 See Guide/SEMANTIC_TOKENS_GUIDE.md for more info\n\n`;
    
    return report;
}

/**
 * Main execution
 */
async function main() {
    const args = process.argv.slice(2);
    const srcDir = args[0] || './src';
    
    console.log(`🔍 Scanning ${srcDir} for hardcoded colors...\n`);
    
    const violations = scanDirectory(srcDir);
    const report = formatReport(violations);
    
    console.log(report);
    
    // Exit with error if violations found
    if (violations.length > 0) {
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
}

module.exports = { scanFile, scanDirectory, formatReport };
