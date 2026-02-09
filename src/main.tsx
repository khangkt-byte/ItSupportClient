
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import "./styles/globals.css";
  import { SecurityValidator } from "./lib/utils/securityChecks";

  // Initialize security checks
  try {
    SecurityValidator.initialize();
  } catch (error) {
    console.error('[Main] Security initialization failed:', error);
    // Continue to render error page or handle appropriately
  }

  createRoot(document.getElementById("root")!).render(<App />);
  