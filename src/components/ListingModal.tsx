// src/components/ListingModal.tsx
// FIXED: Proper ownership detection and conditional rendering

import React from "react";
import {
  MapPin,
  Eye,
  Clock,
  Star,
  Heart,
  Phone,
  Mail,
  User,
  MessageCircle,
  TrendingUp,
  Edit,
  BarChart3,
} from "lucide-react";
import { BaseModal } from "./modals";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { messagingService } from "../services/messagingService";
import { useToast } from "../contexts/ToastContext";
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
    id?: number;
    full_name: string;
    avatar: string | null;
  };
  is_owner?: boolean;
  user_id?: number;
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

  if (!listing) return null;

  // CRITICAL: Check ownership using multiple sources
  const isOwnAd =
    user &&
    (listing.is_owner === true ||
      listing.user_id === user.id ||
      listing.user?.id === user.id);

  console.log("🔍 Ownership Check:", {
    hasUser: !!user,
    userId: user?.id,
    listingIsOwner: listing.is_owner,
    listingUserId: listing.user_id,
    listingUserObjId: listing.user?.id,
    finalIsOwnAd: isOwnAd,
  });

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

  const handleMessageSeller = async () => {
    if (!listing || !isLoggedIn) {
      toast.error("Please sign in to message the seller");
      return;
    }

    if (isOwnAd) {
      toast.error("You cannot message yourself about your own ad");
      return;
    }

    try {
      setStartingConversation(true);

      const conversation = await messagingService.createConversation(
        listing.id
      );

      navigate("/messages", {
        state: { conversationId: conversation.id },
      });

      onClose();
    } catch (error: any) {
      console.error("Failed to start conversation:", error);

      let errorMessage = "";

      if (error.details?.error) {
        errorMessage = Array.isArray(error.details.error)
          ? error.details.error[0]
          : error.details.error;
      } else if (error.error) {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (errorMessage.includes("yourself")) {
        toast.error("You cannot message yourself about your own ad");
      } else if (errorMessage.includes("blocked")) {
        if (errorMessage.includes("You have blocked")) {
          toast.error(
            "You have blocked this user. Please unblock them from Blocked Chats to continue."
          );
        } else if (errorMessage.includes("has blocked you")) {
          toast.error(
            "This user has blocked you. You cannot start a conversation with them."
          );
        } else {
          toast.error("Cannot start conversation. User is blocked.");
        }
      } else if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("Failed to start conversation. Please try again.");
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
      {/* Custom Header - Blue border for own ads */}
      <div
        className={`flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10 ${
          isOwnAd ? "border-b-4 border-blue-500" : "border-gray-200"
        }`}
      >
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          {/* Your Ad Badge - ONLY for own ads */}
          {isOwnAd && (
            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 shadow-md">
              <Star className="h-4 w-4 fill-current" aria-hidden="true" />
              <span>Your Ad</span>
            </div>
          )}

          {/* Featured Badge */}
          {listing.featured && (
            <div
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1"
              role="status"
              aria-label="Featured listing"
            >
              <Star className="h-4 w-4 fill-current" aria-hidden="true" />
              <span>Featured</span>
            </div>
          )}

          {/* Category Badge */}
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            {listing.category}
          </span>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
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
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-3xl font-bold text-orange-600">
              {listing.price}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>{listing.location}</span>
              </div>
              {/* CRITICAL: Show views ONLY for owner */}
              {isOwnAd && (
                <div
                  className="flex items-center space-x-1 text-blue-600 font-medium"
                  title="View count (visible to you as the owner)"
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  <span>{listing.views} views</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" aria-hidden="true" />
                <span>{listing.timeAgo}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="mb-6">
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={displayImages[currentImageIndex]}
                alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
              />

              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    aria-label="Previous image"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    aria-label="Next image"
                  >
                    →
                  </button>

                  <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {currentImageIndex + 1} / {displayImages.length}
                  </div>
                </>
              )}
            </div>

            {hasMultipleImages && (
              <div className="grid grid-cols-4 gap-2">
                {displayImages.map((image: string, index: number) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${listing.title} thumbnail ${index + 1}`}
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

        {/* CONDITIONAL RENDERING BASED ON OWNERSHIP */}
        {isOwnAd ? (
          /* OWNER VIEW - Show analytics and management */
          <>
            {/* Analytics Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Your Ad Performance
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {listing.views}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total Views</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {listing.featured ? "Yes" : "No"}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Featured</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {listing.timeAgo}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Posted</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600 bg-white rounded-lg p-3">
                <p>
                  💡 <strong>Tip:</strong> Want more visibility? Consider
                  promoting your ad to featured status for increased reach!
                </p>
              </div>
            </div>

            {/* Owner Actions */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Manage Your Ad
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    navigate("/dashboard");
                    onClose();
                  }}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>View Dashboard</span>
                </button>
                {/* <button
                  onClick={() => {
                    navigate(`/edit-ad/${listing.id}`);
                    onClose();
                  }}
                  className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                >
                  <Edit className="h-5 w-5" />
                  <span>Edit Ad</span>
                </button> */}
              </div>
            </div>
          </>
        ) : (
          /* BUYER VIEW - Show contact information */
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>
            {isLoggedIn ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {listing.phone && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Phone</div>
                        <div className="font-semibold text-gray-900">
                          {listing.phone}
                        </div>
                      </div>
                    </div>
                  )}
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

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleMessageSeller}
                    disabled={startingConversation}
                    className="btn-primary flex-1 flex items-center justify-center space-x-2"
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

                  {listing.phone && (
                    <a
                      href={`tel:${listing.phone}`}
                      className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                    >
                      <Phone className="h-5 w-5" />
                      <span>Call</span>
                    </a>
                  )}

                  {listing.email && (
                    <a
                      href={`mailto:${listing.email}`}
                      className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                    >
                      <Mail className="h-5 w-5" />
                      <span>Email</span>
                    </a>
                  )}

                  <button
                    className="btn-ghost px-4"
                    aria-label="Add to favorites"
                  >
                    <Heart className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sign In to View Contact Info
                </h3>
                <p className="text-gray-600 mb-4">
                  Please sign in to view the seller's contact information and
                  get in touch.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </BaseModal>
  );
};

export default ListingModal;