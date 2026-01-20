import type { Employee } from '../types/data';
import { initialEmployees } from '../stores/dataStore';

let employeesDB = [...initialEmployees];

export const employeesApi = {
  async getAll(): Promise<Employee[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...employeesDB];
  },

  async getById(id: string): Promise<Employee | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return employeesDB.find((emp) => emp.id === id) || null;
  },

  async create(data: Omit<Employee, 'id'>): Promise<Employee> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const newEmployee: Employee = {
      ...data,
      id: Date.now().toString(),
    };
    employeesDB.push(newEmployee);
    return newEmployee;
  },

  async update(id: string, data: Partial<Employee>): Promise<Employee> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const index = employeesDB.findIndex((emp) => emp.id === id);
    if (index === -1) throw new Error('Employee not found');
    
    employeesDB[index] = { ...employeesDB[index], ...data };
    return employeesDB[index];
  },

  async delete(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    employeesDB = employeesDB.filter((emp) => emp.id !== id);
  },
};
