import { useCallback, useEffect, useState } from 'react';
import type { DepartmentDto, DepartmentsQueryParams, PaginatedResult } from '@/types/data';
import { departmentsApi } from '@/services/api/departments';
import { getApiErrorMessage } from '@/utils/apiErrors';

export function useDepartmentQuery() {
    const [queryParams, setQueryParams] = useState<DepartmentsQueryParams>({
        page: 1,
        pageSize: 10,
        search: '',
        sortBy: 'name',
        isDescending: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<DepartmentDto> | null>(null);

    const fetchDepartments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await departmentsApi.getAll(queryParams);
            setPaginatedResult(result);
        } catch (err) {
            console.error('Failed to fetch departments:', err);
            setError(getApiErrorMessage(err, 'Failed to load departments'));
            setPaginatedResult(null);
        } finally {
            setLoading(false);
        }
    }, [queryParams]);

    useEffect(() => {
        void fetchDepartments();
    }, [fetchDepartments]);

    return {
        queryParams,
        setQueryParams,
        paginatedResult,
        loading,
        error,
        setError,
        refetch: fetchDepartments,
    };
}
