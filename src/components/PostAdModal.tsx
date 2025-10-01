import React, { useEffect } from "react";
import {
  Star,
  Clock,
  Image as ImageIcon,
  User,
  X,
  MapPin,
  DollarSign,
  Tag,
  FileText,
  Phone,
  Mail,
  EyeOff,
  AlertCircle,
  Check,
  Upload,
} from "lucide-react";
import BaseModal from "./modals/BaseModal";
import { useAuth } from "../contexts/AuthContext";
import { usePostAd } from "../hooks/usePostAd";
import { useToast } from "../contexts/ToastContext";

interface PostAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PostAdModal: React.FC<PostAdModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const {
    // State
    formData,
    categories,
    cities,
    images,
    imagePreview,
    selectedPlan,
    loading,
    loadingData,
    errors,
    step,

    // Actions
    loadData,
    updateField,
    handleImageUpload,
    removeImage,
    submitAd,
    resetForm,
    setSelectedPlan,
    setStep,
    formatPhoneDisplay,
  } = usePostAd();

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadData();
    }
  }, [isOpen, isAuthenticated, loadData]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await submitAd();
    if (success) {
      onSuccess?.();
      onClose();
      resetForm();
    } else {
      // Error handling - check if there are specific errors
      if (errors.submit) {
        toast.error(errors.submit);
      } else {
        toast.error(
          "Failed to create ad. Please check the form and try again."
        );
      }
    }
  };

  // Handle modal close with reset
  const handleClose = () => {
    onClose();
    resetForm();
  };

  // Login required screen
  if (!isAuthenticated) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="max-w-md"
        showCloseButton={false}
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to sign in to post an advertisement. This helps us maintain
            quality and security for all users.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                // Parent component should handle showing sign in modal
              }}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
            >
              Sign In
            </button>
          </div>
        </div>
      </BaseModal>
    );
  }

  // Loading state
  if (loadingData) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Post Your Ad"
        maxWidth="max-w-4xl"
      >
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories and cities...</p>
        </div>
      </BaseModal>
    );
  }

  // Plan selection step
  if (step === "plan") {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Choose Your Ad Plan"
        maxWidth="max-w-2xl"
      >
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Free Plan */}
            <div
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                selectedPlan === "free"
                  ? "border-orange-500 bg-orange-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedPlan("free")}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-semibold text-gray-900">Free Ad</h4>
                <div className="text-3xl font-bold text-green-600">$0</div>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <Clock className="h-4 w-4 mr-3 text-green-500" />
                  30 days duration
                </li>
                <li className="flex items-center">
                  <ImageIcon className="h-4 w-4 mr-3 text-green-500" />
                  Up to 3 images
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-3 text-green-500" />
                  Basic listing in search results
                </li>
              </ul>
            </div>

            {/* Featured Plan */}
            <div
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all relative ${
                selectedPlan === "featured"
                  ? "border-orange-500 bg-orange-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedPlan("featured")}
            >
              <div className="absolute -top-3 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                Recommended
              </div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-semibold text-gray-900">
                  Featured Ad
                </h4>
                <div className="text-3xl font-bold text-orange-600">$9.99</div>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <Clock className="h-4 w-4 mr-3 text-orange-500" />
                  30 days duration
                </li>
                <li className="flex items-center">
                  <ImageIcon className="h-4 w-4 mr-3 text-orange-500" />
                  Up to 10 images
                </li>
                <li className="flex items-center">
                  <Star className="h-4 w-4 mr-3 text-orange-500" />
                  Featured badge & top placement
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-3 text-orange-500" />
                  3x more visibility
                </li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep("form")}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
            >
              Continue with {selectedPlan === "free" ? "Free" : "Featured"} Plan
            </button>
          </div>
        </div>
      </BaseModal>
    );
  }

  // Main form
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Your Ad"
      maxWidth="max-w-5xl"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            {/* Plan Summary */}
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {selectedPlan === "featured" && (
                    <Star className="h-5 w-5 text-orange-500" />
                  )}
                  <span className="font-medium text-gray-900">
                    {selectedPlan === "free" ? "Free Ad" : "Featured Ad"}
                  </span>
                  <span className="text-sm text-gray-500">
                    • {selectedPlan === "free" ? "Up to 3" : "Up to 10"} images
                  </span>
                </div>
                <div className="font-semibold text-gray-900">
                  {selectedPlan === "free" ? "$0" : "$9.99"}
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Basic Information
              </h3>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Ad Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.title ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter a clear, descriptive title"
                    maxLength={100}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.title}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.title.length}/100 characters
                  </p>
                </div>

                {/* Category & City Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Category *
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => updateField("category", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                        errors.category ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      <MapPin className="h-4 w-4 inline mr-1" />
                      City *
                    </label>
                    <select
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select city</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                          {city.state_code && `, ${city.state_code}`}
                        </option>
                      ))}
                    </select>
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.city}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-vertical ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Provide detailed information about your item or service..."
                    maxLength={2000}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/2000 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Pricing & Details
              </h3>

              <div className="space-y-4">
                {/* Price Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Type *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { value: "fixed", label: "Fixed Price" },
                      { value: "negotiable", label: "Negotiable" },
                      { value: "contact", label: "Contact for Price" },
                      { value: "free", label: "Free" },
                      { value: "swap", label: "Swap/Trade" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-colors text-sm ${
                          formData.price_type === option.value
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="price_type"
                          value={option.value}
                          checked={formData.price_type === option.value}
                          onChange={(e) =>
                            updateField("price_type", e.target.value)
                          }
                          className="sr-only"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Input & Condition Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Price */}
                  {(formData.price_type === "fixed" ||
                    formData.price_type === "negotiable") && (
                    <div>
                      <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Price ($) *
                      </label>
                      <input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => updateField("price", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                          errors.price ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      {errors.price && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.price}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Condition - FIXED VALUES */}
                  <div
                    className={
                      formData.price_type === "contact" ||
                      formData.price_type === "free" ||
                      formData.price_type === "swap"
                        ? "sm:col-span-2"
                        : ""
                    }
                  >
                    <label
                      htmlFor="condition"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Condition
                    </label>
                    <select
                      id="condition"
                      value={formData.condition}
                      onChange={(e) => updateField("condition", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    >
                      <option value="not_applicable">Not Applicable</option>
                      <option value="new">New</option>
                      <option value="like_new">Like New</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <label
                    htmlFor="keywords"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    <Tag className="h-4 w-4 inline mr-1" />
                    Keywords (Optional)
                  </label>
                  <input
                    id="keywords"
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => updateField("keywords", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="e.g., iPhone, Apple, smartphone, unlocked"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add relevant keywords to help buyers find your ad
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Images & Contact */}
          <div className="space-y-6">
            {/* Images Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ImageIcon className="h-5 w-5 mr-2" />
                Images *
                <span className="text-sm text-gray-500 font-normal ml-2">
                  (Up to {selectedPlan === "free" ? "3" : "10"})
                </span>
              </h3>

              <div className="space-y-4">
                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    errors.images
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag & drop images or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    PNG, JPG, GIF up to 5MB each
                  </p>
                  <label className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer transition-colors">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Images
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                    />
                  </label>
                </div>

                {errors.images && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.images}
                  </p>
                )}

                {/* Image Preview Grid */}
                {imagePreview.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 sm:h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          aria-label="Remove image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Contact Information
              </h3>

              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor="contact_email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email Address
                  </label>
                  <input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) =>
                      updateField("contact_email", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.contact_email
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.contact_email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.contact_email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="contact_phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    id="contact_phone"
                    type="tel"
                    value={formatPhoneDisplay(formData.contact_phone)}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "");
                      if (cleaned.length <= 10) {
                        updateField("contact_phone", cleaned);
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.contact_phone
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="(555) 123-4567"
                  />
                  {errors.contact_phone && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.contact_phone}
                    </p>
                  )}

                  {/* Hide Phone Option */}
                  {formData.contact_phone && (
                    <label className="flex items-center mt-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.hide_phone}
                        onChange={(e) =>
                          updateField("hide_phone", e.target.checked)
                        }
                        className="text-orange-500 focus:ring-orange-500 rounded mr-2"
                      />
                      <EyeOff className="h-4 w-4 mr-1 text-gray-500" />
                      Hide phone from public view
                    </label>
                  )}
                </div>

                {/* Contact validation error */}
                {errors.contact && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.contact}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Errors */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.submit}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-200 gap-4">
          <button
            type="button"
            onClick={() => setStep("plan")}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Change Plan Selection
          </button>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Ad...
                </>
              ) : (
                <>
                  Create Ad
                  {selectedPlan === "featured" && (
                    <span className="ml-2 text-sm opacity-90">($9.99)</span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Guidelines */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Before you submit
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • Your ad will be reviewed within 24 hours before going live
                </li>
                <li>• Use clear, high-quality images for better engagement</li>
                <li>
                  • Write a detailed description to attract serious buyers
                </li>
                <li>• Check your contact information is correct</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default PostAdModal;
