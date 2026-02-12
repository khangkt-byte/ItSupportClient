/**
 * Permission Constants
 * Must match backend: PermissionSeeders.cs & Permissions.cs
 * 
 * References:
 * - Backend: ITSupportServer/Data/Seeds/PermissionSeeders.cs
 * - Backend: ITSupportServer/src/Modules/Authorization/Permissions.cs
 */

/**
 * Permission structure matching backend exactly
 */
export const Permissions = {
  // Admin superuser
  Admin: 'Admin',

  // Area permissions
  Area: {
    View: 'Area.View',
    Create: 'Area.Create',
    Edit: 'Area.Edit',
    Delete: 'Area.Delete',
  },

  // Department permissions
  Department: {
    View: 'Department.View',
    Create: 'Department.Create',
    Edit: 'Department.Edit',
    Delete: 'Department.Delete',
  },

  // Employee permissions
  Employee: {
    View: 'Employee.View',
    Create: 'Employee.Create',
    Edit: 'Employee.Edit',
    Delete: 'Employee.Delete',
  },

  // Account permissions
  Account: {
    View: 'Account.View',
    Create: 'Account.Create',
    Edit: 'Account.Edit',
    Delete: 'Account.Delete',
  },

  // Role permissions
  Role: {
    View: 'Role.View',
    Create: 'Role.Create',
    Edit: 'Role.Edit',
    Delete: 'Role.Delete',
  },

  // IssueLog permissions (main feature)
  IssueLog: {
    View: 'IssueLog.View',
    Create: 'IssueLog.Create',
    Edit: 'IssueLog.Edit',
    Delete: 'IssueLog.Delete',
  },

  // Issue permissions
  Issue: {
    View: 'Issue.View',
    Create: 'Issue.Create',
    Edit: 'Issue.Edit',
    Delete: 'Issue.Delete',
  },

  // Cause permissions
  Cause: {
    View: 'Cause.View',
    Create: 'Cause.Create',
    Edit: 'Cause.Edit',
    Delete: 'Cause.Delete',
  },

  // Device permissions
  Device: {
    View: 'Device.View',
    Create: 'Device.Create',
    Edit: 'Device.Edit',
    Delete: 'Device.Delete',
  },

  // DeviceType permissions
  DeviceType: {
    View: 'DeviceType.View',
    Create: 'DeviceType.Create',
    Edit: 'DeviceType.Edit',
    Delete: 'DeviceType.Delete',
  },
} as const;

/**
 * Role names (for display)
 */
export const Roles = {
  Admin: 'Admin',
  Employee: 'Employee',
  Manager: 'Manager',
  Viewer: 'Viewer',
} as const;

/**
 * Type definitions
 */
export type Permission = typeof Permissions[keyof typeof Permissions];
export type Role = typeof Roles[keyof typeof Roles];
