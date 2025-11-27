import React, { useState, useMemo } from "react";
import { Heart, Search } from "lucide-react";
import FlyerGrid from "../components/common/flyer/FlyerGrid";
import ListingModal from "../components/ListingModal";
import { Flyer } from "../types/flyer";
import { FlippingAd, RecentListings } from "../components/AdBanners";
import { SidebarBanner, BetweenAdsBanner, FooterBanner } from "../components/common/BannerLayouts";
import { useAuth } from "../contexts/AuthContext";
import PageHeader from "../components/PageHeader";

// Dummy data for flyers
const DUMMY_FLYERS: Flyer[] = [
  {
    id: 1,
    title: "Spice Palace - Authentic Indian Cuisine",
    description:
      "Experience the finest Indian dining with our traditional recipes passed down through generations. Fresh ingredients, aromatic spices, and authentic flavors await you.",
    images: [
      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "Restaurants",
    location: "Chicago, IL",
    contact: {
      phone: "(312) 555-0123",
      email: "info@spicepalace.com",
      website: "www.spicepalace.com",
    },
  },
  {
    id: 2,
    title: "Patel Brothers - Indian Grocery Store",
    description:
      "Your one-stop shop for all Indian groceries, spices, and specialty items. Fresh vegetables, authentic ingredients, and household essentials.",
    images: [
      "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "Grocery Stores",
    location: "Naperville, IL",
    contact: {
      phone: "(630) 555-0124",
      website: "www.patelbrothers.com",
    },
  },
  {
    id: 3,
    title: "Bollywood Fashion - Designer Wear",
    description:
      "Latest Indian fashion trends, designer sarees, lehengas, and traditional wear for all occasions. Custom tailoring available.",
    images: [
      "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1536620/pexels-photo-1536620.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1536621/pexels-photo-1536621.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "Clothing",
    location: "Aurora, IL",
    contact: {
      phone: "(630) 555-0125",
      email: "info@bollywoodfashion.com",
    },
  },
  {
    id: 4,
    title: "Taj Mahal Banquet Hall",
    description:
      "Elegant venue for weddings, parties, and corporate events. Full catering services with authentic Indian cuisine.",
    images: [
      "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "Event Venues",
    location: "Schaumburg, IL",
    contact: {
      phone: "(847) 555-0126",
      email: "events@tajmahalbanquet.com",
      website: "www.tajmahalbanquet.com",
    },
  },
  {
    id: 5,
    title: "Desi Sweets & Snacks",
    description:
      "Fresh Indian sweets, savory snacks, and traditional desserts made daily. Catering available for all occasions.",
    images: [
      "https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "Bakery",
    location: "Oak Brook, IL",
    contact: {
      phone: "(630) 555-0127",
    },
  },
  {
    id: 6,
    title: "India Bazaar - Jewelry & Gifts",
    description:
      "Exquisite Indian jewelry, home decor, and gift items. Gold, silver, and fashion jewelry for every occasion.",
    images: [
      "https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "Jewelry",
    location: "Lombard, IL",
    contact: {
      phone: "(630) 555-0128",
      email: "info@indiabazaar.com",
    },
  },
];

const FavoritesPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFlyer, setSelectedFlyer] = useState<Flyer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract unique categories from flyers
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(DUMMY_FLYERS.map(flyer => flyer.category)));
    return ["all", ...uniqueCategories];
  }, []);

  // Filter flyers based on search and category
  const filteredFlyers = useMemo(() => {
    return DUMMY_FLYERS.filter(flyer => {
      const matchesSearch =
        searchQuery === "" ||
        flyer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flyer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flyer.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "all" || flyer.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleFlyerClick = (flyer: Flyer) => {
    setSelectedFlyer(flyer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFlyer(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-2 lg:gap-4">
          {/* Left Sidebar with Ads */}
          <div className="md:w-48 xl:w-72 lg:w-64 hidden md:block flex-shrink-0">
            <div className="sticky top-24 space-y-4 z-10">
              <div className="hidden lg:block">
                <SidebarBanner />
              </div>
              <FlippingAd size="medium" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <PageHeader
              icon={Heart}
              title="Desi Favorites"
              description="Discover the best Desi businesses, restaurants, and services in your area"
            />
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search flyers..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-3 text-sm text-gray-600">
                Showing {filteredFlyers.length} of {DUMMY_FLYERS.length} flyers
              </div>
            </div>

            {/* Flyers Grid */}
            <FlyerGrid flyers={filteredFlyers} onFlyerClick={handleFlyerClick} />

            {/* Between Ads Banner */}
            <div className="mt-8">
              <BetweenAdsBanner />
            </div>
          </div>

          {/* Right Sidebar with Ads */}
          <div className="md:w-48 hidden md:block xl:w-72 lg:w-60 flex-shrink-0">
            <div className="sticky top-24 space-y-4 z-10">
              <RecentListings />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Banner Ad */}
      <div className="mx-4 mb-4">
        <FooterBanner />
      </div>

      {/* Listing Modal */}
      <ListingModal
        listing={
          selectedFlyer
            ? {
                id: selectedFlyer.id,
                title: selectedFlyer.title,
                category: selectedFlyer.category,
                price: "Contact for pricing",
                location: selectedFlyer.location,
                image: selectedFlyer.images[0],
                views: 0,
                timeAgo: "Recently posted",
                postedDate: new Date(),
                featured: false,
                description: selectedFlyer.description,
                phone: selectedFlyer.contact?.phone,
                email: selectedFlyer.contact?.email,
                images: selectedFlyer.images,
              }
            : null
        }
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isLoggedIn={isAuthenticated}
      />
    </div>
  );
};

export default FavoritesPage;
