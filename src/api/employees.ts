import { apiClient, buildQueryString } from './common';
import type {
  EmployeeDto,
  ListEmployeeDto,
  DetailEmployeeDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  UpdateProfileDto,
  ProfileDto,
  PaginatedResult,
  QueryParams,
  BulkDeleteResultDto,
} from '../types/data';

/**
 * Query parameters for employees list endpoint
 * Extends the generic QueryParams with employees-specific filtering
 */
export interface EmployeesQueryParams extends QueryParams { }

export const employeesApi = {
  /**
   * Get all employees with pagination
   * GET /api/employees
   */
  async getAll(params: EmployeesQueryParams = {}): Promise<PaginatedResult<ListEmployeeDto>> {
    const queryString = buildQueryString({
      Page: params.page || 1,
      PageSize: params.pageSize || 10,
      SortBy: params.sortBy,
      IsDescending: params.isDescending,
      Search: params.search,
    });

    return apiClient.get<PaginatedResult<ListEmployeeDto>>(`/api/employees${queryString}`);
  },

  /**
   * Get employee by ID
   * GET /api/employees/{id}
   */
  async getById(id: string): Promise<DetailEmployeeDto> {
    return apiClient.get<DetailEmployeeDto>(`/api/employees/${id}`);
  },

  /**
   * Create new employee
   * POST /api/employees
   */
  async create(data: CreateEmployeeDto): Promise<EmployeeDto> {
    return apiClient.post<EmployeeDto>('/api/employees', data);
  },

  /**
   * Update employee
   * PUT /api/employees/{id}
   */
  async update(id: string, data: UpdateEmployeeDto): Promise<EmployeeDto> {
    return apiClient.put<EmployeeDto>(`/api/employees/${id}`, data);
  },

  /**
   * Delete employee(s)
   * DELETE /api/employees
   * 
   * Strategy: All-or-nothing (transaction-based)
   * Business rules:
   * - Không thể xóa Super_Admin
   * - Không thể xóa nếu nhân viên có nhật ký sự cố
   */
  async delete(ids: string[], softDelete: boolean = true): Promise<BulkDeleteResultDto> {
    const queryString = buildQueryString({ softDelete });
    return apiClient.delete<BulkDeleteResultDto>(`/api/employees${queryString}`, ids);
  },

  /**
   * Delete single employee
   */
  async deleteSingle(id: string, softDelete: boolean = true): Promise<BulkDeleteResultDto> {
    return this.delete([id], softDelete);
  },

  /**
   * Assign roles to employee
   * POST /api/employees/{id}/roles
   */
  async assignRoles(id: string, roleIds: number[]): Promise<DetailEmployeeDto> {
    return apiClient.post<DetailEmployeeDto>(`/api/employees/${id}/roles`, roleIds);
  },

  /**
   * Get current user profile
   * GET /api/employees/me
   */
  async getProfile(): Promise<ProfileDto> {
    return apiClient.get<ProfileDto>('/api/employees/me');
  },

  /**
   * Update current user profile
   * PUT /api/employees/me
   */
  async updateProfile(data: UpdateProfileDto): Promise<ProfileDto> {
    return apiClient.put<ProfileDto>('/api/employees/me', data);
  },
};
