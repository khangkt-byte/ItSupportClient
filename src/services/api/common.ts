/**
 * API Client with Enterprise-Grade Features
 * 
 * Features:
 * - CSRF Protection with lazy initialization
 * - Token expiry handling
 * - Exponential backoff retry
 * - Request/Response interceptors
 * - Comprehensive error handling
 * 
 * References:
 * - Microsoft REST API Guidelines: https://github.com/microsoft/api-guidelines
 * - Google API Design Guide: https://cloud.google.com/apis/design
 * - Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 */

import type { ApiError } from '@/features/auth/types/auth';

/**
 * API Client Configuration
 */
interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Request options
 */
interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipCsrf?: boolean;
  _retryCount?: number;
  _backoffDelay?: number;
}

/**
 * Enterprise-grade API Client
 * Compliance: Microsoft API Guidelines, Google API Design
 */
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private maxRetries: number;
  private retryDelay: number;

  private authHeader: string | null = null;
  private csrfToken: string | null = null;
  private csrfInitPromise: Promise<void> | null = null;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 30000; // 30 seconds
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000;
  }

  /**
   * Ensure CSRF token is initialized before request
   * Pattern: Lazy initialization with promise memoization
   * Reference: Microsoft Async Patterns
   */
  private async ensureCsrfToken(): Promise<void> {
    // ✅ Return existing promise if already initializing
    if (this.csrfInitPromise) {
      return this.csrfInitPromise;
    }

    // ✅ Return immediately if token already exists
    if (this.csrfToken) {
      return Promise.resolve();
    }

    // ✅ Initialize and cache promise
    this.csrfInitPromise = this.initializeCsrf();

    try {
      await this.csrfInitPromise;
    } finally {
      this.csrfInitPromise = null;
    }
  }

  /**
   * Initialize CSRF token
   * Backend: /api/csrf/token
   */
  private async initializeCsrf(): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/api/csrf/token`, {
        credentials: 'include',
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(`CSRF token fetch failed: ${response.status}`);
      }

      const data = await response.json();
      this.csrfToken = data.csrfToken;

      if (this.csrfToken) {
        console.log('[CSRF] ✅ Token initialized:', this.csrfToken.substring(0, 16) + '...');
      }
    } catch (error) {
      console.error('[CSRF] ❌ Failed to get token:', error);
      throw error;
    }
  }

  /**
   * Make HTTP request with comprehensive error handling
   * Pattern: Interceptor pattern with retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const retryCount = options._retryCount || 0;
    const backoffDelay = options._backoffDelay || this.retryDelay;

    // ✅ CRITICAL: Ensure CSRF token for state-changing requests
    if (options.method && options.method !== 'GET' && !options.skipCsrf) {
      await this.ensureCsrfToken();
    }

    const headers = new Headers(options.headers);

    // ✅ Add Authorization header
    if (this.authHeader && !options.skipAuth) {
      headers.set('Authorization', this.authHeader);
    }

    // ✅ Add CSRF token for non-GET requests
    if (options.method && options.method !== 'GET' && this.csrfToken && !options.skipCsrf) {
      headers.set('X-CSRF-Token', this.csrfToken);
    }

    // ✅ Add X-Requested-With header (CSRF protection)
    headers.set('X-Requested-With', 'XMLHttpRequest');

    // ✅ Add default Content-Type if body exists
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
        signal: options.signal || AbortSignal.timeout(this.timeout)
      });

      // ✅ Handle CSRF token expiry with exponential backoff
      if (response.status === 403 && retryCount < this.maxRetries) {
        try {
          // Read from a clone so the original response body remains available
          // for the centralized error parser in handleResponse.
          const error = await response.clone().json();
          if (error.errorCode === 'CSRF_TOKEN_MISSING' ||
            error.errorCode === 'CSRF_TOKEN_INVALID') {

            console.log(`[CSRF] Token expired, retrying after ${backoffDelay}ms...`);

            // ✅ Wait with exponential backoff
            await new Promise(resolve => setTimeout(resolve, backoffDelay));

            // ✅ Clear and reinitialize token
            this.csrfToken = null;
            this.csrfInitPromise = null;
            await this.ensureCsrfToken();

            // ✅ Retry with exponential backoff
            return this.request<T>(endpoint, {
              ...options,
              _retryCount: retryCount + 1,
              _backoffDelay: backoffDelay * 2
            });
          }
        } catch (parseError) {
          // Continue to handleResponse
        }
      }

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          const timeoutError = new Error('The request timed out. Please try again.');
          (timeoutError as any).errorCode = 'REQUEST_TIMEOUT';
          (timeoutError as any).errorCategory = 'transport';
          throw timeoutError;
        }

        if (error instanceof TypeError) {
          const networkError = new Error('Unable to reach the server. Check your connection and try again.');
          (networkError as any).errorCode = 'NETWORK_ERROR';
          (networkError as any).errorCategory = 'transport';
          throw networkError;
        }
      }
      throw error;
    }
  }

  /**
   * Handle response with comprehensive error handling
   * Pattern: Response interceptor
   * Reference: Axios interceptor pattern
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // ✅ CRITICAL: Check for Token-Expired header
    const tokenExpired = response.headers.get('Token-Expired');
    if (tokenExpired === 'true') {
      console.warn('[Auth] ⚠️ Token expired, triggering event...');

      // Clear auth state
      this.authHeader = null;

      // Dispatch custom event for auth re-initialization
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:token-expired'));
      }
    }

    // ✅ Handle successful response
    if (response.ok) {
      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    }

    // ✅ Handle error responses
    let errorData: ApiError;
    try {
      const rawBody = await response.text();
      errorData = rawBody
        ? JSON.parse(rawBody)
        : {
          error: response.statusText,
          statusCode: response.status,
        };
    } catch {
      errorData = {
        error: response.statusText,
        statusCode: response.status
      };
    }

    // ✅ Throw specific error for token expiry
    if (tokenExpired === 'true') {
      const error = new Error('TOKEN_EXPIRED');
      (error as any).data = errorData;
      (error as any).status = response.status;
      (error as any).headers = response.headers;
      throw error;
    }

    // ✅ Throw error with data
    const error = new Error(
      errorData.detail ||
      errorData.message ||
      errorData.title ||
      errorData.error ||
      'Request failed'
    );
    (error as any).data = errorData;
    (error as any).status = response.status;
    (error as any).headers = response.headers;
    (error as any).response = response;
    throw error;
  }

  // ===== PUBLIC API =====

  /**
   * Set authentication header
   */
  setAuthHeader(token: string): void {
    this.authHeader = `Bearer ${token}`;
    console.log('[Auth] ✅ Authorization header set');
  }

  /**
   * Clear authentication header
   */
  clearAuthHeader(): void {
    this.authHeader = null;
    console.log('[Auth] 🔓 Authorization header cleared');
  }

  /**
   * Get CSRF token (for debugging)
   */
  getCsrfToken(): string | null {
    return this.csrfToken;
  }

  /**
   * HTTP GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET'
    });
  }

  /**
   * HTTP POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  /**
   * HTTP PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  /**
   * HTTP PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  /**
   * HTTP DELETE request
   */
  async delete<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  /**
   * Upload file (for Excel import)
   */
  async upload<T>(endpoint: string, file: File, additionalData?: any): Promise<T> {
    // Ensure CSRF token
    await this.ensureCsrfToken();

    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      });
    }

    const headers = new Headers();
    if (this.authHeader) {
      headers.set('Authorization', this.authHeader);
    }
    if (this.csrfToken) {
      headers.set('X-CSRF-Token', this.csrfToken);
    }
    headers.set('X-Requested-With', 'XMLHttpRequest');

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include'
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Download file (for Excel export)
   */
  async download(endpoint: string, filename: string): Promise<void> {
    const headers = new Headers();
    if (this.authHeader) {
      headers.set('Authorization', this.authHeader);
    }
    headers.set('X-Requested-With', 'XMLHttpRequest');

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

/**
 * Singleton API client instance
 * Configuration from environment variables
 */
const API_BASE_URL = typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL
  ? (import.meta as any).env.VITE_API_URL
  : 'https://localhost:5001';

export const apiClient = new ApiClient({
  baseURL: API_BASE_URL,
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000
});

/**
 * Export types and config
 */
export { API_BASE_URL };

/**
 * Helper function to build query string
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Export type for external use
 */
export type { ApiClientConfig, RequestOptions };