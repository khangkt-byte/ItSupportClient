import { useMemo } from 'react';
import type { PaginatedResult, WorkLog, WorkLogsQueryParams } from '@/types/data';

export function useFilteredWorkLogs(
    data: WorkLog[],
    queryParams: WorkLogsQueryParams
): PaginatedResult<WorkLog> {
    const filteredLogs = useMemo(() => {
        const searchText = (queryParams.search || '').toLowerCase().trim();
        const statusValue = queryParams.status;

        const filtered = data.filter((log) => {
            const operators = log.operators || [];
            const requesters = log.requesters || [];
            const issue = log.issue || log.issueDescription || '';

            const matchesSearch =
                !searchText ||
                issue.toLowerCase().includes(searchText) ||
                operators.some((op) => op.toLowerCase().includes(searchText)) ||
                requesters.some((req) => req.toLowerCase().includes(searchText)) ||
                (log.department || '').toLowerCase().includes(searchText) ||
                (log.area || '').toLowerCase().includes(searchText);

            const matchesStatus = !statusValue || log.status === statusValue;
            return matchesSearch && matchesStatus;
        });

        const sortBy = queryParams.sortBy || 'reportDate';
        const direction = queryParams.isDescending ? -1 : 1;

        filtered.sort((a, b) => {
            const getValue = (log: WorkLog): string => {
                switch (sortBy) {
                    case 'reportDate':
                        return log.reportDate || '';
                    case 'status':
                        return log.status || '';
                    case 'department':
                        return log.department || '';
                    case 'area':
                        return log.area || '';
                    case 'operator':
                        return (log.operators || []).join(', ');
                    case 'requester':
                        return (log.requesters || []).join(', ');
                    default:
                        return log.issue || log.issueDescription || '';
                }
            };

            const aValue = getValue(a).toLowerCase();
            const bValue = getValue(b).toLowerCase();
            if (aValue < bValue) return -1 * direction;
            if (aValue > bValue) return 1 * direction;
            return 0;
        });

        return filtered;
    }, [data, queryParams]);

    return useMemo<PaginatedResult<WorkLog>>(() => {
        const pageSize = queryParams.pageSize || 20;
        const totalCount = filteredLogs.length;
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        const page = Math.min(Math.max(queryParams.page || 1, 1), totalPages);
        const start = (page - 1) * pageSize;
        const items = filteredLogs.slice(start, start + pageSize);

        return {
            page,
            pageSize,
            totalCount,
            totalPages,
            hasPreviousPage: page > 1,
            hasNextPage: page < totalPages,
            items,
        };
    }, [filteredLogs, queryParams.page, queryParams.pageSize]);
}
