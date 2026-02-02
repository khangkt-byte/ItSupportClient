import { useState, useEffect } from 'react';
import {
  workLogsApi,
  employeesApi,
  departmentsApi,
  areasApi,
  accountsApi,
  rolesApi,
} from '../api';
import type { 
  ListEmployeeDto, 
  Department, 
  AreaDto, 
  ListAccountDto, 
  RoleDto, 
  IssueLogDto,
  PaginatedResult,
  Area {/* Added Area type */}
} from '../types/data';

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
  const employees = useApiData<ListEmployeeDto>(employeesApi);
  const departments = useApiData<Department>(departmentsApi);
  const areasRaw = useApiData<AreaDto>(areasApi);
  const accounts = useApiData<ListAccountDto>(accountsApi);
  const roles = useApiData<RoleDto>(rolesApi);
  const workLogs = useApiData<IssueLogDto>(workLogsApi);

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

  return {
    employees,
    departments,
    areas,
    accounts,
    roles,
    workLogs,
  };
}