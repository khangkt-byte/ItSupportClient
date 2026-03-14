import { useCallback, useEffect, useState } from 'react';
import type { DepartmentDto, DepartmentsQueryParams, PaginatedResult } from '@/types/data';
import { departmentsApi } from '@/services/api/departments';

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
            setError('Failed to load departments');
            setPaginatedResult(null);
        } finally {
            setLoading(false);
        }
    }, [queryParams]);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    return {
        queryParams,
        setQueryParams,
        loading,
        error,
        setError,
        paginatedResult,
        refetch: fetchDepartments,
        fetchDepartments,
    };
}
