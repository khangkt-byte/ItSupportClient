export interface Role {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  birthday: string;
  department: string;
  area: string;
  phoneNumber: string;
  email: string;
  deleteDate: string | null;
}

export interface Device {
  id: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  deviceType: string;
  description: string;
}

export interface DeviceType {
  id: string;
  name: string;
  description: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
}

export interface Area {
  id: string;
  name: string;
  description: string;
}

export interface Account {
  id: string;
  employeeId: string;
  username: string;
  password: string;
  role: string;
  deleteDate: string | null;
}

export type WorkStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface WorkLog {
  id: string;
  reportDate: Date;
  operators: string[]; // Changed from operator: string to operators: string[]
  requesters: string[]; // Changed from requester: string to requesters: string[]
  department: string;
  area: string;
  issue: string;
  cause: string;
  fixDescription: string;
  note: string;
  status: WorkStatus;
}