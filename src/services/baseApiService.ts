// src/services/baseApiService.ts
import { API_CONFIG, getHeaders, ApiResponse, ApiError } from "../config/api";

class BaseApiService {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async makeRequest<T>(
    url: string,
    options: RequestInit = {},
    includeAuth: boolean = true,
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const config: RequestInit = {
        ...options,
        headers: {
          ...getHeaders(includeAuth),
          ...options.headers,
        },
        signal: controller.signal,
      };

      const response = await fetch(`${this.baseURL}${url}`, config);
      clearTimeout(timeoutId);

      let data: any;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // Handle token refresh for 401 errors
        if (response.status === 401 && includeAuth && attempt === 1) {
          const refreshSuccess = await this.handleTokenRefresh();
          if (refreshSuccess) {
            return this.makeRequest<T>(url, options, includeAuth, attempt + 1);
          }
        }

        // Extract error message from DRF response format
        let errorMessage = "Request failed";

        if (data && typeof data === "object") {
          // Handle DRF non_field_errors (most common for auth errors)
          if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
            errorMessage = data.non_field_errors[0];
          }
          // Handle DRF field-specific errors
          else if (data.email && Array.isArray(data.email)) {
            errorMessage = data.email[0];
          } else if (data.password && Array.isArray(data.password)) {
            errorMessage = data.password[0];
          }
          // Handle DRF detail field
          else if (data.detail) {
            errorMessage = data.detail;
          }
          // Handle custom error field
          else if (data.error) {
            errorMessage = data.error;
          }
          // Handle other field errors
          else {
            const fieldErrors = [];
            for (const [key, value] of Object.entries(data)) {
              if (Array.isArray(value)) {
                fieldErrors.push(...value);
              } else if (typeof value === "string") {
                fieldErrors.push(value);
              }
            }
            if (fieldErrors.length > 0) {
              errorMessage = fieldErrors[0];
            }
          }
        }

        console.error(`API Error ${response.status}:`, errorMessage, data);

        throw {
          message: errorMessage,
          status: response.status,
          details: data, // Keep full response for debugging
        } as ApiError;
      }

      return {
        data,
        status: response.status,
        message: data.message,
      };
    } catch (error: any) {
      // Retry logic for network errors
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        await this.delay(this.retryDelay * attempt);
        return this.makeRequest<T>(url, options, includeAuth, attempt + 1);
      }

      if (error.name === "AbortError") {
        throw {
          message: "Request timeout",
          status: 408,
        } as ApiError;
      }

      if (error.message && error.status) {
        throw error;
      }

      throw {
        message: error.message || "Network error",
        status: error.status || 500,
      } as ApiError;
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors, timeout, or 5xx server errors
    return (
      error.name === "AbortError" ||
      !error.status ||
      (error.status >= 500 && error.status < 600)
    );
  }

  private async handleTokenRefresh(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        this.handleAuthFailure();
        return false;
      }

      const response = await fetch(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`,
        {
          method: "POST",
          headers: getHeaders(false),
          body: JSON.stringify({ refresh: refreshToken }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access_token", data.access);
        if (data.refresh) {
          localStorage.setItem("refresh_token", data.refresh);
        }
        return true;
      } else {
        this.handleAuthFailure();
        return false;
      }
    } catch (error) {
      this.handleAuthFailure();
      return false;
    }
  }

  private handleAuthFailure(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    // Redirect to login if not already there
    if (window.location.pathname !== "/") {
      window.location.href = "/";
    }

    // Dispatch custom event for auth state change
    window.dispatchEvent(new CustomEvent("auth:logout"));
  }

  // HTTP Methods
  protected async get<T>(
    url: string,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { method: "GET" }, includeAuth);
  }

  protected async post<T>(
    url: string,
    data?: any,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const options: RequestInit = {
      method: "POST",
    };

    if (data) {
      if (data instanceof FormData) {
        options.body = data;
        // Remove Content-Type header for FormData (browser will set it with boundary)
        options.headers = { ...getHeaders(includeAuth) };
        delete (options.headers as any)["Content-Type"];
      } else {
        options.body = JSON.stringify(data);
        options.headers = getHeaders(includeAuth);
      }
    }

    return this.makeRequest<T>(url, options, includeAuth);
  }

  protected async put<T>(
    url: string,
    data?: any,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const options: RequestInit = {
      method: "PUT",
    };

    if (data) {
      if (data instanceof FormData) {
        options.body = data;
        options.headers = { ...getHeaders(includeAuth) };
        delete (options.headers as any)["Content-Type"];
      } else {
        options.body = JSON.stringify(data);
        options.headers = getHeaders(includeAuth);
      }
    }

    return this.makeRequest<T>(url, options, includeAuth);
  }

  protected async patch<T>(
    url: string,
    data?: any,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const options: RequestInit = {
      method: "PATCH",
    };

    if (data) {
      if (data instanceof FormData) {
        options.body = data;
        options.headers = { ...getHeaders(includeAuth) };
        delete (options.headers as any)["Content-Type"];
      } else {
        options.body = JSON.stringify(data);
        options.headers = getHeaders(includeAuth);
      }
    }

    return this.makeRequest<T>(url, options, includeAuth);
  }

  protected async delete<T>(
    url: string,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { method: "DELETE" }, includeAuth);
  }
}

export default BaseApiService;
