import React from 'react';
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
  Gamepad2 
} from 'lucide-react';

const Categories: React.FC = () => {
  const categories = [
    {
      id: 'jobs',
      name: 'Jobs',
      icon: Briefcase,
      count: 1247,
      color: 'from-blue-500 to-blue-600',
      description: 'Find your dream job'
    },
    {
      id: 'real-estate',
      name: 'Real Estate',
      icon: Home,
      count: 856,
      color: 'from-green-500 to-green-600',
      description: 'Homes & apartments'
    },
    {
      id: 'vehicles',
      name: 'Vehicles',
      icon: Car,
      count: 634,
      color: 'from-red-500 to-red-600',
      description: 'Cars, bikes & more'
    },
    {
      id: 'buy-sell',
      name: 'Buy & Sell',
      icon: ShoppingBag,
      count: 923,
      color: 'from-purple-500 to-purple-600',
      description: 'Electronics, furniture'
    },
    {
      id: 'services',
      name: 'Services',
      icon: Wrench,
      count: 445,
      color: 'from-orange-500 to-orange-600',
      description: 'Professional services'
    },
    {
      id: 'education',
      name: 'Education',
      icon: GraduationCap,
      count: 234,
      color: 'from-indigo-500 to-indigo-600',
      description: 'Tutoring & classes'
    },
    {
      id: 'events',
      name: 'Community Events',
      icon: Calendar,
      count: 167,
      color: 'from-pink-500 to-pink-600',
      description: 'Cultural events'
    },
    {
      id: 'health',
      name: 'Health & Wellness',
      icon: Heart,
      count: 189,
      color: 'from-teal-500 to-teal-600',
      description: 'Healthcare services'
    },
    {
      id: 'matrimonial',
      name: 'Matrimonial',
      icon: Users,
      count: 312,
      color: 'from-rose-500 to-rose-600',
      description: 'Find your partner'
    },
    {
      id: 'food',
      name: 'Food & Dining',
      icon: Utensils,
      count: 156,
      color: 'from-yellow-500 to-yellow-600',
      description: 'Restaurants & catering'
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      icon: Gamepad2,
      count: 98,
      color: 'from-cyan-500 to-cyan-600',
      description: 'Movies, games & fun'
    }
  ];

  return (
    <section className="py-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Browse Categories</h2>
        <p className="text-sm text-gray-600">Find exactly what you're looking for</p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden"
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            
            <div className="relative p-3 text-center">
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${category.color} text-white mb-2 group-hover:scale-110 transition-transform duration-300`}>
                <category.icon className="h-5 w-5" />
              </div>
              
              {/* Category Name */}
              <h3 className="text-xs font-semibold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
                {category.name}
              </h3>
              
              {/* Description */}
              <p className="text-xs text-gray-600 mb-2 hidden md:block">
                {category.description}
              </p>
              
              {/* Count */}
              <div className="flex items-center justify-center space-x-1">
                <span className="text-sm font-bold text-gray-900">{category.count.toLocaleString()}</span>
                <span className="text-xs text-gray-500">ads</span>
              </div>
              
              {/* Hover Effect Border */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${category.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
            </div>
          </div>
        ))}
      </div>

      {/* View All Categories Button */}
      <div className="text-center mt-8">
        <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 text-sm">
          View All Categories
        </button>
      </div>
    </section>
  );
};

export default Categories;