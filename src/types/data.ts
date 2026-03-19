// API Response Types based on OpenAPI Schema

// Pagination
export interface PaginatedResult<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  items: T[];
}

// Query Parameters (Base)
/**
 * Generic query parameters for paginated list endpoints
 * All paginated endpoints extend this interface
 */
export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  isDescending?: boolean;
  search?: string;
}

/**
 * Module-specific query parameters
 * Extends QueryParams with resource-specific filters
 * Reference: Microsoft REST API Guidelines, Azure API Design Best Practices
 */

// Accounts
export interface AccountsQueryParams extends QueryParams {
  isLocked?: boolean | null; // null = all, true = locked only, false = active only
}

// Employees
export interface EmployeesQueryParams extends QueryParams {
  dptId?: number | null; // Filter by department
  areaId?: number | null; // Filter by area
}

// Roles
export interface RolesQueryParams extends QueryParams {
  // Future: Add role-specific filters
}

// Issues
export interface IssuesQueryParams extends QueryParams {
  // Future: Add issue-specific filters
}

// Causes
export interface CausesQueryParams extends QueryParams {
  issueId?: number | null; // Filter by issue
}

// Work Logs (Issue Logs)
export interface WorkLogsQueryParams extends QueryParams {
  status?: string | null; // Filter by status (pending, in-progress, resolved, cancelled)
  dptId?: number | null; // Filter by department
  areaId?: number | null; // Filter by area
  issueId?: number | null; // Filter by issue type
}

// Areas
export interface AreasQueryParams extends QueryParams {
  // Future: Add area-specific filters
}

// Departments
export interface DepartmentsQueryParams extends QueryParams {
  // Future: Add department-specific filters
}

// Role Management
export interface ClaimDto {
  claimId: number;
  claim: string;
  category: string | null;
}

export interface RoleDto {
  roleId: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
  claims: ClaimDto[] | null;
}

export interface CreateRoleDto {
  name: string;
  description?: string | null;
  claimIds?: number[] | null;
}

export interface UpdateRoleDto {
  name?: string | null;
  description?: string | null;
  claimIds?: number[] | null;
}

// Account Roles Management
export interface AccountRolesDto {
  accountId: string; // UUID
  username: string;
  roles: RoleDto[];
}

export interface AssignRolesDto {
  accountId: string; // UUID
  roleIds: number[];
}

export interface AssignRolesAndClaimsDto {
  accountId: string; // UUID
  roleIds: number[];
  claimIds: number[];
}

// Employee Management
export interface EmployeeDto {
  empId: string; // UUID
  empCode: string | null;
  fullName: string;
  phoneNumber: string | null;
  email: string | null;
  dptId: number;
  areaId: number;
  position: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ListEmployeeDto {
  empId: string;
  empCode: string | null;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  position: string | null;
  dptId: number;
  areaId: number;
  createdAt: string;
}

export interface DetailEmployeeDto extends EmployeeDto {
  roles: RoleDto[] | null;
}

export interface CreateEmployeeDto {
  empCode?: string | null;
  fullName: string;
  phoneNumber?: string | null;
  email?: string | null;
  dptId?: number;
  areaId?: number;
  position?: string | null;
}

export interface UpdateEmployeeDto {
  empCode?: string | null;
  fullName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  dptId?: number | null;
  areaId?: number | null;
  position?: string | null;
}

export interface ProfileDto {
  empId: string;
  empCode: string | null;
  fullName: string;
  phoneNumber: string | null;
  email: string | null;
  dptId: number;
  areaId: number;
  position: string | null;
  username: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface UpdateProfileDto {
  fullName: string;
  phoneNumber?: string | null;
  email?: string | null;
}

// Area Management
export interface AreaDto {
  areaId: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateAreaDto {
  name: string;
  description?: string | null;
}

export interface UpdateAreaDto {
  name?: string | null;
  description?: string | null;
}

// Department Management
export interface DepartmentDto {
  dptId: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
  employeeCount: number;
  issueLogCount: number;
}

export interface DepartmentSuggestionDto {
  dptId: number;
  name: string;
  employeeCount: number;
}

export interface CreateDepartmentDto {
  name: string;
  description?: string | null;
}

export interface UpdateDepartmentDto {
  name?: string | null;
  description?: string | null;
}

// Bulk Operations
export interface BulkDeleteResultDto {
  success: boolean;
  deletedCount: number;
  totalRequested: number;
  message: string;
}

// Account Management
export interface AccountDto {
  accountId: string; // UUID
  username: string;
  empName: string; // Fixed: was employeeName
  empCode: string | null; // Fixed: was employeeCode
  email: string | null;
  position: string | null;
  isLocked: boolean;
  failedLoginAttempts: number;
  lastLoginAt: string | null;
  lockedUntil: string | null;
  createdAt: string;
  updatedAt: string | null;
  roles: RoleDto[] | null;
}

export interface ListAccountDto {
  accountId: string;
  username: string;
  empName: string; // Fixed: was employeeName
  empCode: string | null; // Fixed: was employeeCode
  isLocked: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface CreateAccountDto {
  empId: string; // UUID - Fixed: was employeeId
  username: string;
  password: string;
  roleIds?: number[] | null;
}

export interface UpdateAccountDto {
  username?: string | null;
  isLocked?: boolean | null;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResultDto {
  temporaryPassword: string;
  message: string;
}

export interface LoginHistoryDto {
  loginAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  success: boolean;
  failureReason: string | null;
}

// Authentication
export interface LoginDto {
  identifier: string;
  password: string;
}

export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
}

export interface OtpDto {
  otp: string;
  accountId: string; // UUID
}

export interface OtpResponseDto {
  token: TokenResponseDto;
}

export interface OtpSentResponseDto {
  accountId: string;
  message: string;
}

// Issue Management (Knowledge Base)
export interface IssueDto {
  issId: number;
  name: string;
  description: string | null;
  category: string | null;
  severity: number | null;
  usageCount: number;
  createdAt: string;
  updatedAt: string | null;
  causes: CauseDto[] | null;
}

export interface IssueSuggestionDto {
  issId: number;
  name: string;
  description: string | null;
  usageCount: number;
  lastUsed: string | null;
}

export interface CreateIssueDto {
  name: string;
  description?: string | null;
  category?: string | null;
  severity?: number | null;
}

export interface UpdateIssueDto {
  name?: string | null;
  description?: string | null;
  category?: string | null;
  severity?: number | null;
}

// Cause Management (Knowledge Base)
export interface CauseDto {
  causeId: number;
  issId: number;
  issueName: string | null;
  name: string;
  description: string | null;
  usageCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface ListCauseDto {
  causeId: number;
  issId: number;
  issueName: string | null;
  name: string;
  usageCount: number;
  createdAt: string;
}

export interface CauseSuggestionDto {
  causeId: number;
  issId: number;
  name: string;
  description: string | null;
  usageCount: number;
}

export interface CreateCauseDto {
  issId?: number;
  name: string;
  description?: string | null;
}

export interface UpdateCauseDto {
  name?: string | null;
  description?: string | null;
}

// Issue Log Management (Work Logs)
export interface IssueLogDto {
  issLogId: string; // UUID
  operator: string;
  requester: string | null;
  dptId: number;
  departmentName: string;
  areaId: number;
  areaName: string;
  issueId: number | null;
  issueName: string | null;
  issueDescription: string;
  causeId: number | null;
  causeName: string | null;
  cause: string | null;
  resolution: string | null;
  permanentFix: string | null;
  notes: string | null;
  dateReported: string; // ISO DateTime
  status: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateIssueLogDto {
  operator: string;
  requester?: string | null;
  dptId?: number;
  areaId?: number;
  issueId?: number | null;
  issueDescription: string;
  causeId?: number | null;
  cause?: string | null;
  resolution?: string | null;
  permanentFix?: string | null;
  notes?: string | null;
  dateReported: string; // DateOnly format: YYYY-MM-DD
  status?: string | null;
}

export interface UpdateIssueLogDto {
  operator?: string | null;
  requester?: string | null;
  dptId?: number | null;
  areaId?: number | null;
  issueId?: number | null;
  issueDescription?: string | null;
  causeId?: number | null;
  cause?: string | null;
  resolution?: string | null;
  permanentFix?: string | null;
  notes?: string | null;
  dateReported?: string | null;
  status?: string | null;
}

// Import/Export
export type ErrorSeverity = 0 | 1; // 0 = Warning, 1 = Error

// User Session (for client-side auth)
export interface User {
  id: string;
  username: string;
  employeeId: string;
  fullName: string;
  role: 'admin' | 'employee';
  email: string;
}

export interface ImportError {
  field: string;
  message: string;
  severity: ErrorSeverity;
  originalValue: string | null;
  suggestedValue: string | null;
  suggestedId: number | null;
  suggestions: any;
}

export interface ImportPreviewDataDto {
  operator: string;
  requester: string | null;
  department: string;
  mappedDepartment: string | null;
  area: string;
  issueDescription: string;
  dateReported: string | null;
  isDuplicate: boolean;
}

export interface ImportRowValidation {
  rowNumber: number;
  errors: ImportError[];
  warnings: ImportError[];
  mappedDepartmentId: number | null;
  mappedDepartmentName: string | null;
  mappedAreaId: number | null;
  mappedAreaName: string | null;
  duplicateOf: string | null; // UUID
  previewData: ImportPreviewDataDto | null;
  hasErrors: boolean;
  hasWarnings: boolean;
}

export interface ImportValidationResultDto {
  totalRows: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
  duplicateCount: number;
  isValid: boolean;
  rows: ImportRowValidation[];
  summary: string | null;
}

export interface ImportResultDto {
  successCount: number;
  updatedCount: number;
  skippedCount: number;
  autoMatched: number;
  departmentsCreated: number;
  errors: string[];
  warnings: string[];
  hasErrors: boolean;
  summary: string | null;
}

// Legacy types for backward compatibility
export type WorkStatus = 'pending' | 'in-progress' | 'resolved' | 'cancelled';

export interface WorkLog extends IssueLogDto {
  // Mapping for backward compatibility
  id: string;
  reportDate: string; // Changed from Date to string (ISO DateTime) to match API
  operators: string[];
  requesters: string[];
  department: string;
  area: string;
  issue: string;
  fixDescription: string;
  note: string;
  status: WorkStatus;
}

// Type aliases for backward compatibility
export type Employee = ListEmployeeDto & {
  id: string;
  employeeId: string;
  birthday?: string;
  department?: string;
  area?: string;
  deleteDate?: string | null;
};

export type Role = RoleDto & { id: string };
export type Account = ListAccountDto & {
  id: string;
  role: string;
  password: string;
  employeeId: string;
  employeeName: string; // Add for backward compatibility
  employeeCode: string | null; // Add for backward compatibility
  roles?: RoleDto[] | null;
  deleteDate?: string | null
};
export type Issue = IssueDto & { id: string };
export type Area = AreaDto & { id: string };
export type Device = { id: string; name: string; brand: string; model: string; serialNumber: string; deviceType: string; description: string };
export type DeviceType = { id: string; name: string; description: string };

// Department - Note: API doesn't have Department endpoint, using inline data
export interface Department {
  id: number;
  dptId: number; // Add for API compatibility
  name: string;
  description: string;
}

// CSRF Token Management
export interface CsrfTokenResponse {
  csrfToken: string;
}

// Rate Limit Response
export interface RateLimitResponse {
  error: string;
  message: string;
  retryAfter?: number;
}

// Authentication related
export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Import types for backward compatibility
export type ImportValidationResult = ImportValidationResultDto;
export type IssueSuggestion = IssueSuggestionDto;
export type CauseSuggestion = CauseSuggestionDto;

// Utility types
export type DuplicateHandling = 'Skip' | 'Update' | 'CreateNew' | 'Fail';

export interface ImportOptions {
  duplicateHandling: DuplicateHandling;
}