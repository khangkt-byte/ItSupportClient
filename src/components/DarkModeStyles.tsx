import { useEffect } from 'react';

export function DarkModeStyles() {
  useEffect(() => {
    // Initialize dark mode from localStorage or system preference
    const initializeDarkMode = () => {
      const theme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDarkMode = theme ? theme === 'dark' : prefersDark;
      
      if (isDarkMode) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    };

    initializeDarkMode();

    // Listen for storage changes (dark mode toggle in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        if (e.newValue === 'dark') {
          document.body.classList.add('dark-theme');
        } else {
          document.body.classList.remove('dark-theme');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return null;
}
