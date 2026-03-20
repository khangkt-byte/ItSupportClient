import { useCallback, useEffect, useState } from 'react';
import type { CausesQueryParams, ListCauseDto, PaginatedResult } from '@/types/data';
import { causesApi } from '@/services/api/causes';
import { getApiErrorMessage } from '@/utils/apiErrors';

export function useCauseQuery() {
  const [queryParams, setQueryParams] = useState<CausesQueryParams>({
    page: 1,
    pageSize: 10,
    search: '',
    sortBy: 'name',
    isDescending: false,
    issueId: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<ListCauseDto> | null>(null);

  const fetchCauses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await causesApi.getAll(queryParams);
      setPaginatedResult(result);
    } catch (err) {
      console.error('Failed to fetch causes:', err);
      setError(getApiErrorMessage(err, 'Unable to load causes. Please refresh and try again.'));
      setPaginatedResult(null);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    void fetchCauses();
  }, [fetchCauses]);

  return {
    queryParams,
    setQueryParams,
    paginatedResult,
    loading,
    error,
    setError,
    refetch: fetchCauses,
  };
}
