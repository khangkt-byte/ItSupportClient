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

import { useState, useEffect, useCallback } from 'react';
import { Plus, Shield } from 'lucide-react';
import { PaginationBar } from '@/components/common/PaginationBar';
import { rolesApi } from '@/services/api/roles';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import type { Role, RoleDto, RolesQueryParams, PaginatedResult } from '@/types/data';
import { usePermission } from '@/hooks/usePermission';
import { Permissions } from '@/config/permissions';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { RoleTable } from '@/features/roles/components/RoleTable';
import { RoleFormModal, type RoleFormData } from '@/features/roles/components/RoleFormModal';

interface Props {
  data: Role[];
  setData: (items: Role[]) => void;
}

export function RoleManagement({ data, setData }: Props) {
  void data;
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
    void fetchRoles();
  }, [fetchRoles]);

  const openCreateForm = () => {
    setEditing(null);
    setError(null);
    setShowForm(true);
  };

  const openEditForm = (item: RoleDto) => {
    setEditing(item);
    setError(null);
    setShowForm(true);
  };

  const handleSubmit = async (formData: RoleFormData) => {
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
      setEditing(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save role. Please try again.';
      console.error('Failed to save role:', err);
      setError(message);
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete role';
      alert(message);
      setConfirmDelete(null);
    }
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
            onClick={openCreateForm}
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

      <RoleTable
        items={paginatedResult?.items || []}
        isLoading={isLoading}
        error={showForm ? null : error}
        canEdit={hasPermission(Permissions.Role.Edit)}
        canDelete={hasPermission(Permissions.Role.Delete)}
        onEdit={openEditForm}
        onDelete={setConfirmDelete}
      />

      {paginatedResult && !isLoading && (
        <PaginationBar
          page={paginatedResult.page}
          totalPages={paginatedResult.totalPages}
          totalCount={paginatedResult.totalCount}
          hasPreviousPage={paginatedResult.hasPreviousPage}
          hasNextPage={paginatedResult.hasNextPage}
          onPageChange={(page: number) =>
            setQueryParams((prev) => ({
              ...prev,
              page: Math.min(Math.max(1, page), paginatedResult.totalPages),
            }))
          }
        />
      )}

      <RoleFormModal
        isOpen={showForm}
        editing={editing}
        error={error}
        isSubmitting={isLoading}
        onSubmit={handleSubmit}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        onClearError={() => setError(null)}
      />

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