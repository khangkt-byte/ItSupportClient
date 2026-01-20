import { useState, useEffect } from 'react';
import { workLogsApi } from '../api';
import type { WorkLog } from '../types/data';

export function useWorkLogs() {
  const [data, setData] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const logs = await workLogsApi.getAll();
      setData(logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch work logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkLogs();
  }, []);

  const createWorkLog = async (logData: Omit<WorkLog, 'id'>) => {
    try {
      const newLog = await workLogsApi.create(logData);
      setData((prev) => [newLog, ...prev]);
      return { success: true, data: newLog };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create' };
    }
  };

  const updateWorkLog = async (id: string, logData: Partial<WorkLog>) => {
    try {
      const updated = await workLogsApi.update(id, logData);
      setData((prev) => prev.map((log) => (log.id === id ? updated : log)));
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update' };
    }
  };

  const deleteWorkLog = async (id: string) => {
    try {
      await workLogsApi.delete(id);
      setData((prev) => prev.filter((log) => log.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete' };
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchWorkLogs,
    createWorkLog,
    updateWorkLog,
    deleteWorkLog,
  };
}
