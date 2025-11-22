export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  full_name: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  avatar?: string;
}

export interface ProfileFormData {
  first_name: string;
  last_name: string;
  phone: string;
  avatar?: File;
}

export interface PasswordChangeData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ProfileHeaderProps {
  user: User;
  isEditing: boolean;
  isChangingPassword: boolean;
  avatarPreview: string;
  onEditClick: () => void;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface ProfileFormProps {
  user: User;
  isEditing: boolean;
  formData: ProfileFormData;
  errors: Record<string, string>;
  updating: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export interface PasswordChangeFormProps {
  user: User;
  isChangingPassword: boolean;
  passwordData: PasswordChangeData;
  showPassword: {
    old: boolean;
    new: boolean;
    confirm: boolean;
  };
  errors: Record<string, string>;
  updating: boolean;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTogglePassword: (field: "old" | "new" | "confirm") => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onStartChanging: () => void;
}

export interface AccountInfoProps {
  user: User;
  onResendVerification?: () => void;
}

export interface AlertMessageProps {
  type: "success" | "error";
  message: string;
  onClose?: () => void;
}

export interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}
