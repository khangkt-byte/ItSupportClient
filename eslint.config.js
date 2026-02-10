import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import noHardcodedColorsRule from './.eslint/rules/no-hardcoded-colors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default tseslint.config(
  // Base configs
  js.configs.recommended,
  ...tseslint.configs.recommended,
  
  // Global ignores
  {
    ignores: [
      'node_modules/**',
      'build/**',
      'dist/**',
      '.vite/**',
      'coverage/**',
      '*.config.js',
      '*.config.ts',
      'scripts/**',
    ],
  },

  // Main configuration
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'custom-rules': {
        rules: {
          'no-hardcoded-colors': noHardcodedColorsRule,
        },
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      // ESLint recommended overrides
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off', // Handled by TypeScript

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // React rules
      ...reactPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Not needed in React 18+
      'react/prop-types': 'off', // Using TypeScript instead

      // React Hooks rules
      ...reactHooksPlugin.configs.recommended.rules,

      // Custom color linting rule
      'custom-rules/no-hardcoded-colors': [
        'error',
        {
          allowTransparent: true,
          allowInherit: true,
          ignorePatterns: ['transparent', 'currentColor', 'inherit'],
        },
      ],
    },
  },

  // Test files configuration
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  }
);
