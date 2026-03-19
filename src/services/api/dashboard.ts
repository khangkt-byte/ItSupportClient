import { apiClient, buildQueryString } from './common';
import type { DashboardSummaryDto, DashboardSummaryQueryParams } from '@/types/data';

export const dashboardApi = {
    /**
     * Get dashboard summary
     * GET /api/dashboard/summary
     */
    async getSummary(params: DashboardSummaryQueryParams = {}): Promise<DashboardSummaryDto> {
        const queryString = buildQueryString({
            Period: params.period,
            FromDate: params.fromDate,
            ToDate: params.toDate,
            Timezone: params.timezone,
            GroupBy: params.groupBy,
            MonthOffset: params.monthOffset,
        });

        return apiClient.get<DashboardSummaryDto>(`/api/dashboard/summary${queryString}`);
    },
};
