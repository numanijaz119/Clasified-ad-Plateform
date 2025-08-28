import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, MapPin, User, Plus, Cloud, Home, Briefcase, Car, ShoppingBag, Wrench, GraduationCap, Calendar, Heart, TrendingUp } from 'lucide-react';
import SignInModal from './SignInModal';

interface HeaderProps {
  onPostAd: () => void;
  onSignIn: () => void;
  isLoggedIn: boolean;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ onPostAd, onSignIn, isLoggedIn, onSignOut }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationPages = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Jobs', path: '/category/Jobs', icon: Briefcase },
    { name: 'Real Estate', path: '/category/Real Estate', icon: Home },
    { name: 'Vehicles', path: '/category/Vehicles', icon: Car },
    { name: 'Buy & Sell', path: '/category/Buy & Sell', icon: ShoppingBag },
    { name: 'Services', path: '/category/Services', icon: Wrench },
    { name: 'Education', path: '/category/Education', icon: GraduationCap },
    { name: 'Events', path: '/category/Community Events', icon: Calendar },
    { name: 'Health', path: '/category/Health & Wellness', icon: Heart }
  ];

  return (
    <header className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <div className="flex-shrink-0 flex items-center">
                <img
                  src="/DesiloginILlogo.png"
                  className="h-24 w-auto object-contain hover:opacity-90 transition-opacity"
                  onError={(e) => {
                    console.log('Logo failed to load, falling back to text logo');
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3" style={{display: 'none'}}>
                  <span className="text-white font-bold text-3xl">DL</span>
                </div>
              </div>
            </Link>
          </div>


          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Weather Widget - Desktop */}
            <div className="flex items-center space-x-3 min-w-[400px]">
              <WeatherWidget />
              <ScrollingWidgets />
            </div>
            <button
              onClick={onPostAd}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2.5 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center space-x-2 font-semibold text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Post Ad</span>
            </button>
            <button
              onClick={isLoggedIn ? onSignOut : onSignIn}
              className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors"
            >
              <User className="h-5 w-5" />
              <span className="text-sm">{isLoggedIn ? 'Sign Out' : 'Sign In'}</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-orange-500 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>


        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-3">
            {/* Mobile Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={onPostAd}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2.5 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Post Ad</span>
              </button>
              <button
                onClick={isLoggedIn ? onSignOut : onSignIn}
                className="w-full flex items-center justify-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors py-2"
              >
                <User className="h-5 w-5" />
                <span className="text-sm">{isLoggedIn ? 'Sign Out' : 'Sign In'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

// Weather Widget Component
const WeatherWidget: React.FC = () => {
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  
  const cities = [
    { name: 'Chicago', temp: '32°F', condition: 'Partly Cloudy' },
    { name: 'Aurora', temp: '30°F', condition: 'Cloudy' },
    { name: 'Naperville', temp: '33°F', condition: 'Clear' },
    { name: 'Bloomington-Normal', temp: '29°F', condition: 'Snow' },
    { name: 'Peoria', temp: '31°F', condition: 'Overcast' },
    { name: 'Springfield', temp: '28°F', condition: 'Windy' },
    { name: 'Urbana-Champaign', temp: '27°F', condition: 'Foggy' },
    { name: 'Rockford', temp: '25°F', condition: 'Cold' }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCityIndex((prevIndex) => 
        prevIndex >= cities.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [cities.length]);

  const currentCity = cities[currentCityIndex];

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg min-w-[140px]">
      <div className="flex items-center">
        <Cloud className="h-4 w-4 mr-2" />
        <div className="text-xs">
          <div className="font-semibold">{currentCity.name}</div>
          <div className="text-xs opacity-90">{currentCity.temp}</div>
        </div>
      </div>
    </div>
  );
};

// Scrolling Widgets Component
const ScrollingWidgets: React.FC = () => {
  const [currentDealIndex, setCurrentDealIndex] = useState(0);

  const deals = [
    {
      title: "50% OFF Electronics",
      subtitle: "Limited time offer",
      color: "from-blue-500 to-blue-600",
      discount: "50%"
    },
    {
      title: "Free Delivery on Orders $50+",
      subtitle: "No minimum required",
      color: "from-green-500 to-green-600",
      discount: "FREE"
    },
    {
      title: "Buy 2 Get 1 Free",
      subtitle: "On selected items",
      color: "from-purple-500 to-purple-600",
      discount: "B2G1"
    },
    {
      title: "30% OFF Services",
      subtitle: "Professional services",
      color: "from-pink-500 to-pink-600",
      discount: "30%"
    },
    {
      title: "Flash Sale - 70% OFF",
      subtitle: "Today only",
      color: "from-red-500 to-red-600",
      discount: "70%"
    },
    {
      title: "Student Discount 25%",
      subtitle: "Valid student ID required",
      color: "from-indigo-500 to-indigo-600",
      discount: "25%"
    }
  ];

  // Deal cycling
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDealIndex((prevIndex) => (prevIndex + 1) % deals.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [deals.length]);

  const currentDeal = deals[currentDealIndex];

  return (
    <div className="relative bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg min-w-[200px] cursor-pointer hover:opacity-90 transition-all duration-300 overflow-hidden">
      {/* Illumination Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse"></div>
      
      {/* NEW Badge - Slanted Left */}
      <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs font-bold px-3 py-1 transform -rotate-12 shadow-lg">
        NEW
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="text-xs">
            <div className="font-bold text-sm">Deals & Coupons</div>
            <div className="text-xs opacity-90">{currentDeal.subtitle}</div>
          </div>
          <div className="bg-white/20 text-white font-bold text-xs px-2 py-1 rounded-full">
            {currentDeal.discount}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;