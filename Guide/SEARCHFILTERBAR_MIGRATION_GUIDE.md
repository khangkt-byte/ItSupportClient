# SearchFilterBar Migration Guide

## Overview

This guide documents the migration of all management components to use the new **enterprise-grade SearchFilterBar** component with server-side pagination, filtering, and sorting.

## ✅ Completed Components

### 1. **Accounts Management** - ✅ COMPLETE
**File:** `src/features/accounts/components/AccountManagement.tsx`

**Features Implemented:**
- ✅ Server-side search (username, employee name, employee code)
- ✅ Filter by status (All / Active / Locked)
- ✅ Sort by: username, empName, empCode, createdAt, lastLoginAt, isLocked
- ✅ Pagination with page size selection (10, 20, 50, 100)
- ✅ Professional UI following Microsoft Fluent 2 + Material Design patterns

**QueryParams Used:**
```typescript
interface AccountsQueryParams extends QueryParams {
  isLocked?: boolean | null; // null = all, true = locked, false = active
}
```

### 2. **Employees Management** - ✅ COMPLETE  
**File:** `src/features/employees/components/EmployeeManagement.tsx`

**Features Implemented:**
- ✅ Server-side search (empCode, fullName, email)
- ✅ Filter by Department
- ✅ Sort by: fullName, empCode, email, position, createdAt
- ✅ Pagination with Microsoft 365-style controls
- ✅ Loading states and error handling

**QueryParams Used:**
```typescript
interface EmployeesQueryParams extends QueryParams {
  dptId?: number | null;   // Filter by department
  areaId?: number | null;  // Filter by area (ready for future use)
}
```

**Implementation Pattern:**
```typescript
const [queryParams, setQueryParams] = useState<EmployeesQueryParams>({
  page: 1,
  pageSize: 10,
  search: '',
  sortBy: 'fullName',
  isDescending: false,
  dptId: null,
  areaId: null,
});

const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<ListEmployeeDto> | null>(null);

// Fetch data from server
const fetchEmployees = useCallback(async () => {
  const result = await employeesApi.getAll(queryParams);
  setPaginatedResult(result);
}, [queryParams]);

useEffect(() => {
  fetchEmployees();
}, [fetchEmployees]);
```

---

## 🔄 Pending Components

### 3. **Work Logs Management** - ⏳ PENDING (Complex)
**File:** `src/features/workLogs/components/WorkLogManagement.tsx`

**Current State:**
- ❌ Uses client-side filtering (`usePagination` hook)
- ❌ Local search and status filter
- ✅ Already has complex features (Excel import/export, KB autocomplete)

**Recommended Implementation:**
```typescript
interface WorkLogsQueryParams extends QueryParams {
  status?: string | null;  // 'pending' | 'in-progress' | 'resolved' | 'cancelled'
  dptId?: number | null;   // Filter by department
  areaId?: number | null;  // Filter by area
  issueId?: number | null; // Filter by issue type
}
```

**Migration Steps:**
1. Replace `searchQuery` + `statusFilter` state with `queryParams: WorkLogsQueryParams`
2. Replace `const filtered = useMemo(...` with `await workLogsApi.getAll(queryParams)`
3. Replace search/filter UI with:
```tsx
<SearchFilterBar
  queryParams={queryParams}
  onQueryChange={setQueryParams}
  paginatedResult={paginatedResult}
  filterOptions={[
    { label: 'All Status', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Cancelled', value: 'cancelled' },
  ]}
  currentFilter={queryParams.status || 'all'}
  onFilterChange={(value) =>
    setQueryParams({
      ...queryParams,
      status: value === 'all' ? null : value,
      page: 1,
    })
  }
  sortOptions={[
    { label: 'Date Reported', value: 'dateReported' },
    { label: 'Operator', value: 'operator' },
    { label: 'Status', value: 'status' },
    { label: 'Department', value: 'department' },
  ]}
  placeholder="Search work logs..."
/>
```
4. Remove `usePagination` hook and `Pagination` component imports
5. Update table to use `paginatedResult.items`
6. Add Microsoft 365-style pagination controls (see EmployeeManagement for reference)

**⚠️ Special Considerations:**
- Keep all existing features (Excel import/export, KB autocomplete, stats cards)
- Only replace the search/filter/pagination parts
- Test import/export functionality after migration

---

### 4. **Roles Management** - ⏳ PENDING (Simple)
**File:** `src/features/roles/components/RoleManagement.tsx`

**Current State:**
- ❌ No pagination (displays all roles in grid)
- ❌ No search functionality
- ✅ Professional card-based UI

**Recommended Implementation:**
```typescript
const [queryParams, setQueryParams] = useState<RolesQueryParams>({
  page: 1,
  pageSize: 12, // Grid works better with 12 items (3x4 or 4x3)
  search: '',
  sortBy: 'name',
  isDescending: false,
});
```

**Migration Steps:**
1. Add server-side fetch: `const result = await rolesApi.getAll(queryParams)`
2. Add SearchFilterBar above the grid:
```tsx
<SearchFilterBar
  queryParams={queryParams}
  onQueryChange={setQueryParams}
  paginatedResult={paginatedResult}
  filterOptions={[]}  // No filters needed for roles
  currentFilter="all"
  onFilterChange={() => {}}
  sortOptions={[
    { label: 'Name', value: 'name' },
    { label: 'Created Date', value: 'createdAt' },
    { label: 'Permission Count', value: 'claimCount' },
  ]}
  placeholder="Search roles..."
/>
```
3. Keep the grid layout (don't change to table)
4. Add pagination controls below the grid

---

### 5. **Areas Management** - ⏳ PENDING (Simple)
**File:** `src/features/areas/components/AreaManagement.tsx`

**Current State:**
- ❌ No pagination (displays all areas in grid)
- ❌ No search functionality

**Option A: Keep Grid + Add SearchFilterBar (Recommended for small datasets)**
```typescript
const [queryParams, setQueryParams] = useState<AreasQueryParams>({
  page: 1,
  pageSize: 12,
  search: '',
  sortBy: 'name',
  isDescending: false,
});
```

**Option B: Convert to Table + SearchFilterBar (Better for large datasets)**
```typescript
// Replace grid with table similar to EmployeeManagement
<table className="w-full">
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Created Date</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {paginatedResult?.items.map(area => (
      <tr key={area.id}>...</tr>
    ))}
  </tbody>
</table>
```

**Recommendation:** Use **Option A** (Grid) if typically < 50 areas, **Option B** (Table) if > 50 areas.

---

### 6. **Departments Management** - ⏳ PENDING (Simple)
**File:** `src/features/areas/components/DepartmentManagement.tsx`

**Current State:**
- ❌ No pagination (displays all departments in grid)
- ❌ No search functionality
- ✅ Already uses API (departmentApi.getAll, create, update, delete)

**Migration Steps:**
1. Update API call to pass queryParams:
```typescript
const result = await departmentApi.getAll(queryParams);
```

2. Add SearchFilterBar:
```tsx
<SearchFilterBar
  queryParams={queryParams}
  onQueryChange={setQueryParams}
  paginatedResult={paginatedResult}
  filterOptions={[]}
  currentFilter="all"
  onFilterChange={() => {}}
  sortOptions={[
    { label: 'Name', value: 'name' },
    { label: 'Description', value: 'description' },
    { label: 'Created Date', value: 'createdAt' },
  ]}
  placeholder="Search departments..."
/>
```

3. Keep grid layout (similar to Areas)

---

## UI Design Best Practices Applied

### **1. Nielsen Norman Group - Filters vs Facets**
**Source:** https://www.nngroup.com/articles/filters-vs-facets/

**Applied Principles:**
- ✅ **Clear Visual Hierarchy:** Search → Filter → Sort → Results
- ✅ **Low Interaction Cost:** One-click filter changes, no hidden controls
- ✅ **Faceted Navigation:** Multiple dimensions (search, department, status) for complex data
- ✅ **Active Filter Indicators:** Chips/badges show active filters (e.g., `Search: "john"`, `Filter: Active`)

### **2. Microsoft Fluent UI 2**
**Source:** https://fluent2.microsoft.design/

**Applied Design Tokens:**
- ✅ **Spacing:** 4px/8px grid system (px-3, py-2, gap-2, gap-3)
- ✅ **Border Radius:** rounded-lg (8px), rounded-full (pills)
- ✅ **Elevation:** shadow-sm, shadow-md, shadow-lg for depth hierarchy
- ✅ **Hover States:** hover:bg-accent/50, hover:border-input
- ✅ **Focus Rings:** focus:ring-2 focus:ring-primary-500/20
- ✅ **Typography:** font-medium for labels, font-semibold for headers

### **3. Google Material Design - Data Tables**
**Source:** https://m2.material.io/components/data-tables

**Applied Patterns:**
- ✅ **Chip Indicators:** Active filters shown as colored chips with icons
- ✅ **Dense/Comfortable Layouts:** Configurable via `dense` prop
- ✅ **Inline Actions:** Edit/delete buttons appear on row hover
- ✅ **Loading States:** Spinner with descriptive text ("Loading employees...")
- ✅ **Empty States:** Helpful messages with icons and suggestions

### **4. Salesforce Lightning Design System**
**Source:** https://www.lightningdesignsystem.com/

**Applied Components:**
- ✅ **Icon-Enhanced Inputs:** Search/filter/sort icons for visual clarity
- ✅ **Dropdown Menus:** Elevated dropdown for sort options with active state highlighting
- ✅ **Pagination Controls:** "Show: 10 per page" + page number input
- ✅ **Breadcrumb Indicators:** "Showing 1 to 10 of 42" (Microsoft Graph API style)

---

## Backend Requirements

All modules require backend C# controllers to support the new filter parameters:

### **AccountsController** - ✅ Ready
```csharp
[HttpGet]
public async Task<ActionResult<PaginatedResult<ListAccountDto>>> GetAccounts(
    [FromQuery] AccountsQueryParameters parameters)
{
    var query = _dbContext.Accounts.AsQueryable();

    // Search filter
    if (!string.IsNullOrWhiteSpace(parameters.Search))
    {
        query = query.Where(a =>
            a.Username.Contains(parameters.Search) ||
            a.Employee.FullName.Contains(parameters.Search) ||
            a.Employee.EmpCode.Contains(parameters.Search)
        );
    }

    // Status filter
    if (parameters.IsLocked.HasValue)
    {
        query = query.Where(a => a.IsLocked == parameters.IsLocked.Value);
    }

    var dtoQuery = query.Select(a => new ListAccountDto { /* ... */ });
    return await dtoQuery.ToPaginatedResultAsync(parameters, "Username");
}
```

### **EmployeesController** - ⏳ TODO
```csharp
public record EmployeesQueryParameters : QueryParameters
{
    public int? DptId { get; init; }
    public int? AreaId { get; init; }
}

[HttpGet]
public async Task<ActionResult<PaginatedResult<ListEmployeeDto>>> GetEmployees(
    [FromQuery] EmployeesQueryParameters parameters)
{
    var query = _dbContext.Employees.AsQueryable();

    if (!string.IsNullOrWhiteSpace(parameters.Search))
    {
        query = query.Where(e =>
            e.FullName.Contains(parameters.Search) ||
            e.EmpCode.Contains(parameters.Search) ||
            e.Email.Contains(parameters.Search)
        );
    }

    if (parameters.DptId.HasValue)
    {
        query = query.Where(e => e.DptId == parameters.DptId.Value);
    }

    if (parameters.AreaId.HasValue)
    {
        query = query.Where(e => e.AreaId == parameters.AreaId.Value);
    }

    var dtoQuery = query.Select(e => new ListEmployeeDto { /* ... */ });
    return await dtoQuery.ToPaginatedResultAsync(parameters, "FullName");
}
```

### **WorkLogsController** - ⏳ TODO
```csharp
public record WorkLogsQueryParameters : QueryParameters
{
    public string? Status { get; init; }
    public int? DptId { get; init; }
    public int? AreaId { get; init; }
    public int? IssueId { get; init; }
}

[HttpGet]
public async Task<ActionResult<PaginatedResult<IssueLogDto>>> GetWorkLogs(
    [FromQuery] WorkLogsQueryParameters parameters)
{
    var query = _dbContext.IssueLogs.AsQueryable();

    if (!string.IsNullOrWhiteSpace(parameters.Search))
    {
        query = query.Where(w =>
            w.IssueDescription.Contains(parameters.Search) ||
            w.Resolution.Contains(parameters.Search)
        );
    }

    if (!string.IsNullOrWhiteSpace(parameters.Status))
    {
        query = query.Where(w => w.Status == parameters.Status);
    }

    if (parameters.DptId.HasValue)
    {
        query = query.Where(w => w.DptId == parameters.DptId.Value);
    }

    var dtoQuery = query.Select(w => new IssueLogDto { /* ... */ });
    return await dtoQuery.ToPaginatedResultAsync(parameters, "DateReported");
}
```

### **RolesController** - ⏳ TODO
```csharp
[HttpGet]
public async Task<ActionResult<PaginatedResult<RoleDto>>> GetRoles(
    [FromQuery] QueryParameters parameters)
{
    var query = _dbContext.Roles.Include(r => r.Claims).AsQueryable();

    if (!string.IsNullOrWhiteSpace(parameters.Search))
    {
        query = query.Where(r =>
            r.Name.Contains(parameters.Search) ||
            r.Description.Contains(parameters.Search)
        );
    }

    var dtoQuery = query.Select(r => new RoleDto { /* ... */ });
    return await dtoQuery.ToPaginatedResultAsync(parameters, "Name");
}
```

---

## Testing Checklist

After migrating each component, verify:

- [ ] **Search**
  - [ ] Typing triggers debounced search (300ms)
  - [ ] Search results update correctly
  - [ ] Clear button (X) resets search
  - [ ] Empty search shows all results

- [ ] **Filter**
  - [ ] Each filter option works
  - [ ] "All" option shows unfiltered results
  - [ ] Filter change resets to page 1
  - [ ] Active filter shown in chip/badge

- [ ] **Sort**
  - [ ] Each sort field works
  - [ ] Ascending/descending toggle works
  - [ ] Arrow iconindicates sort direction  
  - [ ] Active sort field highlighted

- [ ] **Pagination**
  - [ ] Previous/Next buttons work
  - [ ] Page number input works
  - [ ] Page size selector works (10, 20, 50, 100)
  - [ ] "Showing X to Y of Z" text accurate
  - [ ] Page controls disabled at boundaries

- [ ] **UI/UX**
  - [ ] Loading state displays
  - [ ] Error state displays with message
  - [ ] Empty state displays with helpful text
  - [ ] Hover states work on buttons/rows
  - [ ] Responsive layout (mobile/tablet/desktop)

- [ ] **Accessibility**
  - [ ] ARIA labels present (aria-label, aria-expanded)
  - [ ] Keyboard navigation works (Tab, Enter, Space)
  - [ ] Focus rings visible
  - [ ] Screen reader test passes

---

## Performance Benefits

### **Before (Client-Side):**
```typescript
// ❌ Load ALL data, filter on client
const allEmployees = await employeesApi.getAll(); // 10,000 records
const filtered = allEmployees.filter(emp => ...);  // JavaScript filtering
const paginated = filtered.slice(0, 10);            // Client-side pagination
```
**Problems:**
- Network: Transfers 10,000MB+ of JSON data
- Memory: Holds 10,000 objects in browser RAM
- Performance: Laggy filtering on low-end devices
- User Experience: Long initial load time

### **After (Server-Side):**
```typescript
// ✅ Server filters/sorts, returns only current page
const result = await employeesApi.getAll({
  page: 1,
  pageSize: 10,
  search: 'john',
  dptId: 5
}); // Returns only 10 records
```
**Benefits:**
- Network: Transfers only 10-100 records (99% reduction)
- Memory: Minimal browser RAM usage
- Performance: Instant filtering (SQL indexed queries)
- User Experience: Fast, smooth interactions
- Scalability: Works with 1M+ records

---

## Migration Priority

1. **High Priority** (Complex, high usage):
   - ✅ Accounts Management (DONE)
   - ✅ Employees Management (DONE)
   - ⏳ Work Logs Management (complex features, needs careful migration)

2. **Medium Priority** (Moderate usage):
   - ⏳ Roles Management (simple, but important for security)
   - ⏳ Departments Management (foundational data)

3. **Low Priority** (Simple, low usage):
   - ⏳ Areas Management (simple grid, few records expected)

---

## Related Documentation

- [Filter & Sort All Modules](./FILTER_SORT_ALL_MODULES.md) - Complete guide with QueryParams types
- [Accounts Filter & Sort Implementation](./ACCOUNTS_FILTER_SORT_IMPLEMENTATION.md) - Reference implementation
- [SearchFilterBar Component](../src/components/common/SearchFilterBar.tsx) - Component source code
- [Type Definitions](../src/types/data.ts) - All QueryParams interfaces

---

## Support

For questions or issues during migration:
1. Check this guide and related documentation
2. Review AccountManagement.tsx as reference implementation
3. Test each feature using the testing checklist
4. Consult Microsoft/Azure/Material Design guidelines for UI patterns
