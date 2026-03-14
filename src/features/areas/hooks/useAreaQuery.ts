import { useCallback, useEffect, useState } from 'react';
import { areasApi } from '@/services/api/areas';
import type { AreaDto, AreasQueryParams, PaginatedResult } from '@/types/data';

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
            setError('Failed to load areas');
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
        fetchAreas,
        refetch: fetchAreas,
    };
}
