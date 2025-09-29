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
  ResendVerificationRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
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
        // Don't store tokens during registration - wait for email verification
        // Just return the response data
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
   * Verify email with 6-digit code
   */
  async verifyEmail(
    data: EmailVerificationRequest
  ): Promise<EmailVerificationResponse> {
    try {
      const response = await this.post<EmailVerificationResponse>(
        API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL,
        data,
        false // Don't include auth header for email verification
      );

      return response.data || { message: "Email verified successfully" };
    } catch (error: any) {
      console.error("Email verification error:", error);
      throw error;
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(
    data: ResendVerificationRequest
  ): Promise<EmailVerificationResponse> {
    try {
      const response = await this.post<EmailVerificationResponse>(
        API_CONFIG.ENDPOINTS.AUTH.RESEND_VERIFICATION,
        data,
        false
      );

      return response.data || { message: "Verification email sent" };
    } catch (error: any) {
      console.error("Resend verification error:", error);
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
      const response = await this.put<{ user: User; message: string }>(
        API_CONFIG.ENDPOINTS.AUTH.PROFILE_UPDATE,
        userData,
        true // Include auth header
      );

      if (response.data && response.data.user) {
        // Extract the user object from the nested response
        const updatedUser = response.data.user;

        // Update stored user data with the clean user object
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Dispatch custom event so auth context can update
        window.dispatchEvent(
          new CustomEvent("auth:login", { detail: updatedUser })
        );

        return updatedUser;
      }

      throw new Error("Failed to update user profile");
    } catch (error: any) {
      console.error("Update profile error:", error);
      throw error;
    }
  }

  /**
   * Forgot password - send reset code
   */
  async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    try {
      const response = await this.post<ForgotPasswordResponse>(
        API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
        data,
        false
      );

      return (
        response.data || { message: "Password reset code sent to your email" }
      );
    } catch (error: any) {
      console.error("Forgot password error:", error);
      throw error;
    }
  }

  /**
   * Reset password using code
   */
  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    try {
      const response = await this.post<ResetPasswordResponse>(
        API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
        data,
        false
      );

      return response.data || { message: "Password reset successful" };
    } catch (error: any) {
      console.error("Reset password error:", error);
      throw error;
    }
  }

  /**
   * Change password for authenticated users
   */
  async changePassword(
    data: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> {
    try {
      // Transform field names to match backend expectations
      const requestData = {
        current_password: data.old_password,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      };

      const response = await this.put<ChangePasswordResponse>(
        API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD,
        requestData,
        true
      );

      return response.data || { message: "Password changed successfully" };
    } catch (error: any) {
      console.error("Change password error:", error);
      throw error;
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    try {
      await this.delete(API_CONFIG.ENDPOINTS.AUTH.DELETE_ACCOUNT, true);

      // Clear all stored auth data after successful deletion
      await this.logout();

      console.log("Account deleted successfully");
    } catch (error: any) {
      console.error("Delete account error:", error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem("refresh_token");

      // Call backend logout endpoint if refresh token exists
      if (refreshToken) {
        try {
          await this.post(
            API_CONFIG.ENDPOINTS.AUTH.LOGOUT,
            { refresh_token: refreshToken },
            true
          );
        } catch (error) {
          // Continue with logout even if backend call fails
          console.warn(
            "Backend logout failed, continuing with local logout:",
            error
          );
        }
      }

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
