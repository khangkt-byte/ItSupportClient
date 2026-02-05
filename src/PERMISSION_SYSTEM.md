# 🔐 Permission System Documentation

## 📋 Overview

Hệ thống phân quyền enterprise-grade với các tính năng:
- ✅ CSRF Protection với lazy initialization
- ✅ JWT Token auto-refresh (60s interval, 2min buffer)
- ✅ Cross-tab synchronization
- ✅ Permission caching (5min TTL)
- ✅ Security validation (HTTPS, Web Crypto API, etc.)
- ✅ Exponential backoff retry
- ✅ Comprehensive error handling

---

## 🏗️ Architecture

```
/lib
├── api/
│   ├── common.ts          # API Client với CSRF & retry logic
│   └── auth.ts            # Auth API với auto-refresh & cross-tab sync
├── utils/
│   ├── jwtHelper.ts       # JWT token utilities
│   └── securityChecks.ts  # Security validation
├── hooks/
│   └── usePermission.ts   # Permission checking hook
├── components/
│   └── PermissionGuard.tsx # Permission-based guards
└── constants/
    └── permissions.ts     # Permission definitions

/api (Compatibility Layer)
├── common.ts              # Re-exports từ lib/api/common.ts
└── auth.ts                # Re-exports từ lib/api/auth.ts

/types
└── auth.ts                # Authentication type definitions
```

---

## 🔑 Permission Structure (Backend)

### Admin Role
- `Admin` - Bypass all permission checks

### Manager Role (13 permissions)
- `IssueLog.View`, `IssueLog.Create`, `IssueLog.Edit`, `IssueLog.Delete`
- `Issue.View`, `Issue.Create`, `Issue.Edit`
- `Cause.View`, `Cause.Create`, `Cause.Edit`
- `Employee.View`, `Department.View`, `Area.View`

### Employee Role (9 permissions)
- `IssueLog.View`, `IssueLog.Create`, `IssueLog.Edit`
- `Issue.View`, `Cause.View`
- `Device.View`, `Employee.View`, `Department.View`, `Area.View`

### Viewer Role (10 permissions)
- Read-only access to most resources

---

## 💻 Usage Examples

### 1. Permission Hook

```tsx
import { usePermission } from './lib/hooks/usePermission';
import { Permissions } from './lib/constants/permissions';

function MyComponent() {
  const { hasPermission, isAdmin, isLoading } = usePermission();

  if (isLoading) return <div>Loading permissions...</div>;

  return (
    <div>
      {hasPermission(Permissions.IssueLog.Create) && (
        <button>Create Issue Log</button>
      )}

      {isAdmin && (
        <button>Admin Settings</button>
      )}
    </div>
  );
}
```

### 2. Permission Guard Components

```tsx
import { PermissionGuard, AdminOnly } from './lib/components/PermissionGuard';
import { Permissions } from './lib/constants/permissions';

function MyPage() {
  return (
    <div>
      {/* Single permission */}
      <PermissionGuard permission={Permissions.IssueLog.Create}>
        <CreateButton />
      </PermissionGuard>

      {/* Admin only */}
      <AdminOnly>
        <AdminPanel />
      </AdminOnly>

      {/* With fallback */}
      <PermissionGuard 
        permission={Permissions.IssueLog.Delete}
        fallback={<div>You cannot delete</div>}
      >
        <DeleteButton />
      </PermissionGuard>
    </div>
  );
}
```

### 3. Multiple Permissions

```tsx
import { RequireAllPermissions, RequireAnyPermission } from './lib/components/PermissionGuard';

// Require ALL permissions
<RequireAllPermissions permissions={['IssueLog.View', 'IssueLog.Edit']}>
  <EditForm />
</RequireAllPermissions>

// Require ANY permission
<RequireAnyPermission permissions={['IssueLog.Create', 'IssueLog.Edit']}>
  <ActionButtons />
</RequireAnyPermission>
```

### 4. Programmatic Permission Check

```tsx
import { authApi } from './lib/api/auth';

// Async check
const canCreate = await authApi.hasPermission('IssueLog.Create');
if (canCreate) {
  // Do something
}

// Get all permissions
const permissions = await authApi.getMyPermissions();
console.log('User permissions:', permissions);
```

---

## 🔐 Security Features

### 1. CSRF Protection

```tsx
// Automatically handled by API client
// CSRF token được lazy-initialized khi cần
// Auto-refresh khi expired với exponential backoff

await apiClient.post('/api/work-logs', data);
// ✅ CSRF token tự động được thêm vào header
```

### 2. JWT Auto-Refresh

```tsx
// Auto-refresh chạy mỗi 60 giây
// Refresh trước 2 phút khi token sắp expired
// Cross-tab sync để tất cả tabs đều updated

// Manual refresh nếu cần
await authApi.refreshToken();
```

### 3. Security Validation

```tsx
import { SecurityValidator } from './lib/utils/securityChecks';

// Check security requirements
const check = SecurityValidator.checkBrowserSecurity();

if (check.errors.length > 0) {
  console.error('Security errors:', check.errors);
}

if (check.warnings.length > 0) {
  console.warn('Security warnings:', check.warnings);
}
```

### 4. Cross-Tab Synchronization

```tsx
// Tự động sync giữa các tabs:
// - Login/Logout
// - Token refresh
// - Permission updates

// Tab 1: User login
await authApi.login({ identifier: 'admin', password: 'pass' });

// Tab 2: Tự động update auth state
// Không cần làm gì, BroadcastChannel tự động sync
```

---

## 🚀 API Client Features

### 1. CSRF Protection

```tsx
import { apiClient } from './lib/api/common';

// GET requests: Không cần CSRF token
await apiClient.get('/api/work-logs');

// POST/PUT/DELETE: CSRF token tự động added
await apiClient.post('/api/work-logs', data);
await apiClient.put('/api/work-logs/123', data);
await apiClient.delete('/api/work-logs/123');

// Skip CSRF nếu cần (login, public endpoints)
await apiClient.post('/api/auth/login', credentials, { skipCsrf: true });
```

### 2. Token Expiry Handling

```tsx
// Token expired được detect từ:
// 1. JWT payload expiry check (client-side)
// 2. Token-Expired header từ backend

// Tự động trigger refresh khi expired
// Event được dispatch: 'auth:token-expired'

window.addEventListener('auth:token-expired', () => {
  console.log('Token expired, refreshing...');
});
```

### 3. Exponential Backoff Retry

```tsx
// CSRF token expired: Auto-retry với exponential backoff
// Retry 1: 1000ms delay
// Retry 2: 2000ms delay
// Retry 3: 4000ms delay
// Max 3 retries

// Automatically handled, không cần config
```

### 4. File Upload/Download

```tsx
// Upload file với CSRF protection
await apiClient.upload('/api/work-logs/import', file, {
  additionalField: 'value'
});

// Download file
await apiClient.download('/api/work-logs/export', 'work-logs.xlsx');
```

---

## 📊 State Management

### Auth State

```tsx
import { authApi, userProfile, accessToken, userPermissions } from './lib/api/auth';

// Get current user
const user = await authApi.getCurrentUser();

// Get current token (debug only)
const token = authApi.getAccessToken();

// Direct access (không recommend, dùng hook hoặc authApi methods)
console.log('User:', userProfile);
console.log('Token:', accessToken);
console.log('Permissions:', userPermissions);
```

### Permission Caching

```tsx
// Permissions được cache 5 phút
// Tự động refresh khi expired

const permissions1 = await authApi.getMyPermissions(); // Fetch từ backend
const permissions2 = await authApi.getMyPermissions(); // Cache hit (< 5min)

// ... 5 minutes later ...
const permissions3 = await authApi.getMyPermissions(); // Fetch lại từ backend

// Force refresh
const { refreshPermissions } = usePermission();
await refreshPermissions();
```

---

## 🛡️ Security Best Practices

### 1. HTTPS Enforcement

```tsx
// Production: Bắt buộc HTTPS
// Development: Cho phép localhost HTTP

// Tự động check khi app khởi động
// Throw error nếu không đủ security requirements
```

### 2. Token Storage

```tsx
// ❌ KHÔNG LƯU token trong localStorage (XSS vulnerable)
// ✅ Tokens được lưu trong memory + httpOnly cookie

// Access token: Memory only
// Refresh token: httpOnly cookie (backend controlled)
```

### 3. Permission Validation

```tsx
// ⚠️ Client-side permission check chỉ để UX
// ✅ Backend LUÔN validate permissions

// Client: Hide UI elements user cannot access
// Backend: Enforce permissions với [Authorize] attribute
```

---

## 🔄 Migration Guide

### Updating Existing Components

```tsx
// Before: No permission checks
function WorkLogManagement() {
  return (
    <div>
      <button onClick={createLog}>Create</button>
      <button onClick={deleteLog}>Delete</button>
    </div>
  );
}

// After: With permission guards
import { PermissionGuard } from './lib/components/PermissionGuard';
import { Permissions } from './lib/constants/permissions';

function WorkLogManagement() {
  return (
    <div>
      <PermissionGuard permission={Permissions.IssueLog.Create}>
        <button onClick={createLog}>Create</button>
      </PermissionGuard>

      <PermissionGuard permission={Permissions.IssueLog.Delete}>
        <button onClick={deleteLog}>Delete</button>
      </PermissionGuard>
    </div>
  );
}
```

### Using Hook for Dynamic Logic

```tsx
import { usePermission } from './lib/hooks/usePermission';
import { Permissions } from './lib/constants/permissions';

function WorkLogRow({ log }) {
  const { hasPermission } = usePermission();

  const handleEdit = () => {
    if (!hasPermission(Permissions.IssueLog.Edit)) {
      alert('You do not have permission to edit');
      return;
    }
    // Edit logic
  };

  return (
    <tr>
      <td>{log.title}</td>
      <td>
        {hasPermission(Permissions.IssueLog.Edit) && (
          <button onClick={handleEdit}>Edit</button>
        )}
        
        {hasPermission(Permissions.IssueLog.Delete) && (
          <button onClick={handleDelete}>Delete</button>
        )}
      </td>
    </tr>
  );
}
```

---

## 🐛 Debugging

### Enable Debug Logs

```tsx
// Security checks
SecurityValidator.checkBrowserSecurity();
// Output: ✅ All security checks passed

// CSRF token
console.log('[CSRF] Token:', apiClient.getCsrfToken());
// Output: [CSRF] ✅ Token initialized: 1234567890abcdef...

// Auth state
console.log('[Auth] Token:', authApi.getAccessToken());
console.log('[Auth] User:', await authApi.getCurrentUser());

// Permissions
const { permissions } = usePermission();
console.log('[Permission] User permissions:', permissions);
```

### Common Issues

1. **CSRF token không được gửi**
   - Check network tab: `X-CSRF-Token` header
   - Verify `credentials: 'include'` trong fetch options

2. **Token auto-refresh không hoạt động**
   - Check console: `[Auth] ⏰ Starting auto-refresh...`
   - Verify refresh token cookie được set từ backend

3. **Permission check luôn trả về false**
   - Check permissions array: `await authApi.getMyPermissions()`
   - Verify backend permissions được seed đúng

4. **Cross-tab sync không hoạt động**
   - Check browser support: `'BroadcastChannel' in window`
   - Verify không có lỗi trong console

---

## 📚 References

- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Auth0 Best Practices](https://auth0.com/docs/secure)
- [RFC 7519 - JWT](https://datatracker.ietf.org/doc/html/rfc7519)
- [W3C Secure Contexts](https://w3c.github.io/webappsec-secure-contexts/)
