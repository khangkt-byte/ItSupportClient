
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import { SecurityValidator } from "@/utils/securityChecks";

  const bootstrapThemeAttributes = () => {
    const root = document.documentElement;
    const body = document.body;

    const resolveAppearance = (appearance: string | null): 'light' | 'dark' => {
      if (appearance === 'light' || appearance === 'dark') {
        return appearance;
      }

      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    try {
      const savedAppearance = localStorage.getItem('appearance');
      const savedBrand = localStorage.getItem('brandColor');
      const savedA11y = localStorage.getItem('a11y');
      const savedLegacyTheme = localStorage.getItem('theme');

      const appearance = resolveAppearance(savedAppearance);
      const brand = savedBrand && (savedBrand === 'default' || savedBrand.startsWith('brand-'))
        ? savedBrand
        : 'default';
      const legacyTheme = savedLegacyTheme && (savedLegacyTheme === 'light' || savedLegacyTheme === 'dark' || savedLegacyTheme.startsWith('brand-'))
        ? savedLegacyTheme
        : appearance;
      const a11y = savedA11y === 'highContrast' ? 'highContrast' : 'default';

      root.setAttribute('data-appearance', appearance);
      root.setAttribute('data-brand', brand);
      root.setAttribute('data-theme', legacyTheme);
      root.setAttribute('data-a11y', a11y);

      if (body) {
        body.setAttribute('data-appearance', appearance);
        body.setAttribute('data-brand', brand);
        body.setAttribute('data-theme', legacyTheme);
        body.setAttribute('data-a11y', a11y);
      }
    } catch {
      // Ignore storage access errors in private mode or restricted environments.
    }
  };

  bootstrapThemeAttributes();

  // Initialize security checks
  try {
    SecurityValidator.initialize();
  } catch (error) {
    console.error('[Main] Security initialization failed:', error);
    // Continue to render error page or handle appropriately
  }

  createRoot(document.getElementById("root")!).render(<App />);
  