import React from 'react';

interface RecentListing {
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
}

const TopBanner: React.FC = () => (
  <div className="bg-gradient-to-r from-blue-100 to-blue-200 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center text-blue-600 font-medium h-20 w-full">
    <div className="text-center">
      <div className="text-sm font-semibold mb-1">Top Advertisement Banner</div>
      <div className="text-xs">728 x 90 - Leaderboard</div>
    </div>
  </div>
);

const SideBanner: React.FC = () => (
  <div className="bg-gradient-to-br from-green-100 to-green-200 border-2 border-dashed border-green-300 rounded-lg flex items-center justify-center text-green-600 font-medium h-64 w-full">
    <div className="text-center">
      <div className="text-sm font-semibold mb-1">Side Advertisement</div>
      <div className="text-xs">300 x 250 - Medium Rectangle</div>
    </div>
  </div>
);

const InlineBanner: React.FC = () => (
  <div className="bg-gradient-to-r from-purple-100 to-purple-200 border-2 border-dashed border-purple-300 rounded-lg flex items-center justify-center text-purple-600 font-medium h-16 w-full">
    <div className="text-center">
      <div className="text-sm font-semibold mb-1">Inline Advertisement</div>
      <div className="text-xs">468 x 60 - Banner</div>
    </div>
  </div>
);

const BottomBanner: React.FC = () => (
  <div className="bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-dashed border-orange-300 rounded-lg flex items-center justify-center text-orange-600 font-medium h-20 w-full">
    <div className="text-center">
      <div className="text-sm font-semibold mb-1">Bottom Advertisement Banner</div>
      <div className="text-xs">728 x 90 - Leaderboard</div>
    </div>
  </div>
);

const MobileBanner: React.FC = () => (
  <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 font-medium h-16 w-full">
    <div className="text-center">
      <div className="text-sm font-semibold mb-1">Mobile Advertisement</div>
      <div className="text-xs">320 x 50 - Mobile Banner</div>
    </div>
  </div>
);

interface RecentListingsProps {
  onListingClick?: (listing: RecentListing) => void;
}

const RecentListings: React.FC<RecentListingsProps> = ({ onListingClick }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  const recentListings: RecentListing[] = [
    { 
      id: 1, 
      title: 'Senior Software Engineer - React/Node.js',
      category: 'Jobs',
      price: '$95,000',
      location: 'Chicago, IL',
      image: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 345,
      timeAgo: '1 hour ago',
      postedDate: new Date('2025-01-12'),
      featured: true,
      description: 'Join our innovative team building next-generation web applications. We are looking for a senior developer with 5+ years of experience in React and Node.js.',
      phone: '(312) 555-0101',
      email: 'hr@techcompany.com'
    },
    { 
      id: 2, 
      title: 'Beautiful 3BR Downtown Condo',
      category: 'Real Estate',
      price: '$2,200/month',
      location: 'Naperville, IL',
      image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 289,
      timeAgo: '3 hours ago',
      postedDate: new Date('2025-01-12'),
      featured: true,
      description: 'Beautiful 3-bedroom apartment with modern amenities and city views.'
    },
    { 
      id: 3, 
      title: 'Honda Civic 2020 - Excellent Condition',
      category: 'Vehicles',
      price: '$22,500',
      location: 'Aurora, IL',
      image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 234,
      timeAgo: '6 hours ago',
      postedDate: new Date('2025-01-11'),
      featured: false,
      description: 'Well-maintained Honda Civic with low mileage. Single owner, all service records available.'
    },
    { 
      id: 4, 
      title: 'Professional Wedding Photography Services',
      category: 'Services',
      price: '$1,200',
      location: 'Peoria, IL',
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 134,
      timeAgo: '8 hours ago',
      postedDate: new Date('2025-01-11'),
      featured: true,
      description: 'Professional wedding photography with Indian cultural expertise. Portfolio available.'
    },
    { 
      id: 5, 
      title: 'Math Tutoring - All Levels Available',
      category: 'Education',
      price: '$40/hour',
      location: 'Springfield, IL',
      image: 'https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 89,
      timeAgo: '12 hours ago',
      postedDate: new Date('2025-01-10'),
      featured: false,
      description: 'Experienced math tutor for students of all ages. Flexible scheduling available.'
    },
    { 
      id: 6, 
      title: 'MacBook Pro 2021 - Like New Condition',
      category: 'Buy & Sell',
      price: '$1,800',
      location: 'Rockford, IL',
      image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 156,
      timeAgo: '1 day ago',
      postedDate: new Date('2025-01-09'),
      featured: false,
      description: 'MacBook Pro 14" with M1 Pro chip. Barely used, includes original box and accessories.'
    },
    { 
      id: 7, 
      title: 'Indian Classical Dance Classes - Bharatanatyam',
      category: 'Education',
      price: '$60/month',
      location: 'Urbana-Champaign, IL',
      image: 'https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 98,
      timeAgo: '2 days ago',
      postedDate: new Date('2025-01-08'),
      featured: false,
      description: 'Learn Bharatanatyam from certified instructor. All ages welcome, flexible scheduling.'
    },
    { 
      id: 8, 
      title: 'Professional House Cleaning Service',
      category: 'Services',
      price: '$80/visit',
      location: 'Bloomington-Normal, IL',
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 145,
      timeAgo: '3 days ago',
      postedDate: new Date('2025-01-07'),
      featured: false,
      description: 'Professional house cleaning service with excellent reviews. Weekly or bi-weekly service available.'
    },
    { 
      id: 9, 
      title: 'Yoga Instructor Position - RYT-200 Required',
      category: 'Jobs',
      price: '$50/hour',
      location: 'Chicago, IL',
      image: 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 123,
      timeAgo: '4 days ago',
      postedDate: new Date('2025-01-06'),
      featured: false,
      description: 'Seeking experienced yoga instructor for wellness center. RYT-200 certification required.'
    },
    { 
      id: 10, 
      title: 'Indian Catering Services for All Events',
      category: 'Services',
      price: '$15/person',
      location: 'Aurora, IL',
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 167,
      timeAgo: '5 days ago',
      postedDate: new Date('2025-01-05'),
      featured: false,
      description: 'Professional catering for all occasions. Specializing in Indian cuisine and fusion dishes.'
    }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex >= recentListings.length - 1 ? 0 : prevIndex + 1
      );
    }, 2000); // Scroll every 2 seconds

    return () => clearInterval(interval);
  }, [recentListings.length]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <h3 className="text-sm font-semibold mb-3 text-gray-800 flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
        Recent Listings
      </h3>
      <div className="relative overflow-hidden h-64">
        <div 
          className="transition-transform duration-500 ease-in-out"
          style={{ transform: `translateY(-${currentIndex * 26}px)` }}
        >
          {recentListings.map((listing) => (
            <div 
              key={listing.id} 
              className="h-9 flex items-center justify-between py-1 mb-1 cursor-pointer hover:bg-gray-50 transition-colors rounded px-2 border-l-2 border-transparent hover:border-orange-500"
              onClick={() => onListingClick && onListingClick(listing)}
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate hover:text-orange-600 transition-colors leading-tight">
                  {listing.title}
                </h4>
                <div className="text-xs text-gray-500 truncate">
                  {listing.category} • {listing.location}
                </div>
              </div>
              <div className="flex flex-col items-end text-xs text-gray-500 ml-2">
                <span className="font-semibold text-orange-600 text-sm">{listing.price}</span>
                <span className="text-xs">{listing.timeAgo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Bullion Widget Component
const BullionWidget: React.FC = () => {
  const [prices, setPrices] = React.useState({
    gold: { price: 2045.50, change: +12.30, changePercent: +0.61 },
    silver: { price: 24.85, change: -0.15, changePercent: -0.60 }
  });

  React.useEffect(() => {
    // Simulate real-time price updates
    const interval = setInterval(() => {
      setPrices(prev => ({
        gold: {
          price: prev.gold.price + (Math.random() - 0.5) * 5,
          change: (Math.random() - 0.5) * 20,
          changePercent: (Math.random() - 0.5) * 2
        },
        silver: {
          price: prev.silver.price + (Math.random() - 0.5) * 0.5,
          change: (Math.random() - 0.5) * 2,
          changePercent: (Math.random() - 0.5) * 3
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Live Precious Metals</h3>
      <div className="flex items-center justify-between">
        {/* Gold */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-xs font-semibold text-yellow-800">Gold</span>
          <span className="text-sm font-bold text-yellow-900">${prices.gold.price.toFixed(0)}</span>
          <span className={`text-xs ${prices.gold.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {prices.gold.change >= 0 ? '↗' : '↘'}{prices.gold.changePercent.toFixed(1)}%
          </span>
        </div>
        
        {/* Silver */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span className="text-xs font-semibold text-gray-800">Silver</span>
          <span className="text-sm font-bold text-gray-900">${prices.silver.price.toFixed(2)}</span>
          <span className={`text-xs ${prices.silver.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {prices.silver.change >= 0 ? '↗' : '↘'}{prices.silver.changePercent.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

// Time Widget Component
const TimeWidget: React.FC = () => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getIndiaTime = () => {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(currentTime);
  };

  const getUSTime = () => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(currentTime);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">World Clock</h3>
      <div className="flex items-center justify-between">
        {/* India Time */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span className="text-xs font-semibold text-orange-800">India</span>
          <span className="text-sm font-bold text-orange-900 font-mono">{getIndiaTime()}</span>
        </div>
        
        {/* US Time */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-xs font-semibold text-blue-800">US</span>
          <span className="text-sm font-bold text-blue-900 font-mono">{getUSTime()}</span>
        </div>
      </div>
    </div>
  );
};

// Flipping Ad Component for Landing Pages
const FlippingAd: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ size = 'medium' }) => {
  const [currentAdIndex, setCurrentAdIndex] = React.useState(0);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  const ads = [
    {
      id: 1,
      title: "Premium Business Listing",
      subtitle: "Boost your visibility today",
      bgColor: "from-blue-500 to-blue-600",
      textColor: "text-white",
      buttonText: "Get Started",
      icon: "🚀"
    },
    {
      id: 2,
      title: "Featured Ad Placement",
      subtitle: "Get noticed by thousands",
      bgColor: "from-green-500 to-green-600",
      textColor: "text-white",
      buttonText: "Learn More",
      icon: "⭐"
    },
    {
      id: 3,
      title: "Professional Services",
      subtitle: "Connect with local experts",
      bgColor: "from-purple-500 to-purple-600",
      textColor: "text-white",
      buttonText: "Find Services",
      icon: "🔧"
    },
    {
      id: 4,
      title: "Real Estate Deals",
      subtitle: "Find your dream home",
      bgColor: "from-orange-500 to-orange-600",
      textColor: "text-white",
      buttonText: "Browse Homes",
      icon: "🏠"
    },
    {
      id: 5,
      title: "Job Opportunities",
      subtitle: "Advance your career",
      bgColor: "from-indigo-500 to-indigo-600",
      textColor: "text-white",
      buttonText: "View Jobs",
      icon: "💼"
    },
    {
      id: 6,
      title: "Vehicle Marketplace",
      subtitle: "Buy & sell with confidence",
      bgColor: "from-red-500 to-red-600",
      textColor: "text-white",
      buttonText: "Shop Now",
      icon: "🚗"
    },
    {
      id: 7,
      title: "Community Events",
      subtitle: "Stay connected locally",
      bgColor: "from-pink-500 to-pink-600",
      textColor: "text-white",
      buttonText: "Join Events",
      icon: "🎉"
    },
    {
      id: 8,
      title: "Education & Training",
      subtitle: "Learn new skills today",
      bgColor: "from-teal-500 to-teal-600",
      textColor: "text-white",
      buttonText: "Explore",
      icon: "📚"
    }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, 3000); // Flip every 3 seconds

    return () => clearInterval(interval);
  }, [ads.length]);

  const handleAdClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const currentAd = ads[currentAdIndex];
  
  const sizeClasses = {
    small: 'h-32 p-4',
    medium: 'h-40 p-6',
    large: 'h-48 p-8'
  };

  const textSizes = {
    small: { title: 'text-sm', subtitle: 'text-xs', button: 'text-xs px-3 py-1' },
    medium: { title: 'text-lg', subtitle: 'text-sm', button: 'text-sm px-4 py-2' },
    large: { title: 'text-xl', subtitle: 'text-base', button: 'text-base px-6 py-3' }
  };

  return (
    <>
      <div 
        className={`bg-gradient-to-r ${currentAd.bgColor} ${currentAd.textColor} rounded-lg shadow-lg ${sizeClasses[size]} transition-all duration-500 ease-in-out transform hover:scale-105 cursor-pointer overflow-hidden relative`}
        onClick={handleAdClick}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{currentAd.icon}</span>
                <h3 className={`font-bold ${textSizes[size].title}`}>{currentAd.title}</h3>
              </div>
              <p className={`${textSizes[size].subtitle} opacity-90`}>{currentAd.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-end justify-between">
            <button className={`bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg font-semibold transition-all duration-200 ${textSizes[size].button}`}>
              {currentAd.buttonText}
            </button>
            
            {/* Progress Dots */}
            <div className="flex space-x-1">
              {ads.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentAdIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Slide Animation Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-pulse"></div>
      </div>

      {/* Ad Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Advertisement</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className={`bg-gradient-to-r ${currentAd.bgColor} ${currentAd.textColor} rounded-lg p-8 mb-6`}>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-4xl">{currentAd.icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold">{currentAd.title}</h3>
                    <p className="text-lg opacity-90">{currentAd.subtitle}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-base opacity-90 mb-4">
                    This is a premium advertisement space. Contact us to learn more about advertising opportunities 
                    and how we can help promote your business to the Illinois Desi community.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm opacity-80">
                    <li>Reach thousands of potential customers</li>
                    <li>Targeted advertising to specific demographics</li>
                    <li>Multiple ad formats and placements available</li>
                    <li>Detailed analytics and performance tracking</li>
                  </ul>
                </div>
                
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg px-6 py-3 font-semibold transition-all duration-200">
                  {currentAd.buttonText}
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Interested in advertising with us?
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold">
                    Contact Sales Team
                  </button>
                  <button className="border-2 border-orange-500 text-orange-500 px-6 py-2 rounded-lg hover:bg-orange-500 hover:text-white transition-all duration-200 font-semibold">
                    View Pricing Plans
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const AdBanners = {
  TopBanner,
  SideBanner,
  InlineBanner,
  BottomBanner,
  MobileBanner,
  RecentListings,
  BullionWidget,
  TimeWidget,
  FlippingAd
};

export default AdBanners;