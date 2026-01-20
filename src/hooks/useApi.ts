import { useState, useEffect, useCallback } from 'react';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

export function useApiMutation<TInput, TOutput>(
  apiCall: (input: TInput) => Promise<TOutput>
) {
  const [state, setState] = useState<ApiState<TOutput>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = async (input: TInput) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await apiCall(input);
      setState({ data, loading: false, error: null });
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  return { ...state, mutate };
}
