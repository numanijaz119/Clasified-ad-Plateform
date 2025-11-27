import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, MapPin, Phone, Mail, Globe } from "lucide-react";
import { Flyer } from "../../../types/flyer";

interface FlyerModalProps {
  flyer: Flyer | null;
  isOpen: boolean;
  onClose: () => void;
}

const FlyerModal: React.FC<FlyerModalProps> = ({ flyer, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !flyer) return null;

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? flyer.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev === flyer.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>

          {/* Image Gallery */}
          <div className="relative">
            <img
              src={flyer.images[currentImageIndex]}
              alt={flyer.title}
              className="w-full h-96 object-cover"
            />

            {/* Category Badge */}
            <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {flyer.category}
            </div>

            {/* Image Navigation */}
            {flyer.images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-800" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors"
                >
                  <ChevronRight className="h-6 w-6 text-gray-800" />
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {flyer.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? "bg-white w-8" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{flyer.title}</h2>

            {flyer.location && (
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-5 w-5 mr-2 text-orange-500" />
                <span>{flyer.location}</span>
              </div>
            )}

            <p className="text-gray-700 mb-6 leading-relaxed">{flyer.description}</p>

            {/* Contact Information */}
            {flyer.contact && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {flyer.contact.phone && (
                    <a
                      href={`tel:${flyer.contact.phone}`}
                      className="flex items-center text-gray-700 hover:text-orange-600 transition-colors"
                    >
                      <Phone className="h-5 w-5 mr-3 text-orange-500" />
                      <span>{flyer.contact.phone}</span>
                    </a>
                  )}
                  {flyer.contact.email && (
                    <a
                      href={`mailto:${flyer.contact.email}`}
                      className="flex items-center text-gray-700 hover:text-orange-600 transition-colors"
                    >
                      <Mail className="h-5 w-5 mr-3 text-orange-500" />
                      <span>{flyer.contact.email}</span>
                    </a>
                  )}
                  {flyer.contact.website && (
                    <a
                      href={`https://${flyer.contact.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-orange-600 transition-colors"
                    >
                      <Globe className="h-5 w-5 mr-3 text-orange-500" />
                      <span>{flyer.contact.website}</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlyerModal;
