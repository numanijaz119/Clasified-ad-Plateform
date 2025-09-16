import React from "react";

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

interface RecentListingsProps {
  onListingClick?: (listing: RecentListing) => void;
}

const RecentListings: React.FC<RecentListingsProps> = ({ onListingClick }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const recentListings: RecentListing[] = [
    {
      id: 1,
      title: "Senior Software Engineer - React/Node.js",
      category: "Jobs",
      price: "$95,000",
      location: "Chicago, IL",
      image:
        "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 345,
      timeAgo: "1 hour ago",
      postedDate: new Date("2025-01-12"),
      featured: true,
      description:
        "Join our innovative team building next-generation web applications. We are looking for a senior developer with 5+ years of experience in React and Node.js.",
      phone: "(312) 555-0101",
      email: "hr@techcompany.com",
    },
    {
      id: 2,
      title: "Beautiful 3BR Downtown Condo",
      category: "Real Estate",
      price: "$2,200/month",
      location: "Naperville, IL",
      image:
        "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 289,
      timeAgo: "3 hours ago",
      postedDate: new Date("2025-01-12"),
      featured: true,
      description:
        "Beautiful 3-bedroom apartment with modern amenities and city views.",
    },
    {
      id: 3,
      title: "Honda Civic 2020 - Excellent Condition",
      category: "Vehicles",
      price: "$22,500",
      location: "Aurora, IL",
      image:
        "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 234,
      timeAgo: "6 hours ago",
      postedDate: new Date("2025-01-11"),
      featured: false,
      description:
        "Well-maintained Honda Civic with low mileage. Single owner, all service records available.",
    },
    {
      id: 4,
      title: "Professional Wedding Photography Services",
      category: "Services",
      price: "$1,200",
      location: "Peoria, IL",
      image:
        "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 134,
      timeAgo: "8 hours ago",
      postedDate: new Date("2025-01-11"),
      featured: true,
      description:
        "Professional wedding photography with Indian cultural expertise. Portfolio available.",
    },
    {
      id: 5,
      title: "Math Tutoring - All Levels Available",
      category: "Education",
      price: "$40/hour",
      location: "Springfield, IL",
      image:
        "https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 89,
      timeAgo: "12 hours ago",
      postedDate: new Date("2025-01-10"),
      featured: false,
      description:
        "Experienced math tutor for students of all ages. Flexible scheduling available.",
    },
    {
      id: 6,
      title: "MacBook Pro 2021 - Like New Condition",
      category: "Buy & Sell",
      price: "$1,800",
      location: "Rockford, IL",
      image:
        "https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 156,
      timeAgo: "1 day ago",
      postedDate: new Date("2025-01-09"),
      featured: false,
      description:
        'MacBook Pro 14" with M1 Pro chip. Barely used, includes original box and accessories.',
    },
    {
      id: 7,
      title: "Indian Classical Dance Classes - Bharatanatyam",
      category: "Education",
      price: "$60/month",
      location: "Urbana-Champaign, IL",
      image:
        "https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 98,
      timeAgo: "2 days ago",
      postedDate: new Date("2025-01-08"),
      featured: false,
      description:
        "Learn Bharatanatyam from certified instructor. All ages welcome, flexible scheduling.",
    },
    {
      id: 8,
      title: "Professional House Cleaning Service",
      category: "Services",
      price: "$80/visit",
      location: "Bloomington-Normal, IL",
      image:
        "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 145,
      timeAgo: "3 days ago",
      postedDate: new Date("2025-01-07"),
      featured: false,
      description:
        "Professional house cleaning service with excellent reviews. Weekly or bi-weekly service available.",
    },
    {
      id: 9,
      title: "Yoga Instructor Position - RYT-200 Required",
      category: "Jobs",
      price: "$50/hour",
      location: "Chicago, IL",
      image:
        "https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 123,
      timeAgo: "4 days ago",
      postedDate: new Date("2025-01-06"),
      featured: false,
      description:
        "Seeking experienced yoga instructor for wellness center. RYT-200 certification required.",
    },
    {
      id: 10,
      title: "Indian Catering Services for All Events",
      category: "Services",
      price: "$15/person",
      location: "Aurora, IL",
      image:
        "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: 167,
      timeAgo: "5 days ago",
      postedDate: new Date("2025-01-05"),
      featured: false,
      description:
        "Professional catering for all occasions. Specializing in Indian cuisine and fusion dishes.",
    },
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex >= recentListings.length - 1 ? 0 : prevIndex + 1
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [recentListings.length]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <h3 className="text-sm font-semibold mb-3 text-gray-800 flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
        Recent Listings
      </h3>
      <div className="relative overflow-hidden h-48">
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
                <span className="font-semibold text-orange-600 text-sm">
                  {listing.price}
                </span>
                <span className="text-xs">{listing.timeAgo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentListings;
export type { RecentListing, RecentListingsProps };
