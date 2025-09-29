import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import authService from "../services/authService";
import {
  AuthState,
  AuthContextType,
  User,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  GoogleLoginRequest,
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

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: User }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "SET_LOADING"; payload: boolean };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case "AUTH_LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        const { user, isAuthenticated } = authService.initializeAuth();

        if (isAuthenticated && user) {
          dispatch({ type: "AUTH_SUCCESS", payload: user });
        } else {
          dispatch({ type: "AUTH_LOGOUT" });
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        dispatch({ type: "AUTH_LOGOUT" });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (state.user) {
      console.log("User in context state:", state.user);
    }
  }, [state.user]);

  // Listen for auth events
  useEffect(() => {
    const handleAuthLogin = (event: CustomEvent) => {
      dispatch({ type: "AUTH_SUCCESS", payload: event.detail });
    };

    const handleAuthLogout = () => {
      dispatch({ type: "AUTH_LOGOUT" });
    };

    window.addEventListener("auth:login", handleAuthLogin as EventListener);
    window.addEventListener("auth:logout", handleAuthLogout);

    return () => {
      window.removeEventListener(
        "auth:login",
        handleAuthLogin as EventListener
      );
      window.removeEventListener("auth:logout", handleAuthLogout);
    };
  }, []);

  // Login function
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      dispatch({ type: "AUTH_START" });

      const response = await authService.login(credentials);

      dispatch({ type: "AUTH_SUCCESS", payload: response.user });

      try {
        const fullProfile = await authService.getProfile();
        dispatch({ type: "AUTH_SUCCESS", payload: fullProfile });
      } catch (profileError) {
        console.warn("Failed to fetch full profile after login:", profileError);
        // Don't throw error, user is still logged in
      }
    } catch (error: any) {
      const errorMessage = error.message || "Login failed. Please try again.";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Register function
  const register = async (
    userData: RegisterRequest
  ): Promise<RegisterResponse> => {
    try {
      dispatch({ type: "AUTH_START" });

      const response = await authService.register(userData);

      // Don't auto-login after registration - wait for email verification
      dispatch({ type: "SET_LOADING", payload: false });
      return response;
    } catch (error: any) {
      const errorMessage =
        error.message || "Registration failed. Please try again.";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Google login function
  const googleLogin = async (tokenData: GoogleLoginRequest): Promise<void> => {
    try {
      dispatch({ type: "AUTH_START" });

      const response = await authService.googleLogin(tokenData);

      dispatch({ type: "AUTH_SUCCESS", payload: response.user });
    } catch (error: any) {
      const errorMessage =
        error.message || "Google login failed. Please try again.";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      dispatch({ type: "AUTH_LOGOUT" });
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if there's an error
      dispatch({ type: "AUTH_LOGOUT" });
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // Update user function
  const updateUser = (userData: Partial<User>): void => {
    dispatch({ type: "UPDATE_USER", payload: userData });
  };

  // Email verification function
  const verifyEmail = async (
    data: EmailVerificationRequest
  ): Promise<EmailVerificationResponse> => {
    try {
      dispatch({ type: "AUTH_START" });
      const response = await authService.verifyEmail(data);

      // After successful verification, don't auto-login
      // Let user manually sign in after seeing success message
      dispatch({ type: "SET_LOADING", payload: false });

      return response;
    } catch (error: any) {
      const errorMessage =
        error.message || "Email verification failed. Please try again.";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Resend verification function
  const resendVerification = async (
    data: ResendVerificationRequest
  ): Promise<EmailVerificationResponse> => {
    try {
      dispatch({ type: "AUTH_START" });
      const response = await authService.resendVerificationEmail(data);
      dispatch({ type: "SET_LOADING", payload: false });
      return response;
    } catch (error: any) {
      const errorMessage =
        error.message ||
        "Failed to resend verification email. Please try again.";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Forgot password function
  const forgotPassword = async (
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> => {
    try {
      dispatch({ type: "AUTH_START" });
      const response = await authService.forgotPassword(data);
      dispatch({ type: "SET_LOADING", payload: false });
      return response;
    } catch (error: any) {
      // Enhanced error handling for forgot password
      let errorMessage = "Failed to send reset code. Please try again.";

      if (error.details) {
        // Handle Django field-specific errors
        if (error.details.email && Array.isArray(error.details.email)) {
          const emailErrors = error.details.email;

          // Map common Django email validation errors
          for (const emailError of emailErrors) {
            const lowerError = emailError.toLowerCase();
            if (lowerError.includes("valid email")) {
              errorMessage = "Please enter a valid email address";
              break;
            } else if (lowerError.includes("required")) {
              errorMessage = "Email address is required";
              break;
            } else {
              errorMessage = emailError;
              break;
            }
          }
        } else if (
          error.details.non_field_errors &&
          Array.isArray(error.details.non_field_errors)
        ) {
          errorMessage = error.details.non_field_errors[0];
        } else if (error.details.error) {
          // Single error message from backend
          errorMessage = error.details.error;
        } else if (typeof error.details === "string") {
          errorMessage = error.details;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Handle specific HTTP status codes
      if (error.status) {
        switch (error.status) {
          case 404:
            errorMessage =
              "We couldn't find an account with this email address.";
            break;
          case 400:
            // Keep the detailed message from backend for 400 errors
            break;
          case 429:
            errorMessage =
              "Too many requests. Please wait before trying again.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
        }
      }

      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Reset password function

  const resetPassword = async (
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> => {
    try {
      dispatch({ type: "AUTH_START" });
      const response = await authService.resetPassword(data);
      dispatch({ type: "SET_LOADING", payload: false });
      return response;
    } catch (error: any) {
      let errorMessage = "Password reset failed. Please try again.";

      if (error.details) {
        if (
          error.details.new_password &&
          Array.isArray(error.details.new_password)
        ) {
          const passwordErrors = error.details.new_password;

          for (const passwordError of passwordErrors) {
            const lowerError = passwordError.toLowerCase();
            if (lowerError.includes("too short")) {
              errorMessage = "Password must be at least 8 characters long";
              break;
            } else if (lowerError.includes("too common")) {
              errorMessage =
                "This password is too common. Please choose a stronger password";
              break;
            } else if (lowerError.includes("entirely numeric")) {
              errorMessage = "Password cannot be entirely numeric";
              break;
            } else if (
              lowerError.includes("similar") ||
              lowerError.includes("attribute")
            ) {
              errorMessage =
                "Password is too similar to your personal information";
              break;
            } else {
              errorMessage = passwordError;
              break;
            }
          }
        } else if (error.details.code) {
          errorMessage = "Invalid or expired verification code";
        } else if (error.details.email) {
          errorMessage = "Invalid email address";
        } else if (error.details.confirm_password) {
          errorMessage = "Password confirmation doesn't match";
        } else if (error.details.non_field_errors) {
          errorMessage = error.details.non_field_errors[0];
        } else if (error.details.error) {
          errorMessage = error.details.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Handle specific status codes
      if (error.status === 400 && errorMessage.includes("Invalid or expired")) {
        errorMessage =
          "The verification code has expired or is invalid. Please request a new one.";
      }

      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Change password function
  const changePassword = async (
    data: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> => {
    try {
      dispatch({ type: "AUTH_START" });
      const response = await authService.changePassword(data);
      dispatch({ type: "SET_LOADING", payload: false });
      return response;
    } catch (error: any) {
      let errorMessage = "Password change failed. Please try again.";

      if (error.details) {
        if (
          error.details.new_password &&
          Array.isArray(error.details.new_password)
        ) {
          const passwordErrors = error.details.new_password;
          errorMessage = passwordErrors[0];
        } else if (
          error.details.old_password &&
          Array.isArray(error.details.old_password)
        ) {
          errorMessage = error.details.old_password[0];
        } else if (
          error.details.confirm_password &&
          Array.isArray(error.details.confirm_password)
        ) {
          errorMessage = error.details.confirm_password[0];
        } else if (
          error.details.non_field_errors &&
          Array.isArray(error.details.non_field_errors)
        ) {
          errorMessage = error.details.non_field_errors[0];
        } else if (typeof error.details === "string") {
          errorMessage = error.details;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    googleLogin,
    logout,
    clearError,
    updateUser,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;
