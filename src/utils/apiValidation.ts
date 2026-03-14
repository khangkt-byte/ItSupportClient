export type ValidationErrors = Record<string, string[]>;

export interface ParsedApiError {
    message: string;
    status?: number;
    errorCode?: string;
    errorCategory?: string;
    traceId?: string;
    instance?: string;
    type?: string;
    retryAfter?: number;
    requiresOtp?: boolean;
    fieldErrors: ValidationErrors | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function getString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function getNumber(value: unknown): number | undefined {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function getBoolean(value: unknown): boolean | undefined {
    return typeof value === 'boolean' ? value : undefined;
}

function getHeaderValue(headers: unknown, key: string): string | undefined {
    if (headers instanceof Headers) {
        return getString(headers.get(key));
    }

    if (!isRecord(headers)) {
        return undefined;
    }

    const matchedKey = Object.keys(headers).find((headerKey) => headerKey.toLowerCase() === key.toLowerCase());
    if (!matchedKey) {
        return undefined;
    }

    return getString(headers[matchedKey]);
}

function resolveStatus(error: Record<string, unknown>, payload: Record<string, unknown> | null): number | undefined {
    return getNumber(error.status) ??
        getNumber(error.statusCode) ??
        getNumber(payload?.status) ??
        getNumber(payload?.statusCode);
}

function resolvePayload(error: Record<string, unknown>): Record<string, unknown> | null {
    if (isRecord(error.data)) {
        return error.data;
    }

    if (isRecord(error.response) && isRecord(error.response.data)) {
        return error.response.data;
    }

    const looksLikeProblemDetails =
        typeof error.title === 'string' ||
        typeof error.detail === 'string' ||
        typeof error.errorCode === 'string' ||
        typeof error.errorCategory === 'string' ||
        isRecord(error.errors);

    return looksLikeProblemDetails ? error : null;
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

    const payload = resolvePayload(error);
    const status = resolveStatus(error, payload);

    if (!payload) {
        return {
            message: fallbackMessage,
            status,
            fieldErrors: null,
        };
    }

    const message =
        getString(payload.detail) ||
        getString(payload.message) ||
        getString(payload.title) ||
        getString(payload.error) ||
        fallbackMessage;

    const headers = isRecord(error.response)
        ? (error.response as Record<string, unknown>).headers
        : error.headers;

    const retryAfterHeader = getHeaderValue(headers, 'Retry-After');
    const retryAfter =
        getNumber(payload.retryAfter) ??
        (retryAfterHeader && /^\d+$/.test(retryAfterHeader) ? Number(retryAfterHeader) : undefined);

    const errorCode = getString(payload.errorCode) || getHeaderValue(headers, 'X-Error-Code');
    const traceId = getString(payload.traceId) || getHeaderValue(headers, 'X-Correlation-ID');

    return {
        message,
        status,
        errorCode,
        errorCategory: getString(payload.errorCategory),
        traceId,
        instance: getString(payload.instance),
        type: getString(payload.type),
        retryAfter,
        requiresOtp: getBoolean(payload.requiresOtp),
        fieldErrors: normalizeFieldErrors(payload.errors),
    };
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
    const parsed = parseApiError(error);
    return parsed.message || fallbackMessage;
}
