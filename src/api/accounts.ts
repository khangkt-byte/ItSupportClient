import { apiClient, buildQueryString } from './common';
import type {
  AccountDto,
  ListAccountDto,
  CreateAccountDto,
  UpdateAccountDto,
  ResetPasswordResultDto,
  ChangePasswordDto,
  LoginHistoryDto,
  PaginatedResult,
  BulkDeleteResultDto,
} from '../types/data';

export interface AccountsQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  isDescending?: boolean;
  search?: string;
}

export const accountsApi = {
  /**
   * Get all accounts with pagination
   * GET /api/accounts
   */
  async getAll(params: AccountsQueryParams = {}): Promise<PaginatedResult<ListAccountDto>> {
    const queryString = buildQueryString({
      Page: params.page || 1,
      PageSize: params.pageSize || 10,
      SortBy: params.sortBy,
      IsDescending: params.isDescending,
      Search: params.search,
    });

    return apiClient.get<PaginatedResult<ListAccountDto>>(`/api/accounts${queryString}`);
  },

  /**
   * Get account by ID
   * GET /api/accounts/{id}
   */
  async getById(id: string): Promise<AccountDto> {
    return apiClient.get<AccountDto>(`/api/accounts/${id}`);
  },

  /**
   * Create new account
   * POST /api/accounts
   */
  async create(data: CreateAccountDto): Promise<AccountDto> {
    return apiClient.post<AccountDto>('/api/accounts', data);
  },

  /**
   * Update account
   * PUT /api/accounts/{id}
   */
  async update(id: string, data: UpdateAccountDto): Promise<AccountDto> {
    return apiClient.put<AccountDto>(`/api/accounts/${id}`, data);
  },

  /**
   * Delete account(s)
   * DELETE /api/accounts
   * 
   * Strategy: All-or-nothing (transaction-based)
   * Business rules:
   * - Không thể xóa tài khoản Super Admin
   * - Không thể tự xóa tài khoản của chính mình
   */
  async delete(ids: string[], softDelete: boolean = true): Promise<BulkDeleteResultDto> {
    const queryString = buildQueryString({ softDelete });
    return apiClient.delete<BulkDeleteResultDto>(`/api/accounts${queryString}`, ids);
  },

  /**
   * Delete single account
   */
  async deleteSingle(id: string, softDelete: boolean = true): Promise<BulkDeleteResultDto> {
    return this.delete([id], softDelete);
  },

  /**
   * Reset account password
   * POST /api/accounts/{id}/reset-password
   */
  async resetPassword(id: string): Promise<ResetPasswordResultDto> {
    return apiClient.post<ResetPasswordResultDto>(`/api/accounts/${id}/reset-password`);
  },

  /**
   * Lock account
   * POST /api/accounts/{id}/lock
   */
  async lock(id: string): Promise<AccountDto> {
    return apiClient.post<AccountDto>(`/api/accounts/${id}/lock`);
  },

  /**
   * Unlock account
   * POST /api/accounts/{id}/unlock
   */
  async unlock(id: string): Promise<AccountDto> {
    return apiClient.post<AccountDto>(`/api/accounts/${id}/unlock`);
  },

  /**
   * Get my permissions
   * GET /api/accounts/my-permissions
   */
  async getMyPermissions(): Promise<string[]> {
    return apiClient.get<string[]>('/api/accounts/my-permissions');
  },

  /**
   * Change password (self-service)
   * POST /api/accounts/me/change-password
   * 
   * Allows user to change their own password
   */
  async changePassword(data: ChangePasswordDto): Promise<void> {
    return apiClient.post<void>('/api/accounts/me/change-password', data);
  },

  /**
   * Get login history (self-service)
   * GET /api/accounts/me/login-history
   * 
   * Get login history for current user
   */
  async getLoginHistory(): Promise<LoginHistoryDto[]> {
    return apiClient.get<LoginHistoryDto[]>('/api/accounts/me/login-history');
  },};