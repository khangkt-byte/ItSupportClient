import * as XLSX from 'xlsx';
import type { WorkLog, ImportValidationResult, ImportRowValidation, ValidationWarning, DuplicateHandling } from '../types/data';

export interface ExcelWorkLog {
  'Report Date': string;
  'Operators': string; // Comma-separated operators
  'Requesters': string; // Comma-separated requesters
  'Department': string;
  'Area': string;
  'Issue Description': string;
  'Cause': string;
  'Fix Description': string;
  'Notes': string;
  'Status': string;
}

export function exportWorkLogsToExcel(workLogs: WorkLog[], filename: string = 'work_logs.xlsx') {
  // Transform data to Excel format
  const excelData: ExcelWorkLog[] = workLogs.map(log => ({
    'Report Date': formatDateForExcel(log.reportDate),
    'Operators': (log.operators || []).join(', '), // Join multiple operators with comma
    'Requesters': (log.requesters || []).join(', '), // Join multiple requesters with comma
    'Department': log.department,
    'Area': log.area,
    'Issue Description': log.issue,
    'Cause': log.cause,
    'Fix Description': log.fixDescription,
    'Notes': log.note,
    'Status': capitalizeStatus(log.status),
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const columnWidths = [
    { wch: 18 }, // Report Date
    { wch: 25 }, // Operators (wider for multiple names)
    { wch: 25 }, // Requesters (wider for multiple names)
    { wch: 15 }, // Department
    { wch: 15 }, // Area
    { wch: 40 }, // Issue Description
    { wch: 40 }, // Cause
    { wch: 40 }, // Fix Description
    { wch: 30 }, // Notes
    { wch: 12 }, // Status
  ];
  worksheet['!cols'] = columnWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Work Logs');

  // Download file
  XLSX.writeFile(workbook, filename);
}

export function validateImportedWorkLogs(
  file: File, 
  existingWorkLogs: WorkLog[]
): Promise<ImportValidationResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        // Validate each row
        const rows: ImportRowValidation[] = jsonData.map((row, index) => {
          const warnings: ValidationWarning[] = [];
          
          // Parse the row data
          let requesters: string[] = [];
          if (row['Requesters']) {
            requesters = row['Requesters'].split(',').map((name: string) => name.trim()).filter(Boolean);
          } else if (row['Requester']) {
            requesters = row['Requester'] ? [row['Requester'].trim()] : [];
          }

          const operators = row['Operators'] ? row['Operators'].split(',').map((name: string) => name.trim()).filter(Boolean) : [];
          const issue = row['Issue Description'] || '';
          const reportDate = parseDateFromExcel(row['Report Date']);

          // Check for required fields
          if (!reportDate) {
            warnings.push({
              field: 'Report Date',
              message: 'Report Date is required',
              severity: 'error'
            });
          }
          if (operators.length === 0) {
            warnings.push({
              field: 'Operators',
              message: 'At least one operator is required',
              severity: 'warning'
            });
          }
          if (!issue) {
            warnings.push({
              field: 'Issue Description',
              message: 'Issue Description is required',
              severity: 'error'
            });
          }

          // Check for duplicates
          const duplicate = findDuplicate(
            {
              issue,
              reportDate,
              operators,
              department: row['Department'] || '',
              area: row['Area'] || ''
            },
            existingWorkLogs
          );

          if (duplicate) {
            warnings.push({
              field: 'duplicate',
              message: `Similar to existing log: ${duplicate.issue.substring(0, 50)}...`,
              severity: 'warning'
            });
          }

          return {
            rowNumber: index + 2, // +2 because Excel is 1-indexed and has header row
            isValid: !warnings.some(w => w.severity === 'error'),
            duplicateOf: duplicate?.id || null,
            warnings,
            previewData: {
              issueDescription: issue,
              dateReported: formatDateForExcel(reportDate),
              operators: operators.join(', '),
              requesters: requesters.join(', ')
            }
          };
        });

        const validationResult: ImportValidationResult = {
          totalRows: rows.length,
          validRows: rows.filter(r => r.isValid).length,
          duplicateCount: rows.filter(r => r.duplicateOf !== null).length,
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

export function importWorkLogsFromExcel(
  file: File,
  duplicateHandling: DuplicateHandling,
  validationResult: ImportValidationResult
): Promise<Partial<WorkLog>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        // Transform to WorkLog format based on duplicate handling
        const workLogs: Partial<WorkLog>[] = [];

        jsonData.forEach((row, index) => {
          const rowValidation = validationResult.rows[index];

          // Skip invalid rows
          if (!rowValidation.isValid) {
            return;
          }

          // Handle duplicates based on strategy
          if (rowValidation.duplicateOf) {
            if (duplicateHandling === 'Skip') {
              return; // Skip this row
            } else if (duplicateHandling === 'Fail') {
              throw new Error(`Duplicate found at row ${rowValidation.rowNumber}. Import cancelled.`);
            }
            // For 'Update' and 'CreateNew', we continue processing
          }

          // Parse row data
          let requesters: string[] = [];
          if (row['Requesters']) {
            requesters = row['Requesters'].split(',').map((name: string) => name.trim()).filter(Boolean);
          } else if (row['Requester']) {
            requesters = row['Requester'] ? [row['Requester'].trim()] : [];
          }

          const workLog: Partial<WorkLog> = {
            id: rowValidation.duplicateOf && duplicateHandling === 'Update' 
              ? rowValidation.duplicateOf 
              : `import-${Date.now()}-${index}`,
            reportDate: parseDateFromExcel(row['Report Date']),
            operators: row['Operators'] ? row['Operators'].split(',').map((name: string) => name.trim()).filter(Boolean) : [],
            requesters,
            department: row['Department'] || '',
            area: row['Area'] || '',
            issue: row['Issue Description'] || '',
            cause: row['Cause'] || '',
            fixDescription: row['Fix Description'] || '',
            note: row['Notes'] || '',
            status: parseStatus(row['Status']),
          };

          workLogs.push(workLog);
        });

        resolve(workLogs);
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

// Helper function to find duplicate work logs
function findDuplicate(
  newLog: { issue: string; reportDate: string; operators: string[]; department: string; area: string },
  existingLogs: WorkLog[]
): WorkLog | null {
  // Consider it a duplicate if:
  // 1. Same issue description (case-insensitive, 80% similarity)
  // 2. Same date (within 24 hours)
  // 3. At least one operator in common
  
  for (const existing of existingLogs) {
    const issuesSimilar = calculateSimilarity(newLog.issue, existing.issue) > 0.8;
    const existingDate = new Date(existing.reportDate);
    const newDate = new Date(newLog.reportDate);
    const timeDiff = Math.abs(existingDate.getTime() - newDate.getTime());
    const withinDay = timeDiff < 24 * 60 * 60 * 1000;
    const hasCommonOperator = newLog.operators.some(op => existing.operators.includes(op));
    
    if (issuesSimilar && withinDay && hasCommonOperator) {
      return existing;
    }
  }
  
  return null;
}

// Calculate string similarity (Levenshtein distance based)
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  const maxLength = Math.max(s1.length, s2.length);
  const distance = levenshteinDistance(s1, s2);
  
  return 1 - distance / maxLength;
}

// Levenshtein distance algorithm
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
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }
  
  return dp[m][n];
}

// Helper functions
function formatDateForExcel(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function parseDateFromExcel(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();

  try {
    // Handle Excel date serial numbers
    if (typeof dateStr === 'number') {
      const date = XLSX.SSF.parse_date_code(dateStr);
      return new Date(date.y, date.m - 1, date.d, date.H || 0, date.M || 0).toISOString();
    }

    // Handle string dates
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }

    // Fallback to current date
    return new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function capitalizeStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
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

export function downloadExcelTemplate() {
  const templateData: ExcelWorkLog[] = [
    {
      'Report Date': '2024-01-15 09:30',
      'Operators': 'John Doe, Jane Smith',
      'Requesters': 'Bob Wilson, Alice Johnson',
      'Department': 'IT',
      'Area': 'Building A',
      'Issue Description': 'Computer not turning on',
      'Cause': 'Power supply failure',
      'Fix Description': 'Replaced power supply unit',
      'Notes': 'Also cleaned dust from inside case',
      'Status': 'Completed',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  
  const columnWidths = [
    { wch: 18 }, { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
    { wch: 40 }, { wch: 40 }, { wch: 40 }, { wch: 30 }, { wch: 12 },
  ];
  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Work Logs');

  XLSX.writeFile(workbook, 'work_log_template.xlsx');
}
