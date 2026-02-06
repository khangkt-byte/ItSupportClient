import { apiClient, buildQueryString } from './common';
import type {
  CauseDto,
  ListCauseDto,
  CauseSuggestionDto,
  CreateCauseDto,
  UpdateCauseDto,
  PaginatedResult,
  BulkDeleteResultDto,
} from '../types/data';

export interface CausesQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  isDescending?: boolean;
  search?: string;
  issueId?: number;
}

export const causesApi = {
  /**
   * Get all causes with pagination
   * GET /api/causes
   */
  async getAll(params: CausesQueryParams = {}): Promise<PaginatedResult<ListCauseDto>> {
    const queryString = buildQueryString({
      Page: params.page || 1,
      PageSize: params.pageSize || 10,
      SortBy: params.sortBy,
      IsDescending: params.isDescending,
      Search: params.search,
      IssId: params.issueId,
    });

    return apiClient.get<PaginatedResult<ListCauseDto>>(`/api/causes${queryString}`);
  },

  /**
   * Get cause by ID
   * GET /api/causes/{id}
   */
  async getById(id: number): Promise<CauseDto> {
    return apiClient.get<CauseDto>(`/api/causes/${id}`);
  },

  /**
   * Create new cause
   * POST /api/causes
   */
  async create(data: CreateCauseDto): Promise<CauseDto> {
    return apiClient.post<CauseDto>('/api/causes', data);
  },

  /**
   * Update cause
   * PUT /api/causes/{id}
   */
  async update(id: number, data: UpdateCauseDto): Promise<CauseDto> {
    return apiClient.put<CauseDto>(`/api/causes/${id}`, data);
  },

  /**
   * Delete cause(s)
   * DELETE /api/causes
   */
  async delete(ids: number[], softDelete: boolean = true): Promise<BulkDeleteResultDto> {
    const queryString = buildQueryString({ softDelete });
    return apiClient.delete<BulkDeleteResultDto>(`/api/causes${queryString}`, ids);
  },

  /**
   * Delete single cause
   */
  async deleteSingle(id: number, softDelete: boolean = true): Promise<BulkDeleteResultDto> {
    return this.delete([id], softDelete);
  },

  /**
   * Get cause suggestions (Knowledge Base)
   * GET /api/causes/suggestions
   */
  async getSuggestions(issueId?: number, search?: string): Promise<CauseSuggestionDto[]> {
    const queryString = buildQueryString({ issId: issueId, search });
    return apiClient.get<CauseSuggestionDto[]>(`/api/causes/suggestions${queryString}`);
  },

  /**
   * Get causes for specific issue
   * GET /api/causes/by-issue/{issId}
   */
  async getByIssueId(issueId: number): Promise<CauseDto[]> {
    return apiClient.get<CauseDto[]>(`/api/causes/by-issue/${issueId}`);
  },

  /**
   * Get causes for specific issue (filtered via getAll)
   */
  async getByIssueIdFiltered(issueId: number): Promise<ListCauseDto[]> {
    const result = await this.getAll({ issueId, pageSize: 100 });
    return result.items;
  },
};
