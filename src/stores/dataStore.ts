import type { Employee, Device, DeviceType, Department, Area, Account, Role, WorkLog } from '../types/data';

export const initialEmployees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    fullName: 'System Administrator',
    birthday: '1990-01-15',
    department: 'IT',
    area: 'Main Office - Bangkok',
    phoneNumber: '081-234-5678',
    email: 'admin@company.com',
    deleteDate: null,
  },
  {
    id: '2',
    employeeId: 'EMP002',
    fullName: 'John Smith',
    birthday: '1992-05-20',
    department: 'IT',
    area: 'Main Office - Bangkok',
    phoneNumber: '082-345-6789',
    email: 'john.smith@company.com',
    deleteDate: null,
  },
];

export const initialDevices: Device[] = [
  {
    id: '1',
    name: 'Office Laptop - Marketing',
    brand: 'Dell',
    model: 'Latitude 5420',
    serialNumber: 'DL2024001',
    deviceType: 'Laptop',
    description: 'Marketing department laptop',
  },
];

export const initialDeviceTypes: DeviceType[] = [
  { id: '1', name: 'Laptop', description: 'Portable computers' },
  { id: '2', name: 'Desktop', description: 'Desktop computers' },
  { id: '3', name: 'Printer', description: 'Printing devices' },
  { id: '4', name: 'Monitor', description: 'Display screens' },
];

export const initialDepartments: Department[] = [
  { id: '1', name: 'IT', description: 'Information Technology Department' },
  { id: '2', name: 'Marketing', description: 'Marketing and Sales Department' },
  { id: '3', name: 'HR', description: 'Human Resources Department' },
];

export const initialAreas: Area[] = [
  { id: '1', name: 'Main Office - Bangkok', description: 'Head office' },
  { id: '2', name: 'Branch Office - Chiang Mai', description: 'Northern branch' },
];

export const initialAccounts: Account[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    deleteDate: null,
  },
  {
    id: '2',
    employeeId: 'EMP002',
    username: 'employee',
    password: 'employee123',
    role: 'employee',
    deleteDate: null,
  },
];

export const initialRoles: Role[] = [
  { id: '1', name: 'admin' },
  { id: '2', name: 'employee' },
];

export const initialWorkLogs: WorkLog[] = [
  {
    id: '1',
    reportDate: new Date('2026-01-15T09:00:00'),
    operators: ['John Smith'],
    requester: 'Sarah Williams',
    department: 'Marketing',
    area: 'Main Office - Bangkok',
    issue: 'Network connection lost in Marketing department office',
    cause: 'Ethernet cable disconnected from network switch',
    fixDescription: 'Reconnected the ethernet cable to port 12 on switch. Tested connection and confirmed internet access restored.',
    note: 'Recommended cable management review for the area',
    status: 'completed',
  },
  {
    id: '2',
    reportDate: new Date('2026-01-16T14:00:00'),
    operators: ['John Smith'],
    requester: 'Emily Chen',
    department: 'Sales',
    area: 'Branch Office - Chiang Mai',
    issue: 'Cannot access shared network drive',
    cause: 'User account permissions were reset after password change',
    fixDescription: 'Restored user permissions to Sales shared folder. Verified access to all required directories.',
    note: 'Explained permission inheritance to user',
    status: 'completed',
  },
  {
    id: '3',
    reportDate: new Date('2026-01-17T09:30:00'),
    operators: ['System Administrator', 'John Smith'],
    requester: 'Tom Anderson',
    department: 'Operations',
    area: 'Main Office - Bangkok',
    issue: 'Computer running very slow, applications lag significantly',
    cause: 'Hard drive at 98% capacity, multiple startup programs running',
    fixDescription: 'Cleaned up temporary files and old downloads. Disabled unnecessary startup programs.',
    note: 'Scheduled for SSD upgrade next week',
    status: 'in-progress',
  },
];