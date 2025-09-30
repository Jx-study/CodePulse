// 基本類型定義

export interface User {
  id: string;
  email: string;
  username?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse {
  user: User;
  session: AuthSession;
  message?: string;
}

export interface ErrorResponse {
  error_code?: string;
  message: string;
}

export interface BreadcrumbItem {
  label: string;
  path: string | null;
}

export interface AlgorithmData {
  name: string;
  category: string;
  description?: string;
}

// React 組件 Props 類型
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}
