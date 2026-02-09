import { useEffect } from 'react';

export function DarkModeStyles() {
  useEffect(() => {
    const applyTheme = (nextTheme: 'light' | 'dark') => {
      document.documentElement.setAttribute('data-theme', nextTheme);
      document.body.setAttribute('data-theme', nextTheme);
    };

    // Initialize theme from localStorage or system preference
    const initializeTheme = () => {
      const storedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = storedTheme === 'dark' || (!storedTheme && prefersDark) ? 'dark' : 'light';

      applyTheme(initialTheme);
    };

    initializeTheme();

    // Listen for storage changes (theme toggle in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        const nextTheme = e.newValue === 'dark' ? 'dark' : 'light';
        applyTheme(nextTheme);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return null;
}
