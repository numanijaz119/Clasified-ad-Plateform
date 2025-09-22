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
    } catch (error: any) {
      const errorMessage = error.message || "Login failed. Please try again.";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Register function
  const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
    try {
      dispatch({ type: "AUTH_START" });

      const response = await authService.register(userData);

      dispatch({ type: "AUTH_SUCCESS", payload: response.user });
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
  const verifyEmail = async (data: EmailVerificationRequest): Promise<EmailVerificationResponse> => {
    try {
      dispatch({ type: "AUTH_START" });
      const response = await authService.verifyEmail(data);
      dispatch({ type: "SET_LOADING", payload: false });
      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Email verification failed. Please try again.";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Resend verification function
  const resendVerification = async (data: ResendVerificationRequest): Promise<EmailVerificationResponse> => {
    try {
      dispatch({ type: "AUTH_START" });
      const response = await authService.resendVerificationEmail(data);
      dispatch({ type: "SET_LOADING", payload: false });
      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to resend verification email. Please try again.";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Forgot password function
  const forgotPassword = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    try {
      dispatch({ type: "AUTH_START" });
      const response = await authService.forgotPassword(data);
      dispatch({ type: "SET_LOADING", payload: false });
      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to send password reset email. Please try again.";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    try {
      dispatch({ type: "AUTH_START" });
      const response = await authService.resetPassword(data);
      dispatch({ type: "SET_LOADING", payload: false });
      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Password reset failed. Please try again.";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Change password function
  const changePassword = async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    try {
      dispatch({ type: "AUTH_START" });
      const response = await authService.changePassword(data);
      dispatch({ type: "SET_LOADING", payload: false });
      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Password change failed. Please try again.";
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
