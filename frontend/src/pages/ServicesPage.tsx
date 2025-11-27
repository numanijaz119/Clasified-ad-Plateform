import React, { useState, useMemo } from "react";
import { ArrowLeft, Briefcase, Search } from "lucide-react";
import FlyerGrid from "../components/common/flyer/FlyerGrid";
import ListingModal from "../components/ListingModal";
import { Flyer } from "../types/flyer";
import { FlippingAd, RecentListings } from "../components/AdBanners";
import { SidebarBanner, BetweenAdsBanner, FooterBanner } from "../components/common/BannerLayouts";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";

// Dummy data for service flyers
const SERVICE_FLYERS: Flyer[] = [
  {
    id: 1,
    title: "Professional House Cleaning Services",
    description:
      "Reliable and thorough house cleaning services with experienced staff. We use eco-friendly products and offer flexible scheduling. Weekly, bi-weekly, or monthly service available.",
    images: [
      "https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/4239092/pexels-photo-4239092.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "Home Services",
    location: "Chicago & Suburbs",
    contact: {
      phone: "(312) 555-0140",
      email: "info@cleaningpro.com",
      website: "www.cleaningpro.com",
    },
  },
  {
    id: 2,
    title: "Immigration Law Services",
    description:
      "Experienced immigration attorney specializing in family-based immigration, work visas, and citizenship applications. Fluent in Hindi, Gujarati, and English.",
    images: [
      "https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/5668474/pexels-photo-5668474.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "Legal Services",
    location: "Downtown Chicago, IL",
    contact: {
      phone: "(312) 555-0141",
      email: "info@immigrationlaw.com",
      website: "www.immigrationlaw.com",
    },
  },
  {
    id: 3,
    title: "Ayurvedic Wellness & Massage Therapy",
    description:
      "Traditional Ayurvedic treatments, therapeutic massages, and wellness consultations. Certified practitioners with authentic herbs and oils imported from India.",
    images: [
      "https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3757943/pexels-photo-3757943.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3757944/pexels-photo-3757944.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "Beauty & Wellness",
    location: "Naperville, IL",
    contact: {
      phone: "(630) 555-0142",
      email: "info@ayurvedawellness.com",
      website: "www.ayurvedawellness.com",
    },
  },
  {
    id: 4,
    title: "Tax Preparation & Accounting Services",
    description:
      "Professional tax preparation, bookkeeping, and accounting services for individuals and small businesses. Experienced with Indian tax matters and FBAR filings.",
    images: [
      "https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/6863184/pexels-photo-6863184.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "Financial Services",
    location: "Aurora, IL",
    contact: {
      phone: "(630) 555-0143",
      email: "info@taxaccounting.com",
      website: "www.taxaccounting.com",
    },
  },
  {
    id: 5,
    title: "Indian Classical Music & Dance Lessons",
    description:
      "Learn Hindustani classical music, Bharatanatyam, Kathak, and other Indian dance forms. Experienced instructors, group and private lessons available.",
    images: [
      "https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1701195/pexels-photo-1701195.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "Education",
    location: "Bloomington, IL",
    contact: {
      phone: "(309) 555-0144",
      email: "info@indianarts.com",
    },
  },
  {
    id: 6,
    title: "Wedding Photography & Videography",
    description:
      "Professional wedding photography and videography services specializing in Indian weddings. Experienced with all Indian wedding traditions and ceremonies.",
    images: [
      "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1024994/pexels-photo-1024994.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1024995/pexels-photo-1024995.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "Professional Services",
    location: "Chicago Metro Area",
    contact: {
      phone: "(312) 555-0145",
      email: "info@weddingphoto.com",
      website: "www.weddingphoto.com",
    },
  },
  {
    id: 7,
    title: "IT Support & Computer Repair",
    description:
      "Professional IT support, computer repair, and technology consulting services. Home and business support, data recovery, and network setup.",
    images: [
      "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/574072/pexels-photo-574072.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "Technology",
    location: "Peoria, IL",
    contact: {
      phone: "(309) 555-0146",
      email: "info@itsupport.com",
      website: "www.itsupport.com",
    },
  },
  {
    id: 8,
    title: "Pediatric Healthcare Services",
    description:
      "Comprehensive pediatric healthcare with Indian-American doctor. Bilingual services in Hindi and English. Accepting new patients and most insurance plans.",
    images: [
      "https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/4173252/pexels-photo-4173252.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    category: "Healthcare",
    location: "Springfield, IL",
    contact: {
      phone: "(217) 555-0147",
      email: "info@pediatriccare.com",
      website: "www.pediatriccare.com",
    },
  },
];

const ServicesPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFlyer, setSelectedFlyer] = useState<Flyer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract unique categories from service flyers
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(SERVICE_FLYERS.map(flyer => flyer.category)));
    return ["all", ...uniqueCategories];
  }, []);

  // Filter service flyers based on search and category
  const filteredFlyers = useMemo(() => {
    return SERVICE_FLYERS.filter(flyer => {
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
              icon={Briefcase}
              title="Services"
              description="Find professional services from the Desi community - lawyers, accountants,
                        doctors, and more"
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
                    placeholder="Search services..."
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
                Showing {filteredFlyers.length} of {SERVICE_FLYERS.length} services
              </div>
            </div>

            {/* Services Grid */}
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

export default ServicesPage;
