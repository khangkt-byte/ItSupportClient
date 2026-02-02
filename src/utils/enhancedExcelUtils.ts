import * as XLSX from 'xlsx';
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

// Fuzzy string matching using Levenshtein distance
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 100;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  const maxLength = Math.max(s1.length, s2.length);
  const distance = levenshteinDistance(s1, s2);
  
  return Math.round((1 - distance / maxLength) * 100);
}

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        );
      }
    }
  }
  
  return dp[m][n];
}

// Find best match using fuzzy matching
function findBestMatch(
  value: string,
  options: Array<{ id: string; name: string }>,
  threshold: number
): { id: string; name: string; score: number } | null {
  let bestMatch: { id: string; name: string; score: number } | null = null;
  
  for (const option of options) {
    const score = calculateSimilarity(value, option.name);
    if (score >= threshold && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { ...option, score };
    }
  }
  
  return bestMatch;
}

// Validate employee names
function validateEmployee(
  name: string,
  employees: Employee[],
  threshold: number,
  fieldName: string
): FieldError | null {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return {
      field: fieldName,
      message: 'Employee name is required',
      originalValue: name
    };
  }

  // Exact match
  const exactMatch = employees.find(
    emp => emp.fullName.toLowerCase() === trimmedName.toLowerCase()
  );
  
  if (exactMatch) {
    return null; // Valid
  }

  // Fuzzy match
  const employeeOptions = employees.map(emp => ({
    id: emp.id,
    name: emp.fullName
  }));
  
  const bestMatch = findBestMatch(trimmedName, employeeOptions, threshold);
  
  return {
    field: fieldName,
    message: `Employee "${trimmedName}" not found`,
    originalValue: name,
    suggestedValue: bestMatch?.name,
    suggestedId: bestMatch?.id,
    matchScore: bestMatch?.score
  };
}

// Parse date from Excel
function parseDateFromExcel(dateStr: any): string {
  if (!dateStr) return new Date().toISOString();

  try {
    if (typeof dateStr === 'number') {
      const date = XLSX.SSF.parse_date_code(dateStr);
      return new Date(date.y, date.m - 1, date.d, date.H || 0, date.M || 0).toISOString();
    }

    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }

    return new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function formatDateForDisplay(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// Validate work log file
export async function validateWorkLogFile(
  file: File,
  existingWorkLogs: WorkLog[],
  employees: Employee[],
  departments: Department[],
  areas: Area[],
  fuzzyThreshold: number = 85
): Promise<EnhancedValidationResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        const itEmployees = employees.filter(emp => emp.department === 'IT' && !emp.deleteDate);
        const activeEmployees = employees.filter(emp => !emp.deleteDate);

        const rows: RowValidation[] = jsonData.map((row, index) => {
          const errors: FieldError[] = [];
          const warnings: FieldWarning[] = [];

          // Parse data
          const operatorsRaw = row['Operators'] || '';
          const requestersRaw = row['Requesters'] || row['Requester'] || '';
          const departmentRaw = row['Department'] || '';
          const areaRaw = row['Area'] || '';
          const issue = row['Issue Description'] || '';
          const reportDate = parseDateFromExcel(row['Report Date']);

          // Validate operators
          const operators = operatorsRaw.split(',').map((s: string) => s.trim()).filter(Boolean);
          if (operators.length === 0) {
            errors.push({
              field: 'Operators',
              message: 'At least one operator is required',
              originalValue: operatorsRaw
            });
          } else {
            operators.forEach((op: string) => {
              const error = validateEmployee(op, itEmployees, fuzzyThreshold, 'Operators');
              if (error) {
                errors.push(error);
              }
            });
          }

          // Validate requesters (optional but validate if provided)
          const requesters = requestersRaw.split(',').map((s: string) => s.trim()).filter(Boolean);
          requesters.forEach((req: string) => {
            const error = validateEmployee(req, activeEmployees, fuzzyThreshold, 'Requesters');
            if (error) {
              warnings.push({
                field: 'Requesters',
                message: error.message
              });
            }
          });

          // Validate department
          let mappedDepartment: Department | undefined;
          if (!departmentRaw) {
            errors.push({
              field: 'Department',
              message: 'Department is required',
              originalValue: departmentRaw
            });
          } else {
            mappedDepartment = departments.find(
              d => d.name.toLowerCase() === departmentRaw.trim().toLowerCase()
            );

            if (!mappedDepartment) {
              const deptOptions = departments.map(d => ({ id: d.id, name: d.name }));
              const bestMatch = findBestMatch(departmentRaw, deptOptions, fuzzyThreshold);
              
              errors.push({
                field: 'Department',
                message: `Department "${departmentRaw}" not found`,
                originalValue: departmentRaw,
                suggestedValue: bestMatch?.name,
                suggestedId: bestMatch?.id,
                matchScore: bestMatch?.score
              });
            }
          }

          // Validate area
          let mappedArea: Area | undefined;
          if (!areaRaw) {
            errors.push({
              field: 'Area',
              message: 'Area is required',
              originalValue: areaRaw
            });
          } else {
            mappedArea = areas.find(
              a => a.name.toLowerCase() === areaRaw.trim().toLowerCase()
            );

            if (!mappedArea) {
              const areaOptions = areas.map(a => ({ id: a.id, name: a.name }));
              const bestMatch = findBestMatch(areaRaw, areaOptions, fuzzyThreshold);
              
              errors.push({
                field: 'Area',
                message: `Area "${areaRaw}" not found`,
                originalValue: areaRaw,
                suggestedValue: bestMatch?.name,
                suggestedId: bestMatch?.id,
                matchScore: bestMatch?.score
              });
            }
          }

          // Validate issue
          if (!issue.trim()) {
            errors.push({
              field: 'Issue Description',
              message: 'Issue description is required',
              originalValue: issue
            });
          }

          return {
            rowNumber: index + 2,
            hasErrors: errors.length > 0,
            hasWarnings: warnings.length > 0,
            errors,
            warnings,
            previewData: {
              operators: operatorsRaw,
              requesters: requestersRaw,
              department: departmentRaw,
              area: areaRaw,
              issueDescription: issue,
              dateReported: formatDateForDisplay(reportDate)
            },
            mappedDepartmentName: mappedDepartment?.name,
            mappedAreaName: mappedArea?.name,
            mappedDepartmentId: mappedDepartment?.id,
            mappedAreaId: mappedArea?.id
          };
        });

        const validationResult: EnhancedValidationResult = {
          totalRows: rows.length,
          validCount: rows.filter(r => !r.hasErrors).length,
          warningCount: rows.filter(r => r.hasWarnings).length,
          errorCount: rows.filter(r => r.hasErrors).length,
          rows
        };

        resolve(validationResult);
      } catch (error) {
        reject(new Error('Failed to parse Excel file: ' + (error as Error).message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
}

// Import work logs with options
export async function importWorkLogsWithOptions(
  file: File,
  validationResult: EnhancedValidationResult,
  options: ImportOptions,
  employees: Employee[],
  departments: Department[],
  areas: Area[]
): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        const importedLogs: Partial<WorkLog>[] = [];
        const errors: string[] = [];
        let skippedCount = 0;
        let autoMatched = 0;
        let entitiesCreated = 0;

        // Track created entities to avoid duplicates
        const createdDepartments = new Map<string, string>();
        const createdAreas = new Map<string, string>();

        jsonData.forEach((row, index) => {
          const rowValidation = validationResult.rows[index];

          // Skip rows with errors if option is set
          if (rowValidation.hasErrors && options.skipRowsWithErrors) {
            skippedCount++;
            return;
          }

          // If errors and not skipping, fail
          if (rowValidation.hasErrors && !options.skipRowsWithErrors) {
            errors.push(`Row ${rowValidation.rowNumber}: ${rowValidation.errors.map(e => e.message).join(', ')}`);
            return;
          }

          try {
            // Parse operators
            const operatorsRaw = row['Operators'] || '';
            const operators = operatorsRaw.split(',').map((s: string) => s.trim()).filter(Boolean);

            // Parse requesters
            const requestersRaw = row['Requesters'] || row['Requester'] || '';
            const requesters = requestersRaw.split(',').map((s: string) => s.trim()).filter(Boolean);

            // Get department
            const departmentRaw = (row['Department'] || '').trim();
            let departmentName = departmentRaw;
            
            // Check manual mapping first
            const deptMappingKey = `Department:${departmentRaw}`;
            if (options.manualMappings[deptMappingKey]) {
              const mappedDept = departments.find(d => d.id === options.manualMappings[deptMappingKey]);
              if (mappedDept) {
                departmentName = mappedDept.name;
                autoMatched++;
              }
            } else if (rowValidation.mappedDepartmentName) {
              departmentName = rowValidation.mappedDepartmentName;
            } else if (options.autoCreateMissingEntities && departmentRaw) {
              // Create new department
              if (!createdDepartments.has(departmentRaw)) {
                const newId = `dept-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                createdDepartments.set(departmentRaw, newId);
                entitiesCreated++;
              }
              departmentName = departmentRaw;
            }

            // Get area
            const areaRaw = (row['Area'] || '').trim();
            let areaName = areaRaw;
            
            const areaMappingKey = `Area:${areaRaw}`;
            if (options.manualMappings[areaMappingKey]) {
              const mappedArea = areas.find(a => a.id === options.manualMappings[areaMappingKey]);
              if (mappedArea) {
                areaName = mappedArea.name;
                autoMatched++;
              }
            } else if (rowValidation.mappedAreaName) {
              areaName = rowValidation.mappedAreaName;
            } else if (options.autoCreateMissingEntities && areaRaw) {
              if (!createdAreas.has(areaRaw)) {
                const newId = `area-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                createdAreas.set(areaRaw, newId);
                entitiesCreated++;
              }
              areaName = areaRaw;
            }

            const workLog: Partial<WorkLog> = {
              id: `import-${Date.now()}-${index}`,
              reportDate: parseDateFromExcel(row['Report Date']),
              operators,
              requesters,
              department: departmentName,
              area: areaName,
              issue: row['Issue Description'] || '',
              cause: row['Cause'] || '',
              fixDescription: row['Fix Description'] || '',
              note: row['Notes'] || '',
              status: parseStatus(row['Status'])
            };

            importedLogs.push(workLog);
          } catch (error) {
            errors.push(`Row ${rowValidation.rowNumber}: ${(error as Error).message}`);
            skippedCount++;
          }
        });

        const result: ImportResult = {
          hasErrors: errors.length > 0 || skippedCount > 0,
          summary: `Successfully imported ${importedLogs.length} work log(s)${
            skippedCount > 0 ? `, skipped ${skippedCount} row(s)` : ''
          }`,
          successCount: importedLogs.length,
          skippedCount,
          autoMatched,
          entitiesCreated,
          errors,
          importedLogs
        };

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
}

function parseStatus(status: string): 'pending' | 'in-progress' | 'completed' | 'cancelled' {
  const normalized = status?.toLowerCase().trim() || 'pending';
  
  if (normalized.includes('cancel')) {
    return 'cancelled';
  }
  if (normalized.includes('progress') || normalized.includes('in-progress')) {
    return 'in-progress';
  }
  if (normalized.includes('complete') || normalized.includes('done') || normalized.includes('resolved')) {
    return 'completed';
  }
  return 'pending';
}
