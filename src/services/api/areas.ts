import { apiClient, buildQueryString } from './common';
import type {
  AreaDto,
  CreateAreaDto,
  UpdateAreaDto,
  PaginatedResult,
  QueryParams,
  BulkDeleteResultDto,
} from '@/types/data';

/**
 * Query parameters for areas list endpoint
 * Extends the generic QueryParams with areas-specific filtering
 */
export interface AreasQueryParams extends QueryParams { }

export const areasApi = {
  /**
   * Get all areas with pagination
   * GET /api/areas
   */
  async getAll(params: AreasQueryParams = {}): Promise<PaginatedResult<AreaDto>> {
    const queryString = buildQueryString({
      Page: params.page || 1,
      PageSize: params.pageSize || 10,
      SortBy: params.sortBy,
      IsDescending: params.isDescending,
      Search: params.search,
    });

    return apiClient.get<PaginatedResult<AreaDto>>(`/api/areas${queryString}`);
  },

  /**
   * Get area by ID
   * GET /api/areas/{id}
   */
  async getById(id: number): Promise<AreaDto> {
    return apiClient.get<AreaDto>(`/api/areas/${id}`);
  },

  /**
   * Create new area
   * POST /api/areas
   */
  async create(data: CreateAreaDto): Promise<AreaDto> {
    return apiClient.post<AreaDto>('/api/areas', data);
  },

  /**
   * Update area
   * PUT /api/areas/{id}
   */
  async update(id: number, data: UpdateAreaDto): Promise<AreaDto> {
    return apiClient.put<AreaDto>(`/api/areas/${id}`, data);
  },

  /**
   * Delete area(s)
   * DELETE /api/areas
   * 
   * Strategy: All-or-nothing (transaction-based)
   * - Nếu TẤT CẢ thành công → 200 OK với summary
   * - Nếu BẤT KỲ lỗi nào → Rollback, throw error (4xx/5xx)
   */
  async delete(ids: number[], softDelete: boolean = true): Promise<BulkDeleteResultDto> {
    const queryString = buildQueryString({ softDelete });
    return apiClient.delete<BulkDeleteResultDto>(`/api/areas${queryString}`, ids);
  },

  /**
   * Delete single area
   * DELETE /api/areas/{id}
   * 
   * Business rules:
   * - Không thể xóa nếu khu vực đang được sử dụng bởi nhân viên (422)
   */
  async deleteSingle(id: number, softDelete: boolean = true): Promise<BulkDeleteResultDto> {
    return this.delete([id], softDelete);
  },
};
