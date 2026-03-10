import { useCallback, useEffect, useState } from 'react';
import { employeesApi } from '@/services/api/employees';
import type { EmployeesQueryParams, ListEmployeeDto, PaginatedResult } from '@/types/data';

export function useEmployeeQuery(queryParams: EmployeesQueryParams) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<ListEmployeeDto> | null>(null);

    const fetchEmployees = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await employeesApi.getAll(queryParams);
            setPaginatedResult(result);
        } catch (err) {
            console.error('Failed to fetch employees:', err);
            setError('Failed to load employees');
            setPaginatedResult(null);
        } finally {
            setLoading(false);
        }
    }, [queryParams]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    return {
        loading,
        error,
        setError,
        paginatedResult,
        fetchEmployees,
    };
}
