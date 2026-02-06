import { apiClient } from './common';
import type { CsrfTokenResponse } from '../types/data';

export const csrfApi = {
    /**
     * Get CSRF token for frontend
     * GET /api/csrf/token
     * 
     * Generates an HMAC-signed CSRF token for protecting state-changing requests.
     * Token is automatically set in XSRF-TOKEN cookie
     * Include token in X-CSRF-Token header for POST/PUT/DELETE/PATCH requests
     */
    async getToken(): Promise<CsrfTokenResponse> {
        return apiClient.get<CsrfTokenResponse>('/api/csrf/token', { skipAuth: true });
    },
};
