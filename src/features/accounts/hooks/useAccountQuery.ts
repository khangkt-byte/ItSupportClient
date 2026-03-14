import { useCallback, useEffect, useState } from 'react';
import { accountsApi } from '@/services/api/accounts';
import type { AccountsQueryParams, ListAccountDto, PaginatedResult } from '@/types/data';

export function useAccountQuery() {
    const [queryParams, setQueryParams] = useState<AccountsQueryParams>({
        page: 1,
        pageSize: 10,
        search: '',
        sortBy: 'username',
        isDescending: false,
        isLocked: null,
    });
    const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<ListAccountDto> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAccounts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await accountsApi.getAll(queryParams);
            setPaginatedResult(result);
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
            setError('Failed to load accounts');
            setPaginatedResult(null);
        } finally {
            setLoading(false);
        }
    }, [queryParams]);

    useEffect(() => {
        void fetchAccounts();
    }, [fetchAccounts]);

    return {
        queryParams,
        setQueryParams,
        paginatedResult,
        loading,
        error,
        // Backward compatibility alias. Prefer `loading`.
        queryLoading: loading,
        // Backward compatibility alias. Prefer `error`.
        queryError: error,
        fetchAccounts,
    };
}
