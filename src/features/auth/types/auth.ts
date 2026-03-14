/**
 * Authentication Type Definitions
 * Must match backend: ITSupportServer/src/Modules/Authentication/
 * 
 * References:
 * - Backend DTOs: AuthenticationDto.cs, LoginDto.cs, TokenResponseDto.cs
 * - Compliance: TypeScript 5.0+, OpenAPI 3.0
 */

/**
 * Login request DTO
 * Backend: LoginDto.cs
 */
export interface LoginDto {
  identifier: string;  // Email or Username
  password: string;
}

/**
 * Login response wrapper
 */
export interface LoginResponse {
  success: boolean;
  error?: string;
}

/**
 * Token response from backend
 * Backend: TokenResponseDto.cs
 */
export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
}

/**
 * Refresh token request
 * Backend: RefreshTokenRequestDto.cs
 */
export interface RefreshTokenRequestDto {
  refreshToken: string;
}

/**
 * API Error response
 * Standard: RFC 7807 Problem Details
 */
export interface ApiError {
  error?: string;
  title?: string;
  detail?: string;
  status?: number;
  instance?: string;
  timestamp?: string;
  errorCode?: string;
  errorCategory?: string;
  errors?: Record<string, string[] | string>;
  message?: string;
  statusCode?: number;
}

/**
 * OTP verification DTO
 * Backend: OtpDto.cs
 */
export interface OtpDto {
  accountId: string;
  otp: string;
}

/**
 * OTP response wrapper
 * Backend: OtpResponseDto.cs
 */
export interface OtpResponseDto {
  token: TokenResponseDto;
}

/**
 * OTP sent confirmation
 * Backend: OtpSentResponseDto.cs
 */
export interface OtpSentResponseDto {
  accountId: string;
  message: string;
}

/**
 * Password reset request
 * Backend: ResetPasswordDto.cs
 */
export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Health check response
 * Backend: Program.cs health checks
 */
export interface HealthCheckResponse {
  status: string;
  checks: HealthCheckEntry[];
  totalDuration: number;
}

export interface HealthCheckEntry {
  name: string;
  status: string;
  description?: string;
  duration: number;
}
