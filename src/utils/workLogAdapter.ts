/**
 * Adapter Layer for WorkLog <-> IssueLogDto mapping
 * Converts between UI models and API DTOs
 */

import type {
  WorkLog,
  IssueLogDto,
  CreateIssueLogDto,
  UpdateIssueLogDto,
  WorkStatus
} from '@/types/data';

/**
 * Convert API IssueLogDto to UI WorkLog
 */
export function issueLogToWorkLog(issueLog: IssueLogDto): WorkLog {
  return {
    // Map IssueLogDto fields to WorkLog
    id: issueLog.issLogId,
    issLogId: issueLog.issLogId,

    // Date mapping
    reportDate: new Date(issueLog.dateReported),
    dateReported: issueLog.dateReported,

    // Operators and Requesters (convert single strings to arrays)
    operator: issueLog.operator,
    operators: issueLog.operator ? issueLog.operator.split(',').map(s => s.trim()) : [],
    requester: issueLog.requester,
    requesters: issueLog.requester ? issueLog.requester.split(',').map(s => s.trim()) : [],

    // Department and Area
    dptId: issueLog.dptId,
    department: issueLog.departmentName,
    departmentName: issueLog.departmentName,
    areaId: issueLog.areaId,
    area: issueLog.areaName,
    areaName: issueLog.areaName,

    // Issue details
    issueId: issueLog.issueId,
    issueName: issueLog.issueName,
    issue: issueLog.issueDescription,
    issueDescription: issueLog.issueDescription,

    // Cause details
    causeId: issueLog.causeId,
    causeName: issueLog.causeName,
    cause: issueLog.cause,

    // Resolution
    resolution: issueLog.resolution,
    fixDescription: issueLog.resolution || '',
    permanentFix: issueLog.permanentFix,

    // Notes and Status
    notes: issueLog.notes,
    note: issueLog.notes || '',
    status: (issueLog.status?.toLowerCase().replace(/\s+/g, '-') || 'pending') as WorkStatus,

    // Timestamps
    createdAt: issueLog.createdAt,
    updatedAt: issueLog.updatedAt,
  };
}

/**
 * Convert UI WorkLog to API CreateIssueLogDto
 */
export function workLogToCreateDto(workLog: Partial<WorkLog>): CreateIssueLogDto {
  return {
    // Convert operators array to comma-separated string
    operator: Array.isArray(workLog.operators)
      ? workLog.operators.join(', ')
      : (workLog.operator || ''),

    // Convert requesters array to comma-separated string
    requester: Array.isArray(workLog.requesters)
      ? workLog.requesters.join(', ')
      : (workLog.requester || null),

    // Department and Area IDs - use DptId instead of departmentId for API compatibility
    DptId: workLog.dptId,
    AreaId: workLog.areaId,

    // Issue
    issueId: workLog.issueId || null,
    issueDescription: workLog.issue || workLog.issueDescription || '',

    // Cause
    causeId: workLog.causeId || null,
    cause: workLog.cause || null,

    // Resolution
    resolution: workLog.fixDescription || workLog.resolution || null,
    permanentFix: workLog.permanentFix || null,

    // Notes and Status
    notes: workLog.note || workLog.notes || null,
    status: workLog.status || 'pending',

    // Date - format as YYYY-MM-DD for DateOnly field
    dateReported: workLog.reportDate
      ? new Date(workLog.reportDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  };
}

/**
 * Convert UI WorkLog to API UpdateIssueLogDto
 */
export function workLogToUpdateDto(workLog: Partial<WorkLog>): UpdateIssueLogDto {
  const dto: UpdateIssueLogDto = {};

  // Only include fields that are present
  if (workLog.operators !== undefined) {
    dto.operator = Array.isArray(workLog.operators)
      ? workLog.operators.join(', ')
      : (workLog.operator || null);
  }

  if (workLog.requesters !== undefined) {
    dto.requester = Array.isArray(workLog.requesters)
      ? workLog.requesters.join(', ')
      : (workLog.requester || null);
  }

  if (workLog.dptId !== undefined) {
    dto.DptId = workLog.dptId;
  }

  if (workLog.areaId !== undefined) {
    dto.AreaId = workLog.areaId;
  }

  if (workLog.issueId !== undefined) {
    dto.issueId = workLog.issueId;
  }

  if (workLog.issue !== undefined || workLog.issueDescription !== undefined) {
    dto.issueDescription = workLog.issue || workLog.issueDescription || null;
  }

  if (workLog.causeId !== undefined) {
    dto.causeId = workLog.causeId;
  }

  if (workLog.cause !== undefined) {
    dto.cause = workLog.cause;
  }

  if (workLog.fixDescription !== undefined || workLog.resolution !== undefined) {
    dto.resolution = workLog.fixDescription || workLog.resolution || null;
  }

  if (workLog.permanentFix !== undefined) {
    dto.permanentFix = workLog.permanentFix;
  }

  if (workLog.note !== undefined || workLog.notes !== undefined) {
    dto.notes = workLog.note || workLog.notes || null;
  }

  if (workLog.status !== undefined) {
    dto.status = workLog.status;
  }

  if (workLog.reportDate !== undefined) {
    dto.dateReported = workLog.reportDate
      ? new Date(workLog.reportDate).toISOString().split('T')[0]
      : null;
  }

  return dto;
}

/**
 * Convert array of IssueLogDto to WorkLog[]
 */
export function issueLogsToWorkLogs(issueLogs: IssueLogDto[]): WorkLog[] {
  return issueLogs.map(issueLogToWorkLog);
}

/**
 * Helper: Extract department ID from name
 * This is a fallback when we need to find department ID from name
 */
export function findDepartmentId(
  departmentName: string,
  departments: Array<{ id: number; name: string }>
): number | undefined {
  const dept = departments.find(d =>
    d.name.toLowerCase() === departmentName.toLowerCase()
  );
  return dept?.id;
}

/**
 * Helper: Extract area ID from name
 */
export function findAreaId(
  areaName: string,
  areas: Array<{ id?: number; areaId?: number; name: string }>
): number | undefined {
  const area = areas.find(a =>
    a.name.toLowerCase() === areaName.toLowerCase()
  );
  return area?.id || area?.areaId;
}
