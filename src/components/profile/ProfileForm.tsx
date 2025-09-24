import React from "react";
import { Save } from "lucide-react";
import { User } from "./types";
import Button from "../ui/Button";

interface ProfileFormData {
  first_name: string;
  last_name: string;
  phone: string;
  avatar?: File;
}

interface ProfileFormProps {
  user: User;
  isEditing: boolean;
  formData: ProfileFormData;
  errors: Record<string, string>;
  updating: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  user,
  isEditing,
  formData,
  errors,
  updating,
  onInputChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Profile Information
      </h2>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              required
            />
            {errors.first_name && (
              <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
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
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              placeholder="(optional)"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {errors.avatar && (
            <p className="text-red-500 text-sm">{errors.avatar}</p>
          )}

          <div className="flex space-x-3 pt-4">
            <Button variant="primary" onClick={onSubmit}>
              <Save className="w-4 h-4" />
              <span>{updating ? "Saving..." : "Save Changes"}</span>
            </Button>
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <p className="text-gray-900 mt-1 py-2">{user.first_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <p className="text-gray-900 mt-1 py-2">{user.last_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <p className="text-gray-900 mt-1 py-2">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <p className="text-gray-900 mt-1 py-2">
              {user.phone || "Not provided"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileForm;
