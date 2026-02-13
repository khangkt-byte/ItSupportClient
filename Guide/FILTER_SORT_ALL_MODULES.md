# Filter & Sort Implementation Guide for All Modules

## Overview

This guide documents the standardized filter and sort implementation across all modules in the IT Support Management application, following industry best practices from Microsoft, GitHub, and Azure.

## Implemented Modules

All modules with pagination now follow the same pattern:

1. **Accounts** ✅ (Full implementation with SearchFilterBar)
2. **Employees** ✅ (Type infrastructure ready)
3. **Work Logs** ✅ (Type infrastructure ready)
4. **Roles** ✅ (Type infrastructure ready)
5. **Areas** ✅ (Type infrastructure ready)
6. **Departments** ✅ (Type infrastructure ready)

## Standard Query Parameters

### Base QueryParams Interface

```typescript
export interface QueryParams {
  page?: number;           // Current page (1-indexed)
  pageSize?: number;       // Items per page (default: 10, max: 100)
  sortBy?: string;         // Field name to sort by
  isDescending?: boolean;  // Sort direction (default: false = ascending)
  search?: string;         // Global text search
}
```

### Module-Specific Extensions

#### Accounts
```typescript
export interface AccountsQueryParams extends QueryParams {
  isLocked?: boolean | null; // null = all, true = locked, false = active
}

// Sort fields: username, empName, empCode, createdAt, lastLoginAt, isLocked
```

#### Employees
```typescript
export interface EmployeesQueryParams extends QueryParams {
  dptId?: number | null;   // Filter by department
  areaId?: number | null;  // Filter by area
}

// Sort fields: empCode, fullName, email, phoneNumber, position, createdAt
```

#### Work Logs
```typescript
export interface WorkLogsQueryParams extends QueryParams {
  status?: string | null;  // Filter by status (pending, in-progress, resolved, cancelled)
  dptId?: number | null;   // Filter by department
  areaId?: number | null;  // Filter by area
  issueId?: number | null; // Filter by issue type
}

// Sort fields: dateReported, operator, requester, status, createdAt
```

#### Roles
```typescript
export interface RolesQueryParams extends QueryParams {
  // Future: Add role-specific filters (e.g., hasClaim)
}

// Sort fields: name, createdAt, updatedAt
```

#### Areas
```typescript
export interface AreasQueryParams extends QueryParams {
  // Future: Add area-specific filters
}

// Sort fields: name, description, createdAt
```

#### Departments
```typescript
export interface DepartmentsQueryParams extends QueryParams {
  // Future: Add department-specific filters
}

// Sort fields: name, description, createdAt
```

## API Client Pattern

All API clients follow this standard:

```typescript
// 1. Import specific QueryParams type from @/types/data
import type {
  ResourceDto,
  ResourceQueryParams, // Module-specific
  PaginatedResult,
  // ...
} from '@/types/data';

// 2. Implement getAll with typed params
export const resourceApi = {
  async getAll(params: ResourceQueryParams = {}): Promise<PaginatedResult<ResourceDto>> {
    const queryString = buildQueryString({
      Page: params.page || 1,
      PageSize: params.pageSize || 10,
      SortBy: params.sortBy,
      IsDescending: params.isDescending,
      Search: params.search,
      // Add module-specific filters
      CustomFilter: params.customFilter,
    });

    return apiClient.get<PaginatedResult<ResourceDto>>(`/api/resource${queryString}`);
  },
};
```

## Component Usage Patterns

### Option 1: With SearchFilterBar (Recommended)

Full-featured search, filter, and sort UI component:

```typescript
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import type { AccountsQueryParams, PaginatedResult, ListAccountDto } from '@/types/data';

export function ResourceManagement({ ... }) {
  const [queryParams, setQueryParams] = useState<AccountsQueryParams>({
    page: 1,
    pageSize: 10,
    search: '',
    sortBy: 'name',
    isDescending: false,
    // Module-specific filters
    customFilter: null,
  });

  const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<ListAccountDto> | null>(null);

  // Fetch data when query params change
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await resourceApi.getAll(queryParams);
      setPaginatedResult(result);
    } catch (err) {
      console.error('Failed to fetch:', err);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <SearchFilterBar
      queryParams={queryParams}
      onQueryChange={setQueryParams}
      paginatedResult={paginatedResult || undefined}
      filterOptions={[
        { label: 'All', value: 'all' },
        { label: 'Active', value: 'active' },
      ]}
      currentFilter={queryParams.customFilter === null ? 'all' : 'active'}
      onFilterChange={(value) =>
        setQueryParams({
          ...queryParams,
          customFilter: value === 'all' ? null : value,
          page: 1,
        })
      }
      sortOptions={[
        { label: 'Name', value: 'name' },
        { label: 'Created Date', value: 'createdAt' },
      ]}
      placeholder="Search..."
    />
  );
}
```

### Option 2: Custom Search (Legacy)

Simple search implementation without filter/sort UI:

```typescript
const [searchQuery, setSearchQuery] = useState('');
const debouncedSearch = useDebounce(searchQuery, 300);

// Client-side filtering
const filtered = useMemo(() =>
  data.filter(item =>
    item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  ),
  [data, debouncedSearch]
);
```

**⚠️ Recommendation:** Migrate to server-side filtering with SearchFilterBar for better performance and consistency.

## Backend Implementation (C#)

### Query Parameters DTO

```csharp
// Base class (already exists in your backend)
public record QueryParameters
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SortBy { get; init; }
    public bool IsDescending { get; init; } = false;
    public string? Search { get; init; }

    public int ValidatedPage => Page < 1 ? 1 : Page;
    public int ValidatedPageSize =>
        PageSize < 1 ? 10 :
        PageSize > 100 ? 100 :
        PageSize;
}

// Module-specific extension
public record AccountsQueryParameters : QueryParameters
{
    public bool? IsLocked { get; init; } // null = all, true = locked, false = active
}

public record EmployeesQueryParameters : QueryParameters
{
    public int? DptId { get; init; }
    public int? AreaId { get; init; }
}

public record WorkLogsQueryParameters : QueryParameters
{
    public string? Status { get; init; }
    public int? DptId { get; init; }
    public int? AreaId { get; init; }
    public int? IssueId { get; init; }
}
```

### Controller Example

```csharp
[HttpGet]
[RequirePermission(Claims.Account_Read)]
public async Task<ActionResult<PaginatedResult<ListAccountDto>>> GetAccounts(
    [FromQuery] AccountsQueryParameters parameters)
{
    var query = _dbContext.Accounts.AsQueryable();

    // Apply search filter
    if (!string.IsNullOrWhiteSpace(parameters.Search))
    {
        var searchTerm = parameters.Search.ToLower();
        query = query.Where(a =>
            a.Username.ToLower().Contains(searchTerm) ||
            a.Employee.FullName.ToLower().Contains(searchTerm) ||
            (a.Employee.EmpCode != null && a.Employee.EmpCode.ToLower().Contains(searchTerm))
        );
    }

    // Apply status filter
    if (parameters.IsLocked.HasValue)
    {
        query = query.Where(a => a.IsLocked == parameters.IsLocked.Value);
    }

    // Project to DTO
    var dtoQuery = query.Select(a => new ListAccountDto { /* ... */ });

    // Apply pagination and sorting
    var result = await dtoQuery.ToPaginatedResultAsync(parameters, "Username");

    return Ok(result);
}
```

## Migration Guide

### From Client-Side to Server-Side Filtering

**Before (Client-Side):**
```typescript
const [searchQuery, setSearchQuery] = useState('');
const [statusFilter, setStatusFilter] = useState('all');
const debouncedSearch = useDebounce(searchQuery, 300);

const filtered = useMemo(() =>
  data.filter(item =>
    item.name.includes(debouncedSearch) &&
    (statusFilter === 'all' || item.status === statusFilter)
  ),
  [data, debouncedSearch, statusFilter]
);

const pagination = usePagination({ data: filtered, itemsPerPage: 10 });
```

**After (Server-Side):**
```typescript
const [queryParams, setQueryParams] = useState<ResourceQueryParams>({
  page: 1,
  pageSize: 10,
  search: '',
  sortBy: 'name',
  isDescending: false,
  status: null, // null = all
});

const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<ResourceDto> | null>(null);

const fetchData = useCallback(async () => {
  const result = await resourceApi.getAll(queryParams);
  setPaginatedResult(result);
}, [queryParams]);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

**Benefits:**
- **Performance:** Backend handles filtering on indexed database fields
- **Scalability:** Works with 1000+ records without client-side lag
- **Consistency:** Single source of truth for business logic
- **Security:** Backend validates all filter criteria

## Sort Field Recommendations

### Naming Convention

Always use **DTO property names** for sort fields:

✅ **Correct:**
```typescript
sortOptions={[
  { label: 'Employee Name', value: 'empName' },  // Matches ListAccountDto.empName
  { label: 'Employee Code', value: 'empCode' },  // Matches ListAccountDto.empCode
]}
```

❌ **Incorrect:**
```typescript
sortOptions={[
  { label: 'Employee Name', value: 'employeeName' },  // Field doesn't exist in DTO
]}
```

### Common Sort Fields by Module

**Accounts:**
- `username`, `empName`, `empCode`, `createdAt`, `lastLoginAt`, `isLocked`

**Employees:**
- `empCode`, `fullName`, `email`, `phoneNumber`, `position`, `createdAt`

**Work Logs:**
- `dateReported`, `operator`, `requester`, `status`, `issueName`, `createdAt`

**Roles:**
- `name`, `description`, `createdAt`, `updatedAt`

**Areas / Departments:**
- `name`, `description`, `createdAt`

## Best Practices References

### Industry Standards

1. **Microsoft REST API Guidelines**
   - https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md
   - Query parameters for filtering/sorting
   - Offset-based pagination (`page`, `pageSize`)

2. **Microsoft Graph Query Parameters**
   - https://learn.microsoft.com/en-us/graph/query-parameters
   - `$filter`, `$orderby`, `$top`, `$skip`, `$search`
   - OData v4 conventions

3. **Azure API Design**
   - https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design
   - Server-side pagination/filtering
   - Max page size limits
   - Stateless requests

4. **GitHub API v3**
   - https://docs.github.com/en/rest
   - Simple query params (`page`, `per_page`, `sort`, `order`)

### Security & Performance

1. **Prevent DoS:** `/api/resource?pageSize=1000000` → Backend enforces `MaxPageSize = 100`
2. **SQL Injection:** Backend uses EF Core parameterized queries
3. **Input Validation:** Backend validates `sortBy` against DTO properties (reflection)
4. **Cache-Friendly:** URI-based params enable HTTP caching

## Testing Checklist

Use this checklist for each module:

- [ ] **Pagination**
  - [ ] Page 1, 2, 3, ... works
  - [ ] Page size selector (10, 20, 50, 100)
  - [ ] "Previous" disabled on page 1
  - [ ] "Next" disabled on last page
  - [ ] Direct page input works
  - [ ] Pagination resets to page 1 on filter/search change

- [ ] **Search**
  - [ ] Global search filters results server-side
  - [ ] Search is debounced (300ms)
  - [ ] Clear search button works
  - [ ] Empty search shows all results

- [ ] **Filter**
  - [ ] Each filter option works correctly
  - [ ] "All" option shows unfiltered results
  - [ ] Multiple filters combine correctly
  - [ ] Filter changes reset to page 1

- [ ] **Sort**
  - [ ] Default sort works (ascending)
  - [ ] Each sort option works
  - [ ] Ascending/descending toggle works
  - [ ] Sort indicator shows current field and direction
  - [ ] Invalid sort field falls back to default

- [ ] **Edge Cases**
  - [ ] Empty result set shows "No items found"
  - [ ] Loading state displays
  - [ ] Error state displays with message
  - [ ] Large datasets (1000+ records) perform well

## Future Enhancements

### Phase 1 (Current)
- ✅ Type infrastructure for all modules
- ✅ API clients support module-specific filters
- ✅ Accounts module has full UI implementation

### Phase 2 (Recommended)
- [ ] Migrate all modules to SearchFilterBar component
- [ ] Add date range filters (`createdAfter`, `createdBefore`)
- [ ] Multi-sort support (`sortBy=name,createdAt`)
- [ ] Saved filter presets

### Phase 3 (Future)
- [ ] URL query param sync for shareable links
- [ ] Export filtered data (Excel, CSV)
- [ ] Advanced filters (OR conditions, nested filters)
- [ ] Filter persistence (localStorage)

## Module-Specific Notes

### Accounts
- **Status:** ✅ Full implementation with SearchFilterBar
- **Filters:** Active/Locked status
- **Sort:** Username (default), Employee Name, Created Date, Last Login
- **Reference:** [ACCOUNTS_FILTER_SORT_IMPLEMENTATION.md](ACCOUNTS_FILTER_SORT_IMPLEMENTATION.md)

### Employees
- **Status:** 🟡 Type infrastructure ready, UI pending
- **Recommended Filters:** Department, Area, Position
- **Recommended Sort:** Full Name (default), Employee Code, Email

### Work Logs
- **Status:** 🟡 Type infrastructure ready, custom search implemented
- **Recommended Filters:** Status, Department, Area, Issue Type, Date Range
- **Recommended Sort:** Date Reported (default), Status, Operator

### Roles
- **Status:** 🟡 Type infrastructure ready, UI pending
- **Recommended Filters:** Has specific claim/permission
- **Recommended Sort:** Name (default), Created Date

### Areas & Departments
- **Status:** 🟡 Type infrastructure ready, UI pending
- **Recommended Filters:** None (simple resources)
- **Recommended Sort:** Name (default), Created Date

## Related Documentation

- [Accounts Filter & Sort Implementation](ACCOUNTS_FILTER_SORT_IMPLEMENTATION.md)
- [SearchFilterBar Component](../src/components/common/SearchFilterBar.tsx)
- [Type Definitions](../src/types/data.ts)
- [API Clients](../src/services/api/)

## Support & Questions

For implementation questions or issues:
1. Check this guide first
2. Review the Accounts module as a reference implementation
3. Consult the Microsoft/Azure API design guidelines
4. Review the SearchFilterBar component source code
