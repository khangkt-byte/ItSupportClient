/**
 * JWT Token Utilities
 * 
 * ⚠️ SECURITY WARNING:
 * Client-side JWT validation is ONLY for UX optimization.
 * Server MUST ALWAYS validate tokens for security.
 * Never trust client-side validation for authorization decisions.
 * 
 * References:
 * - RFC 7519 (JWT): https://datatracker.ietf.org/doc/html/rfc7519
 * - OWASP JWT Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html
 */

/**
 * JWT Payload structure
 * Must match backend: AuthenticationService.cs CreateAccessTokenAsync()
 */
interface JWTPayload {
  sub: string;        // Subject (AccountId)
  exp: number;        // Expiration time (Unix timestamp)
  iat: number;        // Issued at (Unix timestamp)
  nbf?: number;       // Not before (Unix timestamp)
  name: string;       // Username
  role?: string | string[]; // Roles
  jti: string;        // JWT ID (Token ID)
  sid?: string;       // Session ID
}

export class JWTHelper {
  /**
   * Decode JWT token
   * ⚠️ WARNING: This does NOT verify signature!
   */
  static decode(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired
   * UX optimization only - Server validates for security
   */
  static isExpired(token: string, bufferSeconds: number = 60): boolean {
    const payload = this.decode(token);
    if (!payload || !payload.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp - bufferSeconds < now;
  }

  /**
   * Get time until token expires (in seconds)
   */
  static getTimeUntilExpiry(token: string): number {
    const payload = this.decode(token);
    if (!payload || !payload.exp) return 0;

    const now = Math.floor(Date.now() / 1000);
    const timeLeft = payload.exp - now;

    return Math.max(0, timeLeft);
  }

  /**
   * Check if token is valid (basic checks only)
   * ⚠️ This is UX optimization only - Server validates for security
   */
  static isValid(token: string): boolean {
    const payload = this.decode(token);
    if (!payload) return false;

    // Check required claims
    if (!payload.sub || !payload.exp || !payload.iat) {
      return false;
    }

    // Check not before
    if (payload.nbf) {
      const now = Math.floor(Date.now() / 1000);
      if (now < payload.nbf) return false;
    }

    // Check expiry
    return !this.isExpired(token);
  }

  /**
   * Extract user info from token
   */
  static getUserInfo(token: string): {
    id: string;
    username: string;
    roles: string[];
    sessionId?: string;
    tokenId: string;
  } | null {
    const payload = this.decode(token);
    if (!payload) return null;

    return {
      id: payload.sub,
      username: payload.name,
      roles: Array.isArray(payload.role)
        ? payload.role
        : (payload.role ? [payload.role] : []),
      sessionId: payload.sid,
      tokenId: payload.jti
    };
  }

  /**
   * Get session ID from token
   */
  static getSessionId(token: string): string | null {
    const payload = this.decode(token);
    return payload?.sid || null;
  }

  /**
   * Get token ID (jti claim)
   */
  static getTokenId(token: string): string | null {
    const payload = this.decode(token);
    return payload?.jti || null;
  }
}
