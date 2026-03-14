import { useCallback, useEffect, useState } from 'react';
import type { IssueDto, IssuesQueryParams, PaginatedResult } from '@/types/data';
import { issuesApi } from '@/services/api/issues';

export function useIssueQuery(queryParams: IssuesQueryParams) {
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
            setError('Failed to load issues');
            setPaginatedResult(null);
        } finally {
            setLoading(false);
        }
    }, [queryParams]);

    useEffect(() => {
        fetchIssues();
    }, [fetchIssues]);

    return {
        loading,
        error,
        setError,
        paginatedResult,
        fetchIssues,
    };
}
