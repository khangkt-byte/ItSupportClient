import type { DeviceType, Department, Area, Account, Role } from '../types/data';
import { initialDeviceTypes, initialDepartments, initialAreas, initialAccounts, initialRoles } from '../stores/dataStore';

// Generic CRUD API factory
function createCrudApi<T extends { id: string }>(initialData: T[], entityName: string) {
  let db = [...initialData];

  return {
    async getAll(): Promise<T[]> {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [...db];
    },

    async create(data: Omit<T, 'id'>): Promise<T> {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const newItem = { ...data, id: Date.now().toString() } as T;
      db.push(newItem);
      return newItem;
    },

    async update(id: string, data: Partial<T>): Promise<T> {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = db.findIndex((item) => item.id === id);
      if (index === -1) throw new Error(`${entityName} not found`);
      db[index] = { ...db[index], ...data };
      return db[index];
    },

    async delete(id: string): Promise<void> {
      await new Promise((resolve) => setTimeout(resolve, 300));
      db = db.filter((item) => item.id !== id);
    },

    // For testing/development - reset to initial state
    reset() {
      db = [...initialData];
    },
  };
}

export const deviceTypesApi = createCrudApi<DeviceType>(initialDeviceTypes, 'Device Type');
export const departmentsApi = createCrudApi<Department>(initialDepartments, 'Department');
export const areasApi = createCrudApi<Area>(initialAreas, 'Area');
export const accountsApi = createCrudApi<Account>(initialAccounts, 'Account');
export const rolesApi = createCrudApi<Role>(initialRoles, 'Role');
