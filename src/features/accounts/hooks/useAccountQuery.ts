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
    const [queryLoading, setQueryLoading] = useState(false);
    const [queryError, setQueryError] = useState<string | null>(null);

    const fetchAccounts = useCallback(async () => {
        try {
            setQueryLoading(true);
            setQueryError(null);
            const result = await accountsApi.getAll(queryParams);
            setPaginatedResult(result);
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
            setQueryError('Failed to load accounts');
            setPaginatedResult(null);
        } finally {
            setQueryLoading(false);
        }
    }, [queryParams]);

    useEffect(() => {
        void fetchAccounts();
    }, [fetchAccounts]);

    return {
        queryParams,
        setQueryParams,
        paginatedResult,
        queryLoading,
        queryError,
        fetchAccounts,
    };
}
