import { useCallback, useEffect, useState } from 'react';
import { rolesApi } from '@/services/api/roles';
import type { PaginatedResult, RoleDto, RolesQueryParams } from '@/types/data';
import { getApiErrorMessage } from '@/utils/apiErrors';

export function useRoleQuery() {
    const [queryParams, setQueryParams] = useState<RolesQueryParams>({
        page: 1,
        pageSize: 10,
        search: '',
        sortBy: 'name',
        isDescending: false,
    });
    const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<RoleDto> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRoles = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await rolesApi.getAll(queryParams);
            setPaginatedResult(result);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
            setError(getApiErrorMessage(error, 'Unable to load roles. Please refresh and try again.'));
            setPaginatedResult(null);
        } finally {
            setLoading(false);
        }
    }, [queryParams]);

    useEffect(() => {
        void fetchRoles();
    }, [fetchRoles]);

    return {
        queryParams,
        setQueryParams,
        paginatedResult,
        loading,
        error,
        setError,
        refetch: fetchRoles,
    };
}
