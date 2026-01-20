import { useEffect } from 'react';

export function DarkModeStyles() {
  useEffect(() => {
    // Create a style element for dark mode overrides
    const styleId = 'dark-mode-component-styles';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    
    styleEl.textContent = `
      /* Card backgrounds */
      body.dark-theme .bg-white {
        background-color: var(--color-bg-card) !important;
      }
      
      /* Border colors */
      body.dark-theme .border,
      body.dark-theme .border-gray-200,
      body.dark-theme .border-gray-300 {
        border-color: var(--color-border-hr) !important;
      }
      
      /* Text colors */
      body.dark-theme .text-gray-500,
      body.dark-theme .text-gray-600 {
        color: var(--color-text-secondary) !important;
      }
      
      body.dark-theme .text-gray-700,
      body.dark-theme .text-gray-800,
      body.dark-theme .text-gray-900 {
        color: var(--color-text-primary) !important;
      }
      
      /* Input and select backgrounds */
      body.dark-theme input[type="text"],
      body.dark-theme input[type="password"],
      body.dark-theme input[type="email"],
      body.dark-theme input[type="date"],
      body.dark-theme input[type="number"],
      body.dark-theme textarea,
      body.dark-theme select {
        background-color: var(--color-bg-secondary) !important;
        border-color: var(--color-border-hr) !important;
        color: var(--color-text-primary) !important;
      }
      
      body.dark-theme input::placeholder,
      body.dark-theme textarea::placeholder {
        color: var(--color-text-placeholder) !important;
      }
      
      /* Table styles */
      body.dark-theme table {
        color: var(--color-text-primary);
      }
      
      body.dark-theme thead {
        background-color: var(--color-bg-secondary);
        color: var(--color-text-secondary);
      }
      
      body.dark-theme tbody tr:hover {
        background-color: var(--color-hover-secondary);
      }
      
      /* Stat card backgrounds */
      body.dark-theme .bg-blue-50 {
        background-color: rgba(59, 130, 246, 0.15) !important;
      }
      
      body.dark-theme .bg-green-50 {
        background-color: rgba(34, 197, 94, 0.15) !important;
      }
      
      body.dark-theme .bg-purple-50 {
        background-color: rgba(168, 85, 247, 0.15) !important;
      }
      
      body.dark-theme .bg-orange-50 {
        background-color: rgba(249, 115, 22, 0.15) !important;
      }
      
      body.dark-theme .bg-yellow-50 {
        background-color: rgba(234, 179, 8, 0.15) !important;
      }
      
      body.dark-theme .bg-red-50 {
        background-color: rgba(239, 68, 68, 0.15) !important;
      }
      
      /* Button hover states */
      body.dark-theme .bg-blue-50:hover {
        background-color: rgba(59, 130, 246, 0.25) !important;
      }
      
      body.dark-theme .bg-red-50:hover {
        background-color: rgba(239, 68, 68, 0.25) !important;
      }
      
      /* Modal/Dialog backgrounds */
      body.dark-theme .fixed.inset-0 .bg-white {
        background-color: var(--color-bg-card) !important;
      }
      
      /* Gray backgrounds */
      body.dark-theme .bg-gray-50,
      body.dark-theme .bg-gray-100,
      body.dark-theme .bg-gray-200 {
        background-color: var(--color-bg-secondary) !important;
      }
    `;
    
    return () => {
      // Cleanup on unmount
      styleEl?.remove();
    };
  }, []);
  
  return null;
}
