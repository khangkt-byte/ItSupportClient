import { apiClient } from './common';
import type { DashboardSummaryDto } from '@/types/data';

export const dashboardApi = {
    /**
     * Get dashboard summary
     * GET /api/dashboard/summary
     */
    async getSummary(): Promise<DashboardSummaryDto> {
        return apiClient.get<DashboardSummaryDto>('/api/dashboard/summary');
    },
};
