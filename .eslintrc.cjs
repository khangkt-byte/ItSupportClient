/**
 * ESLint Configuration for Theme System
 * 
 * Enforces semantic token usage and accessibility standards
 */

module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: [
        'react',
        'react-hooks',
        '@typescript-eslint',
    ],
    rules: {
        // Custom theme rules
        'no-hardcoded-colors': ['error', {
            allowTransparent: true,
            allowInherit: true,
            ignorePatterns: [
                'transparent',
                'currentColor',
                'inherit',
            ],
        }],

        // TypeScript rules
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
        }],

        // React rules
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',

        // General rules
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'prefer-const': 'error',
        'no-var': 'error',
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    overrides: [
        {
            // Test files
            files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
            env: {
                jest: true,
            },
        },
    ],
};
