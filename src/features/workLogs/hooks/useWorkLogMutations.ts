import { useCallback, useState } from 'react';
import { workLogsApi } from '@/services/api';
import { workLogToCreateDto } from '@/utils/workLogAdapter';
import type { Area, Department, IssueLogDto, WorkLog, WorkStatus } from '@/types/data';

export interface WorkLogMutationFormData {
    reportDate: string;
    operators: string[];
    requesters: string[];
    department: string;
    area: string;
    issue: string;
    cause: string;
    fixDescription: string;
    permanentFix: string;
    note: string;
    status: WorkStatus;
}

interface UseWorkLogMutationsParams {
    data: WorkLog[];
    setData: (logs: WorkLog[]) => void;
    currentUser: string;
    departments: Department[];
    areas: Area[];
}

function mapIssueLogDtoToWorkLog(dto: IssueLogDto, formData: WorkLogMutationFormData): WorkLog {
    return {
        ...dto,
        id: dto.issLogId,
        reportDate: dto.dateReported,
        operators: formData.operators,
        requesters: formData.requesters,
        department: formData.department,
        area: formData.area,
        issue: dto.issueDescription,
        cause: dto.cause || '',
        fixDescription: dto.resolution || '',
        permanentFix: dto.permanentFix || '',
        note: dto.notes || '',
        status: (dto.status as WorkStatus) || 'pending',
    };
}

export function useWorkLogMutations({
    data,
    setData,
    currentUser,
    departments,
    areas,
}: UseWorkLogMutationsParams) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitWorkLog = useCallback(
        async (formData: WorkLogMutationFormData, editing: WorkLog | null): Promise<boolean> => {
            setSubmitting(true);
            setError(null);

            try {
                const dept = departments.find((item) => item.name === formData.department);
                const area = areas.find((item) => item.name === formData.area);

                const workLogData: Partial<WorkLog> = {
                    operators: [formData.operators[0] || currentUser],
                    requesters: formData.requesters,
                    dptId: dept?.dptId,
                    areaId: area?.areaId,
                    issue: formData.issue,
                    cause: formData.cause || undefined,
                    fixDescription: formData.fixDescription || undefined,
                    permanentFix: formData.permanentFix || undefined,
                    note: formData.note || undefined,
                    reportDate: formData.reportDate,
                    status: formData.status,
                };

                const createDto = workLogToCreateDto(workLogData);

                if (editing) {
                    await workLogsApi.update(editing.id, createDto);

                    const updatedWorkLog: WorkLog = {
                        ...editing,
                        reportDate: createDto.dateReported,
                        operators: formData.operators,
                        requesters: formData.requesters,
                        department: formData.department,
                        area: formData.area,
                        issue: formData.issue,
                        cause: formData.cause,
                        fixDescription: formData.fixDescription,
                        permanentFix: formData.permanentFix,
                        note: formData.note,
                        status: formData.status,
                    };

                    setData(data.map((item) => (item.id === editing.id ? updatedWorkLog : item)));
                } else {
                    const created = await workLogsApi.create(createDto);
                    const newWorkLog = mapIssueLogDtoToWorkLog(created, formData);
                    setData([newWorkLog, ...data]);
                }

                return true;
            } catch (mutationError) {
                console.error('Failed to submit work log:', mutationError);
                setError('Failed to submit work log. Please try again.');
                return false;
            } finally {
                setSubmitting(false);
            }
        },
        [areas, currentUser, data, departments, setData]
    );

    const deleteWorkLog = useCallback(
        async (workLogId: string): Promise<boolean> => {
            try {
                await workLogsApi.deleteSingle(workLogId);
                setData(data.filter((item) => item.id !== workLogId));
                return true;
            } catch (mutationError) {
                console.error('Failed to delete work log:', mutationError);
                setError('Failed to delete work log. Please try again.');
                return false;
            }
        },
        [data, setData]
    );

    return {
        submitting,
        error,
        setError,
        submitWorkLog,
        deleteWorkLog,
    };
}
