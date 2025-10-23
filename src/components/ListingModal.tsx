import React from "react";
import {
  MapPin,
  Eye,
  Clock,
  Star,
  Heart,
  Phone,
  Mail,
  Calendar,
  User,
  MessageCircle,
} from "lucide-react";
import { BaseModal } from "./modals";
import { useState } from 'react'; // if not already imported
import { useNavigate } from 'react-router-dom';
import { messagingService } from '../services/messagingService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from "../contexts/AuthContext";

interface Listing {
  id: number;
  title: string;
  category: string;
  price: string;
  location: string;
  image: string;
  views: number;
  timeAgo: string;
  postedDate: Date;
  featured: boolean;
  description: string;
  phone?: string;
  email?: string;
  images: string[];
  user?: {
    full_name: string;
    avatar: string | null;
  };
}

interface ListingModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn?: boolean;
}

const ListingModal: React.FC<ListingModalProps> = ({
  listing,
  isOpen,
  onClose,
  isLoggedIn = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const navigate = useNavigate();
  const toast = useToast();
  const [startingConversation, setStartingConversation] = useState(false);
  const { user } = useAuth();
  const isOwnAd = user && listing?.user?.id === user.id;

  if (!listing) return null;

  // Use dynamic images from API, fallback to placeholder if none
  const displayImages =
    listing.images && listing.images.length > 0
      ? listing.images
      : ["/placeholder.svg"];

  const hasMultipleImages = displayImages.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + displayImages.length) % displayImages.length
    );
  };

  // Add this function inside the component
const handleMessageSeller = async () => {
  if (!listing || !isLoggedIn) {
    toast.error('Please sign in to message the seller');
    return;
  }

  try {
    setStartingConversation(true);

    // Create or get existing conversation
    const conversation = await messagingService.createConversation(listing.id);
    
    // Navigate to messages page with the conversation selected
    navigate('/messages', { 
      state: { conversationId: conversation.id } 
    });
    
    // Close the modal
    onClose();
    
  } catch (error: any) {
    console.error('Failed to start conversation:', error);
    
    // Handle different error cases
    // Check both error.message and error.error (backend can return either)
    let errorMessage = '';
    
    if (error.details?.error) {
      // Handle nested error object from backend
      errorMessage = Array.isArray(error.details.error) 
        ? error.details.error[0] 
        : error.details.error;
    } else if (error.error) {
      errorMessage = error.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    if (errorMessage.includes('yourself')) {
      toast.error('You cannot message yourself about your own ad');
    } else if (errorMessage.includes('blocked')) {
      // Handle blocked user errors
      if (errorMessage.includes('You have blocked')) {
        toast.error('You have blocked this user. Please unblock them from Blocked Chats to continue.');
      } else if (errorMessage.includes('has blocked you')) {
        toast.error('This user has blocked you. You cannot start a conversation with them.');
      } else {
        toast.error('Cannot start conversation. User is blocked.');
      }
    } else if (errorMessage) {
      // Show the actual error message if available
      toast.error(errorMessage);
    } else {
      toast.error('Failed to start conversation. Please try again.');
    }
  } finally {
    setStartingConversation(false);
  }
};

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      showCloseButton={false}
    >
      {/* Custom Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex items-center space-x-3">
          {listing.featured && (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
              <Star className="h-4 w-4 fill-current" />
              <span>Featured</span>
            </div>
          )}
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            {listing.category}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="p-6">
        {/* Title and Price */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {listing.title}
          </h1>
          <div className="text-3xl font-bold text-orange-600 mb-4">
            {listing.price}
          </div>

          {/* Location and Stats */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{listing.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{listing.views} views</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Posted {listing.timeAgo}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{listing.postedDate.toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="mb-6">
          <div className="relative">
            {/* Main Image with Navigation */}
            <div className="relative mb-4">
              <img
                src={displayImages[currentImageIndex]}
                alt={listing.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />

              {/* Navigation Arrows - only show if multiple images */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    →
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {currentImageIndex + 1} / {displayImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Images - only show if multiple images */}
            {hasMultipleImages && (
              <div className="grid grid-cols-4 gap-2">
                {displayImages.map((image: string, index: number) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${listing.title} ${index + 1}`}
                    className={`w-full h-16 object-cover rounded cursor-pointer transition-opacity ${
                      index === currentImageIndex
                        ? "opacity-100 ring-2 ring-orange-500"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Description
          </h2>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p className="whitespace-pre-wrap">{listing.description}</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Contact Information
          </h2>
          {isLoggedIn ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Phone</div>
                  <div className="font-semibold text-gray-900">
                    {listing.phone || "Not provided"}
                  </div>
                </div>
              </div>
              {listing.email && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-semibold text-gray-900">
                      {listing.email}
                    </div>
                  </div>
                </div>
              )}
              {listing.user && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Seller</div>
                    <div className="font-semibold text-gray-900">
                      {listing.user.full_name}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sign In to View Contact Info
              </h3>
              <p className="text-gray-600 mb-4">
                Please sign in to view the seller's contact information and get
                in touch.
              </p>
              {/* <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold">
                Sign In to Contact
              </button> */}
            </div>
          )}

         {/* Action Buttons */}
{isLoggedIn && (
  <div className="flex flex-col sm:flex-row gap-3 mt-6">
    {/* Message Seller Button - PRIMARY ACTION */}
    <button 
      onClick={handleMessageSeller}
      disabled={startingConversation}
      className="btn-primary flex-1"
    >
      {startingConversation ? (
        <>
          <div className="spinner h-4 w-4"></div>
          <span>Opening...</span>
        </>
      ) : (
        <>
          <MessageCircle className="h-5 w-5" />
          <span>Message Seller</span>
        </>
      )}
    </button>

    {/* Call Button */}
    {listing.phone && (
      <a
        href={`tel:${listing.phone}`}
        className="btn-secondary flex-1"
      >
        <Phone className="h-5 w-5" />
        <span>Call</span>
      </a>
    )}

    {/* Email Button */}
    {listing.email && (
      <a
        href={`mailto:${listing.email}`}
        className="btn-secondary flex-1"
      >
        <Mail className="h-5 w-5" />
        <span>Email</span>
      </a>
    )}

    {/* Favorite Button */}
    <button 
      className="btn-ghost px-4"
      aria-label="Add to favorites"
    >
      <Heart className="h-5 w-5" />
    </button>
  </div>
)}
        </div>
      </div>
    </BaseModal>
  );
};

export default ListingModal;
