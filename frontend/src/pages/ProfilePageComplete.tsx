import React, { useState, useEffect } from "react";
import {
  User,
  Edit3,
  Mail,
  Phone,
  Calendar,
  Shield,
  Check,
  X,
  Camera,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { authService } from "../services/authService";

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
  show_email?: boolean;
  show_phone?: boolean;
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
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors(prev => ({
          ...prev,
          avatar: "Please select a valid image file",
        }));
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          avatar: "Image size must be less than 5MB",
        }));
        return;
      }

      setFormData(prev => ({ ...prev, avatar: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Clear avatar error
      if (errors.avatar) {
        setErrors(prev => ({ ...prev, avatar: "" }));
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const togglePasswordVisibility = (field: "old" | "new" | "confirm") => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load profile</p>
          <button
            onClick={loadUserProfile}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
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
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                  {avatarPreview || user.avatar ? (
                    <img
                      src={avatarPreview || user.avatar}
                      alt={user.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{user.full_name}</h1>
                {user.show_email !== false && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{user.email}</span>
                    {user.email_verified ? (
                      <div className="flex items-center space-x-1">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 text-sm">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <X className="w-4 h-4 text-red-500" />
                        <span className="text-red-600 text-sm">Not Verified</span>
                      </div>
                    )}
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center space-x-2 mt-1">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{user.phone}</span>
                  </div>
                )}
              </div>

              {/* Edit Button */}
              {!isEditing && !isChangingPassword && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="(optional)"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                {errors.avatar && <p className="text-red-500 text-sm">{errors.avatar}</p>}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleProfileUpdate}
                    disabled={updating}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{updating ? "Saving..." : "Save Changes"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        first_name: user.first_name,
                        last_name: user.last_name,
                        phone: user.phone || "",
                      });
                      setAvatarPreview(user.avatar || "");
                      setErrors({});
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <p className="text-gray-900 mt-1">{user.first_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <p className="text-gray-900 mt-1">{user.last_name}</p>
                </div>
                {user.show_email !== false && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900 mt-1">{user.email}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <p className="text-gray-900 mt-1">{user.phone || "Not provided"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Account Security & Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Security</h2>

            {isChangingPassword ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.old ? "text" : "password"}
                      name="old_password"
                      value={passwordData.old_password}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("old")}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword.old ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.old_password && (
                    <p className="text-red-500 text-sm mt-1">{errors.old_password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? "text" : "password"}
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword.new ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.new_password && (
                    <p className="text-red-500 text-sm mt-1">{errors.new_password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword.confirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirm_password && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handlePasswordSubmit}
                    disabled={updating}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {updating ? "Changing..." : "Change Password"}
                  </button>
                  <button
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({
                        old_password: "",
                        new_password: "",
                        confirm_password: "",
                      });
                      setErrors({});
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Password</h3>
                    <p className="text-sm text-gray-500">Last changed: Not tracked</p>
                  </div>
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Change Password
                  </button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Account Status</h3>
                  <div className="flex items-center space-x-2">
                    <Shield
                      className={`w-4 h-4 ${user.is_active ? "text-green-500" : "text-red-500"}`}
                    />
                    <span className={user.is_active ? "text-green-600" : "text-red-600"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Created</label>
              <div className="flex items-center space-x-2 mt-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">{formatDate(user.created_at)}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Updated</label>
              <div className="flex items-center space-x-2 mt-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">{formatDate(user.updated_at)}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">User ID</label>
              <p className="text-gray-900 mt-1">#{user.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Verification</label>
              <div className="flex items-center space-x-2 mt-1">
                {user.email_verified ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">Verified</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-red-500" />
                    <span className="text-red-600">Not Verified</span>
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium ml-2">
                      Send Verification Email
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
