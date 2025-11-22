import React, { useState, useEffect } from "react";
import { User, Edit3, Camera, Phone, Mail, Calendar, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  username?: string;
  avatar?: string;
  email_verified: boolean;
  created_at: string;
  last_login?: string;
}

const UserProfile: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    username: "",
    avatar: "",
    email_verified: false,
    created_at: "",
    last_login: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        username: user.username || "",
        avatar: user.avatar || "",
        email_verified: user.email_verified || false,
        created_at: user.created_at || "",
        last_login: user.last_login || "",
      });
      setPreviewUrl(user.avatar || "");
    }
  }, [user]);

  const truncateFilename = (file: File): File => {
    const maxLength = 80; // Safe margin below 100
    const extension = file.name.split(".").pop() || "";

    if (file.name.length <= maxLength) {
      return file;
    }

    // Create shorter name: avatar_ + timestamp + random + extension
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const newName = `avatar_${timestamp}_${random}.${extension}`;

    return new File([file], newName, { type: file.type });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Avatar image must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Truncate filename if too long
      const processedFile = truncateFilename(file);
      setAvatarFile(processedFile);

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError("");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      // Prepare form data for file upload
      const formData = new FormData();

      // Add text fields
      formData.append("first_name", profileData.first_name);
      formData.append("last_name", profileData.last_name);
      formData.append("phone", profileData.phone);

      if (profileData.username) {
        formData.append("username", profileData.username);
      }

      // Add avatar if selected
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      await updateProfile(formData);

      setIsEditing(false);
      setSuccess("Profile updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        username: user.username || "",
        avatar: user.avatar || "",
        email_verified: user.email_verified || false,
        created_at: user.created_at || "",
        last_login: user.last_login || "",
      });
      setPreviewUrl(user.avatar || "");
    }
    setAvatarFile(null);
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mx-6 mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Avatar Section */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-orange-600 text-white p-2 rounded-full cursor-pointer hover:bg-orange-700 transition-colors">
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
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {profileData.first_name} {profileData.last_name}
                  </h3>
                  <div className="flex items-center justify-center mt-2">
                    {profileData.email_verified ? (
                      <span className="flex items-center text-green-600 text-sm">
                        <Shield className="w-4 h-4 mr-1" />
                        Verified Account
                      </span>
                    ) : (
                      <span className="flex items-center text-orange-600 text-sm">
                        <Shield className="w-4 h-4 mr-1" />
                        Unverified Account
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="first_name"
                        value={profileData.first_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.first_name || "Not provided"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="last_name"
                        value={profileData.last_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.last_name || "Not provided"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="username"
                        value={profileData.username}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Optional username"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.username || "Not set"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {profileData.phone || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information (Read-only) */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    {profileData.show_email !== false ? (
                      <p className="text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {profileData.email}
                      </p>
                    ) : (
                      <p className="text-gray-500 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        Hidden by user
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Since
                    </label>
                    <p className="text-gray-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {formatDate(profileData.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
