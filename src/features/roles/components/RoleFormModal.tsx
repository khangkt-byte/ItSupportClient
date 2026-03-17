import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Save, Shield, X } from 'lucide-react';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { FieldError } from '@/components/common/FieldError';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { rolesApi } from '@/services/api/roles';
import type { ClaimDto, RoleDto } from '@/types/data';
import { groupClaimsByCategory } from '@/features/roles/utils/claimGrouping';
import {
  getFieldErrorMessages,
  getGeneralValidationMessages,
  type ValidationErrors,
} from '@/utils/apiErrors';

export interface RoleFormData {
  name: string;
  description: string;
  selectedClaimIds: number[];
}

interface RoleFormModalProps {
  isOpen: boolean;
  editing: RoleDto | null;
  formData: RoleFormData;
  error: string | null;
  validationErrors: ValidationErrors | null;
  isSubmitting: boolean;
  onChange: (formData: RoleFormData) => void;
  onSubmit: (formData: RoleFormData) => Promise<void>;
  onClose: () => void;
  onClearError: () => void;
}

export function createRoleFormData(editing: RoleDto | null): RoleFormData {
  if (editing) {
    return {
      name: editing.name,
      description: editing.description || '',
      selectedClaimIds: editing.claims?.map((claim) => claim.claimId) || [],
    };
  }

  return {
    name: '',
    description: '',
    selectedClaimIds: [],
  };
}

export function RoleFormModal({
  isOpen,
  editing,
  formData,
  error,
  validationErrors,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
  onClearError,
}: RoleFormModalProps) {
  const [availableClaims, setAvailableClaims] = useState<ClaimDto[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Admin']));

  useEffect(() => {
    if (!isOpen) return;

    setExpandedGroups(new Set(['Admin']));
  }, [isOpen, editing]);

  useEffect(() => {
    if (!isOpen) return;

    const loadAvailableClaims = async () => {
      try {
        const claims = await rolesApi.getClaims();
        setAvailableClaims(claims);
      } catch (loadError) {
        console.error('Failed to load claims:', loadError);
        setAvailableClaims([]);
      }
    };

    void loadAvailableClaims();
  }, [isOpen]);

  const groupedClaims = useMemo(() => groupClaimsByCategory(availableClaims), [availableClaims]);

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
    onChange({
      ...formData,
      selectedClaimIds: formData.selectedClaimIds.includes(claimId)
        ? formData.selectedClaimIds.filter((id) => id !== claimId)
        : [...formData.selectedClaimIds, claimId],
    });
  };

  const toggleAllInCategory = (category: string) => {
    const group = groupedClaims.find((item) => item.category === category);
    if (!group) return;

    const categoryClaimIds = group.claims.map((claim) => claim.claimId);
    const allSelected = categoryClaimIds.every((id) => formData.selectedClaimIds.includes(id));

    onChange({
      ...formData,
      selectedClaimIds: allSelected
        ? formData.selectedClaimIds.filter((id) => !categoryClaimIds.includes(id))
        : [...new Set([...formData.selectedClaimIds, ...categoryClaimIds])],
    });
  };

  const toggleExpandAll = () => {
    if (expandedGroups.size === 0) {
      setExpandedGroups(new Set(groupedClaims.map((group) => group.category)));
      return;
    }
    setExpandedGroups(new Set());
  };

  const areAllClaimsSelected =
    availableClaims.length > 0 &&
    availableClaims.every((claim) => formData.selectedClaimIds.includes(claim.claimId));

  const toggleSelectAllClaims = () => {
    onChange({
      ...formData,
      selectedClaimIds: areAllClaimsSelected ? [] : availableClaims.map((claim) => claim.claimId),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const roleNameErrors = getFieldErrorMessages(validationErrors, 'Name');
  const generalValidationMessages = getGeneralValidationMessages(validationErrors, ['Name']);
  const hasRoleNameError = roleNameErrors.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card rounded-lg max-w-4xl w-full my-4 max-h-[90vh] overflow-y-auto">
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
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer hover:text-muted-foreground transition-colors text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <ErrorAlert
            message={error}
            details={generalValidationMessages}
            onDismiss={onClearError}
            dismissDisabled={isSubmitting}
            className="mx-6 mt-4"
          />
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Role Name <span className="text-error-foreground">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => onChange({ ...formData, name: e.target.value })}
                placeholder="e.g., System Administrator"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 bg-card text-foreground placeholder-placeholder transition-colors ${
                  hasRoleNameError
                    ? 'border-error-border focus:ring-error-border/30 focus:border-error-border'
                    : 'border-input focus:ring-primary-500 focus:border-transparent'
                }`}
              />
              <FieldError messages={roleNameErrors} />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => onChange({ ...formData, description: e.target.value })}
                placeholder="Brief description of this role"
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-card text-foreground placeholder-placeholder transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <label className="text-sm font-medium text-muted-foreground">
                  Permissions ({formData.selectedClaimIds.length} selected)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleSelectAllClaims}
                    className="px-3 py-1 text-sm font-medium rounded-md border border-success-border text-success-foreground hover:bg-success-background transition-colors cursor-pointer"
                  >
                    {areAllClaimsSelected ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    type="button"
                    onClick={toggleExpandAll}
                    className="px-3 py-1 text-sm font-medium rounded-md border border-success-border text-success-foreground hover:bg-success-background transition-colors cursor-pointer"
                  >
                    {expandedGroups.size === 0 ? 'Expand All' : 'Collapse All'}
                  </button>
                </div>
              </div>

              <div className="space-y-3 pr-1">
                {groupedClaims.map((group) => {
                  const isExpanded = expandedGroups.has(group.category);
                  const selectedInGroup = group.claims.filter((claim) =>
                    formData.selectedClaimIds.includes(claim.claimId)
                  ).length;
                  const allSelected =
                    group.claims.length > 0 && selectedInGroup === group.claims.length;

                  return (
                    <div key={group.category} className="bg-card border border-border rounded-lg">
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.category)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Shield className="w-5 h-5 text-success shrink-0" />
                          <span className="font-semibold text-foreground text-base">{group.category}</span>
                          <span className="text-xs text-muted-foreground">
                            ({group.claims.length}){selectedInGroup > 0 ? ` - ${selectedInGroup} selected` : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAllInCategory(group.category);
                            }}
                            className="px-3 py-1 text-xs font-medium rounded-md border border-success-border text-success-foreground hover:bg-success-background transition-colors cursor-pointer"
                          >
                            {allSelected ? 'Deselect All' : 'Select All'}
                          </button>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5">
                          <div className="grid grid-cols-4 gap-2 pt-2 pb-3">
                            {group.claims.map((claim) => {
                              const isSelected = formData.selectedClaimIds.includes(claim.claimId);
                              const permissionLabel = claim.claim || claim.category || 'Unknown.Permission';

                              return (
                                <div
                                  key={claim.claimId}
                                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors w-full justify-start ${
                                    isSelected
                                      ? 'bg-success-background text-success-foreground'
                                      : 'text-muted-foreground hover:bg-accent'
                                  } cursor-pointer`}
                                  onClick={() => toggleClaim(claim.claimId)}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    readOnly
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
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary-600 dark:bg-primary-600 text-primary-foreground rounded-lg cursor-pointer hover:bg-primary-700 dark:hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" tone="inverse" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editing ? 'Update Role' : 'Create Role'}
                </>
              )}
            </button>
            <button type="button" onClick={onClose} disabled={isSubmitting} className="btn-secondary flex-1 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
