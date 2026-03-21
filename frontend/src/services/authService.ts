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

export interface OnboardingInfoResponse {
  success: boolean;
  display_name: string;
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
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

  loginWithGoogle() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    window.location.href = `${backendUrl}/api/auth/google`;
  },

  async confirmGoogleLink(): Promise<{ success: boolean; message?: string }> {
    const res = await apiService.post<{ success: boolean; message?: string }>('/api/auth/google/confirm-link');
    return res.data;
  },

  async cancelGoogleLink(): Promise<void> {
    await apiService.post('/api/auth/google/cancel-link');
  },

  async getLinkInfo(): Promise<{ success: boolean; email?: string; message?: string }> {
    const res = await apiService.get<{ success: boolean; email?: string; message?: string }>(
      '/api/auth/google/link-info'
    );
    return res.data;
  },

  async logout(): Promise<void> {
    await apiService.post('/api/auth/logout');
  },

  async getStatus(): Promise<AuthStatusResponse> {
    const res = await apiService.get<AuthStatusResponse>('/api/auth/status');
    return res.data;
  },

  async getOnboardingInfo(): Promise<OnboardingInfoResponse> {
    const res = await apiService.get<OnboardingInfoResponse>('/api/auth/onboarding-info');
    return res.data;
  },

  async completeSetup(username: string, display_name: string): Promise<AuthResponse> {
    const res = await apiService.post<AuthResponse>('/api/auth/complete-setup', {
      username,
      display_name,
    });
    return res.data;
  },

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const res = await apiService.post<ForgotPasswordResponse>('/api/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(email: string, code: string, new_password: string): Promise<ResetPasswordResponse> {
    const res = await apiService.post<ResetPasswordResponse>('/api/auth/reset-password', {
      email,
      code,
      new_password,
    });
    return res.data;
  },
};

export default authService;
