/**
 * Professional Role Management Component
 * 
 * **Design Pattern**: Okta Admin Console "Roles & Permissions" interface
 * - Visual permission grouping by module/category
 * - Select All/None per category
 * - Permission count badges
 * - Description field for role documentation
 * 
 * **References:**
 * - Okta Role Management: https://help.okta.com/en-us/content/topics/security/administrators-admin-comparison.htm
 * - Auth0 Roles: https://auth0.com/docs/manage-users/access-control/configure-core-rbac/rbac-users/assign-roles-to-users
 * - AWS IAM Roles: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html
 * 
 * **API Integration:**
 * - POST /api/roles - Create role
 * - PUT /api/roles/{id} - Update role with claims
 * - DELETE /api/roles/{id} - Delete role
 * - GET /api/roles/claims - Get all available claims
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, X, Shield, Save, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { rolesApi } from '@/services/api/roles';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import type { Role, RoleDto, ClaimDto, RolesQueryParams, PaginatedResult } from '@/types/data';
import { usePermission } from '@/hooks/usePermission';
import { Permissions } from '@/config/permissions';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

interface Props {
  data: Role[];
  setData: (items: Role[]) => void;
}

interface RoleFormData {
  name: string;
  description: string;
  selectedClaimIds: number[];
}

interface ClaimGroup {
  category: string;
  claims: ClaimDto[];
}

function groupClaimsByCategory(claims: ClaimDto[]): ClaimGroup[] {
  const groups = new Map<string, ClaimDto[]>();

  claims.forEach(claim => {
    const category = claim.category || 'Other';
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(claim);
  });

  return Array.from(groups.entries())
    .map(([category, claims]) => ({ category, claims }))
    .sort((a, b) => {
      if (a.category === 'Admin') return -1;
      if (b.category === 'Admin') return 1;
      return a.category.localeCompare(b.category);
    });
}

export function RoleManagement({ data, setData }: Props) {
  const [queryParams, setQueryParams] = useState<RolesQueryParams>({
    page: 1,
    pageSize: 10,
    search: '',
    sortBy: 'name',
    isDescending: false,
  });
  const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<RoleDto> | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RoleDto | null>(null);
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    selectedClaimIds: []
  });

  const [availableClaims, setAvailableClaims] = useState<ClaimDto[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Admin']));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<RoleDto | null>(null);

  const { hasPermission } = usePermission();

  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await rolesApi.getAll(queryParams);
      setPaginatedResult(result);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      setError('Failed to load roles');
      setPaginatedResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  const syncDataManagerRoles = useCallback(async () => {
    const allRoles = await rolesApi.getAll({ page: 1, pageSize: 1000, sortBy: 'name', isDescending: false });
    setData(allRoles.items.map((role) => ({ ...role, id: String(role.roleId) } as Role)));
  }, [setData]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Load available claims when form opens
  useEffect(() => {
    if (showForm) {
      loadAvailableClaims();
    }
  }, [showForm]);

  const loadAvailableClaims = async () => {
    try {
      const claims = await rolesApi.getClaims();
      setAvailableClaims(claims);
    } catch (err) {
      console.error('Failed to load claims:', err);
      setError('Failed to load available permissions');
    }
  };

  const groupedClaims = useMemo(() => groupClaimsByCategory(availableClaims), [availableClaims]);

  const openForm = (item?: RoleDto) => {
    setEditing(item || null);
    setFormData(
      item
        ? {
            name: item.name,
            description: item.description || '',
            selectedClaimIds: item.claims?.map(c => c.claimId) || []
          }
        : {
            name: '',
            description: '',
            selectedClaimIds: []
          }
    );
    setError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const roleData = {
        name: formData.name,
        description: formData.description || null,
        claimIds: formData.selectedClaimIds
      };

      if (editing) {
        await rolesApi.update(editing.roleId, roleData);
      } else {
        await rolesApi.create(roleData);
      }

      await Promise.all([fetchRoles(), syncDataManagerRoles()]);
      setShowForm(false);
      setFormData({ name: '', description: '', selectedClaimIds: [] });
    } catch (err: any) {
      console.error('Failed to save role:', err);
      setError(err.message || 'Failed to save role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    try {
      // Use deleteSingle for single role deletion
      await rolesApi.deleteSingle(confirmDelete.roleId);
      await Promise.all([fetchRoles(), syncDataManagerRoles()]);
      setConfirmDelete(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete role');
      setConfirmDelete(null);
    }
  };

  const toggleGroup = (category: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleClaim = (claimId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedClaimIds: prev.selectedClaimIds.includes(claimId)
        ? prev.selectedClaimIds.filter(id => id !== claimId)
        : [...prev.selectedClaimIds, claimId]
    }));
  };

  const toggleAllInCategory = (category: string) => {
    const group = groupedClaims.find(g => g.category === category);
    if (!group) return;

    const categoryClaimIds = group.claims.map(c => c.claimId);
    const allSelected = categoryClaimIds.every(id => formData.selectedClaimIds.includes(id));

    setFormData(prev => ({
      ...prev,
      selectedClaimIds: allSelected
        ? prev.selectedClaimIds.filter(id => !categoryClaimIds.includes(id))
        : [...new Set([...prev.selectedClaimIds, ...categoryClaimIds])]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary-600" />
            Role Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage roles and their associated permissions
          </p>
        </div>
        {hasPermission(Permissions.Role.Create) && (
          <button
            onClick={() => openForm()}
            className="btn-primary px-4 py-2 flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create Role
          </button>
        )}
      </div>

      <SearchFilterBar
        queryParams={queryParams}
        onQueryChange={(params) => setQueryParams(params as RolesQueryParams)}
        paginatedResult={paginatedResult || undefined}
        filterOptions={[{ label: 'All Roles', value: 'all' }]}
        currentFilter={roleFilter}
        onFilterChange={setRoleFilter}
        sortOptions={[
          { label: 'Role Name', value: 'name' },
          { label: 'Description', value: 'description' },
          { label: 'Created Date', value: 'createdAt' },
        ]}
        placeholder="Search by role name or description..."
        showResults={true}
      />

      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              <p className="text-muted-foreground">Loading roles...</p>
            </div>
          </div>
        )}

        {error && !showForm && !isLoading && (
          <div className="p-4 bg-error-background border border-error-border flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-error-foreground">Error</p>
              <p className="text-sm text-error-foreground">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Role Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Permissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(paginatedResult?.items || []).length > 0 ? (
                (paginatedResult?.items || []).map((item) => {
                  const claimCount = item.claims?.length || 0;
                  return (
                    <tr key={item.roleId} className="hover:bg-accent transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">{item.description || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 text-xs rounded bg-primary-100 text-primary-700 font-medium">
                          {claimCount} {claimCount !== 1 ? 'permissions' : 'permission'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="inline-flex items-center gap-2">
                          {hasPermission(Permissions.Role.Edit) && (
                            <button
                              onClick={() => openForm(item)}
                              className="text-primary-600 inline-flex items-center justify-center hover:text-primary-800 transition-colors"
                              title="Edit role"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission(Permissions.Role.Delete) && (
                            <button
                              onClick={() => setConfirmDelete(item)}
                              className="text-error-foreground inline-flex items-center justify-center hover:text-error-foreground transition-colors"
                              title="Delete role"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No roles found</p>
                    <p className="text-sm mt-1">Create your first role to get started</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {paginatedResult && !isLoading && (
        <div className="card p-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page <span className="font-medium">{paginatedResult.page}</span> of{' '}
            <span className="font-medium">{paginatedResult.totalPages}</span> ({' '}
            <span className="font-medium">{paginatedResult.totalCount}</span> total items)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setQueryParams({
                  ...queryParams,
                  page: Math.max(1, (queryParams.page || 1) - 1),
                })
              }
              disabled={!paginatedResult.hasPreviousPage}
              className="flex items-center gap-1 px-3 py-2 border border-input rounded-lg bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-foreground"
            >
              <span>Previous</span>
            </button>

            <input
              type="number"
              min="1"
              max={paginatedResult.totalPages}
              value={queryParams.page || 1}
              onChange={(e) => {
                const pageNum = Math.min(
                  Math.max(1, parseInt(e.target.value) || 1),
                  paginatedResult.totalPages
                );
                setQueryParams({ ...queryParams, page: pageNum });
              }}
              className="w-12 px-2 py-2 border border-input rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card text-foreground"
            />

            <button
              onClick={() =>
                setQueryParams({
                  ...queryParams,
                  page: Math.min(paginatedResult.totalPages, (queryParams.page || 1) + 1),
                })
              }
              disabled={!paginatedResult.hasNextPage}
              className="flex items-center gap-1 px-3 py-2 border border-input rounded-lg bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-foreground"
            >
              <span>Next</span>
            </button>
          </div>
        </div>
      )}

      {/* Form Dialog */}
      {showForm && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card rounded-lg max-w-4xl w-full my-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                  <Shield className="w-5 h-5 text-primary-600" />
                  {editing ? 'Edit Role' : 'Create New Role'}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Define role name, description, and permissions
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="cursor-pointer hover:text-muted-foreground transition-colors text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mx-6 mt-4 p-4 bg-error-background border border-error-border rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-error-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-error-foreground">Error</p>
                  <p className="text-sm text-error-foreground mt-0.5">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-error-foreground hover:text-error-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Role Name <span className="text-error-foreground">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., System Administrator"
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-card text-foreground placeholder-placeholder transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this role"
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-card text-foreground placeholder-placeholder transition-colors"
                  />
                </div>
              </div>

              {/* Permissions Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    Permissions ({formData.selectedClaimIds.length} selected)
                  </label>
                </div>

                <div className="bg-muted border border-border rounded-lg max-h-96 overflow-y-auto">
                  {groupedClaims.map(group => {
                    const isExpanded = expandedGroups.has(group.category);
                    const selectedInGroup = group.claims.filter(c =>
                      formData.selectedClaimIds.includes(c.claimId)
                    ).length;
                    const allSelected = selectedInGroup === group.claims.length;

                    return (
                      <div key={group.category} className="border-b border-border last:border-b-0">
                        {/* Group Header */}
                        <div className="flex items-center justify-between p-4 bg-card hover:bg-accent transition-colors">
                          <button
                            type="button"
                            onClick={() => toggleGroup(group.category)}
                            className="flex items-center gap-2 flex-1 text-left"
                          >
                            <span className="font-medium text-foreground">{group.category}</span>
                            <span className="text-xs text-muted-foreground">({group.claims.length})</span>
                            {selectedInGroup > 0 && (
                              <span className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full">
                                {selectedInGroup} selected
                              </span>
                            )}
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleAllInCategory(group.category)}
                              className="px-2 py-1 text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                            >
                              {allSelected ? 'Deselect All' : 'Select All'}
                            </button>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {/* Claims in Group */}
                        {isExpanded && (
                          <div className="bg-muted divide-y divide-border">
                            {group.claims.map(claim => {
                              const isSelected = formData.selectedClaimIds.includes(claim.claimId);
                              return (
                                <label
                                  key={claim.claimId}
                                  className="flex items-center gap-3 p-3 pl-8 cursor-pointer hover:bg-accent transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleClaim(claim.claimId)}
                                    className="w-4 h-4 text-primary-600 rounded border-input focus:ring-primary-500"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-muted-foreground">
                                        {claim.claim}
                                      </span>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-primary-600 dark:bg-primary-600 text-primary-foreground rounded-lg cursor-pointer hover:bg-primary-700 dark:hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editing ? 'Update Role' : 'Create Role'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1 px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        action="delete"
        title="Delete role"
        description={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}