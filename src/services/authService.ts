import BaseApiService from "./baseApiService";
import { API_CONFIG } from "../config/api";
import {
  User,
  LoginRequest,
  RegisterRequest,
  GoogleLoginRequest,
  LoginResponse,
  RegisterResponse,
  EmailVerificationRequest,
  EmailVerificationResponse,
} from "../types/auth";

class AuthService extends BaseApiService {
  /**
   * User registration
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await this.post<RegisterResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        userData,
        false // Don't include auth header for registration
      );

      if (response.data) {
        // Store tokens and user data
        this.storeAuthData(response.data.tokens, response.data.user);
        return response.data;
      }

      throw new Error("Registration failed: No data received");
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  /**
   * User login
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials,
        false // Don't include auth header for login
      );

      if (response.data) {
        // Store tokens and user data
        this.storeAuthData(response.data.tokens, response.data.user);
        return response.data;
      }

      throw new Error("Login failed: No data received");
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  }

  /**
   * Google OAuth login
   */
  async googleLogin(tokenData: GoogleLoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.AUTH.GOOGLE_LOGIN,
        tokenData,
        false // Don't include auth header for OAuth login
      );

      if (response.data) {
        // Store tokens and user data
        this.storeAuthData(response.data.tokens, response.data.user);
        return response.data;
      }

      throw new Error("Google login failed: No data received");
    } catch (error: any) {
      console.error("Google login error:", error);
      throw error;
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(
    verificationData: EmailVerificationRequest
  ): Promise<EmailVerificationResponse> {
    try {
      const response = await this.post<EmailVerificationResponse>(
        `${API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL}/${verificationData.token}/`,
        {},
        false // Don't include auth header for email verification
      );

      return response.data || { message: "Email verified successfully" };
    } catch (error: any) {
      console.error("Email verification error:", error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    try {
      const response = await this.get<User>(
        API_CONFIG.ENDPOINTS.AUTH.PROFILE,
        true // Include auth header
      );

      if (response.data) {
        // Update stored user data
        localStorage.setItem("user", JSON.stringify(response.data));
        return response.data;
      }

      throw new Error("Failed to get user profile");
    } catch (error: any) {
      console.error("Get profile error:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User> | FormData): Promise<User> {
    try {
      const response = await this.put<User>(
        API_CONFIG.ENDPOINTS.AUTH.PROFILE_UPDATE,
        userData,
        true // Include auth header
      );

      if (response.data) {
        // Update stored user data
        localStorage.setItem("user", JSON.stringify(response.data));
        return response.data;
      }

      throw new Error("Failed to update user profile");
    } catch (error: any) {
      console.error("Update profile error:", error);
      throw error;
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(password?: string): Promise<void> {
    try {
      const data = password ? { password } : {};

      await this.delete(API_CONFIG.ENDPOINTS.AUTH.DELETE_ACCOUNT, true);

      // Clear all stored auth data after successful deletion
      this.logout();

      console.log("Account deleted successfully");
    } catch (error: any) {
      console.error("Delete account error:", error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    try {
      // Clear all stored auth data
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      // Dispatch logout event
      window.dispatchEvent(new CustomEvent("auth:logout"));

      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem("access_token");
    const user = localStorage.getItem("user");
    return !!(token && user);
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem("access_token");
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token");
  }

  /**
   * Store authentication data
   */
  private storeAuthData(
    tokens: { access: string; refresh: string },
    user: User
  ): void {
    try {
      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      localStorage.setItem("user", JSON.stringify(user));

      // Dispatch login event
      window.dispatchEvent(new CustomEvent("auth:login", { detail: user }));

      console.log("Auth data stored successfully");
    } catch (error) {
      console.error("Error storing auth data:", error);
      throw new Error("Failed to store authentication data");
    }
  }

  /**
   * Initialize auth state from localStorage
   */
  initializeAuth(): { user: User | null; isAuthenticated: boolean } {
    try {
      const user = this.getCurrentUser();
      const isAuthenticated = this.isAuthenticated();

      return { user, isAuthenticated };
    } catch (error) {
      console.error("Error initializing auth:", error);
      return { user: null, isAuthenticated: false };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
