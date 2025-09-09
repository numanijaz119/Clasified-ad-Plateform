import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, Eye, Clock, Star, MapPin, Search } from 'lucide-react';
import AdBanners from '../components/AdBanners';
import ListingModal from '../components/ListingModal';

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
}

const CityPage: React.FC = () => {
  const { cityName } = useParams<{ cityName: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = [
    'all', 'Jobs', 'Real Estate', 'Vehicles', 'Buy & Sell', 'Services', 
    'Education', 'Community Events', 'Health & Wellness', 'Matrimonial',
    'Food & Dining', 'Entertainment'
  ];

  // Mock listings data for the city
  const mockListings: Listing[] = [
    {
      id: 1,
      title: 'Senior Software Engineer - React/Node.js',
      category: 'Jobs',
      price: '$95,000 - $130,000',
      location: cityName || 'Chicago',
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
      title: 'Beautiful 2BR Condo Downtown',
      category: 'Real Estate',
      price: '$2,200/month',
      location: cityName || 'Chicago',
      image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 289,
      timeAgo: '3 hours ago',
      postedDate: new Date('2025-01-12'),
      featured: true,
      description: 'Modern condo with city views and amenities. Recently renovated with high-end finishes.'
    },
    {
      id: 3,
      title: 'Catering Services for Events',
      category: 'Services',
      price: 'Starting $15/person',
      location: cityName || 'Chicago',
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 167,
      timeAgo: '6 hours ago',
      postedDate: new Date('2025-01-11'),
      featured: false,
      description: 'Professional catering for all occasions. Specializing in Indian cuisine and fusion dishes.'
    },
    {
      id: 4,
      title: 'Honda Civic 2020 - Excellent Condition',
      category: 'Vehicles',
      price: '$22,500',
      location: cityName || 'Chicago',
      image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 234,
      timeAgo: '12 hours ago',
      postedDate: new Date('2025-01-11'),
      featured: false,
      description: 'Well-maintained Honda Civic with low mileage. Single owner, all service records available.'
    },
    {
      id: 5,
      title: 'MacBook Pro 2021 - Like New',
      category: 'Buy & Sell',
      price: '$1,800',
      location: cityName || 'Chicago',
      image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 156,
      timeAgo: '1 day ago',
      postedDate: new Date('2025-01-10'),
      featured: false,
      description: 'MacBook Pro 14" with M1 Pro chip. Barely used, includes original box and accessories.'
    },
    {
      id: 6,
      title: 'Indian Classical Dance Classes',
      category: 'Education',
      price: '$60/month',
      location: cityName || 'Chicago',
      image: 'https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 98,
      timeAgo: '2 days ago',
      postedDate: new Date('2025-01-09'),
      featured: false,
      description: 'Learn Bharatanatyam from certified instructor. All ages welcome, flexible scheduling.'
    },
    {
      id: 7,
      title: 'Wedding Photography Services',
      category: 'Services',
      price: 'Starting $1,200',
      location: cityName || 'Chicago',
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 134,
      timeAgo: '3 days ago',
      postedDate: new Date('2025-01-08'),
      featured: true,
      description: 'Professional wedding photography with Indian cultural expertise. Portfolio available.'
    },
    {
      id: 8,
      title: 'Diwali Community Celebration',
      category: 'Community Events',
      price: 'Free Entry',
      location: cityName || 'Chicago',
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 445,
      timeAgo: '4 days ago',
      postedDate: new Date('2025-01-07'),
      featured: true,
      description: 'Join us for a grand Diwali celebration with cultural performances, food, and fireworks.'
    },
    {
      id: 9,
      title: 'Ayurvedic Wellness Consultation',
      category: 'Health & Wellness',
      price: '$80/session',
      location: cityName || 'Chicago',
      image: 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 89,
      timeAgo: '5 days ago',
      postedDate: new Date('2025-01-06'),
      featured: false,
      description: 'Certified Ayurvedic practitioner offering personalized wellness consultations and treatments.'
    },
    {
      id: 10,
      title: 'Indian Restaurant for Sale',
      category: 'Buy & Sell',
      price: '$150,000',
      location: cityName || 'Chicago',
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 267,
      timeAgo: '1 week ago',
      postedDate: new Date('2025-01-05'),
      featured: false,
      description: 'Established Indian restaurant in prime location. Fully equipped kitchen and loyal customer base.'
    }
  ];

  const filteredListings = useMemo(() => {
    let filtered = mockListings.filter(listing => {
      // Search query filter
      const matchesSearch = searchQuery === '' || 
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort listings by date posted (newest first by default)
    if (sortBy === 'newest') {
      filtered.sort((a, b) => b.postedDate.getTime() - a.postedDate.getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => a.postedDate.getTime() - b.postedDate.getTime());
    } else if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  const handleListingClick = (listing: Listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Ad Banner */}
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="px-4 py-2">
          <AdBanners.MobileBanner />
        </div>
      </div>

      {/* Tablet Ad Banner */}
      <div className="hidden md:block lg:hidden bg-white border-b border-gray-200">
        <div className="px-4 py-2">
          <AdBanners.FlippingAd size="medium" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-2 md:gap-4 lg:gap-6">
          {/* Left Sidebar with Ads */}
          <div className="w-20 md:w-32 lg:w-48 flex-shrink-0">
            <div className="sticky top-24 space-y-4 z-10">
              <div className="block lg:hidden">
                <AdBanners.FlippingAd size="small" />
              </div>
              <div className="hidden lg:block">
                <AdBanners.SideBanner />
              </div>
              <AdBanners.FlippingAd size="large" />
              <div className="hidden md:block">
                <AdBanners.FlippingAd size="medium" />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <Link 
                  to="/" 
                 className="flex items-center text-orange-500 hover:text-orange-600 transition-colors mr-4 text-sm"
                >
                 <ArrowLeft className="h-4 w-4 mr-1" />
                 <span className="font-medium">Back</span>
                </Link>
              </div>
              
             <div className="flex items-center mb-1">
               <MapPin className="h-5 w-5 text-orange-500 mr-2" />
               <h1 className="text-xl font-bold text-gray-900">
                  Listings in {cityName}
                </h1>
              </div>
             <p className="text-sm text-gray-600">
                {filteredListings.length} listings found • Sorted by date posted
              </p>
              {selectedCategory !== 'all' && (
                <p className="text-sm text-orange-600">
                  Filtered by category: {selectedCategory}
                </p>
              )}
            </div>

            {/* Filters */}
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
              {/* Search Bar */}
             <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search listings..."
                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                  />
                </div>
              </div>
              
              {/* Filter Dropdowns - Single Line */}
             <div className="flex flex-wrap gap-3 items-end">
                <div>
                 <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                  <select
                    value={cityName || 'Chicago'}
                    disabled
                   className="px-3 py-1.5 border border-gray-300 rounded-md bg-gray-100 text-gray-600 text-sm"
                  >
                    <option value={cityName}>{cityName}</option>
                  </select>
                </div>

                <div>
                 <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                   className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                 <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                   className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>

                <div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSortBy('newest');
                    }}
                   className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Listings List - Single Line Titles */}
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-h-[75vh] overflow-y-auto">
              <div className="divide-y divide-gray-200">
                {filteredListings.map((listing, index) => (
                  <div key={listing.id}>
                    <div 
                     className="p-3 hover:bg-gray-50 cursor-pointer transition-colors group"
                      onClick={() => handleListingClick(listing)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            {listing.featured && (
                              <Star className="h-4 w-4 text-orange-500 fill-current flex-shrink-0" />
                            )}
                            <h3 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                              {listing.title}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 ml-4">
                          <span className="font-semibold text-orange-600">{listing.price}</span>
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">{listing.category}</span>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{listing.views}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{listing.timeAgo}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Inline Ad every 5 listings */}
                    {(index + 1) % 5 === 0 && index < filteredListings.length - 1 && (
                     <div className="p-2 bg-gray-50 border-t border-b border-gray-200">
                        <AdBanners.InlineBanner />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* No Results */}
              {filteredListings.length === 0 && (
               <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                   <MapPin className="h-12 w-12 mx-auto" />
                  </div>
                 <h3 className="text-base font-semibold text-gray-900 mb-2">No listings found</h3>
                  <p className="text-gray-600">Try adjusting your filters to see more results.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar with Ads */}
          <div className="w-20 md:w-32 xl:w-48 flex-shrink-0">
            <div className="sticky top-24 space-y-4 z-10">
              <AdBanners.FlippingAd size="large" />
              <AdBanners.FlippingAd size="small" />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Banner Ad */}
      <AdBanners.BottomBanner />

      {/* Listing Modal */}
      <ListingModal 
        listing={selectedListing}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default CityPage;