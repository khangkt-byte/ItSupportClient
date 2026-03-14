import { useCallback, useEffect, useState } from 'react';
import { workLogsApi } from '@/services/api';
import { getApiErrorMessage } from '@/utils/apiErrors';

interface WorkLogSummary {
    totalCount: number;
    pendingCount: number;
}

export function useWorkLogSummary(enabled: boolean = true) {
    const [summary, setSummary] = useState<WorkLogSummary>({
        totalCount: 0,
        pendingCount: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = useCallback(async () => {
        if (!enabled) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const [allLogs, pendingLogs] = await Promise.all([
                workLogsApi.getAll({ page: 1, pageSize: 1 }),
                workLogsApi.getAll({ page: 1, pageSize: 1, status: 'pending' }),
            ]);

            setSummary({
                totalCount: allLogs.totalCount,
                pendingCount: pendingLogs.totalCount,
            });
        } catch (summaryError) {
            console.error('Failed to fetch work log summary:', summaryError);
            setError(getApiErrorMessage(summaryError, 'Failed to load work log summary'));
        } finally {
            setLoading(false);
        }
    }, [enabled]);

    useEffect(() => {
        void fetchSummary();
    }, [fetchSummary]);

    return {
        ...summary,
        loading,
        error,
        refetch: fetchSummary,
    };
}