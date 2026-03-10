import { useState, JSX } from 'react';
import React from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Clock, Edit, PlayCircle, Trash2, XCircle } from 'lucide-react';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { Permissions } from '@/config/permissions';
import type { PaginatedResult, WorkLog, WorkStatus } from '@/types/data';

interface WorkLogTableProps {
  paginatedResult: PaginatedResult<WorkLog>;
  isLoading: boolean;
  error: string | null;
  onEdit: (log: WorkLog) => void;
  onDelete: (id: string) => void;
}

export function WorkLogTable({ paginatedResult, isLoading, error, onEdit, onDelete }: WorkLogTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    newExpanded.has(id) ? newExpanded.delete(id) : newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const getStatusLabel = (status: WorkStatus) => {
    const labels: Record<string, string> = {
      pending: 'PENDING',
      'in-progress': 'IN PROGRESS',
      resolved: 'RESOLVED',
      cancelled: 'CANCELLED',
    };
    return labels[status] || status?.toUpperCase() || 'UNKNOWN';
  };

  const getStatusIcon = (status: WorkStatus) => {
    const iconProps = { className: 'w-3 h-3', strokeWidth: 2.5 };
    const icons: Record<string, JSX.Element> = {
      pending: <Clock {...iconProps} />,
      'in-progress': <PlayCircle {...iconProps} />,
      resolved: <CheckCircle2 {...iconProps} />,
      cancelled: <XCircle {...iconProps} />,
    };
    const icon = icons[status];
    if (!icon) return null;

    return <span className="inline-flex w-3 h-3 shrink-0 items-center justify-center">{icon}</span>;
  };

  const getStatusBadge = (status: WorkStatus) => {
    const base = 'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium leading-4 tracking-wide transition-colors';
    const styles: Record<string, string> = {
      pending: 'bg-warning-background text-warning-foreground ring-1 ring-inset ring-warning-border',
      'in-progress': 'bg-info-background text-info-foreground ring-1 ring-inset ring-info-border',
      resolved: 'bg-success-background text-success-foreground ring-1 ring-inset ring-success-border',
      cancelled: 'bg-muted text-muted-foreground ring-1 ring-inset ring-border',
    };
    return `${base} ${styles[status] || 'bg-muted text-muted-foreground ring-1 ring-inset ring-border'}`;
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading work logs...</p>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="p-4 bg-error-background border border-error-border flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-error-foreground mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-error-foreground">Error</p>
            <p className="text-sm text-error-foreground">{error}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Operator</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Requester</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Issue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedResult.items.length > 0 ? (
              paginatedResult.items.map((log) => (
                <React.Fragment key={log.id}>
                  <tr className="hover:bg-accent transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground">
                      {new Date(log.reportDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{(log.operators || []).join(', ')}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{(log.requesters || []).join(', ') || 'None'}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{log.department}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => toggleRow(log.id)}
                        className="text-left hover:text-primary-600 line-clamp-2 text-foreground transition-colors"
                      >
                        {log.issue}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={getStatusBadge(log.status)}>
                        {getStatusIcon(log.status)}
                        {getStatusLabel(log.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => toggleRow(log.id)}
                          className="w-4 h-4 text-primary-600 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-primary-800 transition-colors shrink-0"
                          title={expandedRows.has(log.id) ? 'Collapse details' : 'Expand details'}
                        >
                          {expandedRows.has(log.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <PermissionGuard permission={Permissions.IssueLog.Edit} fallback={null}>
                          <button
                            onClick={() => onEdit(log)}
                            className="w-4 h-4 text-primary-600 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-primary-800 transition-colors shrink-0"
                            title="Edit work log"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </PermissionGuard>
                        <PermissionGuard permission={Permissions.IssueLog.Delete} fallback={null}>
                          <button
                            onClick={() => onDelete(log.id)}
                            className="w-4 h-4 text-error-foreground inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-error-foreground transition-colors shrink-0"
                            title="Delete work log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>

                  {expandedRows.has(log.id) && (
                    <tr className="bg-muted">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium mb-1 text-muted-foreground">Area:</p>
                            <p className="text-muted-foreground">{log.area || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium mb-1 text-muted-foreground">Cause:</p>
                            <p className="text-muted-foreground">{log.cause || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium mb-1 text-muted-foreground">Fix:</p>
                            <p className="text-muted-foreground">{log.fixDescription || 'N/A'}</p>
                          </div>
                          {log.permanentFix && (
                            <div>
                              <p className="font-medium mb-1 text-muted-foreground">Permanent Fix:</p>
                              <p className="text-muted-foreground">{log.permanentFix}</p>
                            </div>
                          )}
                          {log.note && (
                            <div>
                              <p className="font-medium mb-1 text-muted-foreground">Note:</p>
                              <p className="text-muted-foreground">{log.note}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-lg font-medium">No work logs found</p>
                  <p className="text-sm mt-1">Try adjusting your search or status filter</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
