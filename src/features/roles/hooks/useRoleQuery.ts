import { useCallback, useEffect, useState } from 'react';
import { rolesApi } from '@/services/api/roles';
import type { PaginatedResult, RoleDto, RolesQueryParams } from '@/types/data';

export function useRoleQuery() {
    const [queryParams, setQueryParams] = useState<RolesQueryParams>({
        page: 1,
        pageSize: 10,
        search: '',
        sortBy: 'name',
        isDescending: false,
    });
    const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<RoleDto> | null>(null);
    const [queryLoading, setQueryLoading] = useState(false);
    const [queryError, setQueryError] = useState<string | null>(null);

    const fetchRoles = useCallback(async () => {
        try {
            setQueryLoading(true);
            setQueryError(null);
            const result = await rolesApi.getAll(queryParams);
            setPaginatedResult(result);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
            setQueryError('Failed to load roles');
            setPaginatedResult(null);
        } finally {
            setQueryLoading(false);
        }
    }, [queryParams]);

    useEffect(() => {
        void fetchRoles();
    }, [fetchRoles]);

    return {
        queryParams,
        setQueryParams,
        paginatedResult,
        queryLoading,
        queryError,
        fetchRoles,
    };
}
