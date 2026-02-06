/**
 * Professional Permission Editor Component
 * 
 * - Module-based layout (one module per row)
 * - Each module can collapse/expand
 * - Permissions are displayed in a 4-column grid
 * - Additive model: Effective = Role permissions + Direct permissions
 */

import { useEffect, useMemo, useState } from 'react';
import { Shield, CheckCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import type { RoleDto, ClaimDto } from '../types/data';

interface PermissionEditorProps {
  selectedRoleIds: number[];
  selectedClaimIds: number[];
  availableRoles: RoleDto[];
  availableClaims: ClaimDto[];
  onRolesChange: (roleIds: number[]) => void;
  onClaimsChange: (claimIds: number[]) => void;
  readOnly?: boolean;
}

interface PermissionGroup {
  category: string;
  claims: ClaimDto[];
}

function groupClaimsByCategory(claims: ClaimDto[]): PermissionGroup[] {
  const groups = new Map<string, ClaimDto[]>();

  claims.forEach(claim => {
    const fallbackCategory = claim.claim?.split('.')?.[0];
    const category = claim.category || fallbackCategory || 'Other';
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

export function PermissionEditor({
  selectedRoleIds,
  selectedClaimIds,
  availableRoles,
  availableClaims,
  onRolesChange,
  onClaimsChange,
  readOnly = false
}: PermissionEditorProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const groupedClaims = useMemo(() => groupClaimsByCategory(availableClaims), [availableClaims]);

  useEffect(() => {
    if (groupedClaims.length === 0) return;
    setExpandedModules(prev => {
      // Remove any stale categories while keeping user toggles
      const valid = new Set(groupedClaims.map(g => g.category));
      const next = new Set<string>();
      prev.forEach(category => {
        if (valid.has(category)) next.add(category);
      });
      return next;
    });
  }, [groupedClaims]);

  const effectivePermissions = useMemo(() => {
    const permissionSet = new Set<string>();
    const sources = new Map<string, 'role' | 'direct' | 'both'>();

    selectedRoleIds.forEach(roleId => {
      const role = availableRoles.find(r => r.roleId === roleId);
      if (role?.claims) {
        role.claims.forEach(claim => {
          permissionSet.add(claim.claim);
          sources.set(claim.claim, 'role');
        });
      }
    });

    selectedClaimIds.forEach(claimId => {
      const claim = availableClaims.find(c => c.claimId === claimId);
      if (claim) {
        const currentSource = sources.get(claim.claim);
        sources.set(claim.claim, currentSource === 'role' ? 'both' : 'direct');
        permissionSet.add(claim.claim);
      }
    });

    return { permissions: Array.from(permissionSet), sources };
  }, [selectedRoleIds, selectedClaimIds, availableRoles, availableClaims]);

  const toggleRole = (roleId: number) => {
    if (readOnly) return;
    const next = selectedRoleIds.includes(roleId)
      ? selectedRoleIds.filter(id => id !== roleId)
      : [...selectedRoleIds, roleId];
    onRolesChange(next);
  };

  const toggleClaim = (claimId: number) => {
    if (readOnly) return;
    const next = selectedClaimIds.includes(claimId)
      ? selectedClaimIds.filter(id => id !== claimId)
      : [...selectedClaimIds, claimId];
    onClaimsChange(next);
  };

  const toggleModule = (category: string) => {
    const next = new Set(expandedModules);
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }
    setExpandedModules(next);
  };

  const toggleExpandAll = () => {
    if (expandedModules.size === 0) {
      setExpandedModules(new Set(groupedClaims.map(g => g.category)));
    } else {
      setExpandedModules(new Set());
    }
  };

  const isClaimInheritedFromRole = (claimValue: string): boolean => {
    return selectedRoleIds.some(roleId => {
      const role = availableRoles.find(r => r.roleId === roleId);
      return role?.claims?.some(c => c.claim === claimValue);
    });
  };

  const isClaimDirectlyAssigned = (claimId: number): boolean => {
    return selectedClaimIds.includes(claimId);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-blue-900 mb-1">Hybrid Permission Model (RBAC + Direct Assignment)</p>
            <p className="text-blue-700">
              <strong>Effective Permissions</strong> = Permissions from Roles + Direct Claims.
            </p>
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Assign Roles ({selectedRoleIds.length} selected)
        </h3>

        <div className="bg-white border rounded-lg divide-y max-h-40 overflow-y-auto">
          {availableRoles.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No roles available</p>
            </div>
          ) : (
            availableRoles.map(role => {
              const isSelected = selectedRoleIds.includes(role.roleId);
              const claimCount = role.claims?.length || 0;

              return (
                <label
                  key={role.roleId}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    readOnly ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleRole(role.roleId)}
                    disabled={readOnly}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{role.name}</div>
                    {role.description && (
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{role.description}</div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {claimCount} perms
                  </span>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </label>
              );
            })
          )}
        </div>
      </div>

      {/* Direct Permissions Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Assign Permissions Directly ({selectedClaimIds.length} selected)
          </h3>
          <button
            type="button"
            onClick={toggleExpandAll}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-green-200 text-green-700 hover:bg-green-50 transition-colors cursor-pointer"
          >
            {expandedModules.size === 0 ? 'Expand All' : 'Collapse All'}
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {groupedClaims.map(group => {
            const selectedInGroup = group.claims.filter(c => selectedClaimIds.includes(c.claimId)).length;
            const isExpanded = expandedModules.has(group.category);

            return (
              <div key={group.category} className="bg-white border rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleModule(group.category)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-gray-900 text-sm">{group.category}</span>
                    <span className="text-xs text-gray-500">
                      ({group.claims.length}){selectedInGroup > 0 ? ` • ${selectedInGroup} selected` : ''}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-4 gap-2">
                      {group.claims.map(claim => {
                        const isDirectlySelected = isClaimDirectlyAssigned(claim.claimId);
                        const isInherited = isClaimInheritedFromRole(claim.claim);
                        const permissionName = claim.claim.split('.')[1] || claim.claim;

                        return (
                          <label
                            key={claim.claimId}
                            className={`flex items-center justify-center gap-1.5 px-2 py-2 text-xs rounded-md border-2 font-medium cursor-pointer transition-all w-full text-center ${
                              isDirectlySelected
                                ? 'bg-green-50 border-green-300 text-green-700 shadow-sm'
                                : isInherited
                                ? 'bg-blue-50 border-blue-200 text-blue-600 hover:border-blue-300'
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                            } ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={isDirectlySelected}
                              onChange={() => toggleClaim(claim.claimId)}
                              disabled={readOnly}
                              className="w-3 h-3 accent-green-600"
                            />
                            <span className="leading-none">{permissionName}</span>
                            {isDirectlySelected && !isInherited && (
                              <CheckCircle className="w-3 h-3 flex-shrink-0" />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Effective Permissions Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          Effective Permissions ({effectivePermissions.permissions.length} total)
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {effectivePermissions.permissions.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No permissions assigned</p>
          ) : (
            effectivePermissions.permissions.map(permission => {
              const source = effectivePermissions.sources.get(permission);
              return (
                <span
                  key={permission}
                  className={`px-2 py-1 text-xs rounded-full font-medium ${
                    source === 'role'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : source === 'direct'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-purple-100 text-purple-700 border border-purple-200'
                  }`}
                >
                  {permission}
                </span>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default PermissionEditor;