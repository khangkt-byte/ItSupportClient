/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'], // Match HTML data-theme attribute
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Semantic color tokens - Material Design 3 pattern
      // Reference: https://m3.material.io/styles/color/system/overview
      colors: {
        // Semantic status colors (with CSS variable fallbacks)
        // Light mode defaults shown as fallbacks
        success: 'var(--color-success, #22c55e)',
        'success-foreground': 'var(--color-success-foreground, #166534)',
        'success-background': 'var(--color-success-background, #f0fdf4)',
        'success-border': 'var(--color-success-border, #bbf7d0)',
        
        warning: 'var(--color-warning, #f59e0b)',
        'warning-foreground': 'var(--color-warning-foreground, #92400e)',
        'warning-background': 'var(--color-warning-background, #fffbeb)',
        'warning-border': 'var(--color-warning-border, #fde68a)',
        
        error: 'var(--color-error, #ef4444)',
        'error-foreground': 'var(--color-error-foreground, #991b1b)',
        'error-background': 'var(--color-error-background, #fef2f2)',
        'error-border': 'var(--color-error-border, #fecaca)',
        
        info: 'var(--color-info, #3b82f6)',
        'info-foreground': 'var(--color-info-foreground, #1e40af)',
        'info-background': 'var(--color-info-background, #eff6ff)',
        'info-border': 'var(--color-info-border, #bfdbfe)',
        
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
    // Badge base classes
    'inline-flex', 'items-center', 'gap-1', 'rounded-md', 'px-2', 'py-1', 'text-xs', 'font-medium', 'leading-4', 'tracking-wide', 'transition-colors',
    'ring-1', 'ring-inset',
    
    // ===== SEMANTIC TOKEN CLASSES (Theme-aware) =====
    // Success token colors (light mode)
    'bg-success-background', 'text-success-foreground', 'ring-success-border',
    
    // Warning token colors (light mode)
    'bg-warning-background', 'text-warning-foreground', 'ring-warning-border',
    
    // Info token colors (light mode)
    'bg-info-background', 'text-info-foreground', 'ring-info-border',
    
    // Error token colors (light mode)
    'bg-error-background', 'text-error-foreground', 'ring-error-border',
    
    // ===== FALLBACK HARDCODED COLORS (Light mode) =====
    // PENDING/Warning badge colors
    'bg-amber-50', 'text-amber-800', 'ring-amber-600/20',
    'dark:bg-amber-400/10', 'dark:text-amber-400', 'dark:ring-amber-400/30',
    
    // IN PROGRESS/Info badge colors
    'bg-blue-50', 'text-blue-700', 'ring-blue-700/10',
    'dark:bg-blue-400/10', 'dark:text-blue-400', 'dark:ring-blue-400/30',
    
    // RESOLVED/Success badge colors
    'bg-green-50', 'text-green-700', 'ring-green-600/20',
    'dark:bg-green-500/10', 'dark:text-green-400', 'dark:ring-green-500/20',
    
    // CANCELLED/Neutral badge colors
    'bg-gray-50', 'text-gray-600', 'ring-gray-500/10',
    'dark:bg-gray-400/10', 'dark:text-gray-400', 'dark:ring-gray-400/20',
    
    // Status icons
    'w-3', 'h-3',
  ],
}
