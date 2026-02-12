/**
 * Security Validation Utilities
 * 
 * Compliance: W3C Secure Contexts, OWASP Transport Layer Protection
 * 
 * References:
 * - W3C Secure Contexts: https://w3c.github.io/webappsec-secure-contexts/
 * - OWASP Transport Layer Protection: https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html
 */

export class SecurityValidator {
  /**
   * Check if running in secure context (HTTPS)
   * Reference: W3C Secure Contexts API
   */
  static isSecureContext(): boolean {
    if (typeof window === 'undefined') return true; // SSR

    return window.isSecureContext;
  }

  /**
   * Enforce HTTPS in production
   */
  static enforceSecureContext(): void {
    // Allow localhost HTTP in development
    if (typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1')) {
      return;
    }

    // Enforce HTTPS in production (check if import.meta exists)
    const isProduction = typeof import.meta !== 'undefined' && import.meta.env?.PROD;
    
    if (isProduction && !this.isSecureContext()) {
      const currentUrl = typeof window !== 'undefined'
        ? window.location.href
        : 'unknown';

      throw new Error(
        `Security Error: This application requires HTTPS.\n` +
        `Current URL: ${currentUrl}\n` +
        `Please access the application using https:// protocol.`
      );
    }
  }

  /**
   * Check browser security features
   */
  static checkBrowserSecurity(): {
    isSecure: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];
    const isProduction = typeof import.meta !== 'undefined' && import.meta.env?.PROD;

    // 1. Check Secure Context
    if (!this.isSecureContext()) {
      if (isProduction) {
        errors.push('⛔ Application is not running in a secure context (HTTPS required)');
      } else {
        warnings.push('⚠️ Application is not using HTTPS (OK for development)');
      }
    }

    // 2. Check Web Crypto API
    if (typeof window !== 'undefined' &&
        (!window.crypto || !window.crypto.subtle)) {
      errors.push('⛔ Web Crypto API not available (HTTPS required)');
    }

    // 3. Check Cookies support
    if (typeof navigator !== 'undefined' && !navigator.cookieEnabled) {
      errors.push('⛔ Cookies are disabled (required for authentication)');
    }

    // 4. Check localStorage
    if (typeof window !== 'undefined') {
      try {
        const testKey = '__security_test__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
      } catch {
        warnings.push('⚠️ localStorage is not available');
      }
    }

    // 5. Check Fetch API
    if (typeof window !== 'undefined' && !window.fetch) {
      errors.push('⛔ Fetch API not supported (modern browser required)');
    }

    // 6. Check Promise support
    if (typeof Promise === 'undefined') {
      errors.push('⛔ Promise not supported (ES6 required)');
    }

    return {
      isSecure: errors.length === 0,
      warnings,
      errors
    };
  }

  /**
   * Validate API endpoint URL
   */
  static validateApiEndpoint(url: string): void {
    try {
      const apiUrl = new URL(url);
      const isProduction = typeof import.meta !== 'undefined' && import.meta.env?.PROD;

      // Allow localhost HTTP
      if (apiUrl.hostname === 'localhost' ||
          apiUrl.hostname === '127.0.0.1') {
        return;
      }

      // Enforce HTTPS for production API
      if (isProduction && apiUrl.protocol !== 'https:') {
        throw new Error(
          `Security Error: API endpoint must use HTTPS in production.\n` +
          `Current endpoint: ${url}`
        );
      }
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(`Invalid API endpoint URL: ${url}`);
      }
      throw error;
    }
  }

  /**
   * Initialize security checks on app load
   */
  static initialize(): void {
    console.log('[Security] 🔒 Performing security checks...');

    // 1. Enforce HTTPS
    try {
      this.enforceSecureContext();
    } catch (error) {
      console.error('[Security]', error);
      throw error;
    }

    // 2. Check browser capabilities
    const securityCheck = this.checkBrowserSecurity();

    if (securityCheck.errors.length > 0) {
      console.error('[Security] ❌ CRITICAL ERRORS:', securityCheck.errors);
      throw new Error(
        'Security requirements not met:\n' +
        securityCheck.errors.join('\n')
      );
    }

    if (securityCheck.warnings.length > 0) {
      console.warn('[Security] ⚠️ Warnings:', securityCheck.warnings);
    }

    console.log('[Security] ✅ All security checks passed');
  }
}