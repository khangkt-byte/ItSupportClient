export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    employeeId: string;
    fullName: string;
    role: 'admin' | 'employee';
    email: string;
  };
  error?: string;
}

// Mock API - Replace with real API calls
export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock authentication logic
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      return {
        success: true,
        token: 'mock-admin-token-' + Date.now(),
        user: {
          id: '1',
          username: 'admin',
          employeeId: 'EMP001',
          fullName: 'System Administrator',
          role: 'admin',
          email: 'admin@company.com',
        },
      };
    } else if (credentials.username === 'employee' && credentials.password === 'employee123') {
      return {
        success: true,
        token: 'mock-employee-token-' + Date.now(),
        user: {
          id: '2',
          username: 'employee',
          employeeId: 'EMP002',
          fullName: 'John Smith',
          role: 'employee',
          email: 'john.smith@company.com',
        },
      };
    }

    return {
      success: false,
      error: 'Invalid username or password',
    };
  },

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
  },

  async verifyToken(token: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return token.startsWith('mock-');
  },
};
