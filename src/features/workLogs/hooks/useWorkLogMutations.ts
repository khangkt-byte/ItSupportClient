import { useCallback, useState } from 'react';
import { workLogsApi } from '@/services/api';
import { workLogToCreateDto } from '@/utils/workLogAdapter';
import { createApiErrorState, type ValidationErrors } from '@/utils/apiErrors';
import type { Area, Department, WorkLog, WorkStatus } from '@/types/data';

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
    currentUser: string;
    departments: Department[];
    areas: Area[];
    /** Called after every successful create / update / delete to reload the list. */
    refetch: () => Promise<void>;
}

export function useWorkLogMutations({
    currentUser,
    departments,
    areas,
    refetch,
}: UseWorkLogMutationsParams) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors | null>(null);

    const submitWorkLog = useCallback(
        async (formData: WorkLogMutationFormData, editing: WorkLog | null): Promise<boolean> => {
            setSubmitting(true);
            setError(null);
            setValidationErrors(null);

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
                } else {
                    await workLogsApi.create(createDto);
                }

                await refetch();
                return true;
            } catch (mutationError) {
                console.error('Failed to submit work log:', mutationError);
                const errorState = createApiErrorState(mutationError, 'Failed to submit work log. Please try again.');
                setError(errorState.message);
                setValidationErrors(errorState.fieldErrors);
                return false;
            } finally {
                setSubmitting(false);
            }
        },
        [areas, currentUser, departments, refetch]
    );

    const deleteWorkLog = useCallback(
        async (workLogId: string): Promise<boolean> => {
            try {
                await workLogsApi.deleteSingle(workLogId);
                await refetch();
                return true;
            } catch (mutationError) {
                console.error('Failed to delete work log:', mutationError);
                const errorState = createApiErrorState(mutationError, 'Failed to delete work log. Please try again.');
                setError(errorState.message);
                setValidationErrors(errorState.fieldErrors);
                return false;
            }
        },
        [refetch]
    );

    return {
        submitting,
        error,
        validationErrors,
        setError,
        setValidationErrors,
        submitWorkLog,
        deleteWorkLog,
    };
}
