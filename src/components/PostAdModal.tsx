import React, { useState } from 'react';
import { X, Upload, Star, Clock, Image as ImageIcon, User } from 'lucide-react';

interface PostAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn?: boolean;
}

const PostAdModal: React.FC<PostAdModalProps> = ({ isOpen, onClose, isLoggedIn = false }) => {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'featured'>('free');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const categories = [
    'Jobs', 'Real Estate', 'Vehicles', 'Buy & Sell', 'Services', 
    'Education', 'Community Events', 'Health & Wellness', 'Matrimonial',
    'Food & Dining', 'Entertainment'
  ];

  const cities = [
    'Chicago', 'Aurora', 'Naperville', 'Bloomington-Normal', 'Peoria', 
    'Springfield', 'Urbana-Champaign', 'Rockford'
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxImages = selectedPlan === 'free' ? 3 : 10;
    
    if (images.length + files.length > maxImages) {
      alert(`You can only upload ${maxImages} images with the ${selectedPlan} plan`);
      return;
    }
    
    setImages([...images, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove all non-digits
    
    if (value.length <= 10) {
      setPhoneNumber(value);
      
      // Validate phone number
      if (value.length === 0) {
        setPhoneError('');
      } else if (value.length < 10) {
        setPhoneError('Phone number must be 10 digits');
      } else if (value.length === 10) {
        setPhoneError('');
      }
    }
  };

  const formatPhoneDisplay = (phone: string) => {
    if (phone.length >= 6) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    } else if (phone.length >= 3) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
    }
    return phone;
  };

  if (!isOpen) return null;

  // Show login prompt if user is not logged in
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h2>
            <p className="text-gray-600 mb-6">
              You need to sign in to post an advertisement. This helps us maintain quality and security for all users.
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
                  // This is now handled by the parent component
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Post Your Ad</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Plan Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Free Plan */}
              <div
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedPlan === 'free'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlan('free')}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900">Free Ad</h4>
                  <div className="text-2xl font-bold text-green-600">$0</div>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-green-500" />
                    30 days duration
                  </li>
                  <li className="flex items-center">
                    <ImageIcon className="h-4 w-4 mr-2 text-green-500" />
                    Up to 3 images
                  </li>
                  <li className="flex items-center">
                    <span className="w-4 h-4 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                    Basic listing
                  </li>
                </ul>
              </div>

              {/* Featured Plan */}
              <div
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all relative ${
                  selectedPlan === 'featured'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlan('featured')}
              >
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Popular
                </div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900">Featured Ad</h4>
                  <div className="text-2xl font-bold text-orange-600">$9.99</div>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-orange-500" />
                    60 days duration
                  </li>
                  <li className="flex items-center">
                    <ImageIcon className="h-4 w-4 mr-2 text-orange-500" />
                    Up to 10 images
                  </li>
                  <li className="flex items-center">
                    <Star className="h-4 w-4 mr-2 text-orange-500" />
                    Featured badge & priority
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Ad Form */}
          <form className="space-y-6">
            {/* Category and City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a city</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Title *
              </label>
              <input
                type="text"
                placeholder="Enter a descriptive title for your ad"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                rows={5}
                placeholder="Provide detailed information about your listing"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <input
                  type="text"
                  placeholder="Enter price (e.g., $500, $50/hour, Negotiable)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone *
                </label>
                <input
                  type="text"
                  value={formatPhoneDisplay(phoneNumber)}
                  onChange={handlePhoneChange}
                  placeholder="(123) 456-7890"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                    phoneError 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-orange-500'
                  }`}
                  required
                />
                {phoneError && (
                  <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images ({images.length}/{selectedPlan === 'free' ? 3 : 10})
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Click to upload images</p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG up to 5MB each
                  </p>
                </label>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold"
              >
                {selectedPlan === 'free' ? 'Post Free Ad' : 'Post Featured Ad - $9.99'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostAdModal;