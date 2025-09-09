import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, Plus } from 'lucide-react';

interface HeaderProps {
  onPostAd: () => void;
  onSignIn: () => void;
  isLoggedIn: boolean;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ onPostAd, onSignIn, isLoggedIn, onSignOut }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
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

          {/* Global Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for jobs, homes, cars, services..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1.5 rounded-md hover:from-orange-600 hover:to-red-600 transition-all duration-200 text-sm font-medium"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
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

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search listings..."
                className="w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1.5 rounded-md hover:from-orange-600 hover:to-red-600 transition-all duration-200 text-xs font-medium"
              >
                Search
              </button>
            </div>
          </form>
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

export default Header;