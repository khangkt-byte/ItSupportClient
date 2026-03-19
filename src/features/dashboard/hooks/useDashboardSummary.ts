import { useCallback, useEffect, useState } from 'react';
import { dashboardApi } from '@/services/api';
import type {
    DashboardDepartmentIssueDto,
    DashboardOverviewDto,
    DashboardStatusBreakdownDto,
    DashboardSummaryDto,
    DashboardTrendPointDto,
} from '@/types/data';
import { getApiErrorMessage } from '@/utils/apiErrors';

const toNumber = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
};

const normalizeOverview = (overview?: Partial<DashboardOverviewDto>): DashboardOverviewDto => ({
    totalIssueLogs: toNumber(overview?.totalIssueLogs),
    issueLogsToday: toNumber(overview?.issueLogsToday),
    openIssueLogs: toNumber(overview?.openIssueLogs),
    resolvedIssueLogs: toNumber(overview?.resolvedIssueLogs),
    totalDepartments: toNumber(overview?.totalDepartments),
    totalEmployees: toNumber(overview?.totalEmployees),
    totalAccounts: toNumber(overview?.totalAccounts),
    activeSessions: toNumber(overview?.activeSessions),
});

const normalizeTrend = (trend?: DashboardTrendPointDto[]): DashboardTrendPointDto[] => {
    if (!Array.isArray(trend)) return [];

    return trend.map(item => ({
        date: item.date,
        count: toNumber(item.count),
    }));
};

const normalizeStatusBreakdown = (items?: DashboardStatusBreakdownDto[]): DashboardStatusBreakdownDto[] => {
    if (!Array.isArray(items)) return [];

    return items.map(item => ({
        status: item.status,
        count: toNumber(item.count),
    }));
};

const normalizeTopDepartments = (items?: DashboardDepartmentIssueDto[]): DashboardDepartmentIssueDto[] => {
    if (!Array.isArray(items)) return [];

    return items.map(item => ({
        dptId: toNumber(item.dptId),
        departmentName: item.departmentName,
        count: toNumber(item.count),
    }));
};

const normalizeSummary = (summary: DashboardSummaryDto): DashboardSummaryDto => ({
    overview: normalizeOverview(summary?.overview),
    trendLast7Days: normalizeTrend(summary?.trendLast7Days),
    statusBreakdown: normalizeStatusBreakdown(summary?.statusBreakdown),
    topDepartments: normalizeTopDepartments(summary?.topDepartments),
});

export function useDashboardSummary(enabled: boolean = true) {
    const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = useCallback(async () => {
        if (!enabled) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const result = await dashboardApi.getSummary();
            setSummary(normalizeSummary(result));
        } catch (summaryError) {
            console.error('Failed to fetch dashboard summary:', summaryError);
            setError(getApiErrorMessage(summaryError, 'Unable to load dashboard summary. Please refresh and try again.'));
            setSummary(null);
        } finally {
            setLoading(false);
        }
    }, [enabled]);

    useEffect(() => {
        void fetchSummary();
    }, [fetchSummary]);

    return {
        summary,
        loading,
        error,
        refetch: fetchSummary,
    };
}
