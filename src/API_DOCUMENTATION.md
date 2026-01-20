# API Documentation

## Architecture Overview

The application is separated into **Frontend (React)** and **API Layer** with clear boundaries:

```
/api                    - API layer (mock backend)
/components            - React UI components
/hooks                 - React hooks for data fetching
/stores                - Initial data stores
/types                 - TypeScript type definitions
```

## API Layer (`/api`)

All API calls are centralized in the `/api` folder. Currently using **mock APIs** that simulate real backend behavior with delays.

### Authentication API (`/api/auth.ts`)

```typescript
authApi.login({ username, password })
  → Returns: { success, token, user, error }

authApi.logout()
  → Clears authentication

authApi.verifyToken(token)
  → Returns: boolean
```

### Work Logs API (`/api/workLogs.ts`)

```typescript
workLogsApi.getAll()                    - Get all work logs
workLogsApi.getById(id)                 - Get single work log
workLogsApi.create(data)                - Create new work log
workLogsApi.update(id, data)            - Update work log
workLogsApi.delete(id)                  - Delete work log
workLogsApi.search(query)               - Search work logs
```

### Other APIs (`/api/common.ts`, `/api/employees.ts`, `/api/devices.ts`)

Similar CRUD operations for:
- `employeesApi`
- `devicesApi`
- `deviceTypesApi`
- `departmentsApi`
- `areasApi`
- `accountsApi`
- `rolesApi`

## Connecting to Real Backend

### Step 1: Update API Configuration

Edit `/api/index.ts`:

```typescript
export const API_CONFIG = {
  baseURL: 'https://your-backend.com/api',  // ← Change this
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

### Step 2: Replace Mock APIs with Real HTTP Calls

Example - Replace `/api/workLogs.ts`:

```typescript
import { apiRequest } from './index';
import type { WorkLog } from '../types/data';

export const workLogsApi = {
  async getAll(): Promise<WorkLog[]> {
    return apiRequest<WorkLog[]>('/work-logs');
  },

  async create(data: Omit<WorkLog, 'id'>): Promise<WorkLog> {
    return apiRequest<WorkLog>('/work-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<WorkLog>): Promise<WorkLog> {
    return apiRequest<WorkLog>(`/work-logs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/work-logs/${id}`, {
      method: 'DELETE',
    });
  },
};
```

### Step 3: Update Authentication

Replace `/api/auth.ts` with real backend calls:

```typescript
export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async logout(): Promise<void> {
    return apiRequest<void>('/auth/logout', {
      method: 'POST',
    });
  },
};
```

## Backend API Requirements

Your backend should provide these endpoints:

### Authentication
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/verify` - Verify JWT token

### Work Logs
- `GET /api/work-logs` - Get all work logs
- `GET /api/work-logs/:id` - Get single work log
- `POST /api/work-logs` - Create work log
- `PUT /api/work-logs/:id` - Update work log
- `DELETE /api/work-logs/:id` - Delete work log

### Employees
- `GET /api/employees`
- `POST /api/employees`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`

### Devices
- `GET /api/devices`
- `POST /api/devices`
- `PUT /api/devices/:id`
- `DELETE /api/devices/:id`

... (similar for all other resources)

## Request/Response Format

### Request Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": 400
}
```

## Custom Hooks

### `useApi` Hook
Generic hook for API calls with loading/error states:

```typescript
const { data, loading, error, refetch } = useApi(
  () => workLogsApi.getAll()
);
```

### `useApiMutation` Hook
For create/update/delete operations:

```typescript
const { mutate, loading } = useApiMutation(workLogsApi.create);
await mutate(newWorkLog);
```

## Environment Variables

Create `.env` file:

```
REACT_APP_API_URL=https://your-backend.com/api
REACT_APP_API_TIMEOUT=10000
```

## Security Notes

- JWT tokens are stored in `localStorage`
- All API requests include `Authorization` header
- Replace mock authentication with real JWT validation
- Implement proper CORS on backend
- Use HTTPS in production

## Testing

The mock APIs simulate:
- Network delays (300-500ms)
- Successful responses
- Error handling
- State persistence in memory

Perfect for frontend development without backend dependency!
