import apiService from '@/api/api';
import type { AuthResponse, AuthStatusResponse } from '@/types';

export interface RegisterPendingResponse {
  success: boolean;
  message?: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message?: string;
  user?: AuthResponse['user'];
}

export interface ResendVerificationResponse {
  success: boolean;
  message?: string;
  remaining_attempts?: number;
}

const authService = {
  async login(usernameOrEmail: string, password: string): Promise<AuthResponse> {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const res = await apiService.post<AuthResponse>('/api/auth/login', {
      usernameOrEmail,
      password,
      timezone,
    });
    return res.data;
  },

  async register(email: string, password: string, username: string): Promise<RegisterPendingResponse> {
    const res = await apiService.post<RegisterPendingResponse>('/api/auth/register', {
      email,
      password,
      username,
    });
    return res.data;
  },

  async verifyEmail(email: string, code: string): Promise<AuthResponse> {
    const res = await apiService.post<AuthResponse>('/api/auth/verify-email', {
      email,
      code,
    });
    return res.data;
  },

  async resendVerification(email: string): Promise<ResendVerificationResponse> {
    const res = await apiService.post<ResendVerificationResponse>('/api/auth/resend-verification', { email });
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
