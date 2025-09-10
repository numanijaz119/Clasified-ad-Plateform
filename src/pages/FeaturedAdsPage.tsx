import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Eye, Clock, Star, MapPin } from "lucide-react";
import AdBanners from "../components/AdBanners";
import ListingModal from "../components/ListingModal";

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

const FeaturedAdsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = [
    "all",
    "Jobs",
    "Real Estate",
    "Vehicles",
    "Buy & Sell",
    "Services",
    "Education",
    "Community Events",
    "Health & Wellness",
    "Matrimonial",
    "Food & Dining",
    "Entertainment",
  ];

  const cities = [
    "all",
    "Chicago",
    "Aurora",
    "Naperville",
    "Bloomington-Normal",
    "Peoria",
    "Springfield",
    "Urbana-Champaign",
    "Rockford",
  ];

  // All featured listings
  const featuredListings: Listing[] = [
    {
      id: 1,
      title: "Software Engineer Position - Full Stack Developer",
      category: "Jobs",
      price: "$95,000",
      location: "Chicago, IL",
      image:
        "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 345,
      timeAgo: "2 hours ago",
      featured: true,
      description:
        "Join our dynamic team as a Full Stack Developer. React, Node.js experience required.",
      postedDate: new Date("2025-01-12"),
      phone: "(312) 555-0101",
      email: "hr@techcompany.com",
    },
    {
      id: 2,
      title: "3BR Luxury Apartment in Downtown",
      category: "Real Estate",
      price: "$2,800/month",
      location: "Naperville, IL",
      image:
        "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 189,
      timeAgo: "4 hours ago",
      featured: true,
      description:
        "Beautiful 3-bedroom apartment with modern amenities and city views.",
      postedDate: new Date("2025-01-12"),
      phone: "(630) 555-0102",
      email: "realtor@apartments.com",
    },
    {
      id: 3,
      title: "2018 Honda Accord - Excellent Condition",
      category: "Vehicles",
      price: "$18,500",
      location: "Aurora, IL",
      image:
        "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 156,
      timeAgo: "6 hours ago",
      featured: true,
      description:
        "Well-maintained Honda Accord with low mileage. Single owner.",
      postedDate: new Date("2025-01-11"),
      phone: "(630) 555-0103",
      email: "seller@cars.com",
    },
    {
      id: 4,
      title: "Wedding Photography Services",
      category: "Services",
      price: "Starting $1,200",
      location: "Peoria, IL",
      image:
        "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 134,
      timeAgo: "12 hours ago",
      featured: true,
      description:
        "Professional wedding photography with Indian cultural expertise.",
      postedDate: new Date("2025-01-10"),
      phone: "(309) 555-0105",
      email: "photo@weddings.com",
    },
    {
      id: 5,
      title: "Indian Classical Dance Classes",
      category: "Education",
      price: "$60/month",
      location: "Bloomington, IL",
      image:
        "https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 98,
      timeAgo: "8 hours ago",
      featured: true,
      description:
        "Learn Bharatanatyam from certified instructor. All ages welcome.",
      postedDate: new Date("2025-01-11"),
      phone: "(309) 555-0104",
      email: "dance@classes.com",
    },
    {
      id: 6,
      title: "DevOps Engineer - Cloud Infrastructure",
      category: "Jobs",
      price: "$90,000 - $120,000",
      location: "Chicago, IL",
      image:
        "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 278,
      timeAgo: "1 day ago",
      featured: true,
      description:
        "Build and maintain scalable cloud infrastructure on AWS. Kubernetes and Docker experience required.",
      postedDate: new Date("2025-01-11"),
      phone: "(312) 555-0107",
      email: "devops@cloudtech.com",
    },
    {
      id: 7,
      title: "Luxury 4BR Home with Pool",
      category: "Real Estate",
      price: "$650,000",
      location: "Springfield, IL",
      image:
        "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 423,
      timeAgo: "1 day ago",
      featured: true,
      description:
        "Stunning 4-bedroom home with pool and modern amenities in prime location.",
      postedDate: new Date("2025-01-11"),
      phone: "(217) 555-0108",
      email: "luxury@realestate.com",
    },
    {
      id: 8,
      title: "BMW X5 2021 - Premium Package",
      category: "Vehicles",
      price: "$45,000",
      location: "Rockford, IL",
      image:
        "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 312,
      timeAgo: "2 days ago",
      featured: true,
      description:
        "BMW X5 with premium package, low mileage, excellent condition.",
      postedDate: new Date("2025-01-10"),
      phone: "(815) 555-0109",
      email: "luxury@cars.com",
    },
    {
      id: 9,
      title: "Ayurvedic Wellness Center",
      category: "Health & Wellness",
      price: "$80/session",
      location: "Urbana-Champaign, IL",
      image:
        "https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 167,
      timeAgo: "2 days ago",
      featured: true,
      description:
        "Certified Ayurvedic practitioner offering personalized wellness consultations.",
      postedDate: new Date("2025-01-10"),
      phone: "(217) 555-0110",
      email: "wellness@ayurveda.com",
    },
    {
      id: 10,
      title: "Marketing Manager - Digital Agency",
      category: "Jobs",
      price: "$70,000 - $90,000",
      location: "Naperville, IL",
      image:
        "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 234,
      timeAgo: "3 days ago",
      featured: true,
      description:
        "Lead marketing campaigns for diverse client portfolio. Experience in digital marketing required.",
      postedDate: new Date("2025-01-09"),
      phone: "(630) 555-0111",
      email: "careers@digitalagency.com",
    },
    {
      id: 11,
      title: "iPhone 14 Pro Max - Unlocked",
      category: "Buy & Sell",
      price: "$950",
      location: "Chicago, IL",
      image:
        "https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 198,
      timeAgo: "3 days ago",
      featured: true,
      description:
        "iPhone 14 Pro Max in excellent condition, unlocked for all carriers.",
      postedDate: new Date("2025-01-09"),
      phone: "(312) 555-0112",
      email: "seller@electronics.com",
    },
    {
      id: 12,
      title: "Diwali Community Celebration",
      category: "Community Events",
      price: "Free Entry",
      location: "Aurora, IL",
      image:
        "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 567,
      timeAgo: "4 days ago",
      featured: true,
      description:
        "Join us for a grand Diwali celebration with cultural performances, food, and fireworks.",
      postedDate: new Date("2025-01-08"),
      phone: "(630) 555-0113",
      email: "events@community.org",
    },
  ];

  const filteredListings = useMemo(() => {
    let filtered = featuredListings.filter((listing) => {
      // Search query filter
      const matchesSearch =
        searchQuery === "" ||
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategory === "all" || listing.category === selectedCategory;

      // City filter
      const matchesCity =
        selectedCity === "all" || listing.location.includes(selectedCity);

      return matchesSearch && matchesCategory && matchesCity;
    });

    // Sort listings
    if (sortBy === "newest") {
      filtered.sort((a, b) => b.postedDate.getTime() - a.postedDate.getTime());
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => a.postedDate.getTime() - b.postedDate.getTime());
    } else if (sortBy === "alphabetical") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "views") {
      filtered.sort((a, b) => b.views - a.views);
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedCity, sortBy]);

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

      <main className="max-w-7xl mx-auto px-4">
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
                  <span className="font-medium">Back to Home</span>
                </Link>
              </div>

              <div className="flex items-center mb-1">
                <Star className="h-5 w-5 text-orange-500 mr-2 fill-current" />
                <h1 className="text-xl font-bold text-gray-900">
                  Featured Advertisements
                </h1>
              </div>
              <p className="text-sm text-gray-600">
                {filteredListings.length} featured listings • Premium ads from
                our community
              </p>
              {selectedCategory !== "all" && (
                <p className="text-sm text-orange-600">
                  Filtered by category: {selectedCategory}
                </p>
              )}
              {selectedCity !== "all" && (
                <p className="text-sm text-orange-600">
                  Filtered by city: {selectedCity}
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
                    placeholder="Search featured listings..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                  />
                </div>
              </div>

              {/* Filter Dropdowns */}
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city === "all" ? "All Cities" : city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="alphabetical">Alphabetical</option>
                    <option value="views">Most Viewed</option>
                  </select>
                </div>

                <div>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSelectedCity("all");
                      setSortBy("newest");
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {filteredListings.map((listing, index) => (
                <div key={listing.id}>
                  <div
                    className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden"
                    onClick={() => handleListingClick(listing)}
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />

                      {/* Featured Badge */}
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-current" />
                        <span>Featured</span>
                      </div>

                      {/* Category Tag */}
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {listing.category}
                      </div>

                      {/* Views */}
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{listing.views}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {listing.title}
                      </h3>

                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {listing.description}
                      </p>

                      {/* Price */}
                      <div className="text-lg font-bold text-orange-600 mb-2">
                        {listing.price}
                      </div>

                      {/* Location and Time */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{listing.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{listing.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inline Ad every 6 listings */}
                  {(index + 1) % 6 === 0 &&
                    index < filteredListings.length - 1 && (
                      <div className="col-span-full my-4">
                        <AdBanners.InlineBanner />
                      </div>
                    )}
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredListings.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                  <div className="text-gray-400 mb-4">
                    <Star className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No featured ads found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your filters to see more results.
                  </p>
                </div>
              </div>
            )}
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
      <div className="mx-4">
        <AdBanners.BottomBanner />
      </div>

      {/* Listing Modal */}
      <ListingModal
        listing={selectedListing}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isLoggedIn={true}
      />
    </div>
  );
};

export default FeaturedAdsPage;
