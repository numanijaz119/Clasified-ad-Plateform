// src/components/Categories.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Home,
  Car,
  ShoppingBag,
  Wrench,
  GraduationCap,
  Calendar,
  Heart,
  Users,
  Utensils,
  Gamepad2,
  Grid3x3,
} from "lucide-react";
import { useCategories } from "../hooks";
import CategorySkeleton from "./skeletons/CategorySkeleton";

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  briefcase: Briefcase,
  home: Home,
  car: Car,
  shopping: ShoppingBag,
  wrench: Wrench,
  education: GraduationCap,
  calendar: Calendar,
  heart: Heart,
  users: Users,
  utensils: Utensils,
  gamepad: Gamepad2,
  grid: Grid3x3,
};

// Color mapping for gradients
const colorMap: Record<string, string> = {
  jobs: "from-blue-500 to-blue-600",
  "real-estate": "from-green-500 to-green-600",
  vehicles: "from-red-500 to-red-600",
  "buy-sell": "from-purple-500 to-purple-600",
  services: "from-orange-500 to-orange-600",
  education: "from-indigo-500 to-indigo-600",
  events: "from-pink-500 to-pink-600",
  health: "from-teal-500 to-teal-600",
  community: "from-yellow-500 to-yellow-600",
  food: "from-rose-500 to-rose-600",
  entertainment: "from-violet-500 to-violet-600",
  matrimonial: "from-rose-500 to-rose-600",
  other: "from-gray-500 to-gray-600",
};

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const { categories, loading, error, refetch } = useCategories(true);

  const handleCategoryClick = (slug: string) => {
    navigate(`/category/${slug}`);
  };

  // Get icon component
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName.toLowerCase()] || Grid3x3;
    return IconComponent;
  };

  // Get color gradient
  const getColor = (slug: string) => {
    return colorMap[slug.toLowerCase()] || "from-gray-500 to-gray-600";
  };

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600 mb-4" role="alert">
              {error}
            </p>
            <button
              onClick={refetch}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              aria-label="Retry loading categories"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-16 bg-gradient-to-br from-gray-50 to-gray-100"
      aria-labelledby="categories-heading"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2
            id="categories-heading"
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Browse by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover thousands of listings across various categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <CategorySkeleton count={8} />
          ) : categories.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No categories available</p>
            </div>
          ) : (
            categories.map((category) => {
              const IconComponent = getIcon(category.icon);
              const colorGradient = getColor(category.slug);

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.slug)}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left group focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  aria-label={`View ${category.name} listings, ${category.ads_count} ads available`}
                >
                  <div
                    className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${colorGradient} mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <IconComponent
                      className="w-6 h-6 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-orange-500 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                    {category.description}
                  </p>
                  <p className="text-sm font-medium text-gray-500">
                    {category.ads_count.toLocaleString()}{" "}
                    {category.ads_count === 1 ? "ad" : "ads"}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default Categories;
