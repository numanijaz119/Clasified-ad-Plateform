import React, { useState, useEffect } from "react";
import { authService } from "../services/index";
import { ProfileHeader } from "../components/profile";
import { ProfileForm } from "../components/profile";
import { PasswordChangeForm } from "../components/profile";
import { AccountInfo } from "../components/profile";
import { LoadingSpinner } from "../components/profile";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";

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

  const [profileUpdating, setProfileUpdating] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  const { updateUser } = useAuth();

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
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const toast = useToast();

  // Load user profile on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const truncateFilename = (file: File): File => {
    const maxLength = 80; // Keep safe margin below 100
    const extension = file.name.split(".").pop() || "";
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf("."));

    if (file.name.length <= maxLength) {
      return file;
    }

    // Create shorter name: timestamp + random + extension
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const newName = `avatar_${timestamp}_${random}.${extension}`;

    // Create new File object with shorter name
    return new File([file], newName, { type: file.type });
  };

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
      toast.error(error.message || "Failed to load profile");
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
        const errorMsg = "Please select a valid image file";
        toast.error(errorMsg);
        setErrors((prev) => ({ ...prev, avatar: errorMsg }));
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        const errorMsg = "Image size must be less than 5MB";
        toast.error(errorMsg);
        setErrors((prev) => ({ ...prev, avatar: errorMsg }));
        return;
      }

      // Truncate filename if too long
      const processedFile = truncateFilename(file);
      setFormData((prev) => ({ ...prev, avatar: processedFile }));

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
    setProfileUpdating(true);
    setUpdating(true);
    setErrors({});

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
      updateUser(updatedUser);
      setIsEditing(false);

      // Success toast notification
      toast.success("Profile updated successfully!");

      // Reload profile to get latest data
      loadUserProfile();
    } catch (error: any) {
      // Error handling with toast
      if (error.details) {
        setErrors(error.details);
        // Show first error in toast
        const firstError = Object.values(error.details)[0] as string;
        toast.error(firstError);
      } else {
        const errorMsg = error.message || "Failed to update profile";
        setErrors({ general: errorMsg });
        toast.error(errorMsg);
      }

      console.log("Full error:", error);
      console.log("Error details:", error.details);
      console.log("File size:", formData.avatar?.size);
      console.log("File type:", formData.avatar?.type);
    } finally {
      // setUpdating(false);
      setProfileUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordUpdating(true);
    setUpdating(true);
    setErrors({});

    try {
      // Client-side validation
      if (passwordData.new_password !== passwordData.confirm_password) {
        const errorMsg = "Passwords do not match";
        setErrors({ confirm_password: errorMsg });
        toast.error(errorMsg);
        return;
      }

      if (passwordData.new_password.length < 8) {
        const errorMsg = "Password must be at least 8 characters long";
        setErrors({ new_password: errorMsg });
        toast.error(errorMsg);
        return;
      }

      await authService.changePassword(passwordData);

      // Reset form and state
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
      setIsChangingPassword(false);

      // Success toast notification
      toast.success("Password changed successfully!");
    } catch (error: any) {
      // Error handling with toast
      if (error.details) {
        setErrors(error.details);
        // Show first error in toast
        const firstError = Object.values(error.details)[0] as string;
        toast.error(firstError);
      } else {
        const errorMsg = error.message || "Failed to change password";
        setErrors({ general: errorMsg });
        toast.error(errorMsg);
      }
    } finally {
      // setUpdating(false);
      setPasswordUpdating(false);
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
    <div className="!min-h-screen bg-gray-50 py-8">
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

        {/* Only show general errors that aren't handled by toast */}
        {errors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-800 text-sm">{errors.general}</div>
              <button
                onClick={() => setErrors((prev) => ({ ...prev, general: "" }))}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information Form */}
          <ProfileForm
            user={user}
            isEditing={isEditing}
            formData={formData}
            errors={errors}
            updating={profileUpdating}
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
            updating={passwordUpdating}
            onPasswordChange={handlePasswordChange}
            onTogglePassword={togglePasswordVisibility}
            onSubmit={handlePasswordSubmit}
            onCancel={handleCancelPasswordChange}
            onStartChanging={handleStartPasswordChange}
          />
        </div>

        {/* Account Information */}
        <div className="mt-8">
          <AccountInfo user={user} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
