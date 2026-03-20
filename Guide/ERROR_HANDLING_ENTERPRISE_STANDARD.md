# Error Handling Enterprise Standard

## Scope
This document defines the frontend error-handling standard for this project.
It applies to API parsing, state management, and user-facing error UI across all modules.

## Architecture Principles
- Use one normalized error contract for all API errors.
- Separate machine-readable fields from user-facing messages.
- Never parse business logic from free-text messages when structured fields exist.
- Keep validation errors field-level, and non-field errors global.
- Preserve traceability with `traceId`, `errorCode`, and `status`.

## Backend Contract Baseline
The backend returns RFC Problem Details style payloads (`application/problem+json`), including core fields and extensions.

Core fields:
- `type`
- `title`
- `status`
- `detail`
- `instance`

Extensions supported by frontend normalizer:
- `traceId`
- `timestamp`
- `errorCode`
- `errorCategory`
- `errors`
- `retryAfter`
- `retryAfterHuman`
- `requiresOtp`
- `retryable`
- `serviceType`
- `resource`
- `metadata`
- `conflictInfo`
- `summary`
- `batchResults`

## Frontend Standard

### Shared Utility
Use `src/utils/apiErrors.ts` as the single source of truth for API error parsing.

Primary APIs:
- `normalizeApiError(error, fallbackMessage?)`
- `createApiErrorState(error, fallbackMessage)`
- `getApiErrorMessage(error, fallbackMessage)`
- `getFieldErrorMessages(fieldErrors, fieldName, aliases?)`
- `getGeneralValidationMessages(fieldErrors, excludedFields?)`

### Naming Convention
- Utility file: `apiErrors.ts` (canonical name)
- Error state object shape:
  - `message`: normalized user message
  - `fieldErrors`: field-level validation dictionary
  - `error`: full normalized payload

In component state:
- Use `mutationError` / `queryError` when both exist.
- Use `error` only when there is a single error context.
- Use `validationErrors` for field-level display.

### UI Convention
- Use shared `ErrorAlert` component (`src/components/common/ErrorAlert.tsx`) for global form/module error blocks.
- Field-level validation stays near the relevant input.
- General validation messages render under the global alert.

### Transport-Level Errors
API client maps transport errors to normalized, user-safe messages:
- Timeout -> `REQUEST_TIMEOUT`
- Network failure -> `NETWORK_ERROR`

## Module Adoption Checklist
For each module/hook:
1. Parse API errors only with `apiErrors` utilities.
2. Store and pass `validationErrors` when forms can receive server validation.
3. Render global errors with `ErrorAlert`.
4. Keep fallback messages action-oriented and concise.
5. Avoid duplicating key lookup logic for field errors.

## Practical Rules
- Do not expose internal stack traces or sensitive backend details.
- Log raw errors to console only for diagnostics; show normalized messages to users.
- Use retry hints (`retryAfter`, `retryable`) when available.
- Treat `detail` as display text, not a parsing source for business logic.

## Message Wording Standard (Phase 2)
- Prefer `Unable to ...` over `Failed to ...` for user-facing fallback messages.
- Keep fallback messages action-oriented and specific to the attempted operation.
- Include a next action when useful:
  - load/query flows: `Please refresh and try again.`
  - mutation flows (create/update/delete): `Please try again.`
  - import/validation flows: `Please check the file/data and try again.`
- End fallback messages with a period.

## References
- RFC 9457: Problem Details for HTTP APIs
  - https://datatracker.ietf.org/doc/html/rfc9457
- ASP.NET Core API error handling and ProblemDetails guidance
  - https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling-api?view=aspnetcore-9.0
- TanStack Query error handling guidance
  - https://tanstack.com/query/latest/docs/framework/react/guides/query-functions
  - https://tanstack.com/query/latest/docs/framework/react/guides/mutations
- React Error Boundary guidance
  - https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- Google AIP-193 (structured errors, machine-readable metadata)
  - https://google.aip.dev/193
- Stripe error-handling model (typed errors and retry strategy)
  - https://docs.stripe.com/error-handling
- GitHub REST troubleshooting (rate-limit, retry-after, auth edge cases)
  - https://docs.github.com/en/rest/using-the-rest-api/troubleshooting-the-rest-api?apiVersion=2022-11-28
