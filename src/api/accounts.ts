import { apiClient, buildQueryString } from './common';
import type {
  AccountDto,
  ListAccountDto,
  CreateAccountDto,
  UpdateAccountDto,
  ResetPasswordResultDto,
  PaginatedResult,
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
   */
  async delete(ids: string[]): Promise<boolean> {
    return apiClient.delete<boolean>('/api/accounts', ids);
  },

  /**
   * Delete single account
   */
  async deleteSingle(id: string): Promise<boolean> {
    return this.delete([id]);
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
};
