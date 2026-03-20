export type ApiFieldErrors = Record<string, string[]>;

export interface ApiProblemDetails {
    type?: string;
    title?: string;
    status?: number;
    detail?: string;
    instance?: string;
    traceId?: string;
    timestamp?: string;
    errorCode?: string;
    errorCategory?: string;
    retryAfter?: number;
    retryAfterHuman?: string;
    requiresOtp?: boolean;
    retryable?: boolean;
    serviceType?: string;
    resource?: string;
    metadata?: Record<string, unknown>;
    conflictInfo?: Record<string, unknown>;
    summary?: Record<string, unknown>;
    batchResults?: unknown[];
    errors?: unknown;
}

export interface NormalizedApiError {
    message: string;
    userMessage: string;
    title?: string;
    detail?: string;
    status?: number;
    errorCode?: string;
    errorCategory?: string;
    traceId?: string;
    instance?: string;
    type?: string;
    timestamp?: string;
    retryAfter?: number;
    retryAfterHuman?: string;
    requiresOtp?: boolean;
    retryable?: boolean;
    serviceType?: string;
    resource?: string;
    metadata?: Record<string, unknown>;
    conflictInfo?: Record<string, unknown>;
    summary?: Record<string, unknown>;
    batchResults?: unknown[];
    fieldErrors: ApiFieldErrors | null;
    isNetworkError: boolean;
    isTimeoutError: boolean;
    isAuthenticationError: boolean;
    isAuthorizationError: boolean;
    isValidationError: boolean;
    isRetryable: boolean;
}

export interface ApiErrorState {
    message: string;
    fieldErrors: ApiFieldErrors | null;
    error: NormalizedApiError;
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
        getNumber(payload?.statusCode) ??
        getNumber(payload?.code);
}

function resolvePayload(error: Record<string, unknown>): Record<string, unknown> | null {
    if (isRecord(error.data)) {
        return error.data;
    }

    if (isRecord(error.response) && isRecord(error.response.data)) {
        return error.response.data;
    }

    if (isRecord(error.error)) {
        return error.error;
    }

    const looksLikeProblemDetails =
        typeof error.title === 'string' ||
        typeof error.detail === 'string' ||
        typeof error.errorCode === 'string' ||
        typeof error.errorCategory === 'string' ||
        typeof error.message === 'string' ||
        isRecord(error.errors);

    return looksLikeProblemDetails ? error : null;
}

function normalizeFieldErrors(rawErrors: unknown): ApiFieldErrors | null {
    if (!rawErrors) {
        return null;
    }

    if (Array.isArray(rawErrors)) {
        const normalizedFromArray: ApiFieldErrors = {};

        rawErrors.forEach((item, index) => {
            if (!isRecord(item)) {
                return;
            }

            const pointer = getString(item.pointer) || getString(item.field) || `error_${index + 1}`;
            const detail = getString(item.detail) || getString(item.description) || getString(item.message);
            if (!detail) {
                return;
            }

            normalizedFromArray[pointer] = [...(normalizedFromArray[pointer] || []), detail];
        });

        return Object.keys(normalizedFromArray).length > 0 ? normalizedFromArray : null;
    }

    if (!isRecord(rawErrors)) {
        return null;
    }

    const normalized: ApiFieldErrors = {};

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
            return;
        }

        if (isRecord(messages) && typeof messages.message === 'string') {
            normalized[field] = [messages.message.trim()];
        }
    });

    return Object.keys(normalized).length > 0 ? normalized : null;
}

function toSentenceCase(value: string): string {
    return value
        .replace(/[._]/g, ' ')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim();
}

function formatFieldLabel(fieldName: string): string {
    const normalized = fieldName.replace(/^\/?#?\/?/, '');
    const lastSegment = normalized.split(/[/.]/).filter(Boolean).pop() || normalized;
    const sentence = toSentenceCase(lastSegment);
    return sentence ? sentence.charAt(0).toUpperCase() + sentence.slice(1) : fieldName;
}

function getFallbackMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof Error && getString(error.message)) {
        return error.message;
    }

    return fallbackMessage;
}

function isNetworkFailure(error: unknown): boolean {
    return error instanceof TypeError ||
        (error instanceof Error && /failed to fetch|networkerror|network request failed/i.test(error.message));
}

function isTimeoutFailure(error: unknown): boolean {
    return error instanceof Error && (error.name === 'AbortError' || /timeout/i.test(error.message));
}

export function normalizeApiError(error: unknown, fallbackMessage = 'Unable to complete the request. Please try again.'): NormalizedApiError {
    const fallback = getFallbackMessage(error, fallbackMessage);
    const networkError = isNetworkFailure(error);
    const timeoutError = isTimeoutFailure(error);

    if (!isRecord(error)) {
        return {
            message: networkError
                ? 'Unable to reach the server. Check your connection and try again.'
                : timeoutError
                    ? 'The request timed out. Please try again.'
                    : fallback,
            userMessage: networkError
                ? 'Unable to reach the server. Check your connection and try again.'
                : timeoutError
                    ? 'The request timed out. Please try again.'
                    : fallback,
            fieldErrors: null,
            isNetworkError: networkError,
            isTimeoutError: timeoutError,
            isAuthenticationError: false,
            isAuthorizationError: false,
            isValidationError: false,
            isRetryable: networkError || timeoutError,
        };
    }

    const payload = resolvePayload(error);
    const status = resolveStatus(error, payload);
    const headers = isRecord(error.response)
        ? (error.response as Record<string, unknown>).headers
        : error.headers;

    const retryAfterHeader = getHeaderValue(headers, 'Retry-After');
    const retryAfter = payload
        ? getNumber(payload.retryAfter) ??
        (retryAfterHeader && /^\d+$/.test(retryAfterHeader) ? Number(retryAfterHeader) : undefined)
        : retryAfterHeader && /^\d+$/.test(retryAfterHeader)
            ? Number(retryAfterHeader)
            : undefined;

    const title = getString(payload?.title);
    const detail = getString(payload?.detail) || getString(payload?.message) || getString(payload?.error);
    const errorCode = getString(payload?.errorCode) || getHeaderValue(headers, 'X-Error-Code');
    const errorCategory = getString(payload?.errorCategory);
    const traceId = getString(payload?.traceId) || getHeaderValue(headers, 'X-Correlation-ID');
    const fieldErrors = normalizeFieldErrors(payload?.errors);

    const isAuthenticationError = status === 401 || errorCode === 'TOKEN_EXPIRED';
    const isAuthorizationError = status === 403;
    const isValidationError = status === 400 || status === 422 || !!fieldErrors;
    const isRetryable =
        networkError ||
        timeoutError ||
        status === 429 ||
        status === 502 ||
        getBoolean(payload?.retryable) === true;

    const userMessage =
        detail ||
        title ||
        (timeoutError
            ? 'The request timed out. Please try again.'
            : networkError
                ? 'Unable to reach the server. Check your connection and try again.'
                : fallback);

    return {
        message: userMessage,
        userMessage,
        title,
        detail,
        status,
        errorCode,
        errorCategory,
        traceId,
        instance: getString(payload?.instance),
        type: getString(payload?.type),
        timestamp: getString(payload?.timestamp),
        retryAfter,
        retryAfterHuman: getString(payload?.retryAfterHuman),
        requiresOtp: getBoolean(payload?.requiresOtp),
        retryable: getBoolean(payload?.retryable),
        serviceType: getString(payload?.serviceType),
        resource: getString(payload?.resource),
        metadata: isRecord(payload?.metadata) ? payload.metadata : undefined,
        conflictInfo: isRecord(payload?.conflictInfo) ? payload.conflictInfo : undefined,
        summary: isRecord(payload?.summary) ? payload.summary : undefined,
        batchResults: Array.isArray(payload?.batchResults) ? payload.batchResults : undefined,
        fieldErrors,
        isNetworkError: networkError,
        isTimeoutError: timeoutError,
        isAuthenticationError,
        isAuthorizationError,
        isValidationError,
        isRetryable,
    };
}

export function createApiErrorState(error: unknown, fallbackMessage: string): ApiErrorState {
    const normalized = normalizeApiError(error, fallbackMessage);

    return {
        message: normalized.userMessage || fallbackMessage,
        fieldErrors: normalized.fieldErrors,
        error: normalized,
    };
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
    return createApiErrorState(error, fallbackMessage).message;
}

export function getFieldErrorMessages(
    fieldErrors: ApiFieldErrors | null | undefined,
    fieldName: string,
    aliases: string[] = [],
): string[] {
    if (!fieldErrors) {
        return [];
    }

    const candidates = [fieldName, ...aliases].map((candidate) => candidate.toLowerCase());

    for (const [field, messages] of Object.entries(fieldErrors)) {
        if (candidates.includes(field.toLowerCase())) {
            return messages;
        }
    }

    return [];
}

export function getGeneralValidationMessages(
    fieldErrors: ApiFieldErrors | null | undefined,
    excludedFields: string[] = [],
): string[] {
    if (!fieldErrors) {
        return [];
    }

    const excluded = excludedFields.map((field) => field.toLowerCase());

    return Object.entries(fieldErrors)
        .filter(([field]) => !excluded.includes(field.toLowerCase()))
        .flatMap(([field, messages]) => messages.map((message) => `${formatFieldLabel(field)}: ${message}`));
}

export function parseApiError(error: unknown): NormalizedApiError {
    return normalizeApiError(error);
}

export type ValidationErrors = ApiFieldErrors;
export type ParsedApiError = NormalizedApiError;