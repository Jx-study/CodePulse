// API base URL:
// - dev：空字串走 Vite proxy
// - prod：用 VITE_API_URL 或 VITE_BACKEND_URL（指向後端域名）
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "";

// API 基本配置類型
interface ApiConfig {
  baseURL: string;
  timeout?: number;
}

// API 響應類型
interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

// API 錯誤類型
interface ApiError {
  message: string;
  status: number;
  error_code?: string;
}

class ApiService {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  private async executeFetch(
    url: string,
    options: RequestInit,
  ): Promise<Response> {
    return fetch(url, {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;

    // 1. 執行第一次請求
    let response = await this.executeFetch(url, options);

    // 2. 如果 401 且不是在請求 status 本身時（避免無限循環）
    if (response.status === 401 && endpoint !== "/api/auth/status") {
      try {
        // 嘗試呼叫 status 接口讓後端更新 Token
        await this.executeFetch(`${this.config.baseURL}/api/auth/status`, {
          credentials: "include",
        });

        // 3. 重新執行原始請求
        response = await this.executeFetch(url, options);
      } catch (e) {
        // 刷新失敗，維持原本的 401 狀態
        console.warn("Token refresh failed", e);
      }
    }

    // 處理最終結果
    let data: any;
    try {
      data = await response.json();
    } catch {
      throw {
        message: "Invalid JSON response",
        status: response.status,
      } as ApiError;
    }

    if (!response.ok) {
      throw {
        message: data.message || "API request failed",
        status: response.status,
        error_code: data.error_code,
      } as ApiError;
    }

    return {
      data,
      status: response.status,
      message: data.message,
    };
  }

  async get<T>(
    endpoint: string,
    headers?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET", headers });
  }

  async post<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      headers,
    });
  }

  async put<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      headers,
    });
  }

  async patch<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers,
    });
  }

  async delete<T>(
    endpoint: string,
    headers?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE", headers });
  }
}

// 創建 API 服務實例
const apiService = new ApiService({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export default apiService;
export type { ApiResponse, ApiError };
