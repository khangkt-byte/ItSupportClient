import type { WorkLog } from '../types/data';
import { initialWorkLogs } from '../stores/dataStore';

// Simulate database
let workLogsDB = [...initialWorkLogs];

// Mock API - Replace with real API calls
export const workLogsApi = {
  async getAll(): Promise<WorkLog[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...workLogsDB];
  },

  async getById(id: string): Promise<WorkLog | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return workLogsDB.find((log) => log.id === id) || null;
  },

  async create(data: Omit<WorkLog, 'id'>): Promise<WorkLog> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const newLog: WorkLog = {
      ...data,
      id: Date.now().toString(),
    };
    workLogsDB = [newLog, ...workLogsDB];
    return newLog;
  },

  async update(id: string, data: Partial<WorkLog>): Promise<WorkLog> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const index = workLogsDB.findIndex((log) => log.id === id);
    if (index === -1) throw new Error('Work log not found');
    
    workLogsDB[index] = { ...workLogsDB[index], ...data };
    return workLogsDB[index];
  },

  async delete(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    workLogsDB = workLogsDB.filter((log) => log.id !== id);
  },

  async search(query: string): Promise<WorkLog[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const lowerQuery = query.toLowerCase();
    return workLogsDB.filter(
      (log) =>
        log.issue.toLowerCase().includes(lowerQuery) ||
        log.operators.some(op => op.toLowerCase().includes(lowerQuery)) ||
        log.requester.toLowerCase().includes(lowerQuery)
    );
  },
};