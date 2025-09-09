import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, Eye, Clock, Star, Search } from 'lucide-react';
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

const CategoryPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cities = [
    'all', 'Chicago', 'Aurora', 'Naperville', 'Bloomington-Normal', 'Peoria', 
    'Springfield', 'Urbana-Champaign', 'Rockford'
  ];

  // Mock listings data for the category
  const getAllMockListings = (): Listing[] => [
    {
      id: 1,
      title: 'Senior Software Engineer - React/Node.js',
      category: 'Jobs',
      price: '$95,000 - $130,000',
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
      title: 'Marketing Manager - Digital Agency',
      category: 'Jobs',
      price: '$70,000 - $90,000',
      location: 'Naperville, IL',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 189,
      timeAgo: '3 hours ago',
      postedDate: new Date('2025-01-12'),
      featured: false,
      description: 'Lead marketing campaigns for diverse client portfolio. Experience in digital marketing and team management required.',
      phone: '(630) 555-0102',
      email: 'careers@digitalagency.com'
    },
    {
      id: 3,
      title: 'Data Scientist - Healthcare Analytics',
      category: 'Jobs',
      price: '$85,000 - $115,000',
      location: 'Aurora, IL',
      image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 267,
      timeAgo: '6 hours ago',
      postedDate: new Date('2025-01-11'),
      featured: true,
      description: 'Apply machine learning to improve patient outcomes. PhD in Data Science or related field preferred.',
      phone: '(630) 555-0103',
      email: 'jobs@healthtech.com'
    },
    {
      id: 4,
      title: 'UX/UI Designer - Fintech Startup',
      category: 'Jobs',
      price: '$75,000 - $95,000',
      location: 'Chicago, IL',
      image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 156,
      timeAgo: '12 hours ago',
      postedDate: new Date('2025-01-11'),
      featured: false,
      description: 'Design intuitive financial applications for mobile and web. Portfolio showcasing fintech experience required.',
      phone: '(312) 555-0104',
      email: 'design@fintech.com'
    },
    {
      id: 5,
      title: 'Project Manager - Construction',
      category: 'Jobs',
      price: '$80,000 - $100,000',
      location: 'Peoria, IL',
      image: 'https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 98,
      timeAgo: '1 day ago',
      postedDate: new Date('2025-01-10'),
      featured: false,
      description: 'Oversee commercial construction projects from start to finish. PMP certification preferred.',
      phone: '(309) 555-0105',
      email: 'pm@construction.com'
    },
    {
      id: 6,
      title: 'Sales Representative - Medical Devices',
      category: 'Jobs',
      price: '$60,000 + Commission',
      location: 'Springfield, IL',
      image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 234,
      timeAgo: '2 days ago',
      postedDate: new Date('2025-01-09'),
      featured: false,
      description: 'Sell cutting-edge medical equipment to healthcare facilities. Medical sales experience required.',
      phone: '(217) 555-0106',
      email: 'sales@meddevice.com'
    },
    {
      id: 7,
      title: 'DevOps Engineer - Cloud Infrastructure',
      category: 'Jobs',
      price: '$90,000 - $120,000',
      location: 'Chicago, IL',
      image: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 178,
      timeAgo: '3 days ago',
      postedDate: new Date('2025-01-08'),
      featured: true,
      description: 'Build and maintain scalable cloud infrastructure on AWS. Kubernetes and Docker experience required.',
      phone: '(312) 555-0107',
      email: 'devops@cloudtech.com'
    },
    {
      id: 8,
      title: 'Registered Nurse - ICU',
      category: 'Jobs',
      price: '$65,000 - $85,000',
      location: 'Rockford, IL',
      image: 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 145,
      timeAgo: '4 days ago',
      postedDate: new Date('2025-01-07'),
      featured: false,
      description: 'Provide critical care in our state-of-the-art ICU facility. BSN and ICU experience required.',
      phone: '(815) 555-0108',
      email: 'nursing@hospital.com'
    },
    {
      id: 9,
      title: 'Accountant - CPA Firm',
      category: 'Jobs',
      price: '$55,000 - $70,000',
      location: 'Naperville, IL',
      image: 'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 123,
      timeAgo: '5 days ago',
      postedDate: new Date('2025-01-06'),
      featured: false,
      description: 'Handle tax preparation and financial audits. CPA certification preferred.',
      phone: '(630) 555-0109',
      email: 'careers@cpafirm.com'
    },
    {
      id: 10,
      title: 'Elementary School Teacher',
      category: 'Jobs',
      price: '$45,000 - $60,000',
      location: 'Aurora, IL',
      image: 'https://images.pexels.com/photos/8471831/pexels-photo-8471831.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 89,
      timeAgo: '1 week ago',
      postedDate: new Date('2025-01-05'),
      featured: false,
      description: 'Teach elementary students in a supportive environment. Teaching license required.',
      phone: '(630) 555-0110',
      email: 'hr@schooldistrict.edu'
    },
    // Real Estate listings
    {
      id: 11,
      title: 'Beautiful 3BR Downtown Condo',
      category: 'Real Estate',
      price: '$2,500/month',
      location: 'Chicago, IL',
      image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 234,
      timeAgo: '2 hours ago',
      postedDate: new Date('2025-01-12'),
      featured: true,
      description: 'Modern condo with city views and premium amenities.'
    },
    {
      id: 12,
      title: '4BR Family Home with Garage',
      category: 'Real Estate',
      price: '$450,000',
      location: 'Naperville, IL',
      image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 189,
      timeAgo: '5 hours ago',
      postedDate: new Date('2025-01-11'),
      featured: false,
      description: 'Spacious family home in quiet neighborhood.'
    },
    // Vehicle listings
    {
      id: 13,
      title: '2020 Honda Civic - Excellent Condition',
      category: 'Vehicles',
      price: '$22,500',
      location: 'Aurora, IL',
      image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 156,
      timeAgo: '3 hours ago',
      postedDate: new Date('2025-01-12'),
      featured: false,
      description: 'Well-maintained Honda Civic with low mileage.'
    },
    {
      id: 14,
      title: '2018 Toyota Camry - One Owner',
      category: 'Vehicles',
      price: '$19,800',
      location: 'Peoria, IL',
      image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 123,
      timeAgo: '1 day ago',
      postedDate: new Date('2025-01-11'),
      featured: true,
      description: 'Reliable Toyota Camry with complete service history.'
    },
    // Buy & Sell listings
    {
      id: 15,
      title: 'MacBook Pro 2021 - Like New',
      category: 'Buy & Sell',
      price: '$1,800',
      location: 'Chicago, IL',
      image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 267,
      timeAgo: '4 hours ago',
      postedDate: new Date('2025-01-12'),
      featured: false,
      description: 'MacBook Pro 14" with M1 Pro chip. Barely used.'
    },
    {
      id: 16,
      title: 'iPhone 14 Pro Max - Unlocked',
      category: 'Buy & Sell',
      price: '$950',
      location: 'Naperville, IL',
      image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 198,
      timeAgo: '6 hours ago',
      postedDate: new Date('2025-01-11'),
      featured: true,
      description: 'iPhone 14 Pro Max in excellent condition, unlocked.'
    },
    // Services listings
    {
      id: 17,
      title: 'Professional House Cleaning Service',
      category: 'Services',
      price: '$80/visit',
      location: 'Springfield, IL',
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 145,
      timeAgo: '2 hours ago',
      postedDate: new Date('2025-01-12'),
      featured: false,
      description: 'Reliable house cleaning service with excellent reviews.'
    },
    {
      id: 18,
      title: 'Wedding Photography Services',
      category: 'Services',
      price: 'Starting $1,200',
      location: 'Chicago, IL',
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 234,
      timeAgo: '1 day ago',
      postedDate: new Date('2025-01-11'),
      featured: true,
      description: 'Professional wedding photography with Indian cultural expertise.'
    },
    // Education listings
    {
      id: 19,
      title: 'Math Tutoring - All Levels',
      category: 'Education',
      price: '$40/hour',
      location: 'Urbana-Champaign, IL',
      image: 'https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 89,
      timeAgo: '3 hours ago',
      postedDate: new Date('2025-01-12'),
      featured: false,
      description: 'Experienced math tutor for students of all ages.'
    },
    {
      id: 20,
      title: 'Indian Classical Dance Classes',
      category: 'Education',
      price: '$60/month',
      location: 'Chicago, IL',
      image: 'https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 156,
      timeAgo: '5 hours ago',
      postedDate: new Date('2025-01-11'),
      featured: true,
      description: 'Learn Bharatanatyam from certified instructor.'
    }
  ];

  const mockListings = getAllMockListings().filter(listing => 
    listing.category === categoryName
  );

  const filteredListings = useMemo(() => {
    let filtered = mockListings.filter(listing => {
      // Search query filter
      const matchesSearch = searchQuery === '' || 
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      // City filter
      const matchesCity = selectedCity === 'all' || listing.location.includes(selectedCity);
      
      return matchesSearch && matchesCity;
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
  }, [searchQuery, selectedCity, sortBy]);

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Jobs': '💼',
      'Real Estate': '🏠',
      'Vehicles': '🚗',
      'Buy & Sell': '🛍️',
      'Services': '🔧',
      'Education': '🎓',
      'Community Events': '📅',
      'Health & Wellness': '❤️',
      'Matrimonial': '💑',
      'Food & Dining': '🍽️',
      'Entertainment': '🎮'
    };
    return icons[category] || '📋';
  };

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
                <span className="text-3xl mr-3">{getCategoryIcon(categoryName || '')}</span>
               <h1 className="text-xl font-bold text-gray-900">
                  {categoryName} Listings
                </h1>
              </div>
             <p className="text-sm text-gray-600">
                {filteredListings.length} listings found • Sorted by date posted
              </p>
              {selectedCity !== 'all' && (
                <p className="text-sm text-orange-600">
                  Filtered by: {selectedCity}
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
                 <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={categoryName || 'Jobs'}
                    disabled
                   className="px-3 py-1.5 border border-gray-300 rounded-md bg-gray-100 text-gray-600 text-sm"
                  >
                    <option value={categoryName}>{categoryName}</option>
                  </select>
                </div>

                <div>
                 <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                   className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>
                        {city === 'all' ? 'All Cities' : city}
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
                      setSelectedCity('all');
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
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-h-[80vh] overflow-y-auto">
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
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">{listing.location}</span>
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
                   <span className="text-3xl">{getCategoryIcon(categoryName || '')}</span>
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

export default CategoryPage;