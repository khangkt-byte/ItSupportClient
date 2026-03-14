import { useCallback, useEffect, useState } from 'react';
import { areasApi } from '@/services/api/areas';
import type { AreaDto, AreasQueryParams, PaginatedResult } from '@/types/data';
import { getApiErrorMessage } from '@/utils/apiValidation';

export function useAreaQuery() {
    const [queryParams, setQueryParams] = useState<AreasQueryParams>({
        page: 1,
        pageSize: 10,
        search: '',
        sortBy: 'name',
        isDescending: false,
    });
    const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<AreaDto> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAreas = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await areasApi.getAll(queryParams);
            setPaginatedResult(result);
        } catch (err) {
            console.error('Failed to fetch areas:', err);
            setError(getApiErrorMessage(err, 'Failed to load areas'));
            setPaginatedResult(null);
        } finally {
            setLoading(false);
        }
    }, [queryParams]);

    useEffect(() => {
        void fetchAreas();
    }, [fetchAreas]);

    return {
        queryParams,
        setQueryParams,
        paginatedResult,
        loading,
        error,
        setError,
        refetch: fetchAreas,
    };
}
