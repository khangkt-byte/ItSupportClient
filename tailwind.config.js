/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '.dark-theme'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Semantic color tokens - Material Design 3 pattern
      // Reference: https://m3.material.io/styles/color/system/overview
      colors: {
        // Semantic status colors (themeable via CSS variables)
        success: 'var(--color-success)',
        'success-foreground': 'var(--color-success-foreground)',
        'success-background': 'var(--color-success-background)',
        'success-border': 'var(--color-success-border)',
        
        warning: 'var(--color-warning)',
        'warning-foreground': 'var(--color-warning-foreground)',
        'warning-background': 'var(--color-warning-background)',
        'warning-border': 'var(--color-warning-border)',
        
        error: 'var(--color-error)',
        'error-foreground': 'var(--color-error-foreground)',
        'error-background': 'var(--color-error-background)',
        'error-border': 'var(--color-error-border)',
        
        info: 'var(--color-info)',
        'info-foreground': 'var(--color-info-foreground)',
        'info-background': 'var(--color-info-background)',
        'info-border': 'var(--color-info-border)',
        
        // Keep the existing Tailwind default color palette
      },
      spacing: {
        // Custom spacing utilities can be extended here
      },
      fontSize: {
        // Custom font sizes
        xs: ['0.75rem', { lineHeight: '1rem' }],    // 12px
        sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        base: ['1rem', { lineHeight: '1.5rem' }],    // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        xl: ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', '"Courier New"'],
      },
      borderRadius: {
        // Default Tailwind border radius
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
      animation: {
        spin: 'spin 1s linear infinite',
        ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      transitionProperty: {
        DEFAULT: 'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform',
      },
    },
  },
  plugins: [],
  safelist: [
    // Add commonly used dynamic classes to prevent purging
    'bg-blue-50', 'bg-blue-100', 'bg-blue-600',
    'text-blue-600', 'text-blue-700', 'text-blue-100',
    'bg-green-50', 'bg-green-100', 'bg-green-700',
    'text-green-600', 'text-green-700',
    'bg-red-50', 'bg-red-100', 'bg-red-700',
    'text-red-600', 'text-red-700',
    'bg-orange-50', 'bg-orange-100', 'bg-orange-600',
    'text-orange-600', 'text-orange-700',
    'bg-yellow-50', 'bg-yellow-100', 'bg-yellow-600',
    'text-yellow-600', 'text-yellow-700',
    'border-blue-200', 'border-red-200', 'border-gray-300',
    'ring-blue-500', 'ring-red-500',
  ],
}
