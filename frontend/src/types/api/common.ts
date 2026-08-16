/**
 * Common API Types
 * 通用 API 相關的類型定義
 */

// ==================== Generic API Response ====================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

// ==================== API Error ====================
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode?: number;
}

// ==================== API Config ====================
export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

// ==================== Request Options ====================
export interface RequestOptions extends RequestInit {
  params?: Record<string, unknown>;
  data?: unknown;
  timeout?: number;
}

// ==================== Pagination ====================
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
