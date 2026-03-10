/**
 * Professional Permission Editor Component
 * 
 * - Module-based layout (one module per row)
 * - Each module can collapse/expand
 * - Permissions are displayed in a 4-column grid
 * - Additive model: Effective = Role permissions + Direct permissions
 */

import { useEffect, useMemo, useState } from 'react';
import { Shield, CheckCircle, Info, ChevronDown, ChevronUp, Search, AlertCircle, Lock, X } from 'lucide-react';
import type { RoleDto, ClaimDto } from '@/types/data';
import { RoleUnlinkConfirmDialog } from '@/components/common/RoleUnlinkConfirmDialog';

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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showOnlyAssigned, setShowOnlyAssigned] = useState<boolean>(false);
  const [isRoleUnlinkDialogOpen, setIsRoleUnlinkDialogOpen] = useState<boolean>(false);
  const [pendingUnlinkData, setPendingUnlinkData] = useState<{
    claimId: number;
    permissionName: string;
    rolesToRemove: RoleDto[];
  } | null>(null);

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

  useEffect(() => {
    // Keep direct claims as explicit-only: remove claims already inherited from selected roles.
    const sanitizedClaims = selectedClaimIds.filter(claimId => !roleClaimIds.has(claimId));
    if (sanitizedClaims.length !== selectedClaimIds.length) {
      onClaimsChange(sanitizedClaims);
    }
  }, [selectedClaimIds, roleClaimIds, onClaimsChange]);

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

    // Unchecking a claim
    if (isChecked) {
      // If from role, show confirmation dialog
      if (isInherited) {
        const rolesToRemove = selectedRoleIds
          .filter(roleId => roleHasClaim(roleId, claimId))
          .map(roleId => availableRoles.find(r => r.roleId === roleId)!)
          .filter(Boolean);
        
        const claim = availableClaims.find(c => c.claimId === claimId);
        const permissionName = claim?.claim || claim?.category || 'Unknown.Permission';
        
        setPendingUnlinkData({
          claimId,
          permissionName,
          rolesToRemove
        });
        setIsRoleUnlinkDialogOpen(true);
        return;
      }
      
      // If only direct assignment, remove it immediately
      if (isDirect) {
        onClaimsChange(selectedClaimIds.filter(id => id !== claimId));
        return;
      }
    }

    // Checking a claim (add to direct)
    onClaimsChange([...selectedClaimIds, claimId]);
  };

  const handleConfirmUnlink = () => {
    if (!pendingUnlinkData) return;

    const { claimId, rolesToRemove: rolesToRemoveData } = pendingUnlinkData;
    const rolesToRemove = rolesToRemoveData.map(r => r.roleId);
    
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
    const isDirect = selectedClaimIds.includes(claimId);
    if (isDirect) {
      nextClaims = nextClaims.filter(id => id !== claimId);
    }
    
    onRolesChange(nextRoles);
    onClaimsChange(nextClaims);
    setIsRoleUnlinkDialogOpen(false);
    setPendingUnlinkData(null);
  };

  const handleCancelUnlink = () => {
    setIsRoleUnlinkDialogOpen(false);
    setPendingUnlinkData(null);
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

  // Filter roles by search term
  const filteredRoles = useMemo(() => {
    if (!searchTerm.trim()) return availableRoles;
    const term = searchTerm.toLowerCase();
    return availableRoles.filter(role =>
      role.name.toLowerCase().includes(term) ||
      (role.description && role.description.toLowerCase().includes(term))
    );
  }, [availableRoles, searchTerm]);

  // Filter claims by search term
  const filteredGroupedClaims = useMemo(() => {
    if (!searchTerm.trim()) {
      if (!showOnlyAssigned) return groupedClaims;
      return groupedClaims.map(g => ({
        ...g,
        claims: g.claims.filter(c => selectedClaimIds.includes(c.claimId) || roleClaimIds.has(c.claimId))
      })).filter(g => g.claims.length > 0);
    }

    const term = searchTerm.toLowerCase();
    const filtered = groupedClaims.map(g => ({
      ...g,
      claims: g.claims.filter(c => {
        const matchesTerm = 
          (c.claim?.toLowerCase() || '').includes(term) ||
          (c.category?.toLowerCase() || '').includes(term);
        const isAssigned = selectedClaimIds.includes(c.claimId) || roleClaimIds.has(c.claimId);
        return matchesTerm && (!showOnlyAssigned || isAssigned);
      })
    })).filter(g => g.claims.length > 0);

    return filtered;
  }, [groupedClaims, searchTerm, showOnlyAssigned, selectedClaimIds, roleClaimIds]);

  return (
    <div className="space-y-6">
      {/* Information Banner - Best Practice: Clear Explanation of Hybrid Model */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-primary-900 mb-2">
              🔒 Hybrid Permission Model (RBAC + Direct Assignment)
            </p>
            <ul className="text-primary-700 space-y-1 ml-4 list-disc">
              <li>
                <strong>Effective Permissions</strong> = Permissions from Assigned Roles + Directly Assigned Claims
              </li>
              <li>
                <strong>Principle of Least Privilege:</strong> Only assign permissions that are actually needed
              </li>
              <li>
                <strong>Blue indicators</strong> = from Roles (inherited) | <strong>Green indicators</strong> = Direct Claims
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar - Match SearchFilterBar styling */}
      <div className="bg-card border border-border rounded-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-muted-foreground/60" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Search roles and permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search roles and permissions"
              className="w-full h-10 pl-10 pr-10 text-sm border border-input/60 rounded-lg bg-background/50 text-foreground placeholder:text-muted-foreground/50 
                focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 hover:border-input transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground/50 hover:text-foreground transition-colors"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Show Only Assigned Toggle */}
          <label className="flex items-center gap-2 cursor-pointer h-10 px-3 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/50 transition-all duration-200 whitespace-nowrap text-sm">
            <input
              type="checkbox"
              checked={showOnlyAssigned}
              onChange={(e) => setShowOnlyAssigned(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded border-input focus:ring-primary-500 cursor-pointer"
              aria-label="Show only assigned permissions"
            />
            <span className="text-muted-foreground">Show Assigned Only</span>
          </label>
        </div>
      </div>

      {/* Roles Section - Best Practice: Clear Role Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600" />
            Assign Roles
            <span className="text-sm font-medium text-muted-foreground">
              ({selectedRoleIds.length} of {filteredRoles.length})
            </span>
          </h3>
          {readOnly && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              <Lock className="w-3 h-3" />
              Read-only
            </span>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg divide-y divide-border overflow-hidden">
          {filteredRoles.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-2 text-placeholder" />
              <p className="text-sm">{searchTerm ? 'No roles match your search' : 'No roles available'}</p>
            </div>
          ) : (
            filteredRoles.map(role => {
              const isSelected = selectedRoleIds.includes(role.roleId);
              const claimCount = role.claims?.length || 0;
              const assignedCount = role.claims?.filter(c => selectedClaimIds.includes(c.claimId)).length || 0;

              return (
                <div
                  key={role.roleId}
                  onClick={() => !readOnly && toggleRole(role.roleId)}
                  className={`flex items-center gap-3 p-4 transition-all ${
                    readOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-accent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {
                      if (!readOnly) {
                        toggleRole(role.roleId);
                      }
                    }}
                    disabled={readOnly}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 text-primary-600 rounded border-input focus:ring-primary-500 cursor-pointer"
                    aria-label={`Select ${role.name} role`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground flex items-center gap-2">
                      {role.name}
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-primary-600 shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {role.description && <p>{role.description}</p>}
                      <p className="text-xs mt-1">
                        Permissions: {claimCount} total
                        {assignedCount > 0 && ` (${assignedCount} in direct claims)`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Direct Permissions Section - Best Practice: Clear Separation from Roles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <Shield className="w-5 h-5 text-success" />
            Assign Direct Permissions
            <span className="text-sm font-medium text-muted-foreground">
              ({selectedClaimIds.length} selected)
            </span>
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleSelectAllClaims}
              disabled={readOnly}
              className={`px-3 py-1 text-sm font-medium rounded-md border border-success-border text-success-foreground transition-colors ${
                readOnly ? 'opacity-60 cursor-not-allowed' : 'hover:bg-success-background cursor-pointer'
              }`}
              aria-label={areAllClaimsSelected ? 'Deselect all permissions' : 'Select all permissions'}
            >
              {areAllClaimsSelected ? 'Deselect All' : 'Select All'}
            </button>
            <button
              type="button"
              onClick={toggleExpandAll}
              className="px-3 py-1 text-sm font-medium rounded-md border border-success-border text-success-foreground hover:bg-success-background transition-colors cursor-pointer"
              aria-label={expandedModules.size === 0 ? 'Expand all sections' : 'Collapse all sections'}
            >
              {expandedModules.size === 0 ? 'Expand All' : 'Collapse All'}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredGroupedClaims.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 text-placeholder" />
              <p className="text-sm">{searchTerm ? 'No permissions match your search' : 'No permissions available'}</p>
            </div>
          ) : (
            filteredGroupedClaims.map(group => {
              const selectedInGroup = group.claims.filter(c => selectedClaimIds.includes(c.claimId)).length;
              const isExpanded = expandedModules.has(group.category);
              const selectableGroupIds = group.claims
                .map(c => c.claimId)
                .filter(id => !roleClaimIds.has(id));
              const areAllSelectedInGroup =
                selectableGroupIds.length > 0 && selectableGroupIds.every(id => selectedClaimIds.includes(id));

              return (
                <div key={group.category} className="bg-card border border-border rounded-lg overflow-hidden">
                  {/* Category Header */}
                  <div 
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent transition-colors cursor-pointer group"
                    onClick={() => toggleModule(group.category)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleModule(group.category);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Shield className="w-5 h-5 text-success shrink-0" />
                      <span className="font-semibold text-foreground text-base">{group.category}</span>
                      <span className="text-xs text-muted-foreground">
                        ({group.claims.length} permissions)
                        {selectedInGroup > 0 && (
                          <span className="ml-2 inline-flex items-center gap-1 text-success">
                            ✓ {selectedInGroup} selected
                          </span>
                        )}
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
                        aria-label={areAllSelectedInGroup ? `Deselect all ${group.category}` : `Select all ${group.category}`}
                      >
                        {areAllSelectedInGroup ? 'Deselect' : 'Select'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleModule(group.category)}
                        className="p-1 cursor-pointer hover:bg-accent rounded transition-colors"
                        aria-label={isExpanded ? `Collapse ${group.category}` : `Expand ${group.category}`}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Permissions Grid - Best Practice: Compact 4-column layout for scanning */}
                  {isExpanded && (
                    <div className="px-5">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-3 pb-4">
                        {group.claims.map(claim => {
                          const isDirectlySelected = isClaimDirectlyAssigned(claim.claimId);
                          const isInherited = roleClaimIds.has(claim.claimId);
                          const isChecked = isDirectlySelected || isInherited;
                          const permissionLabel = claim.claim || claim.category || 'Unknown.Permission';

                          return (
                            <div
                              key={claim.claimId}
                              onClick={() => {
                                if (!readOnly) {
                                  toggleClaim(claim.claimId);
                                }
                              }}
                              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all border cursor-pointer ${
                                isDirectlySelected
                                  ? 'bg-success-background text-success-foreground border-success-border font-medium'
                                  : isInherited
                                  ? 'bg-info-background text-info-foreground border-info-border font-medium'
                                  : 'text-muted-foreground hover:bg-accent border-transparent hover:border-border'
                              } ${readOnly ? 'opacity-60 cursor-not-allowed' : ''} group/permission`}
                              role="button"
                              tabIndex={readOnly ? -1 : 0}
                              onKeyDown={(e) => {
                                if ((e.key === 'Enter' || e.key === ' ') && !readOnly) {
                                  e.preventDefault();
                                  toggleClaim(claim.claimId);
                                }
                              }}
                              aria-pressed={isChecked}
                              title={isInherited ? `Inherited from assigned role. Click to remove.` : permissionLabel}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                readOnly
                                disabled={readOnly}
                                className={`w-3 h-3 pointer-events-none shrink-0 ${
                                  isInherited ? 'accent-info-600' : 'accent-green-600'
                                }`}
                                aria-label={permissionLabel}
                              />
                              <span className="leading-none">{permissionLabel}</span>
                              {isInherited && !isDirectlySelected && (
                                <span className="ml-auto shrink-0" title="Inherited from role">
                                  <Shield className="w-3 h-3 opacity-70" />
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Effective Permissions Summary - Best Practice: Clear Overview */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary-600" />
          Effective Permissions Summary
          <span className="text-sm font-normal text-muted-foreground">
            ({effectivePermissions.permissions.length} total)
          </span>
        </h4>
        
        {effectivePermissions.permissions.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">No permissions assigned</p>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {effectivePermissions.permissions.map(permission => {
                const source = effectivePermissions.sources.get(permission);
                return (
                  <span
                    key={permission}
                    className={`px-2.5 py-1.5 text-xs rounded-full font-medium inline-flex items-center gap-1 border ${
                      source === 'role'
                        ? 'bg-primary-100 text-primary-700 border-primary-300'
                        : source === 'direct'
                        ? 'bg-success-background text-success-foreground border-success-border'
                        : 'bg-info-background text-info-foreground border-info-border'
                    }`}
                    title={
                      source === 'role'
                        ? 'Inherited from assigned role'
                        : source === 'direct'
                        ? 'Directly assigned'
                        : 'From both role and direct assignment'
                    }
                  >
                    {source === 'role' && '👤 '}
                    {source === 'direct' && '✓ '}
                    {source === 'both' && '⚡ '}
                    {permission}
                  </span>
                );
              })}
            </div>
            <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border space-y-1">
              <p><span className="text-primary-600">👤</span> = from Assigned Role (inherited)</p>
              <p><span className="text-success-600">✓</span> = Directly Assigned Permission</p>
              <p><span className="text-info-600">⚡</span> = Both from Role + Direct Assignment</p>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <RoleUnlinkConfirmDialog
        isOpen={isRoleUnlinkDialogOpen}
        onClose={handleCancelUnlink}
        onConfirm={handleConfirmUnlink}
        permissionName={pendingUnlinkData?.permissionName || ''}
        rolesToRemove={pendingUnlinkData?.rolesToRemove || []}
      />
    </div>
  );
}

export default PermissionEditor;