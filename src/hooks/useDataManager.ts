import { useState, useEffect } from 'react';
import {
  workLogsApi,
  employeesApi,
  devicesApi,
  deviceTypesApi,
  departmentsApi,
  areasApi,
  accountsApi,
  rolesApi,
} from '../api';
import type { Employee, Device, DeviceType, Department, Area, Account, Role, WorkLog } from '../types/data';

function useApiData<T>(apiService: any) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiService.getAll();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, setData, loading };
}

export function useDataManager() {
  const employees = useApiData<Employee>(employeesApi);
  const devices = useApiData<Device>(devicesApi);
  const deviceTypes = useApiData<DeviceType>(deviceTypesApi);
  const departments = useApiData<Department>(departmentsApi);
  const areas = useApiData<Area>(areasApi);
  const accounts = useApiData<Account>(accountsApi);
  const roles = useApiData<Role>(rolesApi);
  const workLogs = useApiData<WorkLog>(workLogsApi);

  return {
    employees,
    devices,
    deviceTypes,
    departments,
    areas,
    accounts,
    roles,
    workLogs,
  };
}