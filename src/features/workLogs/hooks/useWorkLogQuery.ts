import { useCallback, useEffect, useState } from 'react';
import { workLogsApi } from '@/services/api';
import type { IssueLogDto, PaginatedResult, WorkLog, WorkLogsQueryParams } from '@/types/data';
import { getApiErrorMessage } from '@/utils/apiErrors';

/**
 * Map IssueLogDto (server shape) → WorkLog (UI shape).
 * Exported so WorkLogImportExportPanel can reuse it for the export path.
 */
export function mapIssueLogToWorkLog(log: IssueLogDto): WorkLog {
    return {
        ...log,
        id: log.issLogId,
        reportDate: log.dateReported,
        operators: log.operator ? [log.operator] : [],
        requesters: log.requester ? [log.requester] : [],
        department: log.departmentName || '',
        area: log.areaName || '',
        issue: log.issueDescription,
        cause: log.cause || '',
        fixDescription: log.resolution || '',
        permanentFix: log.permanentFix || '',
        note: log.notes || '',
        status: normalizeWorkStatus(log.status),
    };
}

function normalizeWorkStatus(status: string | null | undefined): WorkLog['status'] {
    if (!status) return 'pending';
    return status.toLowerCase().replace(/\s+/g, '-').trim() as WorkLog['status'];
}

/**
 * Server-side pagination/sorting/filtering hook for WorkLogs.
 * Mirrors the pattern used by useAccountQuery, useEmployeeQuery, etc.
 */
export function useWorkLogQuery() {
    const [queryParams, setQueryParams] = useState<WorkLogsQueryParams>({
        page: 1,
        pageSize: 20,
        search: '',
        sortBy: 'reportDate',
        isDescending: true,
        status: null,
    });
    const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<WorkLog> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await workLogsApi.getAll(queryParams);
            setPaginatedResult({
                ...result,
                items: result.items.map(mapIssueLogToWorkLog),
            });
        } catch (err) {
            console.error('Failed to fetch work logs:', err);
            setError(getApiErrorMessage(err, 'Failed to load work logs'));
            setPaginatedResult(null);
        } finally {
            setLoading(false);
        }
    }, [queryParams]);

    useEffect(() => {
        void fetchWorkLogs();
    }, [fetchWorkLogs]);

    return {
        queryParams,
        setQueryParams,
        paginatedResult,
        loading,
        error,
        setError,
        refetch: fetchWorkLogs,
    };
}
