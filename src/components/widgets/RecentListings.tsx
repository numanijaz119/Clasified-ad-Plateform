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
    // ... rest of your listings data
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
