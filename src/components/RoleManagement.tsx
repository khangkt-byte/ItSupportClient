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

import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, X, Shield, Save, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { rolesApi } from '../api/roles';
import type { RoleDto, ClaimDto } from '../types/data';
import { usePermission } from '../lib/hooks/usePermission';
import { Permissions } from '../lib/constants/permissions';
import { ConfirmDialog } from './ConfirmDialog';

interface Props {
  data: RoleDto[];
  setData: (items: RoleDto[]) => void;
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
        const updated = await rolesApi.update(editing.roleId, roleData);
        setData(data.map((i) => (i.roleId === editing.roleId ? updated : i)));
      } else {
        const created = await rolesApi.create(roleData);
        setData([...data, created]);
      }

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
      await rolesApi.delete(confirmDelete.roleId);
      setData(data.filter((i) => i.roleId !== confirmDelete.roleId));
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
            <Shield className="w-7 h-7 text-blue-600" />
            Role Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage roles and their associated permissions
          </p>
        </div>
        {hasPermission(Permissions.Role.Create) && (
          <button
            onClick={() => openForm()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create Role
          </button>
        )}
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.map((item) => {
          const claimCount = item.claims?.length || 0;
          return (
            <div key={item.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
              {item.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
              )}
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                  {claimCount} {claimCount !== 1 ? 'permissions' : 'permission'}
                </span>
              </div>
              {(hasPermission(Permissions.Role.Edit) || hasPermission(Permissions.Role.Delete)) && (
                <div className="flex gap-2">
                  {hasPermission(Permissions.Role.Edit) && (
                    <button
                      onClick={() => openForm(item)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                  )}
                  {hasPermission(Permissions.Role.Delete) && (
                    <button
                      onClick={() => setConfirmDelete(item)}
                      className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {data.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No roles found</p>
            <p className="text-sm mt-1">Create your first role to get started</p>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  {editing ? 'Edit Role' : 'Create New Role'}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Define role name, description, and permissions
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="cursor-pointer hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-red-900">Error</p>
                  <p className="text-sm text-red-700 mt-0.5">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Role Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., System Administrator"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this role"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Permissions Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">
                    Permissions ({formData.selectedClaimIds.length} selected)
                  </label>
                </div>

                <div className="bg-gray-50 border rounded-lg max-h-96 overflow-y-auto">
                  {groupedClaims.map(group => {
                    const isExpanded = expandedGroups.has(group.category);
                    const selectedInGroup = group.claims.filter(c =>
                      formData.selectedClaimIds.includes(c.claimId)
                    ).length;
                    const allSelected = selectedInGroup === group.claims.length;

                    return (
                      <div key={group.category} className="border-b last:border-b-0">
                        {/* Group Header */}
                        <div className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
                          <button
                            type="button"
                            onClick={() => toggleGroup(group.category)}
                            className="flex items-center gap-2 flex-1 text-left"
                          >
                            <span className="font-medium text-gray-900">{group.category}</span>
                            <span className="text-xs text-gray-500">({group.claims.length})</span>
                            {selectedInGroup > 0 && (
                              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                                {selectedInGroup} selected
                              </span>
                            )}
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleAllInCategory(group.category)}
                              className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                            >
                              {allSelected ? 'Deselect All' : 'Select All'}
                            </button>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Claims in Group */}
                        {isExpanded && (
                          <div className="bg-gray-50 divide-y divide-gray-100">
                            {group.claims.map(claim => {
                              const isSelected = formData.selectedClaimIds.includes(claim.claimId);
                              return (
                                <label
                                  key={claim.claimId}
                                  className="flex items-center gap-3 p-3 pl-8 cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleClaim(claim.claimId)}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-700">
                                        {claim.claim}
                                      </span>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
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
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  className="flex-1 px-4 py-2 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors"
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