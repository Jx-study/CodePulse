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
    const resp = await fetch('/api/users/me', { credentials: 'include' });
    if (!resp.ok) throw new Error('Failed to fetch profile');
    return resp.json();
  },

  async updateProfile(patch: UpdateProfilePayload) {
    const resp = await fetch('/api/users/me', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!resp.ok) throw new Error('Failed to update profile');
    return resp.json();
  },

  async getUploadSignature(): Promise<UploadSignature> {
    const resp = await fetch('/api/users/me/upload-signature', {
      credentials: 'include',
    });
    if (!resp.ok) throw new Error('Failed to get upload signature');
    return resp.json();
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const resp = await fetch('/api/users/me/password', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      throw { status: resp.status, error_code: data.error_code, message: data.message };
    }
  },

  async uploadAvatar(file: File): Promise<string> {
    // Step 1: 取得後端簽名
    const sig = await this.getUploadSignature();

    // Step 2: 直接上傳至 Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', sig.signature);
    formData.append('timestamp', String(sig.timestamp));
    formData.append('api_key', sig.api_key);
    formData.append('folder', sig.folder);
    formData.append('public_id', sig.public_id);

    const uploadResp = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
      { method: 'POST', body: formData },
    );
    if (!uploadResp.ok) throw new Error('Cloudinary upload failed');

    const result = await uploadResp.json();
    return result.secure_url as string;
  },
};
