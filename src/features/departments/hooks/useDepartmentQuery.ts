import { useCallback, useEffect, useState } from 'react';
import type { DepartmentDto, DepartmentsQueryParams, PaginatedResult } from '@/types/data';
import { departmentApi } from '@/services/api/departments';

export function useDepartmentQuery(queryParams: DepartmentsQueryParams) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<DepartmentDto> | null>(null);

    const fetchDepartments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await departmentApi.getAll(queryParams);
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
        loading,
        error,
        setError,
        paginatedResult,
        fetchDepartments,
    };
}
