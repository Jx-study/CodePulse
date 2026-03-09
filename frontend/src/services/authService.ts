import apiService from '@/api/api';
import type { AuthResponse, AuthStatusResponse } from '@/types';

const authService = {
  async login(usernameOrEmail: string, password: string): Promise<AuthResponse> {
    const res = await apiService.post<AuthResponse>('/api/auth/login', {
      usernameOrEmail,
      password,
    });
    return res.data;
  },

  async register(email: string, password: string, username: string): Promise<AuthResponse> {
    const res = await apiService.post<AuthResponse>('/api/auth/register', {
      email,
      password,
      username,
    });
    return res.data;
  },

  async logout(): Promise<void> {
    await apiService.post('/api/auth/logout');
  },

  async getStatus(): Promise<AuthStatusResponse> {
    const res = await apiService.get<AuthStatusResponse>('/api/auth/status');
    return res.data;
  },
};

export default authService;
