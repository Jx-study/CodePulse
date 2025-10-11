import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ==================== 類型定義 ====================

interface User {
  id: string;
  email: string;
  username?: string;
  avatar?: string;
  email_confirmed?: boolean;
  created_at?: string;
  last_sign_in?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

// ==================== Context 建立 ====================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==================== Token 管理工具 ====================

// 統一使用與舊 authService 相同的 key，確保兼容性
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// TODO: 未來改用 HTTP-only cookies 提升安全性
// TODO: 實作 token 加密儲存（使用 Web Crypto API）
const tokenManager = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  hasToken: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};

// ==================== API 請求工具 ====================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = tokenManager.getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '請求失敗');
  }

  return data;
};

// ==================== AuthProvider 組件 ====================

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ========== 檢查用戶認證狀態 ==========
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);

      // 如果沒有 token，直接設為未登入
      if (!tokenManager.hasToken()) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // 呼叫後端驗證 token
      // TODO: 實作 token 自動刷新機制（當 401 時自動呼叫 refresh API）
      const data = await apiRequest('/api/auth/status');

      if (data.isAuthenticated && data.user) {
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        tokenManager.clearTokens();
      }
    } catch (error) {
      console.error('檢查認證狀態失敗:', error);
      // TODO: 區分網路錯誤與認證錯誤，僅在認證失敗時清除 token
      setIsAuthenticated(false);
      setUser(null);
      tokenManager.clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ========== 登入 ==========
  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.success && data.session) {
        // 儲存 tokens
        tokenManager.setTokens(
          data.session.access_token,
          data.session.refresh_token
        );

        // 設置用戶狀態
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        throw new Error(data.message || '登入失敗');
      }
    } catch (error) {
      console.error('登入錯誤:', error);
      throw error;
    }
  }, []);

  // ========== 註冊 ==========
  const register = useCallback(async (email: string, password: string, username?: string) => {
    try {
      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, username }),
      });

      if (data.success && data.session) {
        // 儲存 tokens
        tokenManager.setTokens(
          data.session.access_token,
          data.session.refresh_token
        );

        // 設置用戶狀態
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        throw new Error(data.message || '註冊失敗');
      }
    } catch (error) {
      console.error('註冊錯誤:', error);
      throw error;
    }
  }, []);

  // ========== 登出 ==========
  const logout = useCallback(async () => {
    try {
      // 呼叫後端登出 API
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('登出 API 呼叫失敗:', error);
      // 即使 API 失敗，仍然清除本地 token
    } finally {
      // 清除本地狀態
      tokenManager.clearTokens();
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  // ========== App 啟動時檢查認證狀態 ==========
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // ========== Context Value ==========
  const value: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    login,
    register,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ==================== useAuth Hook ====================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthContext;
