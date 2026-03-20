/**
 * Department API Client
 * Endpoints: /api/departments
 * Based on OpenAPI Specification
 */

import { apiClient, buildQueryString } from './common';
import type {
  DepartmentDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentSuggestionDto,
  PaginatedResult,
  DepartmentsQueryParams,
  BulkDeleteResultDto
} from '@/types/data';

export const departmentsApi = {
  /**
   * GET /api/departments
   * Get all departments with pagination
   */
  async getAll(params?: DepartmentsQueryParams): Promise<PaginatedResult<DepartmentDto>> {
    const queryString = buildQueryString({
      Page: params?.page || 1,
      PageSize: params?.pageSize || 10,
      SortBy: params?.sortBy,
      IsDescending: params?.isDescending,
      Search: params?.search,
    });

    return apiClient.get<PaginatedResult<DepartmentDto>>(`/api/departments${queryString}`);
  },

  /**
   * GET /api/departments/{id}
   * Get department by ID
   */
  async getById(id: number): Promise<DepartmentDto> {
    return apiClient.get<DepartmentDto>(`/api/departments/${id}`);
  },

  /**
   * GET /api/departments/suggestions
   * Get department suggestions for autocomplete
   */
  async getSuggestions(search?: string): Promise<DepartmentSuggestionDto[]> {
    const queryString = buildQueryString({ search });
    return apiClient.get<DepartmentSuggestionDto[]>(`/api/departments/suggestions${queryString}`);
  },

  /**
   * POST /api/departments
   * Create new department
   */
  async create(data: CreateDepartmentDto): Promise<DepartmentDto> {
    return apiClient.post<DepartmentDto>('/api/departments', data);
  },

  /**
   * PUT /api/departments/{id}
   * Update department
   */
  async update(id: number, data: UpdateDepartmentDto): Promise<DepartmentDto> {
    return apiClient.put<DepartmentDto>(`/api/departments/${id}`, data);
  },

  /**
   * DELETE /api/departments
   * Delete department(s)
   * 
   * Strategy: All-or-nothing (transaction-based)
   * - If all succeed -> 200 OK with summary
   * - If any item fails -> rollback and throw error (4xx/5xx)
   * 
   * Business rules:
   * - Cannot delete departments with active employees (422)
   * - Cannot delete departments referenced by work logs (422)
   */
  async delete(ids: number[], softDelete: boolean = true): Promise<BulkDeleteResultDto> {
    const queryString = buildQueryString({ softDelete });
    return apiClient.delete<BulkDeleteResultDto>(`/api/departments${queryString}`, ids);
  },

  /**
   * Delete single department
   */
  async deleteSingle(id: number, softDelete: boolean = true): Promise<BulkDeleteResultDto> {
    return this.delete([id], softDelete);
  },

  /**
   * Backward-compatible alias. Prefer delete(ids, softDelete).
   */
  async bulkDelete(ids: number[], softDelete: boolean = true): Promise<BulkDeleteResultDto> {
    return this.delete(ids, softDelete);
  }
};
