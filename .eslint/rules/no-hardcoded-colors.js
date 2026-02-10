/**
 * ESLint Rule: No Hardcoded Colors
 * 
 * Detects hardcoded color values and suggests semantic tokens
 * Enforces theme system best practices
 * 
 * @module eslint-rules/no-hardcoded-colors
 */

/**
 * Regex patterns for color detection
 */
const COLOR_PATTERNS = {
    hex3: /#[0-9a-fA-F]{3}\b/,
    hex6: /#[0-9a-fA-F]{6}\b/,
    rgb: /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/,
    rgba: /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/,
    hsl: /hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)/,
    hsla: /hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)/,
    namedColors: /\b(red|blue|green|yellow|orange|purple|pink|brown|gray|grey|black|white|cyan|magenta)\b/i,
};

/**
 * Semantic token suggestions
 */
const TOKEN_SUGGESTIONS = {
    // Status colors
    '#22c55e': '--color-success',
    '#16a34a': '--color-success',
    '#f59e0b': '--color-warning',
    '#d97706': '--color-warning',
    '#ef4444': '--color-error',
    '#dc2626': '--color-error',
    '#3b82f6': '--color-info',
    '#2563eb': '--color-info',
    
    // Text colors
    '#1F2936': '--color-text-primary',
    '#F3F4F6': '--color-text-primary',
    '#6B7280': '--color-text-secondary',
    '#D1D5DB': '--color-text-secondary',
    
    // Background colors
    '#FFFFFF': '--color-bg-primary',
    '#ffffff': '--color-bg-primary',
    '#111827': '--color-bg-primary',
    '#F9FAFB': '--color-bg-secondary',
    '#1F2937': '--color-bg-secondary',
    
    // Named colors
    'green': '--color-success',
    'red': '--color-error',
    'yellow': '--color-warning',
    'orange': '--color-warning',
    'blue': '--color-info',
    'white': '--color-bg-primary',
    'black': '--color-text-primary',
};

/**
 * Get semantic token suggestion for color
 */
function getSuggestion(colorValue) {
    const normalized = colorValue.toLowerCase();
    
    // Direct match
    if (TOKEN_SUGGESTIONS[normalized]) {
        return TOKEN_SUGGESTIONS[normalized];
    }
    
    // Partial match for similar colors
    if (normalized.includes('green')) return '--color-success';
    if (normalized.includes('red')) return '--color-error';
    if (normalized.includes('yellow') || normalized.includes('orange')) return '--color-warning';
    if (normalized.includes('blue')) return '--color-info';
    
    return '--color-[appropriate-token]';
}

/**
 * ESLint rule definition
 */
export default {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow hardcoded color values, encourage semantic tokens',
            category: 'Best Practices',
            recommended: true,
        },
        fixable: 'code',
        schema: [
            {
                type: 'object',
                properties: {
                    allowTransparent: {
                        type: 'boolean',
                        default: true,
                    },
                    allowInherit: {
                        type: 'boolean',
                        default: true,
                    },
                    ignorePatterns: {
                        type: 'array',
                        items: { type: 'string' },
                        default: [],
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            noHardcodedColor: 'Hardcoded color "{{value}}" detected. Use semantic token {{suggestion}} instead.',
            noHardcodedHex: 'Hardcoded hex color {{value}} detected. Use var({{suggestion}}) instead.',
            noHardcodedRgb: 'Hardcoded rgb color detected. Use CSS variable instead.',
            noNamedColor: 'Named color "{{value}}" detected. Use semantic token {{suggestion}} instead.',
        },
    },

    create(context) {
        const options = context.options[0] || {};
        const allowTransparent = options.allowTransparent !== false;
        const allowInherit = options.allowInherit !== false;
        const ignorePatterns = options.ignorePatterns || [];

        /**
         * Check if value should be ignored
         */
        function shouldIgnore(value) {
            if (!value) return true;
            
            const normalized = value.toLowerCase().trim();
            
            // Allow transparent and inherit
            if (allowTransparent && normalized === 'transparent') return true;
            if (allowInherit && normalized === 'inherit') return true;
            if (normalized === 'currentcolor') return true;
            if (normalized === 'initial') return true;
            if (normalized === 'unset') return true;
            
            // Check ignore patterns
            for (const pattern of ignorePatterns) {
                if (new RegExp(pattern).test(value)) return true;
            }
            
            return false;
        }

        /**
         * Check string for hardcoded colors
         */
        function checkForHardcodedColors(node, value) {
            if (shouldIgnore(value)) return;

            // Check hex colors
            if (COLOR_PATTERNS.hex3.test(value) || COLOR_PATTERNS.hex6.test(value)) {
                const match = value.match(/#[0-9a-fA-F]{3,6}/);
                if (match) {
                    const suggestion = getSuggestion(match[0]);
                    context.report({
                        node,
                        messageId: 'noHardcodedHex',
                        data: {
                            value: match[0],
                            suggestion,
                        },
                        fix(fixer) {
                            return fixer.replaceText(node, `var(${suggestion})`);
                        },
                    });
                }
            }

            // Check rgb/rgba
            if (COLOR_PATTERNS.rgb.test(value) || COLOR_PATTERNS.rgba.test(value)) {
                context.report({
                    node,
                    messageId: 'noHardcodedRgb',
                    data: { value },
                });
            }

            // Check hsl/hsla
            if (COLOR_PATTERNS.hsl.test(value) || COLOR_PATTERNS.hsla.test(value)) {
                context.report({
                    node,
                    messageId: 'noHardcodedRgb',
                    data: { value },
                });
            }

            // Check named colors
            const namedMatch = value.match(COLOR_PATTERNS.namedColors);
            if (namedMatch) {
                const colorName = namedMatch[0];
                if (!shouldIgnore(colorName)) {
                    const suggestion = getSuggestion(colorName);
                    context.report({
                        node,
                        messageId: 'noNamedColor',
                        data: {
                            value: colorName,
                            suggestion,
                        },
                    });
                }
            }
        }

        return {
            // JSX style prop
            JSXAttribute(node) {
                if (node.name.name === 'style' && node.value) {
                    if (node.value.type === 'JSXExpressionContainer') {
                        const expression = node.value.expression;
                        
                        // Object expression like style={{ color: '#fff' }}
                        if (expression.type === 'ObjectExpression') {
                            expression.properties.forEach(prop => {
                                if (prop.value && prop.value.type === 'Literal') {
                                    checkForHardcodedColors(prop.value, String(prop.value.value));
                                }
                            });
                        }
                    }
                }
            },

            // Template literals in styled-components or CSS-in-JS
            TemplateLiteral(node) {
                node.quasis.forEach(quasi => {
                    checkForHardcodedColors(quasi, quasi.value.raw);
                });
            },

            // String literals
            Literal(node) {
                if (typeof node.value === 'string') {
                    // Check if this is a CSS property value
                    const sourceCode = context.sourceCode || context.getSourceCode();
                    const ancestors = sourceCode.getAncestors(node);
                    const parent = ancestors[ancestors.length - 1];
                    
                    // In object properties (CSS-in-JS)
                    if (parent && parent.type === 'Property') {
                        const key = parent.key.name || parent.key.value;
                        const cssProperties = [
                            'color', 'backgroundColor', 'borderColor', 'background',
                            'fill', 'stroke', 'outlineColor', 'textDecorationColor'
                        ];
                        
                        if (cssProperties.includes(key)) {
                            checkForHardcodedColors(node, node.value);
                        }
                    }
                }
            },

            // CallExpression for styled-components
            CallExpression(node) {
                // styled.div`color: red;`
                if (node.callee.type === 'MemberExpression' &&
                    node.callee.object.name === 'styled') {
                    
                    node.arguments.forEach(arg => {
                        if (arg.type === 'TemplateLiteral') {
                            arg.quasis.forEach(quasi => {
                                checkForHardcodedColors(quasi, quasi.value.raw);
                            });
                        }
                    });
                }
            },
        };
    },
};
