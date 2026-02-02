import { apiClient, buildQueryString } from './common';
import type {
  AreaDto,
  CreateAreaDto,
  UpdateAreaDto,
  PaginatedResult,
} from '../types/data';

export interface AreasQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  isDescending?: boolean;
  search?: string;
}

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
   */
  async delete(ids: number[], softDelete: boolean = true): Promise<boolean> {
    const queryString = buildQueryString({ softDelete });
    return apiClient.delete<boolean>(`/api/areas${queryString}`, ids);
  },

  /**
   * Delete single area
   */
  async deleteSingle(id: number, softDelete: boolean = true): Promise<boolean> {
    return this.delete([id], softDelete);
  },
};
