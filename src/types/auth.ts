// src/types/auth.ts
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  full_name: string;
  email_verified: boolean;
  is_active: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  created_at: string;
  updated_at: string;
  avatar?: string;
  google_id?: number;
  show_email?: boolean;
  show_phone?: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface GoogleLoginRequest {
  id_token: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  message?: string;
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
  message: string;
  requires_verification?: boolean;
}

export interface EmailVerificationRequest {
  code: string;
}

export interface EmailVerificationResponse {
  message: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  new_password: string;
  confirm_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<RegisterResponse>;
  googleLogin: (tokenData: GoogleLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
  verifyEmail: (
    data: EmailVerificationRequest
  ) => Promise<EmailVerificationResponse>;
  resendVerification: (
    data: ResendVerificationRequest
  ) => Promise<EmailVerificationResponse>;
  forgotPassword: (
    data: ForgotPasswordRequest
  ) => Promise<ForgotPasswordResponse>;
  resetPassword: (data: ResetPasswordRequest) => Promise<ResetPasswordResponse>;
  changePassword: (
    data: ChangePasswordRequest
  ) => Promise<ChangePasswordResponse>;
}
