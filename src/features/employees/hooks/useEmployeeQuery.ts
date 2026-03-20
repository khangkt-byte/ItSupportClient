import { useCallback, useEffect, useState } from 'react';
import { employeesApi } from '@/services/api/employees';
import type { EmployeesQueryParams, ListEmployeeDto, PaginatedResult } from '@/types/data';
import { getApiErrorMessage } from '@/utils/apiErrors';

export function useEmployeeQuery() {
    const [queryParams, setQueryParams] = useState<EmployeesQueryParams>({
        page: 1,
        pageSize: 10,
        search: '',
        sortBy: 'fullName',
        isDescending: false,
        dptId: null,
        areaId: null,
    });
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
            setError(getApiErrorMessage(err, 'Unable to load employees. Please refresh and try again.'));
            setPaginatedResult(null);
        } finally {
            setLoading(false);
        }
    }, [queryParams]);

    useEffect(() => {
        void fetchEmployees();
    }, [fetchEmployees]);

    return {
        queryParams,
        setQueryParams,
        paginatedResult,
        loading,
        error,
        setError,
        refetch: fetchEmployees,
    };
}
