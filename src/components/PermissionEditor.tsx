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

  const roleClaimIds = useMemo(() => {
    const ids = new Set<number>();
    selectedRoleIds.forEach(roleId => {
      const role = availableRoles.find(r => r.roleId === roleId);
      role?.claims?.forEach(claim => ids.add(claim.claimId));
    });
    return ids;
  }, [selectedRoleIds, availableRoles]);

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
    const isCurrentlySelected = selectedRoleIds.includes(roleId);
    
    if (isCurrentlySelected) {
      // Remove role
      const newRoles = selectedRoleIds.filter(id => id !== roleId);
      onRolesChange(newRoles);
      console.log('Role removed:', roleId, 'New roles:', newRoles);
    } else {
      // Add role and remove its claims from direct assignments
      const role = availableRoles.find(r => r.roleId === roleId);
      const roleClaimIdsToRemove = new Set(role?.claims?.map(c => c.claimId) || []);
      const nextClaims = selectedClaimIds.filter(id => !roleClaimIdsToRemove.has(id));
      
      const newRoles = [...selectedRoleIds, roleId];
      onRolesChange(newRoles);
      
      // ALWAYS call onClaimsChange when adding a role, even if nothing to remove
      // This ensures any overlapping claims are cleared
      onClaimsChange(nextClaims);
      console.log('Role added:', roleId, 'Removed claims:', Array.from(roleClaimIdsToRemove), 'New claims:', nextClaims);
    }
  };

  const roleHasClaim = (roleId: number, claimId: number): boolean => {
    const role = availableRoles.find(r => r.roleId === roleId);
    return Boolean(role?.claims?.some(c => c.claimId === claimId));
  };

  const toggleClaim = (claimId: number) => {
    if (readOnly) return;
    
    const isDirect = selectedClaimIds.includes(claimId);
    const isInherited = roleClaimIds.has(claimId);
    const isChecked = isDirect || isInherited;

    console.log('=== toggleClaim ===', { 
      claimId, 
      isDirect, 
      isInherited, 
      isChecked,
      currentRoles: selectedRoleIds,
      currentDirectClaims: selectedClaimIds 
    });

    // Unchecking a claim
    if (isChecked) {
      // If from role, remove role and preserve other claims as direct
      if (isInherited) {
        const rolesToRemove = selectedRoleIds.filter(roleId => roleHasClaim(roleId, claimId));
        console.log('ClaimId', claimId, 'is inherited from roles:', rolesToRemove);
        
        const claimsToPreserve = new Set<number>();
        rolesToRemove.forEach(roleId => {
          const role = availableRoles.find(r => r.roleId === roleId);
          role?.claims?.forEach(claim => {
            if (claim.claimId !== claimId) {
              claimsToPreserve.add(claim.claimId);
            }
          });
        });
        
        const nextRoles = selectedRoleIds.filter(roleId => !rolesToRemove.includes(roleId));
        
        const remainingRoleClaimIds = new Set<number>();
        nextRoles.forEach(roleId => {
          const role = availableRoles.find(r => r.roleId === roleId);
          role?.claims?.forEach(claim => remainingRoleClaimIds.add(claim.claimId));
        });
        
        const preservedNotInRoles = Array.from(claimsToPreserve).filter(id => !remainingRoleClaimIds.has(id));
        let nextClaims = Array.from(new Set([...selectedClaimIds, ...preservedNotInRoles]));
        
        // If it was also a direct claim, remove it
        if (isDirect) {
          nextClaims = nextClaims.filter(id => id !== claimId);
        }
        
        console.log('Removing roles:', rolesToRemove, 'Preserving claims:', preservedNotInRoles, 'Final claims:', nextClaims);
        onRolesChange(nextRoles);
        onClaimsChange(nextClaims);
        return;
      }
      
      // If only direct assignment, remove it
      if (isDirect) {
        console.log('Removing direct claim:', claimId);
        onClaimsChange(selectedClaimIds.filter(id => id !== claimId));
        return;
      }
    }

    // Checking a claim (add to direct)
    console.log('Adding direct claim:', claimId);
    onClaimsChange([...selectedClaimIds, claimId]);
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

  const selectableClaimIds = useMemo(
    () => availableClaims.filter(c => !roleClaimIds.has(c.claimId)).map(c => c.claimId),
    [availableClaims, roleClaimIds]
  );

  const areAllClaimsSelected =
    selectableClaimIds.length > 0 && selectableClaimIds.every(id => selectedClaimIds.includes(id));

  const toggleSelectAllClaims = () => {
    if (readOnly) return;
    if (areAllClaimsSelected) {
      onClaimsChange([]);
      return;
    }
    onClaimsChange(selectableClaimIds);
  };

  const toggleSelectAllInGroup = (group: PermissionGroup) => {
    if (readOnly) return;
    const groupIds = group.claims.map(c => c.claimId);
    const selectableGroupIds = groupIds.filter(id => !roleClaimIds.has(id));
    const areAllSelected =
      selectableGroupIds.length > 0 && selectableGroupIds.every(id => selectedClaimIds.includes(id));
    const next = areAllSelected
      ? selectedClaimIds.filter(id => !selectableGroupIds.includes(id))
      : Array.from(new Set([...selectedClaimIds, ...selectableGroupIds]));
    onClaimsChange(next);
  };

  const isClaimDirectlyAssigned = (claimId: number): boolean => {
    return selectedClaimIds.includes(claimId);
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-primary-900 mb-1">Hybrid Permission Model (RBAC + Direct Assignment)</p>
            <p className="text-primary-700">
              <strong>Effective Permissions</strong> = Permissions from Roles + Direct Claims.
            </p>
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-600" />
          Assign Roles ({selectedRoleIds.length} selected)
        </h3>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
          {availableRoles.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
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
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    readOnly ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleRole(role.roleId)}
                    disabled={readOnly}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-gray-50">{role.name}</div>
                    {role.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{role.description}</div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {claimCount} perms
                  </span>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-primary-600 shrink-0" />
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
            <Shield className="w-5 h-5 text-success" />
            Assign Permissions Directly ({selectedClaimIds.length} selected)
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAllClaims}
              disabled={readOnly}
              className={`px-3 py-1 text-sm font-medium rounded-md border border-success-border text-success-foreground transition-colors ${
                readOnly ? 'opacity-60 cursor-not-allowed' : 'hover:bg-success-background cursor-pointer'
              }`}
            >
              {areAllClaimsSelected ? 'Deselect All' : 'Select All'}
            </button>
            <button
              type="button"
              onClick={toggleExpandAll}
              className="px-3 py-1 text-sm font-medium rounded-md border border-success-border text-success-foreground hover:bg-success-background transition-colors cursor-pointer"
            >
              {expandedModules.size === 0 ? 'Expand All' : 'Collapse All'}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {groupedClaims.map(group => {
            const selectedInGroup = group.claims.filter(c => selectedClaimIds.includes(c.claimId)).length;
            const isExpanded = expandedModules.has(group.category);
            const selectableGroupIds = group.claims
              .map(c => c.claimId)
              .filter(id => !roleClaimIds.has(id));
            const areAllSelectedInGroup =
              selectableGroupIds.length > 0 && selectableGroupIds.every(id => selectedClaimIds.includes(id));

            return (
              <div key={group.category} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleModule(group.category)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Shield className="w-5 h-5 text-success shrink-0" />
                    <span className="font-semibold text-gray-900 dark:text-gray-50 text-base">{group.category}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({group.claims.length}){selectedInGroup > 0 ? ` • ${selectedInGroup} selected` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectAllInGroup(group);
                      }}
                      disabled={readOnly}
                      className={`px-3 py-1 text-xs font-medium rounded-md border border-success-border text-success-foreground transition-colors ${
                        readOnly ? 'opacity-60 cursor-not-allowed' : 'hover:bg-success-background cursor-pointer'
                      }`}
                    >
                      {areAllSelectedInGroup ? 'Deselect All' : 'Select All'}
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5">
                    <div className="grid grid-cols-4 gap-2 pt-2 pb-3">
                      {group.claims.map(claim => {
                        const isDirectlySelected = isClaimDirectlyAssigned(claim.claimId);
                        const isInherited = roleClaimIds.has(claim.claimId);
                        const isChecked = isDirectlySelected || isInherited;
                        const permissionLabel = claim.claim || claim.category || 'Unknown.Permission';

                        return (
                          <div
                            key={claim.claimId}
                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors w-full justify-start ${
                              isDirectlySelected
                                ? 'bg-success-background text-success-foreground'
                                : isInherited
                                ? 'bg-info-background text-info-foreground'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            } ${readOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                            onClick={() => {
                              if (!readOnly) {
                                console.log('Click on permission:', claim.claim);
                                toggleClaim(claim.claimId);
                              }
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              disabled={readOnly}
                              className="w-4 h-4 accent-green-600 pointer-events-none"
                            />
                            <span className="leading-none">{permissionLabel}</span>
                          </div>
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
      <div className="bg-linear-to-r from-primary-50 to-green-50 border border-primary-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
          <CheckCircle className="w-5 h-5 text-primary-600" />
          Effective Permissions ({effectivePermissions.permissions.length} total)
        </h4>
        <div className="flex flex-wrap gap-2">
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
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
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