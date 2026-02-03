import type { 
  ListEmployeeDto, 
  Department, 
  AreaDto, 
  ListAccountDto, 
  RoleDto, 
  IssueLogDto,
  PaginatedResult,
  Area, // Area type
  Employee, // Employee type
  Account, // Account type
  Role, // Role type
  WorkLog // WorkLog type
} from '../types/data';
import { useState, useEffect } from 'react';
import {
  workLogsApi,
  employeesApi,
  departmentsApi,
  areasApi,
  accountsApi,
  rolesApi,
} from '../api';

function useApiData<T>(apiService: any) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // For workLogs and other paginated APIs, request a large page size
        const result = await apiService.getAll({ page: 1, pageSize: 1000 });
        // Handle paginated results
        if (result && 'items' in result) {
          setData(result.items);
        } else if (Array.isArray(result)) {
          setData(result);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, setData, loading };
}

export function useDataManager() {
  const employeesRaw = useApiData<ListEmployeeDto>(employeesApi);
  const departments = useApiData<Department>(departmentsApi);
  const areasRaw = useApiData<AreaDto>(areasApi);
  const accountsRaw = useApiData<ListAccountDto>(accountsApi);
  const rolesRaw = useApiData<RoleDto>(rolesApi);
  const workLogsRaw = useApiData<IssueLogDto>(workLogsApi);

  // Transform AreaDto to Area (add id field for backward compatibility)
  const areas = {
    data: areasRaw.data.map(area => ({
      ...area,
      id: String(area.areaId) // Area type extends AreaDto with string id
    } as Area)),
    setData: (newData: Area[]) => {
      areasRaw.setData(newData);  // Pass through, Area is compatible with AreaDto
    },
    loading: areasRaw.loading
  };

  // Transform ListEmployeeDto to Employee
  const employees = {
    data: employeesRaw.data.map(emp => ({
      ...emp,
      id: emp.empId,
      employeeId: emp.empCode || emp.empId,
      deleteDate: null
    } as Employee)),
    setData: (newData: Employee[]) => {
      employeesRaw.setData(newData as ListEmployeeDto[]);
    },
    loading: employeesRaw.loading
  };

  // Transform ListAccountDto to Account
  const accounts = {
    data: accountsRaw.data.map(acc => ({
      ...acc,
      id: acc.accountId,
      role: 'employee', // Default role, should be fetched from roles
      password: '********', // Placeholder
      employeeId: acc.accountId,
      employeeName: acc.empName,
      employeeCode: acc.empCode,
      deleteDate: null
    } as Account)),
    setData: (newData: Account[]) => {
      accountsRaw.setData(newData as ListAccountDto[]);
    },
    loading: accountsRaw.loading
  };

  // Transform RoleDto to Role
  const roles = {
    data: rolesRaw.data.map(role => ({
      ...role,
      id: String(role.roleId)
    } as Role)),
    setData: (newData: Role[]) => {
      rolesRaw.setData(newData as RoleDto[]);
    },
    loading: rolesRaw.loading
  };

  // Transform IssueLogDto to WorkLog
  const workLogs = {
    data: workLogsRaw.data.map(log => ({
      ...log,
      id: log.issLogId,
      reportDate: log.dateReported,
      operators: log.operator ? [log.operator] : [],
      requesters: log.requester ? [log.requester] : [],
      department: log.departmentName || '',
      area: log.areaName || '',
      issue: log.issueDescription,
      cause: log.cause || '',
      fixDescription: log.resolution || '',
      note: log.notes || '',
      status: log.status as any // Assuming IssueLogDto.status is compatible
    } as WorkLog)),
    setData: (newData: WorkLog[]) => {
      workLogsRaw.setData(newData as unknown as IssueLogDto[]);
    },
    loading: workLogsRaw.loading
  };

  return {
    employees,
    departments,
    areas,
    accounts,
    roles,
    workLogs,
  };
}