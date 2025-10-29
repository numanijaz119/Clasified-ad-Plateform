import React from "react";
import { User, Edit3, Mail, Phone, Camera } from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

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

interface ProfileHeaderProps {
  user: User;
  isEditing: boolean;
  isChangingPassword: boolean;
  avatarPreview: string;
  onEditClick: () => void;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAvatarDelete: () => void;
  avatarDeleting: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isEditing,
  avatarPreview,
  onEditClick,
  onAvatarChange,
  onAvatarDelete,
  avatarDeleting,
}) => {
  const hasAvatar = !!(avatarPreview || user.avatar);
  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Avatar */}
          <div className="relative flex flex-col items-center gap-2">
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
              <>
                <label className="absolute bottom-8 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-2 rounded-full cursor-pointer hover:from-orange-600 hover:to-red-600 transition-all duration-200">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onAvatarChange}
                    className="hidden"
                  />
                </label>
                {hasAvatar && (
                  <button
                    onClick={onAvatarDelete}
                    disabled={avatarDeleting}
                    className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {avatarDeleting ? "Removing..." : "Remove"}
                  </button>
                )}
              </>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {user.full_name}
            </h1>
            <div className="flex items-center space-x-2 mt-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{user.email}</span>
              {user.email_verified ? (
                <Badge variant="success">Verified</Badge>
              ) : (
                <Badge variant="error">Not Verified</Badge>
              )}
            </div>
            {user.phone && (
              <div className="flex items-center space-x-2 mt-1">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{user.phone}</span>
              </div>
            )}
          </div>

          {/* Edit Button */}
          {!isEditing && (
            <Button onClick={onEditClick} variant="primary">
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
