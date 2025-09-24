// ProfilePage.tsx - Complete Component
import React, { useState, useEffect } from "react";
import { authService } from "../services/index";
import { ProfileHeader } from "../components/profile";
import { ProfileForm } from "../components/profile";
import { PasswordChangeForm } from "../components/profile";
import { AccountInfo } from "../components/profile";
import { AlertMessage } from "../components/profile";
import { LoadingSpinner } from "../components/profile";

interface User {
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

interface ProfileFormData {
  first_name: string;
  last_name: string;
  phone: string;
  avatar?: File;
}

interface PasswordChangeData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: "",
    last_name: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string>("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  // Load user profile on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await authService.getProfile();
      setUser(profile);
      setFormData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone || "",
      });
      if (profile.avatar) {
        setAvatarPreview(profile.avatar);
      }
    } catch (error: any) {
      setErrors({ general: error.message || "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          avatar: "Please select a valid image file",
        }));
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          avatar: "Image size must be less than 5MB",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, avatar: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Clear avatar error
      if (errors.avatar) {
        setErrors((prev) => ({ ...prev, avatar: "" }));
      }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setErrors({});
    setSuccess("");

    try {
      // Create FormData for file upload
      const updateData = new FormData();
      updateData.append("first_name", formData.first_name);
      updateData.append("last_name", formData.last_name);
      updateData.append("phone", formData.phone);

      if (formData.avatar) {
        updateData.append("avatar", formData.avatar);
      }

      const updatedUser = await authService.updateProfile(updateData);
      setUser(updatedUser);
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
      loadUserProfile();
    } catch (error: any) {
      if (error.details) {
        setErrors(error.details);
      } else {
        setErrors({ general: error.message || "Failed to update profile" });
      }
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setErrors({});
    setSuccess("");

    try {
      if (passwordData.new_password !== passwordData.confirm_password) {
        setErrors({ confirm_password: "Passwords do not match" });
        return;
      }

      await authService.changePassword(passwordData);
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
      setIsChangingPassword(false);
      setSuccess("Password changed successfully!");
    } catch (error: any) {
      if (error.details) {
        setErrors(error.details);
      } else {
        setErrors({ general: error.message || "Failed to change password" });
      }
    } finally {
      setUpdating(false);
    }
  };

  const togglePasswordVisibility = (field: "old" | "new" | "confirm") => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setSuccess("");
    setErrors({});
  };

  const handleCancelEdit = () => {
    if (!user) return;

    setIsEditing(false);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone || "",
    });
    setAvatarPreview(user.avatar || "");
    setErrors({});
  };

  const handleStartPasswordChange = () => {
    setIsChangingPassword(true);
    setSuccess("");
    setErrors({});
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      old_password: "",
      new_password: "",
      confirm_password: "",
    });
    setErrors({});
  };

  const handleResendVerification = async () => {
    if (!user) return;

    try {
      await authService.resendVerificationEmail({ email: user.email });
      setSuccess("Verification email sent successfully!");
    } catch (error: any) {
      setErrors({
        general: error.message || "Failed to send verification email",
      });
    }
  };

  const clearMessages = () => {
    setSuccess("");
    setErrors((prev) => ({ ...prev, general: "" }));
  };

  if (loading) {
    return <LoadingSpinner message="Loading profile..." fullScreen />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <p className="text-red-600 mb-4">Failed to load profile</p>
          <button
            onClick={loadUserProfile}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <ProfileHeader
          user={user}
          isEditing={isEditing}
          isChangingPassword={isChangingPassword}
          avatarPreview={avatarPreview}
          onEditClick={handleEditProfile}
          onAvatarChange={handleAvatarChange}
        />

        {/* Success/Error Messages */}
        {success && (
          <AlertMessage
            type="success"
            message={success}
            onClose={clearMessages}
          />
        )}

        {errors.general && (
          <AlertMessage
            type="error"
            message={errors.general}
            onClose={clearMessages}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information Form */}
          <ProfileForm
            user={user}
            isEditing={isEditing}
            formData={formData}
            errors={errors}
            updating={updating}
            onInputChange={handleInputChange}
            onSubmit={handleProfileUpdate}
            onCancel={handleCancelEdit}
          />

          {/* Password Change Form */}
          <PasswordChangeForm
            user={user}
            isChangingPassword={isChangingPassword}
            passwordData={passwordData}
            showPassword={showPassword}
            errors={errors}
            updating={updating}
            onPasswordChange={handlePasswordChange}
            onTogglePassword={togglePasswordVisibility}
            onSubmit={handlePasswordSubmit}
            onCancel={handleCancelPasswordChange}
            onStartChanging={handleStartPasswordChange}
          />
        </div>

        {/* Account Information */}
        <div className="mt-8">
          <AccountInfo
            user={user}
            onResendVerification={handleResendVerification}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
