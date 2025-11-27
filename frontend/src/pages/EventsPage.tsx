import React, { useState, useMemo } from "react";
import { Calendar, Search } from "lucide-react";
import FlyerGrid from "../components/common/flyer/FlyerGrid";
import ListingModal from "../components/ListingModal";
import { Flyer } from "../types/flyer";
import { FlippingAd, RecentListings } from "../components/AdBanners";
import { SidebarBanner, BetweenAdsBanner, FooterBanner } from "../components/common/BannerLayouts";
import { useAuth } from "../contexts/AuthContext";
import PageHeader from "../components/PageHeader";

// Dummy data for event flyers
const EVENT_FLYERS: Flyer[] = [
  {
    id: 1,
    title: "Diwali Festival Celebration 2025",
    description:
      "Join us for the grandest Diwali celebration in Illinois! Experience traditional music, dance performances, authentic Indian food, fireworks display, and cultural activities for the whole family.",
    images: [
      "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "Festivals",
    location: "Navy Pier, Chicago, IL",
    date: "November 15, 2025 - 6:00 PM",
    contact: {
      phone: "(312) 555-0130",
      email: "info@diwalichicago.org",
      website: "www.diwalichicago.org",
    },
  },
  {
    id: 2,
    title: "Bollywood Night - Live Concert",
    description:
      "An evening of mesmerizing Bollywood music with live performances by renowned artists. Dance to your favorite Hindi songs and enjoy authentic Indian cuisine.",
    images: [
      "https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "Concerts",
    location: "Rosemont Theatre, Rosemont, IL",
    date: "January 25, 2025 - 7:30 PM",
    contact: {
      phone: "(847) 555-0131",
      email: "tickets@bollywoodnight.com",
      website: "www.bollywoodnight.com",
    },
  },
  {
    id: 3,
    title: "Holi Festival - Colors of Joy",
    description:
      "Celebrate the festival of colors with music, dance, traditional sweets, and the famous color throwing ceremony. Family-friendly event with activities for all ages.",
    images: [
      "https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "Festivals",
    location: "Millennium Park, Chicago, IL",
    date: "March 14, 2025 - 2:00 PM",
    contact: {
      phone: "(312) 555-0132",
      email: "info@holichicago.com",
    },
  },
  {
    id: 4,
    title: "Indian Classical Music Concert",
    description:
      "An enchanting evening of Indian classical music featuring renowned sitar and tabla artists. Experience the rich tradition of Indian classical music.",
    images: [
      "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "Cultural Events",
    location: "Symphony Center, Chicago, IL",
    date: "February 20, 2025 - 8:00 PM",
    contact: {
      phone: "(312) 555-0133",
      email: "info@classicalmusic.org",
      website: "www.classicalmusic.org",
    },
  },
  {
    id: 5,
    title: "Navratri Garba Dance Festival",
    description:
      "Nine nights of traditional Garba and Dandiya dancing with live music, authentic Gujarati food, and colorful decorations. All skill levels welcome!",
    images: [
      "https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "Religious Events",
    location: "Hindu Temple, Aurora, IL",
    date: "October 3-11, 2025 - 7:00 PM Daily",
    contact: {
      phone: "(630) 555-0134",
      email: "info@navratriaurora.com",
    },
  },
  {
    id: 6,
    title: "Indian Cooking Workshop",
    description:
      "Learn to cook authentic Indian dishes from expert chefs. Hands-on workshop covering spices, techniques, and traditional recipes. All ingredients provided.",
    images: [
      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "Workshops",
    location: "Culinary Institute, Naperville, IL",
    date: "Every Saturday - 10:00 AM",
    contact: {
      phone: "(630) 555-0135",
      email: "info@indiancooking.com",
      website: "www.indiancooking.com",
    },
  },
];

const EventsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFlyer, setSelectedFlyer] = useState<Flyer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract unique categories from event flyers
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(EVENT_FLYERS.map(flyer => flyer.category)));
    return ["all", ...uniqueCategories];
  }, []);

  // Filter event flyers based on search and category
  const filteredFlyers = useMemo(() => {
    return EVENT_FLYERS.filter(flyer => {
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
        <div className="flex gap-2 md:gap-4 lg:gap-6">
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
              icon={Calendar}
              title="Events"
              description="Stay tuned for upcoming Desi community events."
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
                    placeholder="Search events..."
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
                Showing {filteredFlyers.length} of {EVENT_FLYERS.length} events
              </div>
            </div>

            {/* Events Grid */}
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
                price: selectedFlyer.date || "Contact for details",
                location: selectedFlyer.location,
                image: selectedFlyer.images[0],
                views: 0,
                timeAgo: selectedFlyer.date || "Recently posted",
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

export default EventsPage;
