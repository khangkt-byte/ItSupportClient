import type { ApiError } from '@/features/auth/types/auth';

export type ValidationErrors = Record<string, string[]>;

export interface ParsedApiError {
    message: string;
    status?: number;
    errorCode?: string;
    fieldErrors: ValidationErrors | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function normalizeFieldErrors(rawErrors: unknown): ValidationErrors | null {
    if (!isRecord(rawErrors)) return null;

    const normalized: ValidationErrors = {};

    Object.entries(rawErrors).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
            const safeMessages = messages
                .map((msg) => String(msg).trim())
                .filter(Boolean);

            if (safeMessages.length > 0) {
                normalized[field] = safeMessages;
            }
            return;
        }

        if (typeof messages === 'string' && messages.trim()) {
            normalized[field] = [messages.trim()];
        }
    });

    return Object.keys(normalized).length > 0 ? normalized : null;
}

export function parseApiError(error: unknown): ParsedApiError {
    const fallbackMessage = error instanceof Error ? error.message : 'Request failed';

    if (!isRecord(error)) {
        return {
            message: fallbackMessage,
            fieldErrors: null,
        };
    }

    const errorData = isRecord(error.data) ? (error.data as ApiError) : null;
    const status = typeof error.status === 'number' ? error.status : undefined;

    if (!errorData) {
        return {
            message: fallbackMessage,
            status,
            fieldErrors: null,
        };
    }

    const message =
        errorData.detail ||
        errorData.message ||
        errorData.title ||
        errorData.error ||
        fallbackMessage;

    return {
        message,
        status,
        errorCode: errorData.errorCode,
        fieldErrors: normalizeFieldErrors(errorData.errors),
    };
}
