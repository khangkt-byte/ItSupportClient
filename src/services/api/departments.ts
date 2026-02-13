/**
 * Department API Client
 * Endpoints: /api/departments
 * Based on OpenAPI Specification
 */

import { apiClient } from './common';
import type {
  DepartmentDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentSuggestionDto,
  PaginatedResult,
  DepartmentsQueryParams,
  BulkDeleteResultDto
} from '@/types/data';

class DepartmentAPI {
  /**
   * GET /api/departments
   * Lấy danh sách phòng ban (có phân trang)
   */
  async getAll(params?: DepartmentsQueryParams): Promise<PaginatedResult<DepartmentDto>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('Page', params.page.toString());
    if (params?.pageSize) queryParams.append('PageSize', params.pageSize.toString());
    if (params?.sortBy) queryParams.append('SortBy', params.sortBy);
    if (params?.isDescending !== undefined) queryParams.append('IsDescending', params.isDescending.toString());
    if (params?.search) queryParams.append('Search', params.search);

    const url = `/api/departments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<PaginatedResult<DepartmentDto>>(url);
  }

  /**
   * GET /api/departments/{id}
   * Lấy thông tin phòng ban theo ID
   */
  async getById(id: number): Promise<DepartmentDto> {
    return apiClient.get<DepartmentDto>(`/api/departments/${id}`);
  }

  /**
   * GET /api/departments/suggestions
   * Lấy gợi ý phòng ban cho autocomplete/dropdown
   */
  async getSuggestions(search?: string): Promise<DepartmentSuggestionDto[]> {
    const url = search
      ? `/api/departments/suggestions?search=${encodeURIComponent(search)}`
      : '/api/departments/suggestions';
    return apiClient.get<DepartmentSuggestionDto[]>(url);
  }

  /**
   * POST /api/departments
   * Tạo phòng ban mới
   */
  async create(data: CreateDepartmentDto): Promise<DepartmentDto> {
    return apiClient.post<DepartmentDto>('/api/departments', data);
  }

  /**
   * PUT /api/departments/{id}
   * Cập nhật phòng ban
   */
  async update(id: number, data: UpdateDepartmentDto): Promise<DepartmentDto> {
    return apiClient.put<DepartmentDto>(`/api/departments/${id}`, data);
  }

  /**
   * DELETE /api/departments/{dptId}
   * Xóa phòng ban đơn lẻ
   * 
   * Business rules:
   * - Không thể xóa nếu phòng ban có nhân viên (422)
   * - Không thể xóa nếu phòng ban có nhật ký sự cố (422)
   */
  async delete(dptId: number): Promise<void> {
    return apiClient.delete(`/api/departments/${dptId}`);
  }

  /**
   * DELETE /api/departments
   * Xóa nhiều phòng ban
   * 
   * Strategy: All-or-nothing (transaction-based)
   * - Nếu TẤT CẢ thành công → 200 OK với summary
   * - Nếu BẤT KỲ lỗi nào → Rollback, throw error (4xx/5xx)
   * 
   * Business rules:
   * - Không thể xóa phòng ban có nhân viên (422)
   * - Không thể xóa phòng ban có nhật ký sự cố (422)
   * - Transaction rollback nếu ANY item fails
   */
  async bulkDelete(ids: number[], softDelete: boolean = true): Promise<BulkDeleteResultDto> {
    const url = `/api/departments?softDelete=${softDelete}`;
    return apiClient.delete<BulkDeleteResultDto>(url, ids);
  }
}

export const departmentApi = new DepartmentAPI();
