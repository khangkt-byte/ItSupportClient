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

import { useState } from 'react';
import { Plus, Shield } from 'lucide-react';
import { PaginationBar } from '@/components/common/PaginationBar';
import { rolesApi } from '@/services/api/roles';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import type { RoleDto, RolesQueryParams } from '@/types/data';
import { usePermission } from '@/hooks/usePermission';
import { Permissions } from '@/config/permissions';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { RoleTable } from '@/features/roles/components/RoleTable';
import {
  RoleFormModal,
  createRoleFormData,
  type RoleFormData,
} from '@/features/roles/components/RoleFormModal';
import { useRoleQuery } from '@/features/roles/hooks/useRoleQuery';
import { createApiErrorState, type ValidationErrors } from '@/utils/apiErrors';

export function RoleManagement() {
  const {
    queryParams,
    setQueryParams,
    paginatedResult,
    loading,
    error,
    refetch,
  } = useRoleQuery();
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RoleDto | null>(null);
  const [formData, setFormData] = useState<RoleFormData>(createRoleFormData(null));
  const [isMutating, setIsMutating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<RoleDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { hasPermission } = usePermission();

  const openCreateForm = () => {
    setEditing(null);
    setFormData(createRoleFormData(null));
    setMutationError(null);
    setValidationErrors(null);
    setShowForm(true);
  };

  const openEditForm = (item: RoleDto) => {
    setEditing(item);
    setFormData(createRoleFormData(item));
    setMutationError(null);
    setValidationErrors(null);
    setShowForm(true);
  };

  const handleSubmit = async (formData: RoleFormData) => {
    setIsMutating(true);
    setMutationError(null);
    setValidationErrors(null);

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

      await refetch();
      setShowForm(false);
      setEditing(null);
      setFormData(createRoleFormData(null));
    } catch (err: unknown) {
      console.error('Failed to save role:', err);
      const errorState = createApiErrorState(err, 'Failed to save role. Please try again.');
      setMutationError(errorState.message);
      setValidationErrors(errorState.fieldErrors);
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    try {
      setDeleteLoading(true);
      // Use deleteSingle for single role deletion
      await rolesApi.deleteSingle(confirmDelete.roleId);
      await refetch();
      setConfirmDelete(null);
    } catch (err: unknown) {
      const errorState = createApiErrorState(err, 'Failed to delete role.');
      setMutationError(errorState.message);
      setValidationErrors(errorState.fieldErrors);
      setConfirmDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const isLoading = loading || isMutating;
  const tableError = showForm ? null : mutationError || error;

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
        error={tableError}
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
        formData={formData}
        error={mutationError}
        validationErrors={validationErrors}
        isSubmitting={isMutating}
        onChange={setFormData}
        onSubmit={handleSubmit}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
          setFormData(createRoleFormData(null));
          setValidationErrors(null);
        }}
        onClearError={() => {
          setMutationError(null);
          setValidationErrors(null);
        }}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => {
          if (deleteLoading) return;
          setConfirmDelete(null);
        }}
        onConfirm={handleDelete}
        isLoading={deleteLoading}
        loadingLabel="Deleting..."
        action="delete"
        title="Delete role"
        description={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}