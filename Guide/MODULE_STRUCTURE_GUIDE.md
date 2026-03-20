# Module Structure Standard Guide

**Version:** 1.0.0  
**Last Updated:** March 17, 2026  
**Status:** APPROVED Standard for All Features

---

## 📋 Overview

This guide defines the standard folder structure and organization pattern for ALL feature modules in the IT Support Client React application. **Compliance with this standard is mandatory for all modules.**

### Why This Matters
- **Consistency:** All modules follow same pattern
- **Discoverability:** Developers can find files quickly
- **Scalability:** Easy to add new modules
- **Maintainability:** Clear organization reduces confusion
- **Onboarding:** New developers learn one pattern

### Standards Reference
- ✅ Redux Toolkit Style Guide: "Structure Files as Feature Folders"
- ✅ Google JavaScript Style Guide: Folder Organization
- ✅ Airbnb JavaScript Style Guide: Code Organization
- ✅ Next.js Recommended Architecture
- ✅ React Community Best Practices

---

## 📁 Standard Module Structure

### Complete Template

```
features/{moduleName}/
│
├── components/                          # UI Components
│   ├── {ComponentName}.tsx             # Component file
│   ├── {ComponentName}.tsx
│   └── index.ts                        # Barrel export
│
├── hooks/                              # React Hooks
│   ├── use{ModuleName}Query.ts        # Data fetching hook
│   ├── use{ModuleName}Mutations.ts    # Mutations hook (if needed)
│   ├── use{CustomName}.ts             # Custom hooks
│   └── index.ts                        # Barrel export
│
├── types/                              # TypeScript Types
│   ├── {moduleName}.ts                # Type definitions
│   ├── {moduleName}.models.ts         # Data models (if needed)
│   └── index.ts                        # Barrel export
│
├── utils/                              # Utilities & Helpers
│   ├── {utilityName}.ts               # Helper functions
│   ├── formatters.ts                  # Formatting utilities (optional)
│   └── index.ts                        # Barrel export
│
├── constants.ts                        # Module Constants
│
├── __tests__/                          # Test Files
│   ├── {componentName}.test.tsx       # Component tests
│   ├── {hookName}.test.ts             # Hook tests
│   └── {utilityName}.test.ts          # Utility tests
│
└── index.ts                            # Main Module Export
```

### Minimum Required Structure

For small modules, minimum structure is:

```
features/{moduleName}/
├── components/
│   └── index.ts
├── hooks/
│   └── index.ts
├── types/
│   └── index.ts
├── constants.ts
└── index.ts
```

---

## 📝 File Organization Rules

### 1. Components Folder (`components/`)

**Purpose:** React UI components  
**File Type:** `.tsx`  
**Naming:** PascalCase  
**Requirement:** ✅ MANDATORY for all modules

**Example:**
```typescript
// features/accounts/components/AccountTable.tsx
export function AccountTable() { ... }
export function AccountFormModal() { ... }
```

**Best Practice:**
- One component per file
- Export named component, not default
- index.ts for barrel exports

**index.ts Example:**
```typescript
// features/accounts/components/index.ts
export { AccountTable } from './AccountTable';
export { AccountFormModal } from './AccountFormModal';
export { AccountManagement } from './AccountManagement';
```

### 2. Hooks Folder (`hooks/`)

**Purpose:** React Hooks (custom & data fetching)  
**File Type:** `.ts`  
**Naming:** camelCase with `use` prefix  
**Requirement:** ✅ MANDATORY for data-driven modules

**Naming Convention:**

| Hook Type | Pattern | Example |
|-----------|---------|---------|
| Data Query | `use{Module}Query.ts` | `useAccountQuery.ts` |
| Mutations | `use{Module}Mutations.ts` | `useWorkLogMutations.ts` |
| Custom | `use{Feature}[Action].ts` | `useColorBuilder.ts` |
| Helper | ❌ NOT in hooks/ (use utils/) | ❌ useUtils.ts |

**Example:**
```typescript
// features/accounts/hooks/useAccountQuery.ts
export function useAccountQuery() { ... }
```

**index.ts Example:**
```typescript
// features/accounts/hooks/index.ts
export { useAccountQuery } from './useAccountQuery';
export { useAccountMutations } from './useAccountMutations';
```

### 3. Types Folder (`types/`)

**Purpose:** TypeScript type definitions & interfaces  
**File Type:** `.ts`  
**Naming:** camelCase or kebab-case  
**Requirement:** ✅ MANDATORY for modules with domain types

**Naming Convention:**

| Type | Pattern | Example |
|------|---------|---------|
| Entity Types | `{entity}.ts` | `account.ts` |
| API Models | `{entity}.api.ts` | `account.api.ts` |
| UI Models | `{entity}.dto.ts` | `account.dto.ts` |
| All Types | `index.ts` exports | index.ts |

**Example:**
```typescript
// features/accounts/types/account.ts
export interface Account {
  accountId: string;
  username: string;
  email: string;
}

export type AccountsQueryParams = {
  page: number;
  pageSize: number;
  search?: string;
};
```

**index.ts Example:**
```typescript
// features/accounts/types/index.ts
export type { Account, CreateAccountDto, UpdateAccountDto } from './account';
export type { AccountsQueryParams } from './account';
```

### 4. Utils Folder (`utils/`)

**Purpose:** Helper functions, formatters, validators  
**File Type:** `.ts`  
**Naming:** camelCase or kebab-case  
**Requirement:** ⚠️ CONDITIONAL (only if module has utilities)

**Naming Convention:**

| Utility | Pattern | Example |
|---------|---------|---------|
| Helpers | `{action}.ts` | `formatters.ts` |
| Transformers | `{entity}Transformers.ts` | `accountTransformers.ts` |
| Validators | `{entity}Validators.ts` | `accountValidators.ts` |
| Selectors | `{entity}Selectors.ts` | `accountSelectors.ts` |

**Example:**
```typescript
// features/accounts/utils/accountTransformers.ts
export function transformApiAccountToUI(apiAccount) { ... }
export function transformUIAccountToApi(uiAccount) { ... }
```

**index.ts Example:**
```typescript
// features/accounts/utils/index.ts
export { transformApiAccountToUI, transformUIAccountToApi } from './accountTransformers';
export { validateAccountEmail, validateAccountUsername } from './accountValidators';
```

### 5. Constants File (`constants.ts`)

**Purpose:** Module-level constants, enums, static lists  
**File Type:** `.ts`  
**Naming:** SCREAMING_SNAKE_CASE for constants  
**Requirement:** ⚠️ CONDITIONAL (only if module has constants)

**Example:**
```typescript
// features/accounts/constants.ts
export const ACCOUNT_SORT_FIELDS = ['username', 'email', 'createdDate'] as const;
export const DEFAULT_PAGE_SIZE = 10;

export enum AccountStatus {
  ACTIVE = 'active',
  LOCKED = 'locked',
  INACTIVE = 'inactive',
}
```

### 6. Tests Folder (`__tests__/`)

**Purpose:** Unit & integration tests  
**File Type:** `.test.ts`, `.test.tsx`  
**Organization:** ⚠️ CAN ALSO be co-located with source files  
**Requirement:** ✅ MANDATORY for critical modules

**Pattern Options:**

**Option A: Centralized in __tests__/ (Recommended for large modules)**
```
__tests__/
├── AccountTable.test.tsx
├── useAccountQuery.test.ts
└── accountTransformers.test.ts
```

**Option B: Co-located with source (OK for small modules)**
```
components/
├── AccountTable.tsx
└── AccountTable.test.tsx

hooks/
├── useAccountQuery.ts
└── useAccountQuery.test.ts
```

**Best Practice:** Use __tests__/ for main component tests, co-locate for utils.

### 7. Main Export File (`index.ts`)

**Purpose:** Barrel export for the entire module  
**Requirement:** ✅ MANDATORY

**Example:**
```typescript
// features/accounts/index.ts
// Re-export from subfolders
export * from './components';
export * from './hooks';
export * from './types';
export * from './utils';
export * from './constants';

// Or explicit exports (preferred for clarity)
export { AccountManagement, AccountTable, AccountFormModal } from './components';
export { useAccountQuery, useAccountMutations } from './hooks';
export type { Account, AccountsQueryParams } from './types';
export { DEFAULT_PAGE_SIZE, ACCOUNT_SORT_FIELDS } from './constants';
```

---

## 🎯 Specific Module Requirements

### Data Management Modules
**Pattern:** accounts, areas, departments, employees, issues, roles  
**Required Folders:** components/ + hooks/ + types/ + utils/ (if needed) + __tests__/

```
features/{moduleName}/
├── components/
│   ├── {Module}Management.tsx
│   ├── {Module}Table.tsx
│   ├── {Module}FormModal.tsx
│   └── index.ts
├── hooks/
│   ├── use{Module}Query.ts
│   ├── use{Module}Mutations.ts (if create/update/delete)
│   └── index.ts
├── types/
│   └── index.ts
├── utils/
│   └── index.ts
├── constants.ts
├── __tests__/
└── index.ts
```

### Complex Feature Modules
**Pattern:** theme, workLogs  
**Special Rules:**
- Separate concerns: helpers ≠ hooks
- Types in dedicated folder
- Utils for transformers/formatters
- Keep __tests__/ separate from hooks/

```
features/{complexModule}/
├── components/
├── hooks/
├── types/
├── utils/
├── constants.ts
├── __tests__/
└── index.ts
```

### Authentication Module
**Pattern:** auth  
**Special Rules:**
- Types should be in types/ folder
- Can have services/ subfolder if complex
- May have configuration/constants

```
features/auth/
├── components/
│   └── LoginPage.tsx
├── hooks/
│   ├── useAuthQuery.ts (if needed)
│   └── index.ts
├── types/
│   ├── auth.ts
│   └── index.ts
├── services/ (optional)
│   └── authService.ts
├── constants.ts
└── index.ts
```

### Dashboard Module
**Pattern:** dashboard  
**Special Rules:**
- May not have mutations hooks
- Focus on data presentation
- Use hooks for data aggregation

```
features/dashboard/
├── components/
│   ├── AdminDashboard.tsx
│   ├── EmployeeDashboard.tsx
│   └── index.ts
├── hooks/
│   ├── useDashboardData.ts
│   └── index.ts
├── types/
│   └── index.ts
└── index.ts
```

### User Account Module
**Pattern:** myAccount  
**Special Rules:**
- Can have sub-features (Profile, Security, Preferences)
- Use hooks for profile management

```
features/myAccount/
├── components/
│   ├── MyAccountManagement.tsx
│   └── index.ts
├── hooks/
│   ├── useMyProfile.ts
│   └── index.ts
├── types/
│   └── index.ts
└── index.ts
```

---

## 📋 Import Standards

### ✅ Recommended Import Patterns

```typescript
// Using barrel exports (preferred)
import { AccountManagement, useAccountQuery } from '@/features/accounts';
import type { Account } from '@/features/accounts';

// Specific imports when needed
import { AccountTable } from '@/features/accounts/components';
import { useAccountQuery } from '@/features/accounts/hooks';
```

### ❌ Anti-Patterns

```typescript
// Don't do this - too verbose
import AccountManagement from '@/features/accounts/components/AccountManagement';

// Don't do this - breaks encapsulation
import { useAccountQuery } from '@/features/accounts/hooks/useAccountQuery';

// Don't do this - import internal details
import { transformData } from '@/features/accounts/utils/transformers';
// Instead use module export
```

---

## 🔍 Validation Checklist

Before publishing a module, verify:

- [ ] All folders follow naming convention (kebab-case for folders)
- [ ] All files follow naming convention (PascalCase for components, camelCase for others)
- [ ] Components are in components/ folder
- [ ] Hooks are in hooks/ folder (not in utils/)
- [ ] Types are in types/ folder (not mixed with hooks/)
- [ ] Utils don't contain hooks or types
- [ ] __tests__/ folder exists for main tests
- [ ] index.ts exists in each subfolder
- [ ] Main index.ts at module root exists
- [ ] No circular dependencies
- [ ] No direct imports from nested folders (use barrel exports)
- [ ] TypeScript compilation with no errors
- [ ] All imports resolve correctly

### Automated Validation

**ESLint Rules to Enforce:**
```json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          "@/features/*/hooks/*",
          "@/features/*/components/*",
          "@/features/*/utils/*",
          "@/features/*/types/*"
        ],
        "message": "Use barrel exports from module root instead"
      }
    ]
  }
}
```

---

## 🚀 Migration Path (For Existing Modules)

### Step 1: Create Missing Folders
```bash
mkdir -p features/{moduleName}/{types,utils,__tests__,hooks,components}
```

### Step 2: Create index.ts Files
```bash
touch features/{moduleName}/index.ts
touch features/{moduleName}/hooks/index.ts
touch features/{moduleName}/components/index.ts
touch features/{moduleName}/types/index.ts
touch features/{moduleName}/utils/index.ts
```

### Step 3: Move Files to Correct Locations

**Theme Module Example:**
- ✅ Keep: useColorBuilder.ts, useTheme.ts, etc. in hooks/
- 🔄 Move: themeHelpers.ts → utils/themeHelpers.ts
- 🔄 Move: themeTypes.ts → types/themeTypes.ts
- 🔄 Move: useTheme.test.ts → __tests__/useTheme.test.ts

### Step 4: Create Barrel Exports

### Step 5: Update Imports Throughout App

### Step 6: Validate & Test

---

## 📚 References & Best Practices

### Industry Standards Applied

1. **Redux Toolkit Style Guide**
   - "Structure Files as Feature Folders with Single-File Logic"
   - https://redux.js.org/style-guide/
   - ✅ Applied: Feature-based organization

2. **Google JavaScript Style Guide**
   - Folder organization principles
   - https://google.github.io/styleguide/javascriptguide.html
   - ✅ Applied: Consistent naming conventions

3. **Airbnb JavaScript Style Guide**
   - Code organization and structure
   - https://github.com/airbnb/javascript
   - ✅ Applied: Clean architecture patterns

4. **Next.js Recommended Architecture**
   - Co-location of related code
   - https://nextjs.org/docs
   - ✅ Applied: Feature-based folder structure

5. **React Community Best Practices**
   - Component organization
   - https://react.dev/
   - ✅ Applied: Component-focused structure

6. **Clean Code Principles (Robert C. Martin)**
   - Single Responsibility Principle
   - DRY (Don't Repeat Yourself)
   - ✅ Applied: Clear separation of concerns

---

## 🎓 Examples by Module Type

### Example 1: Data Management (Accounts)
✅ Standard CRUD module with form & table

### Example 2: Complex Feature (Theme)
⚠️ Requires careful organization of helpers & hooks

### Example 3: Authentication (Auth)
🔐 Special handling for auth types & logic

---

## ❓ FAQ

**Q: Can I skip the types/ folder?**  
A: Only if module has no types. Use global types/data.ts as fallback, but document why.

**Q: Should tests be in __tests__/ or co-located?**  
A: Both acceptable. Use __tests__/ for large modules, co-location for small utilities.

**Q: Can I have nested component folders?**  
A: Only if you have 10+ components. Keep it flat otherwise.

**Q: What about services/ or api/ folders?**  
A: Use hooks/ for API calls. Create services/ only for complex business logic.

---

## 📞 Questions or Issues?

If you encounter cases not covered in this guide:
1. Document the case
2. Discuss with architecture team
3. Update this guide with decision
4. Notify all developers

---

**This guide is the single source of truth for module structure in this project.**

**Compliance Level:** 🔴 MANDATORY

**Last Reviewed:** March 17, 2026
