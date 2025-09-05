import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Eye, Clock, Star, Heart } from 'lucide-react';
import ListingModal from './ListingModal';

const FeaturedAds: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const featuredAds = [
    {
      id: 1,
      title: 'Software Engineer - Full Stack Developer',
      category: 'Jobs',
      price: '$85,000 - $120,000',
      location: 'Chicago, IL',
      image: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 245,
      timeAgo: '2 hours ago',
      featured: true,
      description: 'Join our dynamic team as a Full Stack Developer. React, Node.js experience required.',
      postedDate: new Date('2025-01-12'),
      phone: '(312) 555-0101',
      email: 'hr@techcompany.com'
    },
    {
      id: 2,
      title: '3BR Luxury Apartment in Downtown',
      category: 'Real Estate',
      price: '$2,800/month',
      location: 'Naperville, IL',
      image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 189,
      timeAgo: '4 hours ago',
      featured: true,
      description: 'Beautiful 3-bedroom apartment with modern amenities and city views.',
      postedDate: new Date('2025-01-12'),
      phone: '(630) 555-0102',
      email: 'realtor@apartments.com'
    },
    {
      id: 3,
      title: '2018 Honda Accord - Excellent Condition',
      category: 'Vehicles',
      price: '$18,500',
      location: 'Aurora, IL',
      image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 156,
      timeAgo: '6 hours ago',
      featured: true,
      description: 'Well-maintained Honda Accord with low mileage. Single owner.',
      postedDate: new Date('2025-01-11'),
      phone: '(630) 555-0103',
      email: 'seller@cars.com'
    },
    {
      id: 4,
      title: 'Indian Classical Dance Classes',
      category: 'Education',
      price: '$60/month',
      location: 'Bloomington, IL',
      image: 'https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 98,
      timeAgo: '8 hours ago',
      featured: false,
      description: 'Learn Bharatanatyam from certified instructor. All ages welcome.',
      postedDate: new Date('2025-01-11'),
      phone: '(309) 555-0104',
      email: 'dance@classes.com'
    },
    {
      id: 5,
      title: 'Wedding Photography Services',
      category: 'Services',
      price: 'Starting $1,200',
      location: 'Peoria, IL',
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 134,
      timeAgo: '12 hours ago',
      featured: true,
      description: 'Professional wedding photography with Indian cultural expertise.',
      postedDate: new Date('2025-01-10'),
      phone: '(309) 555-0105',
      email: 'photo@weddings.com'
    },
    {
      id: 6,
      title: 'MacBook Pro 2021 - Like New',
      category: 'Buy & Sell',
      price: '$1,800',
      location: 'Springfield, IL',
      image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 267,
      timeAgo: '1 day ago',
      featured: false,
      description: 'MacBook Pro 14" with M1 Pro chip. Barely used, includes original box.',
      postedDate: new Date('2025-01-09'),
      phone: '(217) 555-0106',
      email: 'seller@electronics.com'
    }
  ];

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex >= featuredAds.length - 4 ? 0 : prevIndex + 1
      );
    }, 3000); // Scroll every 3 seconds

    return () => clearInterval(interval);
  }, [featuredAds.length]);

  const handleAdClick = (ad) => {
    setSelectedListing(ad);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  return (
    <section className="py-3">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-0.5">Featured Ads</h2>
          <p className="text-xs text-gray-600">Premium listings from our community</p>
        </div>
        <Link 
          to="/featured-ads"
          className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 text-sm"
        >
          View All →
        </Link>
      </div>

      {/* Scrolling Container */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out gap-3"
          style={{ 
            transform: `translateX(-${currentIndex * 25}%)`,
            width: `${featuredAds.length * 25}%`
          }}
        >
          {featuredAds.map((ad) => (
            <div
              key={ad.id}
              className="flex-shrink-0 w-1/4 min-w-0 group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => handleAdClick(ad)}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden">
                <img
                  src={ad.image}
                  alt={ad.title}
                  className="w-full h-28 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                {/* Featured Badge */}
                {ad.featured && (
                  <div className="absolute top-1 left-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-semibold flex items-center space-x-0.5">
                    <Star className="h-2 w-2 fill-current" />
                    <span>Featured</span>
                  </div>
                )}
                
                {/* Favorite Button */}
                <button className="absolute top-1 right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Heart className="h-2.5 w-2.5 text-gray-600 hover:text-red-500 transition-colors" />
                </button>
                
                {/* Category Tag */}
                <div className="absolute bottom-1 left-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-xs">
                  {ad.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-2">
                <h3 className="text-xs font-semibold text-gray-900 mb-0.5 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {ad.title}
                </h3>
                
                <p className="text-xs text-gray-600 mb-1 line-clamp-1 hidden">
                  {ad.description}
                </p>
                
                {/* Price */}
                <div className="text-xs font-bold text-orange-600 mb-1">
                  {ad.price}
                </div>
                
                {/* Location */}
                <div className="flex items-center text-gray-600 mb-1">
                  <MapPin className="h-2.5 w-2.5 mr-0.5" />
                  <span className="text-xs">{ad.location}</span>
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-2.5 w-2.5" />
                    <span>{ad.views} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-2.5 w-2.5" />
                    <span>{ad.timeAgo}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center mt-3 space-x-1">
        {Array.from({ length: featuredAds.length - 3 }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentIndex === index
                ? 'bg-orange-500'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Listing Modal */}
      <ListingModal 
        listing={selectedListing}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
};

export default FeaturedAds;