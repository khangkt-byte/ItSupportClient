
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/globals.css";
import { SecurityValidator } from "./lib/utils/securityChecks";

/**
 * CRITICAL: Initialize theme BEFORE React renders
 * This ensures data-theme attribute is set before any components render
 * Reference: Material Design 3 / Bootstrap theming best practices
 */
const initializeTheme = () => {
  try {
    // 1. Check localStorage for saved theme
    const savedTheme = localStorage.getItem('theme') || null;
    const savedA11y = localStorage.getItem('a11y') || 'default';
    
    // 2. Determine initial theme
    let theme = 'light'; // default
    
    if (savedTheme) {
      // Use saved preference
      theme = savedTheme;
    } else if (typeof window !== 'undefined' && window.matchMedia) {
      // Use system preference if no saved preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = systemPrefersDark ? 'dark' : 'light';
    }
    
    // 3. Apply theme to document BEFORE React renders
    // This is critical for CSS variables to be available
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-a11y', savedA11y);
    document.body.setAttribute('data-a11y', savedA11y);
    
    console.log('[Init] Theme initialized:', theme);
  } catch (error) {
    console.error('[Init] Theme initialization failed:', error);
    // Fallback to light theme
    document.documentElement.setAttribute('data-theme', 'light');
  }
};

// Initialize theme BEFORE React renders anything
initializeTheme();

// Initialize security checks
try {
  SecurityValidator.initialize();
} catch (error) {
  console.error('[Main] Security initialization failed:', error);
  // Continue to render error page or handle appropriately
}

createRoot(document.getElementById("root")!).render(<App />);