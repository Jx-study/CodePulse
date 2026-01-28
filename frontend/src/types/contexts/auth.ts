/**
 * Auth Context Types
 * 認證 Context 相關的類型定義
 */

// ==================== User Types ====================
export interface User {
  id: string;
  email: string;
  username?: string;
  avatar?: string;
  email_confirmed?: boolean;
  created_at?: string;
  last_sign_in?: string;
}

// ==================== Auth Context Types ====================
export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

// ==================== Token Manager Types ====================
export interface TokenManager {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  hasToken: () => boolean;
}

// ==================== Auth Response Types ====================
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  session?: AuthSession;
}

export interface AuthStatusResponse {
  isAuthenticated: boolean;
  user?: User;
}
