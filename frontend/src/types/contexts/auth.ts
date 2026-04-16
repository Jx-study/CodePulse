/**
 * Auth Context Types
 * 認證 Context 相關的類型定義
 */

// ==================== User Types ====================
export interface User {
  id: number;
  email: string;
  username: string;
  display_name: string;
  avatar_url?: string;                        // 暫留，等串接雲端儲存服務再使用
  role: 'user' | 'admin';
  theme?: 'light' | 'dark' | 'system';
  language?: 'en' | 'zh-TW' | 'zh-CN';
  total_xp?: number;
  current_streak?: number;
  longest_streak?: number;
  last_login_date?: string;
  skill_rating?: number;                      // Elo 能力分數（對應 EloService.userStartRating）
  skill_tier?: 1 | 2 | 3 | 4 | 5;           // 由 skill_rating 派生
  created_at?: string;
  has_local_password?: boolean;   // false = OAuth-only account
  timezone?: string;
}

// ==================== Auth Context Types ====================
export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (emailOrDisplayName: string, password: string) => Promise<void>;
  register: (email: string, password: string, display_name: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  showCheckinDialog: boolean;
  setShowCheckinDialog: (v: boolean) => void;
  pendingWelcome: { username: string } | null;
  setPendingWelcome: (v: { username: string } | null) => void;
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
