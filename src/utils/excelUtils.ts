import * as XLSX from 'xlsx';
import type { WorkLog } from '../types/data';

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

export function importWorkLogsFromExcel(file: File): Promise<Partial<WorkLog>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON - use any to handle both old and new formats
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        // Transform to WorkLog format
        const workLogs: Partial<WorkLog>[] = jsonData.map((row, index) => {
          try {
            // Handle both old 'Requester' and new 'Requesters' format for backward compatibility
            let requesters: string[] = [];
            if (row['Requesters']) {
              // New format: comma-separated requesters
              requesters = row['Requesters'].split(',').map((name: string) => name.trim());
            } else if (row['Requester']) {
              // Old format: single requester - convert to array
              requesters = row['Requester'] ? [row['Requester'].trim()] : [];
            }

            return {
              id: `import-${Date.now()}-${index}`,
              reportDate: parseDateFromExcel(row['Report Date']),
              operators: row['Operators'] ? row['Operators'].split(',').map((name: string) => name.trim()) : [],
              requesters: requesters,
              department: row['Department'] || '',
              area: row['Area'] || '',
              issue: row['Issue Description'] || '',
              cause: row['Cause'] || '',
              fixDescription: row['Fix Description'] || '',
              note: row['Notes'] || '',
              status: parseStatus(row['Status']),
            };
          } catch (error) {
            console.error(`Error parsing row ${index + 1}:`, error);
            return null;
          }
        }).filter(Boolean) as Partial<WorkLog>[];

        resolve(workLogs);
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

// Helper functions
function formatDateForExcel(date: string): string {
  const d = new Date(date);
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

function parseStatus(status: string): 'pending' | 'in-progress' | 'completed' {
  const normalized = status?.toLowerCase().trim() || 'pending';
  
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