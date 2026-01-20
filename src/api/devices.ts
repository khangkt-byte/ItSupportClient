import type { Device } from '../types/data';
import { initialDevices } from '../stores/dataStore';

let devicesDB = [...initialDevices];

export const devicesApi = {
  async getAll(): Promise<Device[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...devicesDB];
  },

  async create(data: Omit<Device, 'id'>): Promise<Device> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const newDevice: Device = { ...data, id: Date.now().toString() };
    devicesDB.push(newDevice);
    return newDevice;
  },

  async update(id: string, data: Partial<Device>): Promise<Device> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const index = devicesDB.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Device not found');
    devicesDB[index] = { ...devicesDB[index], ...data };
    return devicesDB[index];
  },

  async delete(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    devicesDB = devicesDB.filter((d) => d.id !== id);
  },
};
