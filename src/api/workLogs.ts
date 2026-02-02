import { apiClient, buildQueryString } from './common';
import type {
  IssueLogDto,
  CreateIssueLogDto,
  UpdateIssueLogDto,
  PaginatedResult,
  ImportValidationResultDto,
  ImportResultDto,
  IssueSuggestionDto,
  CauseSuggestionDto,
} from '../types/data';

export interface WorkLogsQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  isDescending?: boolean;
  search?: string;
}

export const workLogsApi = {
  /**
   * Get all work logs (Issue Logs) with pagination
   * GET /api/issue-logs
   */
  async getAll(params: WorkLogsQueryParams = {}): Promise<PaginatedResult<IssueLogDto>> {
    const queryString = buildQueryString({
      Page: params.page || 1,
      PageSize: params.pageSize || 10,
      SortBy: params.sortBy,
      IsDescending: params.isDescending,
      Search: params.search,
    });

    return apiClient.get<PaginatedResult<IssueLogDto>>(`/api/issue-logs${queryString}`);
  },

  /**
   * Get work log by ID
   * GET /api/issue-logs/{issLogId}
   */
  async getById(id: string): Promise<IssueLogDto> {
    return apiClient.get<IssueLogDto>(`/api/issue-logs/${id}`);
  },

  /**
   * Create new work log
   * POST /api/issue-logs
   */
  async create(data: CreateIssueLogDto): Promise<IssueLogDto> {
    return apiClient.post<IssueLogDto>('/api/issue-logs', data);
  },

  /**
   * Update work log
   * PUT /api/issue-logs/{issLogId}
   */
  async update(id: string, data: UpdateIssueLogDto): Promise<IssueLogDto> {
    return apiClient.put<IssueLogDto>(`/api/issue-logs/${id}`, data);
  },

  /**
   * Delete work log(s)
   * DELETE /api/issue-logs
   */
  async delete(ids: string[], softDelete: boolean = true): Promise<boolean> {
    const queryString = buildQueryString({ softDelete });
    return apiClient.delete<boolean>(`/api/issue-logs${queryString}`, ids);
  },

  /**
   * Delete single work log
   */
  async deleteSingle(id: string, softDelete: boolean = true): Promise<boolean> {
    return this.delete([id], softDelete);
  },

  /**
   * Search work logs (using getAll with search param)
   */
  async search(query: string, params: WorkLogsQueryParams = {}): Promise<PaginatedResult<IssueLogDto>> {
    return this.getAll({ ...params, search: query });
  },

  /**
   * Import validation
   * POST /api/issue-logs/import/validate
   */
  async validateImport(file: File): Promise<ImportValidationResultDto> {
    return apiClient.upload<ImportValidationResultDto>(
      '/api/issue-logs/import/validate',
      file
    );
  },

  /**
   * Import work logs
   * POST /api/issue-logs/import
   */
  async import(file: File, options?: any): Promise<ImportResultDto> {
    return apiClient.upload<ImportResultDto>(
      '/api/issue-logs/import',
      file,
      { optionsJson: options }
    );
  },

  /**
   * Export work logs to Excel
   * GET /api/issue-logs/export
   */
  async export(params: WorkLogsQueryParams = {}): Promise<void> {
    const queryString = buildQueryString({
      Page: params.page,
      PageSize: params.pageSize,
      SortBy: params.sortBy,
      IsDescending: params.isDescending,
      Search: params.search,
    });

    const filename = `issue-logs-export-${new Date().toISOString().split('T')[0]}.xlsx`;
    await apiClient.download(`/api/issue-logs/export${queryString}`, filename);
  },

  /**
   * Download Excel template
   * GET /api/issue-logs/export/template
   */
  async downloadTemplate(): Promise<void> {
    await apiClient.download('/api/issue-logs/export/template', 'issue-log-template.xlsx');
  },

  /**
   * Get issue suggestions (Knowledge Base)
   * GET /api/issues/suggestions
   */
  async getIssueSuggestions(search?: string): Promise<IssueSuggestionDto[]> {
    const queryString = buildQueryString({ search });
    return apiClient.get<IssueSuggestionDto[]>(`/api/issues/suggestions${queryString}`);
  },

  /**
   * Get cause suggestions (Knowledge Base)
   * GET /api/causes/suggestions
   */
  async getCauseSuggestions(issueId?: number, search?: string): Promise<CauseSuggestionDto[]> {
    const queryString = buildQueryString({ issId: issueId, search });
    return apiClient.get<CauseSuggestionDto[]>(`/api/causes/suggestions${queryString}`);
  },
};
