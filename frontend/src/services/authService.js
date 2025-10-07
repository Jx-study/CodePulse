// 根據環境決定 API URL
// 在 Docker 環境中使用服務名稱，本地開發使用 localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class AuthService {
  constructor() {
    this.t = null; // 翻譯函數將由外部注入
  }

  // 設定翻譯函數
  setTranslation(t) {
    this.t = t;
  }

  // 處理錯誤訊息翻譯
  translateError(errorData) {
    if (!this.t || !errorData.error_code) {
      return errorData.message || 'Unknown error';
    }
    
    const translatedMessage = this.t(`auth.errors.${errorData.error_code}`);
    
    // 如果翻譯失敗（返回 key），使用預設訊息
    if (translatedMessage === `auth.errors.${errorData.error_code}`) {
      return errorData.message || 'Unknown error';
    }
    
    return translatedMessage;
  }
  // 登入
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = this.translateError(data);
        throw new Error(errorMessage);
      }

      // 儲存 token 到 localStorage
      if (data.session?.access_token) {
        localStorage.setItem('access_token', data.session.access_token);
        localStorage.setItem('refresh_token', data.session.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // 註冊
  async register(email, password, username = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = this.translateError(data);
        throw new Error(errorMessage);
      }

      // 如果註冊成功且有 session，儲存 token
      if (data.session?.access_token) {
        localStorage.setItem('access_token', data.session.access_token);
        localStorage.setItem('refresh_token', data.session.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  // 登出
  async logout() {
    try {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 無論 API 呼叫是否成功，都清除本地儲存
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  // 獲取當前用戶資訊
  async getCurrentUser() {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No access token');
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = this.translateError(data);
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  // 刷新 token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = this.translateError(data);
        throw new Error(errorMessage);
      }

      // 更新 token
      localStorage.setItem('access_token', data.session.access_token);
      localStorage.setItem('refresh_token', data.session.refresh_token);

      return data;
    } catch (error) {
      console.error('Refresh token error:', error);
      // Token 刷新失敗，清除所有認證資料
      this.logout();
      throw error;
    }
  }

  // 檢查是否已登入
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }

  // 獲取儲存的用戶資訊
  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // 獲取 access token
  getAccessToken() {
    return localStorage.getItem('access_token');
  }
}

// 匯出單例
export default new AuthService();