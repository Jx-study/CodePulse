import apiService from '@/api/api';
import type { ApiError } from '@/api/api';

export interface CheckinResponse {
  success: boolean;
  already_checked_in: boolean;
  xp_earned: number;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
}

export interface CheckinHistoryResponse {
  dates: string[];
}

interface UpdateProfilePayload {
  display_name?: string;
  avatar_url?: string;
  theme?: 'light' | 'dark' | 'system';
  language?: 'en' | 'zh-TW' | 'zh-CN';
}

interface UploadSignature {
  signature: string;
  timestamp: number;
  cloud_name: string;
  api_key: string;
  folder: string;
  public_id: string;
}

export const userService = {
  async getProfile() {
    const res = await apiService.get('/api/users/me');
    return res.data;
  },

  async updateProfile(patch: UpdateProfilePayload) {
    const res = await apiService.patch('/api/users/me', patch);
    return res.data;
  },

  async getUploadSignature(): Promise<UploadSignature> {
    const res = await apiService.get<UploadSignature>('/api/users/me/upload-signature');
    return res.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.put('/api/users/me/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  async checkin(): Promise<CheckinResponse> {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const res = await apiService.post<CheckinResponse>('/api/users/me/checkin', { timezone });
    return res.data;
  },

  async getCheckinHistory(year: number, month: number): Promise<CheckinHistoryResponse> {
    const res = await apiService.get<CheckinHistoryResponse>(
      `/api/users/me/checkin-history?year=${year}&month=${month}`,
    );
    return res.data;
  },

  async uploadAvatar(file: File): Promise<string> {
    const sig = await this.getUploadSignature();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', sig.signature);
    formData.append('timestamp', String(sig.timestamp));
    formData.append('api_key', sig.api_key);
    formData.append('folder', sig.folder);
    formData.append('public_id', sig.public_id);

    // Cloudinary 是第三方服務
    const uploadResp = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
      { method: 'POST', body: formData },
    );
    if (!uploadResp.ok) throw new Error('Cloudinary upload failed');

    const result = await uploadResp.json();
    return result.secure_url as string;
  },
};

export type { ApiError };
