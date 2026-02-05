/**
 * Auth API - Compatibility Layer
 * Re-exports from new lib/api/auth.ts for backward compatibility
 */

export { authApi } from '../lib/api/auth';

// Export types for compatibility
export type { LoginDto, LoginResponse } from '../types/auth';
