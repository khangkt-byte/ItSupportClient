# Account Management: Filter & Sort Implementation Guide

## Overview

This guide documents the implementation of filtering and sorting for the Account Management feature, following industry best practices from Microsoft, GitHub, and Azure.

## Design Principles

### 1. **Query Parameter Standards**
Following [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md) and [Microsoft Graph Query Parameters](https://learn.microsoft.com/en-us/graph/query-parameters):

- **Pagination**: `page`, `pageSize` (offset-based, simple and cache-friendly)
- **Sorting**: `sortBy`, `isDescending` (single-field sort with direction)
- **Filtering**: `search` (global text search) + resource-specific filters (e.g., `isLocked`)
- **Case**: Use PascalCase for server-side params to match C# conventions

### 2. **Server-Side vs. Client-Side**
Best practice from [Azure API Design](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design#implement-data-pagination-and-filtering):

> **Pagination and filtering should be implemented server-side** to:
> - Reduce payload size
> - Improve performance
> - Prevent denial-of-service via large result sets

**Decision**: 
- ✅ **Server-side**: Pagination, sorting, global search (`search`), status filter (`isLocked`)
- ❌ **Client-side**: None (avoid to maintain single source of truth)

### 3. **Sort Field Naming**
Following [GitHub API v3](https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api) and [Microsoft Graph $orderby](https://learn.microsoft.com/en-us/graph/query-parameters#orderby):

- Use **property names from DTO** (e.g., `empName`, `empCode`, `username`, `createdAt`, `lastLoginAt`, `isLocked`)
- Backend validates and defaults to safe field if invalid
- Frontend displays user-friendly labels, sends API field names

### 4. **Filter Strategy**
Following [OData v4 Filter](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part2-url-conventions/odata-v4.0-errata03-os-part2-url-conventions-complete.html#_Toc453752356):

- **Global search** (`search`): Free-text search across multiple fields (username, empName, empCode)
- **Specific filters**: Boolean (`isLocked`), enum values, etc.
- **Avoid complex $filter expressions**: Use simple query params for RESTful APIs

## Implementation

### Frontend (React + TypeScript)

#### 1. Query Parameters Interface

```typescript
// src/types/data.ts
export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  isDescending?: boolean;
  search?: string;
}

// Extended for accounts-specific filters
export interface AccountsQueryParams extends QueryParams {
  isLocked?: boolean | null; // null = all, true = locked only, false = active only
}
```

#### 2. API Client

```typescript
// src/services/api/accounts.ts
export interface AccountsQueryParams extends QueryParams {
  isLocked?: boolean | null;
}

export const accountsApi = {
  async getAll(params: AccountsQueryParams = {}): Promise<PaginatedResult<ListAccountDto>> {
    const queryString = buildQueryString({
      Page: params.page || 1,
      PageSize: params.pageSize || 10,
      SortBy: params.sortBy,
      IsDescending: params.isDescending,
      Search: params.search,
      IsLocked: params.isLocked, // null will be omitted by buildQueryString
    });

    return apiClient.get<PaginatedResult<ListAccountDto>>(`/api/accounts${queryString}`);
  },
};
```

#### 3. Component State

```typescript
const [queryParams, setQueryParams] = useState<AccountsQueryParams>({
  page: 1,
  pageSize: 10,
  search: '',
  sortBy: 'username',
  isDescending: false,
  isLocked: null, // All status by default
});
```

#### 4. SearchFilterBar Integration

```tsx
<SearchFilterBar
  queryParams={queryParams}
  onQueryChange={setQueryParams}
  paginatedResult={paginatedResult || undefined}
  filterOptions={[
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Locked', value: 'locked' },
  ]}
  currentFilter={
    queryParams.isLocked === null ? 'all' :
    queryParams.isLocked ? 'locked' : 'active'
  }
  onFilterChange={(value) =>
    setQueryParams({
      ...queryParams,
      isLocked: value === 'all' ? null : value === 'locked',
      page: 1,
    })
  }
  sortOptions={[
    { label: 'Username', value: 'username' },
    { label: 'Employee Name', value: 'empName' },
    { label: 'Employee Code', value: 'empCode' },
    { label: 'Created Date', value: 'createdAt' },
    { label: 'Last Login', value: 'lastLoginAt' },
    { label: 'Status', value: 'isLocked' },
  ]}
  placeholder="Search by username, email, or employee name..."
/>
```

### Backend (C# + EF Core)

#### 1. Query Parameters DTO

```csharp
public record AccountsQueryParameters : QueryParameters
{
    public bool? IsLocked { get; init; } // null = all, true = locked, false = active
}
```

#### 2. Controller Endpoint

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

    // Project to DTO before pagination (performance optimization)
    var dtoQuery = query.Select(a => new ListAccountDto
    {
        AccountId = a.AccountId,
        Username = a.Username,
        EmpName = a.Employee.FullName,
        EmpCode = a.Employee.EmpCode,
        IsLocked = a.IsLocked,
        LastLoginAt = a.LastLoginAt,
        CreatedAt = a.CreatedAt,
    });

    // Apply pagination and sorting (using extension method)
    var result = await dtoQuery.ToPaginatedResultAsync(parameters, defaultSortField: "Username");

    return Ok(result);
}
```

#### 3. Sort Field Mapping

The backend `PaginationExtensions.ApplySorting()` uses reflection to map `sortBy` to DTO properties. Valid fields:

- `Username` (default)
- `EmpName`
- `EmpCode`
- `CreatedAt`
- `LastLoginAt`
- `IsLocked`

Invalid or missing fields fall back to the default (`Username`).

## Best Practices References

### Industry Standards

1. **Microsoft REST API Guidelines**
   - Source: https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md
   - Key: Use query parameters for filtering/sorting; avoid POST for queries
   - Pagination: offset-based (`page`, `pageSize`) for simplicity

2. **Microsoft Graph Query Parameters**
   - Source: https://learn.microsoft.com/en-us/graph/query-parameters
   - Key: `$filter`, `$orderby`, `$top`, `$skip`, `$search`
   - Note: We use simplified params (not OData syntax) for RESTful clarity

3. **Azure API Design Best Practices**
   - Source: https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design
   - Key: Server-side pagination/filtering, max page size limits, stateless requests

4. **GitHub API v3 Pagination**
   - Source: https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api
   - Key: Use query params `page` and `per_page`; provide `Link` headers for navigation

### Security & Performance

1. **Prevent DoS**: Backend enforces `MaxPageSize = 100` (from your C# code)
2. **Input Validation**: Backend validates `sortBy` against DTO properties
3. **SQL Injection**: EF Core parameterized queries prevent injection
4. **Cache-Friendly**: URI-based params enable HTTP caching (avoid POST)

## Testing Checklist

- [ ] Pagination works (page 1, 2, 3, etc.)
- [ ] Page size selector (10, 20, 50, 100)
- [ ] Global search filters results server-side
- [ ] Status filter (All, Active, Locked) updates query
- [ ] Sort by Username (default, ascending)
- [ ] Sort by Employee Name (ascending/descending toggle)
- [ ] Sort by Created Date (descending shows newest first)
- [ ] Sort by Last Login (handles null values)
- [ ] Invalid sort field falls back to default
- [ ] Empty result set shows "No accounts found"
- [ ] Pagination resets to page 1 on filter/search change
- [ ] URL query params update on state change (optional, for shareable links)

## Migration Notes

If migrating from client-side filtering:

1. Remove local `filteredData` useMemo
2. Remove `debouncedSearch` local state (SearchFilterBar handles it)
3. Update `fetchAccounts()` to use `queryParams` directly
4. Remove `statusFilter` local state (use `queryParams.isLocked`)
5. Test with realistic data (1000+ records) to verify server-side performance

## Future Enhancements

1. **Advanced Filters**: Add filter by role, department, area (extend `AccountsQueryParams`)
2. **Date Range Filters**: `createdAfter`, `createdBefore`, `lastLoginAfter`, etc.
3. **Multi-Sort**: Support sorting by multiple fields (e.g., `sortBy=empName,createdAt`)
4. **Saved Filters**: Allow users to save frequently used filter combinations
5. **Export Filtered Data**: Excel export with current filters applied

## References

- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md)
- [Microsoft Graph Query Parameters](https://learn.microsoft.com/en-us/graph/query-parameters)
- [Azure API Design](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design)
- [OData v4 URL Conventions](https://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part2-url-conventions/odata-v4.0-errata03-os-part2-url-conventions-complete.html)
- [Enterprise Best Practices (DDD, Repository Pattern)](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design)
