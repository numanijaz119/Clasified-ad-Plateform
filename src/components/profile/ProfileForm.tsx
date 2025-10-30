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
  // Basic phone number validation
  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone.trim()) return true; // Optional field

    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, "");

    // Allow 10-11 digits (US format with or without country code)
    return digitsOnly.length >= 10 && digitsOnly.length <= 11;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow only numbers, spaces, parentheses, hyphens, and plus signs
    const sanitized = value.replace(/[^0-9\s\-\(\)\+]/g, "");

    // Update the event target value
    e.target.value = sanitized;
    onInputChange(e);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Profile Information
      </h2>

      {isEditing ? (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="first_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
              required
              autoComplete="given-name"
            />
            {errors.first_name && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.first_name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="last_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Last Name
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
              required
              autoComplete="family-name"
            />
            {errors.last_name && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.last_name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
              placeholder="(555) 123-4567 (optional)"
              autoComplete="tel"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.phone}
              </p>
            )}
            {formData.phone && !validatePhoneNumber(formData.phone) && (
              <p className="text-amber-600 text-sm mt-1">
                Please enter a valid phone number (10-11 digits)
              </p>
            )}
          </div>

          {errors.avatar && (
            <p className="text-red-500 text-sm" role="alert">
              {errors.avatar}
            </p>
          )}

          <div className="flex space-x-3 pt-4">
            <Button type="submit" variant="primary" disabled={updating}>
              <Save className="w-4 h-4" />
              <span>{updating ? "Saving..." : "Save Changes"}</span>
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
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
          {user.show_email !== false && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="text-gray-900 mt-1 py-2">{user.email}</p>
            </div>
          )}
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
