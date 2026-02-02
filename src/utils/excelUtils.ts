// This file is deprecated - use API calls directly via workLogsApi
// Excel operations are now handled by the backend API
import type { WorkLog } from '../types/data';

// Re-export simple helper that was used elsewhere
export function exportWorkLogsToExcel(workLogs: WorkLog[], filename: string = 'work_logs.xlsx') {
  // This is now handled by the API
  console.warn('exportWorkLogsToExcel is deprecated. Use workLogsApi.export() instead.');
}

export function validateImportedWorkLogs(file: File, existingWorkLogs: WorkLog[]): Promise<any> {
  // This is now handled by the API  
  console.warn('validateImportedWorkLogs is deprecated. Use workLogsApi.validateImport() instead.');
  return Promise.resolve({});
}

export function importWorkLogsFromExcel(file: File, duplicateHandling: string, validationResult: any): Promise<any> {
  // This is now handled by the API
  console.warn('importWorkLogsFromExcel is deprecated. Use workLogsApi.import() instead.');
  return Promise.resolve([]);
}

export function downloadExcelTemplate() {
  // This is now handled by the API
  console.warn('downloadExcelTemplate is deprecated. Use workLogsApi.downloadTemplate() instead.');
}
