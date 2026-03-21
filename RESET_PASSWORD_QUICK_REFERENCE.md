# Reset Password Feature - Quick Reference

## 🔄 User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     User sees Login Page                         │
│              [Login form] [Forgot password?]                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│            User clicks "Forgot password?" button                 │
│         Modal appears: Enter email or username                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│    POST /api/auth/forgot-password                               │
│    Request: { email: "user@example.com" }                       │
│    Response: 200 OK                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Backend sends email with link                       │
│    https://localhost:3000/reset-password?token=<secure-token>  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│            User clicks link in email                             │
│         ResetPasswordPage component loads                        │
│    Token extracted from URL query parameters                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Reset Password Form                             │
│    [New Password input] [Show/Hide toggle]                      │
│    [Password requirements checklist]                            │
│    [Confirm Password input] [Show/Hide toggle]                  │
│    [Reset Password button]                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
            Invalid password    Valid password
                    │                   │
                    ▼                   ▼
        Show field errors      Submit form
                            POST /api/auth/reset-password
                            Request: ResetPasswordDto
                                    {
                                      token,
                                      newPassword,
                                      confirmPassword
                                    }
                                    │
                        ┌───────────┴────────────┐
                        │                        │
                    Success(200)            Error (401/400/500)
                        │                        │
                        ▼                        ▼
            Show success page             Show error message
            "Password reset"              Offer retry or new link
            Redirect to login             Links back to forgot password
            after 2 seconds                        │
                        │                        ▼
                        └─────────────────────────┘
                                    │
                                    ▼
                        ┌─────────────────────────┐
                        │  User logs in page      │
                        │ with new password       │
                        └─────────────────────────┘
```

---

## 📁 Component Files

### `ResetPasswordPage.tsx`
**Purpose:** Main reset password form component

**Key Props:**
```typescript
interface ResetPasswordPageProps {
  onResetSuccess?: () => void;  // Called on successful reset
}
```

**Features:**
- ✅ Token extraction from `?token=` query param
- ✅ Password complexity validation
- ✅ Real-time validation feedback
- ✅ Password visibility toggle
- ✅ Error handling & display
- ✅ Success screen with auto-redirect
- ✅ Invalid token handling

**States:**
```typescript
token                    // Secure token from URL
newPassword              // User input for new password
confirmPassword          // User input to confirm password
showNewPassword          // Toggle password visibility
showConfirmPassword      // Toggle confirm password visibility
fieldErrors              // { newPassword: [], confirmPassword: [] }
error                    // General error message
isLoading               // Form submission loading state
isSuccess               // Form submission success state
isTokenInvalid          // Token invalid/expired state
```

---

## 🔐 Password Validation Rules

### Implemented via `passwordValidation.ts`

```typescript
✓ REQUIRED: Minimum 8 characters
✓ REQUIRED: At least one UPPERCASE letter (A-Z)
✓ REQUIRED: At least one LOWERCASE letter (a-z)
✓ REQUIRED: At least one NUMBER (0-9)
✓ REQUIRED: At least one SPECIAL CHARACTER (!@#$%^&*)

// Example VALID passwords:
- "MyPassword123!"
- "Secure@Pass2024"
- "Test123!NewPass"

// Example INVALID passwords:
- "password123"      ← NO UPPERCASE
- "PASSWORD123!"    ← NO LOWERCASE
- "Password!"       ← NO NUMBER
- "Password123"     ← NO SPECIAL CHARACTER
- "Pass1!"          ← TOO SHORT (< 8 chars)
```

---

## 🌐 API Integration

### Auth Service (`src/services/api/auth.ts`)

```typescript
// Method 1: Request password reset (LoginPage uses this)
await authApi.forgotPassword(emailOrUsername: string)
// POST /api/auth/forgot-password
// Request: "user@example.com" or "username"
// Response: 200 OK (no body)
// Errors: 400, 429

// Method 2: Reset password with token (ResetPasswordPage uses this)
await authApi.resetPassword(dto: ResetPasswordDto)
// POST /api/auth/reset-password
// Request: {
//   token: "eyJhbGciOi...",
//   newPassword: "MyNewPassword123!",
//   confirmPassword: "MyNewPassword123!"
// }
// Response: 200 OK (no body)
// Errors: 400, 401, 500
```

---

## 🎯 Error Handling

### Error Scenarios

| Scenario | Status | UI Response | User Action |
|----------|--------|------------|-------------|
| Token expired/invalid | 401 | Show error page | Request new reset link |
| Password too weak | 400 | Show field errors | Improve password |
| Passwords don't match | (client) | Show field error | Retype confirm |
| Network error | Network | Show error alert | Retry |
| Server error | 500 | Show error alert | Contact support |

### Recovery Paths

```
Invalid Token Error
└─ "Request new password reset link"
   └─ Link back to login forgot password modal

Field Validation Error
└─ Show specific field error
└─ User can fix and retry
└─ Button disabled until valid

Network Error
└─ Show error message
└─ User can retry form
└─ Maintains form data (except passwords for security)
```

---

## 🎨 UI Components Used

| Component | Usage | File |
|-----------|-------|------|
| `ErrorAlert` | Display errors | `components/common/ErrorAlert.tsx` |
| `FieldError` | Show field-level errors | `components/common/FieldError.tsx` |
| `LoadingSpinner` | Show loading state | `components/common/LoadingSpinner.tsx` |
| `Eye/EyeOff` (Lucide) | Password visibility toggle | lucide-react |

---

## 🚀 Integration Points

### 1. LoginPage (Existing)
- Already has "Forgot password?" button
- Shows modal for email/username input
- Calls `authApi.forgotPassword()`
- No changes needed ✅

### 2. App.tsx (Updated)
- Added lazy loading for ResetPasswordPage
- Added route detection for `/reset-password`
- Shows ResetPasswordPage before auth check
- Redirect to login on success ✅

### 3. Auth Service (Existing)
- `resetPassword()` method already exists
- Calls `POST /api/auth/reset-password`
- Handles CSRF token automatically
- No changes needed ✅

---

## 📱 Mobile Responsiveness

The component uses Tailwind CSS responsive classes:
```
- max-w-md: Fixed width for form container
- p-4: Padding for mobile, adjusts with screen size
- flex/items-center: Centered layout both ways
- text-sm: Responsive text sizing
- w-full: Full width on mobile
```

**Responsive Breakpoints:**
```
Mobile (< 640px):   Form takes full width with padding
Tablet (640-1024px): Form centered with max-width
Desktop (> 1024px):  Form centered, max-width applied
```

---

## 🔒 Security Checklist

- ✅ Token never logged or exposed
- ✅ Password not stored in state beyond submission
- ✅ CSRF token automatically included
- ✅ Password complexity enforced (OWASP)
- ✅ No authentication required for reset
- ✅ Token validation on backend
- ✅ Rate limiting on forgot-password endpoint
- ✅ HTTPS recommended for production

---

## 📊 Component Dependencies

```
ResetPasswordPage
├── react (hooks)
├── lucide-react (Eye, EyeOff, FileText, AlertCircle, CheckCircle)
├── @components/common
│   ├── ErrorAlert
│   ├── FieldError
│   └── LoadingSpinner
├── @services/api/auth
│   └── authApi.resetPassword()
├── @utils/apiErrors
│   └── parseApiError()
└── @utils/validation/passwordValidation
    ├── validatePasswordComplexity()
    └── validatePasswordsMatch()
```

---

## 🧪 Testing Checklist

### Form Submission
- [ ] Valid password → Submit succeeds
- [ ] Invalid password → Show errors
- [ ] Mismatched passwords → Show error
- [ ] Network error → Show error alert
- [ ] Expired token → Show token error

### Password Validation
- [ ] 8+ characters check works
- [ ] Uppercase check works
- [ ] Lowercase check works
- [ ] Number check works
- [ ] Special char check works
- [ ] All checks required to enable button

### UI/UX
- [ ] Password visibility toggle works
- [ ] Form loads on /reset-password?token=...
- [ ] Without token → Shows error page
- [ ] Success page shows after reset
- [ ] Redirects to login after 2 seconds
- [ ] Mobile layout responsive
- [ ] Error messages clear on input

### Security
- [ ] Token in URL (not body)
- [ ] CSRF token included in request
- [ ] Can't submit without valid password
- [ ] Passwords not exposed in network tab
- [ ] No token persistence

---

## 🛠️ Development Commands

```bash
# Install dependencies (if needed)
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run tests
npm run test

# Type check
npm run type-check
```

---

## 📌 Key Files to Know

| File | Purpose | Modified |
|------|---------|----------|
| `ResetPasswordPage.tsx` | Main form component | ✨ NEW |
| `passwordValidation.ts` | Validation utility | ✨ NEW |
| `App.tsx` | Route integration | ✏️ Updated |
| `auth.ts` | API service | ✓ Existing |
| `LoginPage.tsx` | Forgot password modal | ✓ Existing |
| `auth.ts` (types) | Type definitions | ✓ Existing |

---

## 🎓 Learning Resources

**Password Security:**
- https://owasp.org/www-community/controls/Password_strength
- https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

**React Patterns:**
- https://react.dev/
- https://react.dev/learn/thinking-in-react

**Email Security:**
- https://owasp.org/www-community/attacks/Email_Injection

---

## ❓ FAQ

**Q: What if user doesn't receive the email?**
A: They can retry the forgot password form. Check spam folder. Contact admin if persistent.

**Q: How long is the reset token valid?**
A: Set on backend (not exposed in frontend). Typically 24-48 hours. Check backend config.

**Q: Can a token be used multiple times?**
A: No, typically one-time use on backend. Check backend implementation for confirmation.

**Q: Can I customize password requirements?**
A: Yes, edit validation rules in `passwordValidation.ts`. Update error messages to match.

**Q: Is password sent to backend securely?**
A: Yes, via HTTPS (required for production). CSRF token included. Validate backend enforces HTTPS.

**Q: Can I track password reset attempts?**
A: Yes, add logging in `handleSubmit()`. Log to monitoring/analytics service.

---

