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
  departmentsApi
} from '../api';
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
  RoleDto
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
      ...dto,
      id: dto.accountId,
      employeeId: dto.accountId, // Use accountId as employeeId
      employeeName: dto.empName, // Map for backward compatibility
      employeeCode: dto.empCode,
      role: 'employee', // Default role, should be determined from roles array
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

  // Fetch departments (using hardcoded data since API doesn't provide it)
  const fetchDepartments = async () => {
    try {
      const depts = await departmentsApi.getAll();
      setDepartments(depts);
    } catch (err: any) {
      console.error('Failed to fetch departments:', err);
      // Use fallback data
      setDepartments([
        { id: 1, name: 'IT Department', description: 'Information Technology' },
        { id: 2, name: 'HR Department', description: 'Human Resources' },
        { id: 3, name: 'Finance Department', description: 'Finance' },
        { id: 4, name: 'Operations', description: 'Operations' },
      ]);
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
  };
}
