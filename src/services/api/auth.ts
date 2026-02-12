/**
 * Authentication API
 * 
 * Features:
 * - Silent authentication with refresh tokens
 * - Auto-refresh with cleanup
 * - Cross-tab synchronization
 * - Permission caching
 * - Comprehensive error handling
 * 
 * References:
 * - Auth0 Authentication Best Practices: https://auth0.com/docs/secure
 * - Microsoft Identity Platform: https://learn.microsoft.com/en-us/entra/identity-platform/
 * - OAuth 2.0 RFC 6749: https://datatracker.ietf.org/doc/html/rfc6749
 */

import { apiClient } from './common';
import { JWTHelper } from '@/utils/jwtHelper';
import type { ProfileDto } from '@/types/data';
import type {
  LoginDto,
  LoginResponse,
  OtpDto,
  OtpResponseDto,
  OtpSentResponseDto,
  ResetPasswordDto
} from '@/features/auth/types/auth';

// ===== STATE MANAGEMENT =====

let accessToken: string | null = null;
let userProfile: ProfileDto | null = null;
let userPermissions: string[] = [];
let permissionsCacheTime: number = 0;

// ===== CONFIGURATION =====

const PERMISSIONS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const AUTO_REFRESH_INTERVAL = 60 * 1000; // 60 seconds
const TOKEN_REFRESH_BUFFER = 120; // 2 minutes before expiry

// ===== AUTO-REFRESH MANAGEMENT =====

let refreshIntervalId: NodeJS.Timeout | null = null;
let isRefreshing = false;

// ===== CROSS-TAB SYNCHRONIZATION =====

const authChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('auth-channel')
  : null;

// Listen for auth events from other tabs
if (authChannel) {
  authChannel.addEventListener('message', async (event) => {
    console.log('[Auth] 📢 Cross-tab event:', event.data.type);

    switch (event.data.type) {
      case 'LOGOUT':
        // Logout in this tab too
        accessToken = null;
        userProfile = null;
        userPermissions = [];
        permissionsCacheTime = 0;
        apiClient.clearAuthHeader();
        authApi.stopAutoRefresh();

        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        break;

      case 'LOGIN':
        // Refresh auth state in this tab
        await authApi.initializeAuth();
        break;

      case 'TOKEN_REFRESH':
        // Update token in this tab
        if (event.data.accessToken) {
          accessToken = event.data.accessToken;
          apiClient.setAuthHeader(event.data.accessToken);
        }
        break;
    }
  });
}

// ===== AUTHENTICATION API =====

export const authApi = {
  /**
   * Initialize authentication on page load
   * Pattern: Silent authentication
   * Reference: Auth0 Silent Authentication
   */
  async initializeAuth(): Promise<boolean> {
    try {
      console.log('[Auth] 🔐 Initializing authentication...');

      const response = await apiClient.post<{ accessToken: string }>(
        '/api/auth/refresh-token',
        null,
        { skipAuth: true }
      );

      accessToken = response.accessToken;
      apiClient.setAuthHeader(response.accessToken);

      // Load user profile
      const profile = await authApi.getProfile();
      userProfile = profile;

      // Load permissions
      await authApi.getMyPermissions();

      // Start auto-refresh
      authApi.startAutoRefresh();

      console.log('[Auth] ✅ Authentication restored successfully');
      return true;
    } catch (error: any) {
      console.log('[Auth] ℹ️ No valid session found');

      // Clear stale data
      accessToken = null;
      userProfile = null;
      userPermissions = [];
      permissionsCacheTime = 0;
      apiClient.clearAuthHeader();
      authApi.stopAutoRefresh();

      return false;
    }
  },

  /**
   * Get authenticated user
   */
  async getCurrentUser(): Promise<ProfileDto | null> {
    if (!accessToken) {
      const restored = await authApi.initializeAuth();
      if (!restored) return null;
    }

    return userProfile;
  },

  /**
   * Start auto-refresh with cleanup
   * Pattern: Managed interval lifecycle
   * Reference: JavaScript Best Practices - Memory Management
   */
  startAutoRefresh(): void {
    // Clear existing interval
    authApi.stopAutoRefresh();

    console.log('[Auth] ⏰ Starting auto-refresh...');

    refreshIntervalId = setInterval(async () => {
      if (!accessToken) {
        authApi.stopAutoRefresh();
        return;
      }

      // Check if token needs refresh (2 min buffer)
      if (JWTHelper.isExpired(accessToken, TOKEN_REFRESH_BUFFER)) {
        console.log('[Auth] 🔄 Auto-refreshing token...');

        try {
          await authApi.refreshToken();
        } catch (error) {
          console.error('[Auth] ❌ Auto-refresh failed:', error);
          authApi.stopAutoRefresh();

          // Notify other tabs
          authChannel?.postMessage({ type: 'LOGOUT' });

          // Redirect to login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
    }, AUTO_REFRESH_INTERVAL);
  },

  /**
   * Stop auto-refresh and cleanup
   */
  stopAutoRefresh(): void {
    if (refreshIntervalId) {
      clearInterval(refreshIntervalId);
      refreshIntervalId = null;
      console.log('[Auth] ⏸️ Auto-refresh stopped');
    }
  },

  /**
   * Refresh access token
   * Backend: POST /api/auth/refresh-token
   */
  async refreshToken(): Promise<string | null> {
    // Prevent concurrent refresh requests
    if (isRefreshing) {
      console.log('[Auth] ⏳ Refresh already in progress, waiting...');
      await new Promise(resolve => setTimeout(resolve, 500));
      return accessToken;
    }

    isRefreshing = true;

    try {
      const response = await apiClient.post<{ accessToken: string }>(
        '/api/auth/refresh-token',
        null,
        { skipAuth: true }
      );

      accessToken = response.accessToken;
      apiClient.setAuthHeader(response.accessToken);

      // Notify other tabs
      authChannel?.postMessage({
        type: 'TOKEN_REFRESH',
        accessToken: response.accessToken
      });

      console.log('[Auth] ✅ Token refreshed successfully');
      return accessToken;
    } catch (error) {
      console.error('[Auth] ❌ Token refresh failed:', error);

      // Clear auth state
      accessToken = null;
      userProfile = null;
      userPermissions = [];
      permissionsCacheTime = 0;
      apiClient.clearAuthHeader();
      authApi.stopAutoRefresh();

      throw error;
    } finally {
      isRefreshing = false;
    }
  },

  /**
   * Login with credentials
   * Backend: POST /api/auth/login
   */
  async login(credentials: LoginDto): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<{ accessToken: string }>(
        '/api/auth/login',
        credentials,
        { skipAuth: true }
      );

      accessToken = response.accessToken;
      apiClient.setAuthHeader(response.accessToken);

      // Load user profile
      const profile = await authApi.getProfile();
      userProfile = profile;

      // Load permissions
      await authApi.getMyPermissions();

      // Start auto-refresh
      authApi.startAutoRefresh();

      // Notify other tabs
      authChannel?.postMessage({ type: 'LOGIN' });

      console.log('[Auth] ✅ Login successful');
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] ❌ Login failed:', error);
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  },

  /**
   * Logout
   * Backend: POST /api/auth/logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout', null);
    } catch (error) {
      console.error('[Auth] ⚠️ Logout request failed:', error);
    } finally {
      // Always cleanup
      accessToken = null;
      userProfile = null;
      userPermissions = [];
      permissionsCacheTime = 0;
      apiClient.clearAuthHeader();
      authApi.stopAutoRefresh();

      // Notify other tabs
      authChannel?.postMessage({ type: 'LOGOUT' });

      console.log('[Auth] 👋 Logged out successfully');
    }
  },

  /**
   * Get user profile
   * Backend: GET /api/employees/me
   */
  async getProfile(): Promise<ProfileDto> {
    return apiClient.get<ProfileDto>('/api/employees/me');
  },

  /**
   * Get user permissions with caching
   * Backend: GET /api/accounts/my-permissions
   */
  async getMyPermissions(): Promise<string[]> {
    const now = Date.now();

    // Return cached permissions if still valid
    if (userPermissions.length > 0 &&
      now - permissionsCacheTime < PERMISSIONS_CACHE_TTL) {
      return userPermissions;
    }

    // Fetch fresh permissions
    const permissions = await apiClient.get<string[]>('/api/accounts/my-permissions');
    userPermissions = permissions;
    permissionsCacheTime = now;

    return permissions;
  },

  /**
   * Confirm OTP
   * Backend: POST /api/auth/confirm-otp
   */
  async confirmOtp(dto: OtpDto): Promise<OtpResponseDto> {
    const result = await apiClient.post<OtpResponseDto>(
      '/api/auth/confirm-otp',
      dto,
      { skipAuth: true }
    );

    // Set tokens
    accessToken = result.token.accessToken;
    apiClient.setAuthHeader(result.token.accessToken);

    // Load profile
    const profile = await authApi.getProfile();
    userProfile = profile;

    // Start auto-refresh
    authApi.startAutoRefresh();

    return result;
  },

  /**
   * Resend OTP
   * Backend: POST /api/auth/resend-otp
   */
  async resendOtp(email: string): Promise<OtpSentResponseDto> {
    return apiClient.post<OtpSentResponseDto>(
      '/api/auth/resend-otp',
      email,
      { skipAuth: true }
    );
  },

  /**
   * Forgot password
   * Backend: POST /api/auth/forgot-password
   */
  async forgotPassword(emailOrUsername: string): Promise<void> {
    await apiClient.post(
      '/api/auth/forgot-password',
      emailOrUsername,
      { skipAuth: true }
    );
  },

  /**
   * Reset password
   * Backend: POST /api/auth/reset-password
   */
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    await apiClient.post(
      '/api/auth/reset-password',
      dto,
      { skipAuth: true }
    );
  },

  /**
   * Get current access token (for debugging)
   */
  getAccessToken(): string | null {
    return accessToken;
  },

  /**
   * Check if user has permission
   */
  async hasPermission(permission: string): Promise<boolean> {
    const permissions = await authApi.getMyPermissions();
    return permissions.includes(permission);
  }
};

// ===== EVENT LISTENERS =====

if (typeof window !== 'undefined') {
  // Handle token expiry from backend
  window.addEventListener('auth:token-expired', async () => {
    console.log('[Auth] 🔴 Token expired event received');

    try {
      await authApi.refreshToken();
    } catch (error) {
      console.error('[Auth] ❌ Token refresh failed after expiry:', error);

      // Redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    authApi.stopAutoRefresh();
  });

  // Cleanup broadcast channel on page unload
  window.addEventListener('unload', () => {
    authChannel?.close();
  });
}

// ===== EXPORTS =====

export { accessToken, userProfile, userPermissions };