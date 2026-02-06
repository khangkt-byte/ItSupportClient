/**
 * Central data loading hook for fetching data from API
 * Replaces mock data with real API calls
 */

import { useState, useEffect } from 'react';
import {
  workLogsApi,
  employeesApi,
  areasApi,
  accountsApi,
  rolesApi,
} from '../api';
import { departmentApi } from '../lib/api/departments';
import { issueLogsToWorkLogs } from '../utils/workLogAdapter';
import type {
  WorkLog,
  Employee,
  Area,
  Account,
  Role,
  Department,
  ListEmployeeDto,
  AreaDto,
  ListAccountDto,
  RoleDto,
  DepartmentDto
} from '../types/data';

interface UseDataLoaderReturn {
  workLogs: WorkLog[];
  employees: Employee[];
  areas: Area[];
  accounts: Account[];
  roles: Role[];
  departments: Department[];
  loading: boolean;
  error: string | null;
  refetchWorkLogs: () => Promise<void>;
  refetchEmployees: () => Promise<void>;
  refetchAreas: () => Promise<void>;
  refetchAccounts: () => Promise<void>;
  refetchRoles: () => Promise<void>;
  refetchDepartments: () => Promise<void>;
}

/**
 * Main data loader hook - fetches all data needed for the app
 */
export function useDataLoader(): UseDataLoaderReturn {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert ListEmployeeDto[] to Employee[]
  const mapEmployees = (dtos: ListEmployeeDto[]): Employee[] => {
    return dtos.map(dto => ({
      ...dto,
      id: dto.empId,
      employeeId: dto.empCode || dto.empId,
      deleteDate: null,
    }));
  };

  // Convert AreaDto[] to Area[]
  const mapAreas = (dtos: AreaDto[]): Area[] => {
    return dtos.map(dto => ({
      ...dto,
      id: String(dto.areaId),
    }));
  };

  // Convert ListAccountDto[] to Account[]
  const mapAccounts = (dtos: ListAccountDto[]): Account[] => {
    return dtos.map(dto => ({
      ...(dto as { roles?: RoleDto[] | null }),
      ...dto,
      id: dto.accountId,
      employeeId: dto.accountId, // Use accountId as employeeId
      employeeName: dto.empName, // Map for backward compatibility
      employeeCode: dto.empCode,
      role: (dto as { roles?: RoleDto[] | null }).roles?.length
        ? (dto as { roles?: RoleDto[] | null }).roles!.map(role => role.name).join(', ')
        : 'No Role',
      roles: (dto as { roles?: RoleDto[] | null }).roles || null,
      password: '', // Not returned from API
      deleteDate: null,
    }));
  };

  // Convert RoleDto[] to Role[]
  const mapRoles = (dtos: RoleDto[]): Role[] => {
    return dtos.map(dto => ({
      ...dto,
      id: String(dto.roleId),
    }));
  };

  // Convert DepartmentDto[] to Department[]
  const mapDepartments = (dtos: DepartmentDto[]): Department[] => {
    return dtos.map(dto => ({
      id: dto.dptId,
      departmentId: dto.dptId, // Add for API compatibility
      name: dto.name,
      description: dto.description || '',
    }));
  };

  // Fetch work logs
  const fetchWorkLogs = async () => {
    try {
      const response = await workLogsApi.getAll({ pageSize: 1000 }); // Get all work logs
      const mappedLogs = issueLogsToWorkLogs(response.items);
      setWorkLogs(mappedLogs);
    } catch (err: any) {
      console.error('Failed to fetch work logs:', err);
      throw err;
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await employeesApi.getAll({ pageSize: 1000 });
      const mapped = mapEmployees(response.items);
      setEmployees(mapped);
    } catch (err: any) {
      console.error('Failed to fetch employees:', err);
      throw err;
    }
  };

  // Fetch areas
  const fetchAreas = async () => {
    try {
      const response = await areasApi.getAll({ pageSize: 100 });
      const mapped = mapAreas(response.items);
      setAreas(mapped);
    } catch (err: any) {
      console.error('Failed to fetch areas:', err);
      throw err;
    }
  };

  // Fetch accounts
  const fetchAccounts = async () => {
    try {
      const response = await accountsApi.getAll({ pageSize: 1000 });
      const mapped = mapAccounts(response.items);
      setAccounts(mapped);
    } catch (err: any) {
      console.error('Failed to fetch accounts:', err);
      throw err;
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const response = await rolesApi.getAll({ pageSize: 100 });
      const mapped = mapRoles(response.items);
      setRoles(mapped);
    } catch (err: any) {
      console.error('Failed to fetch roles:', err);
      throw err;
    }
  };

  // Fetch departments from API
  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getAll({ pageSize: 100 });
      const mapped = mapDepartments(response.items);
      setDepartments(mapped);
    } catch (err: any) {
      console.error('Failed to fetch departments:', err);
      // Don't use fallback - let error propagate
      throw err;
    }
  };

  // Initial data load
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([
          fetchWorkLogs(),
          fetchEmployees(),
          fetchAreas(),
          fetchAccounts(),
          fetchRoles(),
          fetchDepartments(),
        ]);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  return {
    workLogs,
    employees,
    areas,
    accounts,
    roles,
    departments,
    loading,
    error,
    refetchWorkLogs: fetchWorkLogs,
    refetchEmployees: fetchEmployees,
    refetchAreas: fetchAreas,
    refetchAccounts: fetchAccounts,
    refetchRoles: fetchRoles,
    refetchDepartments: fetchDepartments,
  };
}