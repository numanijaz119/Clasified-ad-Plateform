import React from "react";
import { Flyer } from "../../../types/flyer";
import { Clock } from "lucide-react";

interface FlyerCardProps {
  flyer: Flyer;
  onClick: (flyer: Flyer) => void;
}

const FlyerCard: React.FC<FlyerCardProps> = ({ flyer, onClick }) => {
  return (
    <div
      className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden"
      onClick={() => onClick(flyer)}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={flyer.images[0]}
          alt={flyer.title}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
        />

        {/* Category Badge */}
        <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
          {flyer.category}
        </div>

        {/* Additional Images Badge */}
        {flyer.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            +{flyer.images.length - 1} more
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
          {flyer.title}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{flyer.description}</p>
        {/* Optional Date */}

        {flyer.date && (
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            {flyer.date}
          </div>
        )}
        {flyer.location && <div className="text-xs text-gray-500 mb-1">📍 {flyer.location}</div>}
      </div>
    </div>
  );
};

export default FlyerCard;
