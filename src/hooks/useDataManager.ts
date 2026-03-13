import type {
  ListEmployeeDto,
  Department,
  AreaDto,
  ListAccountDto,
  RoleDto,
  PaginatedResult,
  Area, // Area type
  Employee, // Employee type
  Account, // Account type
  Role, // Role type
  DepartmentDto
} from '@/types/data';
import { useState, useEffect } from 'react';
import {
  employeesApi,
  areasApi,
  accountsApi,
  rolesApi,
  departmentApi, // Updated: singular name
} from '@/services/api';

function useApiData<T>(apiService: any) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Request a large page size to load all lookup data (departments, areas, etc.)
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
  const departmentsRaw = useApiData<DepartmentDto>(departmentApi);
  const areasRaw = useApiData<AreaDto>(areasApi);
  const accountsRaw = useApiData<ListAccountDto>(accountsApi);
  const rolesRaw = useApiData<RoleDto>(rolesApi);
  // Transform DepartmentDto to Department
  const departments = {
    data: departmentsRaw.data.map(dept => ({
      id: dept.dptId,
      name: dept.name,
      description: dept.description || '',
      dptId: dept.dptId, // Add for API compatibility
    } as Department)),
    setData: (newData: Department[]) => {
      departmentsRaw.setData(newData as unknown as DepartmentDto[]);
    },
    loading: departmentsRaw.loading
  };

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
    data: employeesRaw.data.map(emp => {
      // Look up department and area names from the lookup data
      const dept = departmentsRaw.data.find(d => d.dptId === emp.dptId);
      const area = areasRaw.data.find(a => a.areaId === emp.areaId);
      return {
        ...emp,
        id: emp.empId,
        employeeId: emp.empCode || emp.empId,
        department: dept?.name || '',
        area: area?.name || '',
        deleteDate: null
      } as Employee;
    }),
    setData: (newData: Employee[]) => {
      employeesRaw.setData(newData as ListEmployeeDto[]);
    },
    loading: employeesRaw.loading
  };

  // Transform ListAccountDto to Account
  const accounts = {
    data: accountsRaw.data.map(acc => ({
      ...(acc as { roles?: RoleDto[] | null }),
      ...acc,
      id: acc.accountId,
      role: (acc as { roles?: RoleDto[] | null }).roles?.length
        ? (acc as { roles?: RoleDto[] | null }).roles!.map(role => role.name).join(', ')
        : 'No Role',
      roles: (acc as { roles?: RoleDto[] | null }).roles || null,
      password: '********', // Placeholder - never show real password
      employeeId: acc.empCode || acc.accountId, // Use empCode as fallback
      employeeName: acc.empName || 'Unknown', // Use empName from API
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

  return {
    employees,
    departments,
    areas,
    accounts,
    roles,
  };
}
