# Naming Convention Guide

**Version:** 1.0.0  
**Last Updated:** March 17, 2026  
**Status:** ENFORCED - Compliance is mandatory

---

## 📋 Overview

This guide defines naming conventions for all code in the IT Support Client React application. **Consistency in naming is critical for code discoverability, maintainability, and team collaboration.**

---

## 🎯 Core Principles

1. **Clarity** - Names should be self-documenting
2. **Consistency** - Same patterns applied everywhere
3. **Searchability** - Easy to find via search/grep
4. **Pronounceability** - Easy to discuss in meetings
5. **Brevity** - Concise but not cryptic

---

## 📝 File & Folder Naming

### Folder Naming

**Format:** `kebab-case` (lowercase with hyphens)  
**Length:** 1-3 words max

```
✅ GOOD              ❌ BAD
features/           FEATURES/
accounts/           my-accounts/
my-account/         myAccount/
theme/              Themes/
user-management/    user_management/
```

**Special Folders:**

| Pattern | Purpose | Example |
|---------|---------|---------|
| `__tests__/` | Test files | `__tests__/` |
| `types/` | TypeScript types | `types/` |
| `utils/` | Utilities | `utils/` |
| `hooks/` | React hooks | `hooks/` |
| `components/` | React components | `components/` |

---

### File Naming by Type

#### React Components

**Format:** `PascalCase`  
**Extension:** `.tsx`  
**Rule:** One component per file  
**Naming:** Usually matches a main export

```typescript
✅ GOOD
├── AccountTable.tsx            (Component name in file)
├── AccountFormModal.tsx
└── AccountManagement.tsx

❌ BAD
├── accountTable.tsx            (not PascalCase)
├── account-table.tsx           (kebab-case for component)
├── AccountTableComponent.tsx   (redundant "Component" suffix)
└── Account_Table.tsx           (snake_case)
```

**Sub-component Pattern (if needed):**
```typescript
// Main component file
export function AccountTable() { ... }

// Sub-components inside same file - stay PascalCase
function AccountTableHeader() { ... }
function AccountTableRow() { ... }
// Don't export sub-components unless necessary
```

#### React Hooks

**Format:** camelCase with `use` prefix  
**Extension:** `.ts`  
**Rule:** Custom hooks always start with `use`  
**Length:** Descriptive but concise

```typescript
✅ GOOD
├── useAccountQuery.ts          (data fetching)
├── useAccountMutations.ts      (mutations/updates)
├── useColorBuilder.ts          (feature logic)
├── useTheme.ts                 (state management)
└── useFormValidation.ts        (utility logic)

❌ BAD
├── accountQuery.ts             (missing "use" prefix)
├── UseAccountQuery.ts          (capitalized, wrong convention)
├── use_account_query.ts        (snake_case)
├── accountQueryHook.ts         (redundant "Hook" suffix)
└── getAccountData.ts           (not a hook, use function)
```

**Hook Naming Patterns:**

| Pattern | Purpose | Example |
|---------|---------|---------|
| `use{Feature}Query.ts` | Data fetching | `useAccountQuery.ts` |
| `use{Feature}Mutations.ts` | Create/Update/Delete | `useWorkLogMutations.ts` |
| `use{Feature}{Action}.ts` | Feature-specific | `useColorBuilder.ts` |
| `use{Feature}` | General utility | `useTheme.ts` |

#### TypeScript Types & Interfaces

**Format:** PascalCase for interfaces/types  
**Extension:** `.ts`  
**File naming:** Usually matches type name or entity

```typescript
✅ GOOD
├── account.ts                  (contains Account interface)
├── accountTypes.ts             (multiple account types)
├── index.ts                    (barrel export)
└── ApiResponse.ts              (matches ApiResponse interface)

❌ BAD
├── Account.ts                  (file shouldn't start with capital unless component)
├── account-types.ts            (kebab-case for type file)
├── IAccount.ts                 (Hungarian notation)
└── AccountInterface.ts         (redundant suffix)
```

**Type Naming Patterns:**

```typescript
✅ GOOD
// Entity types
export interface Account { ... }
export interface Employee { ... }

// DTO/API Response types
export interface CreateAccountDto { ... }
export interface AccountResponse { ... }

// Query parameters
export type AccountsQueryParams = { ... }

// Union types
export type Theme = 'light' | 'dark' | BrandTheme;

// Generic wrappers
export interface ApiResponse<T> { ... }
export type AsyncState<T> = 'idle' | 'loading' | 'success' | 'error';

❌ BAD
export interface IAccount { ... }          (Hungarian notation)
export interface AccountInterface { ... }  (redundant suffix)
export type account = { ... }              (lowercase)
export interface AccountType { ... }       (redundant "Type")
```

#### Utility Functions

**Format:** camelCase or verb-based  
**Extension:** `.ts`  
**Rule:** Describe what it does  
**Naming:** Function name should match export or file purpose

```typescript
✅ GOOD
├── formatters.ts              (contains format functions)
├── validators.ts              (contains validate functions)
├── transformers.ts            (contains transform functions)
├── selectors.ts               (contains selector functions)
└── themeHelpers.ts            (contains theme helpers)

❌ BAD
├── helper.ts                  (too vague)
├── utils.ts                   (generic, no context)
├── Formatters.ts              (capitalized)
├── format-utils.ts            (kebab-case)
└── formatterFunctions.ts      (redundant "Functions")
```

**Function Naming:**

```typescript
✅ GOOD (in formatters.ts)
export function formatDate(date: Date): string { ... }
export function formatCurrency(amount: number): string { ... }
export function formatPhone(phone: string): string { ... }

✅ GOOD (in validators.ts)
export function validateEmail(email: string): boolean { ... }
export function validateAccountUsername(username: string): boolean { ... }

✅ GOOD (in selectors/transformers.ts)
export function selectAccountsById(accounts: Account[]): Map<string, Account> { ... }
export function transformApiAccountToUI(apiAccount): UiAccount { ... }

❌ BAD
export function format(data: any): string { ... }      (too generic)
export function acc_format(): string { ... }           (snake_case)
export function FormatDate(): string { ... }           (PascalCase)
export function formatDateHelper(): string { ... }     (redundant "Helper")
```

#### Constants & Enums

**Format:** `SCREAMING_SNAKE_CASE`  
**Extension:** `.ts`  
**File naming:** `constants.ts` or `{feature}Constants.ts`  
**Rule:** Use for immutable values

```typescript
✅ GOOD (in constants.ts)
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_RETRIES = 3;
export const API_TIMEOUT_MS = 5000;
export const ACCOUNT_SORT_FIELDS = ['username', 'email'] as const;

export enum AccountStatus {
  ACTIVE = 'active',
  LOCKED = 'locked',
  INACTIVE = 'inactive',
}

❌ BAD
export const defaultPageSize = 10;          (camelCase)
export const default_page_size = 10;        (snake_case)
export const DefaultPageSize = 10;          (PascalCase)
export const PAGE_SIZE_DEFAULT = 10;        (wrong order)
```

#### Test Files

**Format:** Same as tested file + `.test` or `.spec`  
**Extension:** `.ts` or `.tsx` depending on what's tested  
**Location:** `__tests__/` folder OR co-located with source

```typescript
✅ GOOD (in __tests__/)
├── AccountTable.test.tsx       (tests AccountTable component)
├── useAccountQuery.test.ts     (tests useAccountQuery hook)
└── formatters.test.ts          (tests formatters utilities)

✅ ALSO GOOD (co-located)
├── AccountTable.tsx
├── AccountTable.test.tsx
├── useAccountQuery.ts
└── useAccountQuery.test.ts

❌ BAD
├── AccountTableTest.tsx        (redundant "Test" in filename)
├── test-account-table.tsx      (wrong order, kebab-case)
├── AccountTableSpec.tsx        (use .test not .spec)
└── account.table.test.tsx      (extra dots)
```

#### Config Files

**Format:** Small case or kebab-case  
**Location:** Project root or feature root  
**Pattern:** `.config.ts` or specific purpose

```typescript
✅ GOOD
eslint.config.js
jest.config.ts
tsconfig.json
.env.example

❌ BAD
EsLintConfig.js
JEST_CONFIG.ts
jest.configuration.ts
```

---

## 🔤 Variable & Function Parameter Naming

### Local Variables

**Format:** camelCase  
**Rule:** Descriptive, no redundant types in name

```typescript
✅ GOOD
let isLoading = false;
let accountCount = 10;
let userData = { ... };
let currentTheme = 'light';
let hasPermission = true;

❌ BAD
let isLoadingBoolean = false;       (redundant type)
let account_count = 10;             (snake_case)
let AccountCount = 10;              (PascalCase)
let n = 10;                         (too short, non-descriptive)
let x = userData;                   (non-descriptive)
```

### Function Parameters

**Format:** camelCase  
**Rule:** Parameter names should indicate purpose

```typescript
✅ GOOD
function createAccount(username: string, email: string) { ... }
function handleAccountDelete(accountId: string) { ... }
function formatDate(date: Date) { ... }
function transformData(data: any, options?: TransformOptions) { ... }

❌ BAD
function createAccount(a: string, e: string) { ... }          (single letters)
function handleAccountDelete(id: string) { ... }              (too generic)
function formatDate(dateFormat: Date) { ... }                 (type in name)
function transformData(d: any, o?: TransformOptions) { ... }  (abbreviations)
```

### Boolean Variables

**Format:** Prefix with `is`, `has`, `should`, `can`  
**Rule:** Question-form naming

```typescript
✅ GOOD
let isActive = true;
let isLoading = false;
let hasPermission = true;
let canDelete = true;
let shouldRetry = false;
let isVisible = true;

❌ BAD
let active = true;        (not a question)
let loading = false;      (unclear if boolean)
let permissions = true;   (sounds like object)
let allow = true;         (ambiguous)
```

---

## 🏗️ Module & Package Naming

### Module Exports

**Format:** Export names should match their type  
**Rule:** Clear, searchable names  
**Pattern:** Match exported entity

```typescript
✅ GOOD
// In features/accounts/components/AccountTable.tsx
export function AccountTable() { ... }

// In features/accounts/hooks/useAccountQuery.ts
export function useAccountQuery() { ... }

// In features/accounts/index.ts
export { AccountTable } from './components';
export { useAccountQuery } from './hooks';

❌ BAD
// In features/accounts/components/index.tsx
export default function AccountTable() { ... }  (avoid default exports in features)

// Export names that don't match function
export { accountTable } from './components';     (name mismatch)
```

### Module Paths

**Import Path Pattern:**

```typescript
✅ GOOD (barrel exports)
import { AccountTable, useAccountQuery } from '@/features/accounts';
import { useTheme } from '@/features/theme';

✅ ALSO GOOD (specific folder imports)
import { AccountTable } from '@/features/accounts/components';
import { useAccountQuery } from '@/features/accounts/hooks';

❌ BAD (direct file imports)
import AccountTable from '@/features/accounts/components/AccountTable';
import { useAccountQuery } from '@/features/accounts/hooks/useAccountQuery';
```

---

## 🎯 API & Data Model Naming

### API Response Types

**Pattern:** `{Entity}Response` or `{Entity}Dto`  
**Format:** PascalCase

```typescript
✅ GOOD
export interface AccountResponse { ... }
export interface CreateAccountDto { ... }
export interface UpdateAccountDto { ... }
export interface PaginatedResult<T> { ... }

❌ BAD
export interface accountResponse { ... }        (camelCase)
export interface Account_Response { ... }       (snake_case)
export interface AccountResponseDTO { ... }     (DTO not as suffix convention)
```

### Query Parameters Types

**Pattern:** `{Feature}QueryParams`

```typescript
✅ GOOD
export type AccountsQueryParams = {
  page: number;
  pageSize: number;
  search?: string;
};

❌ BAD
export type AccountQuery { ... }               (ambiguous with query hook)
export type accounts_query_params { ... }      (snake_case)
export interface GetAccountsParams { ... }     (verb prefix)
```

### Mutation Functions

**Pattern:** Verb + Entity (create, update, delete, etc.)

```typescript
✅ GOOD
export async function createAccount(data: CreateAccountDto) { ... }
export async function updateAccount(id: string, data: UpdateAccountDto) { ... }
export async function deleteAccount(id: string) { ... }

❌ BAD
export async function make_account() { ... }      (snake_case)
export async function accountCreate() { ... }     (wrong order)
export async function CreateAccount() { ... }     (PascalCase for function)
```

---

## Event Handlers & Callbacks

**Format:** `handle{Action}` or `on{Action}`  
**Rule:** Describes what happens when event fires

```typescript
✅ GOOD
function handleAccountDelete(id: string) { ... }
function handleFormSubmit(data: FormData) { ... }
function onThemeChange(theme: Theme) { ... }
function onDataLoaded(data: Data) { ... }

❌ BAD
function DeleteAccount(id: string) { ... }        (PascalCase)
function delete_account(id: string) { ... }       (snake_case)
function accountDelete(id: string) { ... }        (missing handler pattern)
function onAccountDelete() { ... }                (inconsistent with other handlers)
```

---

## CSS & Styling

### Tailwind Classes

**Format:** kebab-case (Tailwind standard)

```html
✅ GOOD
<div class="bg-primary text-white p-4 rounded-lg">
  <h1 class="text-2xl font-bold">Title</h1>
</div>

❌ BAD
<div class="bgPrimary textWhite p4 roundedLg">  (camelCase)
<div class="bg_primary text_white p_4">         (snake_case)
```

### CSS Class Names

**Format:** kebab-case or BEM notation

```css
✅ GOOD (kebab-case)
.account-table { ... }
.account-form-modal { ... }
.btn-primary { ... }

✅ ALSO GOOD (BEM - if needed)
.account-table__header { ... }
.account-table__row { ... }
.account-table__row--active { ... }

❌ BAD
.AccountTable { ... }        (PascalCase)
.account_table { ... }       (snake_case)
.accountTable { ... }        (camelCase)
```

---

## Environment Variables

**Format:** `SCREAMING_SNAKE_CASE`  
**Prefix:** Feature or domain

```
✅ GOOD
VITE_API_BASE_URL=http://localhost:5000
VITE_AUTH_TOKEN_KEY=auth_token
VITE_MAX_RETRIES=3
VITE_ENABLE_DEBUG=false

❌ BAD
ViteApiBaseUrl=http://localhost:5000      (camelCase)
VITE_api_base_url=http://localhost:5000   (mixed case)
API_URL=http://localhost:5000             (missing prefix)
```

---

## 💡 Special Cases & Patterns

### Acronyms in Names

**Rule:** Treat as single word in camelCase

```typescript
✅ GOOD
var httpClient = new HttpClient();
var userId = "user-123";
var parseXml = () => {};
var htmlContent = "<div></div>";

❌ BAD
var HTTPClient = new HTTPClient();        (all caps)
var UserID = "user-123";                  (capitalize ID)
var parseXML = () => {};                  (split X and ML)
```

### Abbreviations in Names

**Rule:** Avoid abbreviations - prefer full words

```typescript
✅ GOOD
let isVisible = true;
let userData = { ... };
let handleRequest = () => {};
let validateEmail = () => {};

❌ BAD
let isVis = true;              (abbreviated)
let uData = { ... };           (abbreviated)
let hdlReq = () => {};         (unclear acronyms)
let valEmail = () => {};       (abbreviated function)
```

### Numbers in Names

**Rule:** Only if meaningful to domain

```typescript
✅ GOOD
const HTTP_STATUS_404 = 404;
const MAX_RETRIES_3 = 3;
const VERSION_2_API = 'v2';

❌ BAD
const var1 = "value";         (meaningless)
const func2 = () => {};       (implies multiple versions)
```

---

## ✅ Enforcement & Testing

### Linting Rules

```json
{
  "rules": {
    "naming-convention": [
      "error",
      {
        "selector": "variable",
        "format": ["camelCase"]
      },
      {
        "selector": "function",
        "format": ["camelCase"]
      },
      {
        "selector": "typeLike",
        "format": ["PascalCase"]
      }
    ]
  }
}
```

### Pre-commit Hooks

Run linting before commit:
```bash
eslint --fix src/
prettier --write src/
```

---

## 📚 Quick Reference Table

| Item | Format | Example |
|------|--------|---------|
| Folder | kebab-case | `accounts/`, `my-account/` |
| Component File | PascalCase | `AccountTable.tsx` |
| Hook File | camelCase + use | `useAccountQuery.ts` |
| Type File | camelCase or PascalCase | `account.ts`, `Account.ts` |
| Utility File | camelCase | `formatters.ts` |
| Test File | .test.ts(x) | `AccountTable.test.tsx` |
| Constant | SCREAMING_SNAKE_CASE | `DEFAULT_PAGE_SIZE` |
| Enum | PascalCase members | `AccountStatus.ACTIVE` |
| Variable | camelCase | `isLoading`, `accountData` |
| Function | camelCase | `handleDelete()`, `formatDate()` |
| Type/Interface | PascalCase | `Account`, `CreateAccountDto` |
| Handler | handle{Action} | `handleAccountDelete()` |
| Callback | on{Action} | `onThemeChange()` |
| Boolean | is/has/should/can | `isActive`, `hasPermission` |
| CSS Class | kebab-case | `.account-table` |
| Env Variable | SCREAMING_SNAKE_CASE | `VITE_API_BASE_URL` |

---

## ❓ frequently Asked Questions

**Q: Should I use `use` prefix for non-hook utilities?**  
A: No. The `use` prefix is exclusive to React hooks. Regular utilities should not use it.

**Q: Can I use abbreviations in variable names?**  
A: Generally no, unless they're well-established (e.g., `id`, `url`). Prefer clarity.

**Q: Should types have suffix like `Type` or `Interface`?**  
A: No. The filename and context should be clear. Don't add redundant suffixes.

**Q: When should I use `on` vs `handle` for callbacks?**  
A: Both are acceptable. `on` → event listeners, `handle` → event handlers. Stay consistent per module.

**Q: Can I use numbers in variable names?**  
A: Only if meaningful (e.g., `version2Api`). Random numbers like `var1` are not acceptable.

---

## 📞 Questions or Issues?

If you encounter naming patterns not covered here:
1. Document the case
2. Discuss with team
3. Update this guide
4. Apply consistently going forward

---

**This is the single source of truth for naming conventions.**

**Compliance Level:** 🔴 MANDATORY

**Last Reviewed:** March 17, 2026
