// Enhanced Excel utilities - stub version for API-based operations
// The actual Excel processing is now handled by the backend API
import type { WorkLog, Employee, Department, Area } from '../types/data';

export interface FieldError {
  field: string;
  message: string;
  originalValue: string;
  suggestedValue?: string;
  suggestedId?: string;
  matchScore?: number;
}

export interface FieldWarning {
  field: string;
  message: string;
}

export interface RowValidation {
  rowNumber: number;
  hasErrors: boolean;
  hasWarnings: boolean;
  errors: FieldError[];
  warnings: FieldWarning[];
  previewData: {
    operators: string;
    requesters: string;
    department: string;
    area: string;
    issueDescription: string;
    dateReported: string;
  };
  mappedDepartmentName?: string;
  mappedAreaName?: string;
  mappedDepartmentId?: string;
  mappedAreaId?: string;
}

export interface EnhancedValidationResult {
  totalRows: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
  rows: RowValidation[];
}

export interface ImportOptions {
  skipRowsWithErrors: boolean;
  autoCreateMissingEntities: boolean;
  fuzzyMatchThreshold: number;
  manualMappings: Record<string, string>; // originalValue -> id
}

export interface ImportResult {
  hasErrors: boolean;
  summary: string;
  successCount: number;
  skippedCount: number;
  autoMatched: number;
  entitiesCreated: number;
  errors: string[];
  importedLogs: Partial<WorkLog>[];
}

// Stub functions - these will be replaced with API calls
export async function validateWorkLogFile(
  file: File,
  existingWorkLogs: WorkLog[],
  employees: Employee[],
  departments: Department[],
  areas: Area[]
): Promise<EnhancedValidationResult> {
  console.warn('validateWorkLogFile: Using stub - implement with API call');
  
  // Return empty validation result
  return {
    totalRows: 0,
    validCount: 0,
    warningCount: 0,
    errorCount: 0,
    rows: []
  };
}

export async function importWorkLogsWithOptions(
  file: File,
  validationResult: EnhancedValidationResult,
  options: ImportOptions,
  existingWorkLogs: WorkLog[],
  employees: Employee[],
  departments: Department[],
  areas: Area[]
): Promise<ImportResult> {
  console.warn('importWorkLogsWithOptions: Using stub - implement with API call');
  
  // Return empty import result
  return {
    hasErrors: false,
    summary: 'Import functionality requires backend API',
    successCount: 0,
    skippedCount: 0,
    autoMatched: 0,
    entitiesCreated: 0,
    errors: ['Excel import is currently unavailable. Please use the backend API.'],
    importedLogs: []
  };
}
