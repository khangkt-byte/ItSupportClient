import { apiClient, buildQueryString } from './common';
import type {
  RoleDto,
  CreateRoleDto,
  UpdateRoleDto,
  ClaimDto,
  AccountRolesDto,
  AssignRolesDto,
  AssignRolesAndClaimsDto,
  PaginatedResult,
  QueryParams,
  BulkDeleteResultDto,
} from '@/types/data';

/**
 * Query parameters for roles list endpoint
 * Extends the generic QueryParams with roles-specific filtering
 */
export interface RolesQueryParams extends QueryParams { }

export const rolesApi = {
  /**
   * Get all roles with pagination
   * GET /api/roles
   */
  async getAll(params: RolesQueryParams = {}): Promise<PaginatedResult<RoleDto>> {
    const queryString = buildQueryString({
      Page: params.page || 1,
      PageSize: params.pageSize || 10,
      SortBy: params.sortBy,
      IsDescending: params.isDescending,
      Search: params.search,
    });

    return apiClient.get<PaginatedResult<RoleDto>>(`/api/roles${queryString}`);
  },

  /**
   * Get role by ID
   * GET /api/roles/{id}
   */
  async getById(id: number): Promise<RoleDto> {
    return apiClient.get<RoleDto>(`/api/roles/${id}`);
  },

  /**
   * Create new role
   * POST /api/roles
   */
  async create(data: CreateRoleDto): Promise<RoleDto> {
    return apiClient.post<RoleDto>('/api/roles', data);
  },

  /**
   * Update role
   * PUT /api/roles/{id}
   */
  async update(id: number, data: UpdateRoleDto): Promise<RoleDto> {
    return apiClient.put<RoleDto>(`/api/roles/${id}`, data);
  },

  /**
   * Delete role(s)
   * DELETE /api/roles
   * 
   * Strategy: All-or-nothing (transaction-based)
   * Business rules:
   * - Không thể xóa role đang được sử dụng
   * - Không thể xóa system roles
   */
  async delete(ids: number[], softDelete: boolean = true): Promise<BulkDeleteResultDto> {
    const queryString = buildQueryString({ softDelete });
    return apiClient.delete<BulkDeleteResultDto>(`/api/roles${queryString}`, ids);
  },

  /**
   * Delete single role
   */
  async deleteSingle(id: number, softDelete: boolean = true): Promise<BulkDeleteResultDto> {
    return this.delete([id], softDelete);
  },

  /**
   * Get all available claims
   * GET /api/roles/claims
   */
  async getClaims(): Promise<ClaimDto[]> {
    return apiClient.get<ClaimDto[]>('/api/roles/claims');
  },

  /**
   * Assign roles to account
   * POST /api/roles/assign
   */
  async assignRoles(data: AssignRolesDto): Promise<AccountRolesDto> {
    return apiClient.post<AccountRolesDto>('/api/roles/assign', data);
  },

  /**
   * Assign roles and direct claims to account
   * POST /api/roles/assign-with-claims
   * 
   * Assigns both roles and direct claim permissions to an account.
   * Direct claims should only include permissions NOT in any of the selected roles.
   */
  async assignRolesAndClaims(data: AssignRolesAndClaimsDto): Promise<AccountRolesDto> {
    return apiClient.post<AccountRolesDto>('/api/roles/assign-with-claims', data);
  },
};
