import { apiClient, buildQueryString } from './common';
import type {
  IssueDto,
  IssueSuggestionDto,
  CreateIssueDto,
  UpdateIssueDto,
  PaginatedResult,
  BulkDeleteResultDto,
} from '../types/data';

export interface IssuesQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  isDescending?: boolean;
  search?: string;
}

export const issuesApi = {
  /**
   * Get all issues with pagination
   * GET /api/issues
   */
  async getAll(params: IssuesQueryParams = {}): Promise<PaginatedResult<IssueDto>> {
    const queryString = buildQueryString({
      Page: params.page || 1,
      PageSize: params.pageSize || 10,
      SortBy: params.sortBy,
      IsDescending: params.isDescending,
      Search: params.search,
    });

    return apiClient.get<PaginatedResult<IssueDto>>(`/api/issues${queryString}`);
  },

  /**
   * Get issue by ID
   * GET /api/issues/{id}
   */
  async getById(id: number): Promise<IssueDto> {
    return apiClient.get<IssueDto>(`/api/issues/${id}`);
  },

  /**
   * Create new issue
   * POST /api/issues
   */
  async create(data: CreateIssueDto): Promise<IssueDto> {
    return apiClient.post<IssueDto>('/api/issues', data);
  },

  /**
   * Update issue
   * PUT /api/issues/{id}
   */
  async update(id: number, data: UpdateIssueDto): Promise<IssueDto> {
    return apiClient.put<IssueDto>(`/api/issues/${id}`, data);
  },

  /**
   * Delete issue(s)
   * DELETE /api/issues
   */
  async delete(ids: number[], softDelete: boolean = true): Promise<BulkDeleteResultDto> {
    const queryString = buildQueryString({ softDelete });
    return apiClient.delete<BulkDeleteResultDto>(`/api/issues${queryString}`, ids);
  },

  /**
   * Delete single issue
   */
  async deleteSingle(id: number, softDelete: boolean = true): Promise<BulkDeleteResultDto> {
    return this.delete([id], softDelete);
  },

  /**
   * Get issue suggestions (Knowledge Base)
   * GET /api/issues/suggestions
   */
  async getSuggestions(search?: string): Promise<IssueSuggestionDto[]> {
    const queryString = buildQueryString({ search });
    return apiClient.get<IssueSuggestionDto[]>(`/api/issues/suggestions${queryString}`);
  },
};
