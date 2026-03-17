import { useCallback, useEffect, useState } from 'react';
import type { IssueDto, IssuesQueryParams, PaginatedResult } from '@/types/data';
import { issuesApi } from '@/services/api/issues';
import { getApiErrorMessage } from '@/utils/apiErrors';

export function useIssueQuery() {
    const [queryParams, setQueryParams] = useState<IssuesQueryParams>({
        page: 1,
        pageSize: 10,
        search: '',
        sortBy: 'name',
        isDescending: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<IssueDto> | null>(null);

    const fetchIssues = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await issuesApi.getAll(queryParams);
            setPaginatedResult(result);
        } catch (err) {
            console.error('Failed to fetch issues:', err);
            setError(getApiErrorMessage(err, 'Unable to load issues. Please refresh and try again.'));
            setPaginatedResult(null);
        } finally {
            setLoading(false);
        }
    }, [queryParams]);

    useEffect(() => {
        void fetchIssues();
    }, [fetchIssues]);

    return {
        queryParams,
        setQueryParams,
        paginatedResult,
        loading,
        error,
        setError,
        refetch: fetchIssues,
    };
}
