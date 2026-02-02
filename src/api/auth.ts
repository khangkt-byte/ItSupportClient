import { apiClient } from './common';
import type { 
  LoginDto, 
  TokenResponseDto, 
  OtpSentResponseDto,
  OtpDto,
  OtpResponseDto,
  ChangePasswordDto,
  LoginHistoryDto,
  ProfileDto
} from '../types/data';

export interface LoginRequest extends LoginDto {}

export interface LoginResponse {
  success: boolean;
  token?: TokenResponseDto;
  otpRequired?: boolean;
  accountId?: string;
  message?: string;
  user?: {
    id: string;
    username: string;
    employeeId: string;
    fullName: string;
    role: 'admin' | 'employee';
    email: string;
  };
  error?: string;
}

export const authApi = {
  /**
   * Login user
   * POST /api/auth/login
   */
  async login(credentials: LoginDto): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<TokenResponseDto | OtpSentResponseDto>(
        '/api/auth/login',
        credentials
      );

      // Check if OTP is required
      if ('accountId' in response && 'message' in response) {
        return {
          success: false,
          otpRequired: true,
          accountId: response.accountId,
          message: response.message,
        };
      }

      // Successful login with tokens
      const tokens = response as TokenResponseDto;
      apiClient.setTokens(tokens.accessToken, tokens.refreshToken);

      // Fetch user profile to get user details
      const profile = await authApi.getProfile();
      
      // Determine role based on profile (you may need to adjust this logic)
      const isAdmin = profile.position?.toLowerCase().includes('admin') || 
                     profile.position?.toLowerCase().includes('quản trị');

      return {
        success: true,
        token: tokens,
        user: {
          id: profile.empId,
          username: profile.username || '',
          employeeId: profile.empCode || profile.empId,
          fullName: profile.fullName,
          role: isAdmin ? 'admin' : 'employee',
          email: profile.email || '',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  },

  /**
   * Confirm OTP
   * POST /api/auth/confirm-otp
   */
  async confirmOtp(otpData: OtpDto): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<OtpResponseDto>(
        '/api/auth/confirm-otp',
        otpData
      );

      apiClient.setTokens(response.token.accessToken, response.token.refreshToken);

      const profile = await authApi.getProfile();
      const isAdmin = profile.position?.toLowerCase().includes('admin') || 
                     profile.position?.toLowerCase().includes('quản trị');

      return {
        success: true,
        token: response.token,
        user: {
          id: profile.empId,
          username: profile.username || '',
          employeeId: profile.empCode || profile.empId,
          fullName: profile.fullName,
          role: isAdmin ? 'admin' : 'employee',
          email: profile.email || '',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'OTP verification failed',
      };
    }
  },

  /**
   * Resend OTP
   * POST /api/auth/resend-otp
   */
  async resendOtp(accountId: string): Promise<OtpSentResponseDto> {
    return apiClient.post<OtpSentResponseDto>('/api/auth/resend-otp', accountId);
  },

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiClient.clearTokens();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken'); // Added
        localStorage.removeItem('refreshToken'); // Added
      }
    }
  },

  /**
   * Refresh access token
   * POST /api/auth/refresh-token
   */
  async refreshToken(): Promise<TokenResponseDto> {
    const response = await apiClient.post<TokenResponseDto>('/api/auth/refresh-token');
    apiClient.setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  /**
   * Forgot password
   * POST /api/auth/forgot-password
   */
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/api/auth/forgot-password', email);
  },

  /**
   * Verify token
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      const profile = await authApi.getProfile();
      return !!profile;
    } catch {
      return false;
    }
  },

  /**
   * Get current user profile
   * GET /api/employees/me
   */
  async getProfile(): Promise<ProfileDto> {
    return apiClient.get<ProfileDto>('/api/employees/me');
  },

  /**
   * Change password
   * POST /api/accounts/me/change-password
   */
  async changePassword(data: ChangePasswordDto): Promise<void> {
    await apiClient.post('/api/accounts/me/change-password', data);
  },

  /**
   * Get login history
   * GET /api/accounts/me/login-history
   */
  async getLoginHistory(): Promise<LoginHistoryDto[]> {
    return apiClient.get<LoginHistoryDto[]>('/api/accounts/me/login-history');
  },
};