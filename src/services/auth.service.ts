import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserSettings {
  documentTypes: string[];
  downloadConfig: {
    directory: string;
    retention: number;
  };
  notifications: {
    email: boolean;
    downloadComplete: boolean;
    downloadFailed: boolean;
  };
  schedule?: {
    frequency: string;
    times: string[];
  };
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    verified: boolean;
    plan: string;
    settings: UserSettings;
  };
}

// Update your ApiError interface to include the response structure
export interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
      verified?: boolean;
      userId?: string;
    };
    status?: number;
  };
  code?: string;
}

const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/login`, data);
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('user');
  },

  getCurrentUser(): AuthResponse | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  async verifyEmail(code: string, email?: string): Promise<void> {
    await axios.post(`${API_URL}/auth/verify-email`, { code, email });
  },

  async resendVerificationCode(email: string): Promise<void> {
    await axios.post(`${API_URL}/auth/resend-verification`, { email });
  },

  async requestPasswordReset(email: string): Promise<void> {
    await axios.post(`${API_URL}/auth/forgot-password`, { email });
  },
  async resetPassword(code: string, password: string, email: string): Promise<void> {
    await axios.post(`${API_URL}/auth/reset-password`, { 
      email,
      code,
      password,
      confirmPassword: password
    });
  }
};

export default authService;