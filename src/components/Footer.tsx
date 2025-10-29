import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  Heart,
} from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { contentService } from "../services";
import type { Category, City } from "../types/content";

const Footer = () => {
  const { settings } = useSettings();
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    // Load categories and cities
    const loadData = async () => {
      try {
        const [categoriesData, citiesData] = await Promise.all([
          contentService.getCategories(),
          contentService.getCities()
        ]);
        setCategories(categoriesData.slice(0, 6)); // Top 6 categories
        // Filter for major cities and take top 6
        const majorCities = citiesData.filter(city => city.is_major);
        setCities(majorCities.slice(0, 6));
      } catch (error) {
        // Silently fail - footer will just show without dynamic data
      }
    };
    loadData();
  }, []);

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Featured Ads", path: "/featured-ads" },
    { name: "Search", path: "/search" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  ];

  const contactEmail = settings?.contact_email;
  const supportPhone = settings?.support_phone;

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">IC</span>
              </div>
              <div className="ml-3">
                <h3 className="text-xl font-bold">Illinois Connect</h3>
                <p className="text-sm text-gray-400">Indian Community Hub</p>
              </div>
            </Link>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Connecting the Indian community across Illinois. Find jobs, homes,
              services, and build meaningful connections with fellow Indians in
              your area.
            </p>

            {/* Contact Info - Only show if provided */}
            {(contactEmail || supportPhone) && (
              <div className="space-y-3">
                {contactEmail && (
                  <a 
                    href={`mailto:${contactEmail}`}
                    className="flex items-center text-gray-300 hover:text-orange-500 transition-colors"
                  >
                    <Mail className="h-5 w-5 mr-3 text-orange-500" />
                    <span>{contactEmail}</span>
                  </a>
                )}
                {supportPhone && (
                  <a 
                    href={`tel:${supportPhone}`}
                    className="flex items-center text-gray-300 hover:text-orange-500 transition-colors"
                  >
                    <Phone className="h-5 w-5 mr-3 text-orange-500" />
                    <span>{supportPhone}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-orange-500 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-3">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      to={`/category/${category.slug}`}
                      className="text-gray-300 hover:text-orange-500 transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 text-sm">Loading...</li>
              )}
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Popular Cities</h4>
            <ul className="space-y-3">
              {cities.length > 0 ? (
                cities.map((city) => (
                  <li key={city.id}>
                    <Link
                      to={`/city/${city.slug}`}
                      className="text-gray-300 hover:text-orange-500 transition-colors"
                    >
                      {city.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 text-sm">Loading...</li>
              )}
            </ul>
          </div>
        </div>

        {/* Social Media & Contact */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            {/* Social Media */}
            <div className="flex items-center space-x-6 mb-6 lg:mb-0">
              <span className="text-gray-300 font-medium">Follow Us:</span>
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-gray-400 hover:text-orange-500 transition-colors transform hover:scale-110"
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>

            {/* Contact Email Button - Only show if email is provided */}
            {contactEmail && (
              <div className="flex items-center">
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold"
                >
                  <Mail className="h-5 w-5" />
                  <span>Contact Us</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} DesiLogInIL.com. All rights reserved.
          </div>
          <div className="flex items-center text-gray-400 text-sm">
            <span>Made with</span>
            <Heart className="h-4 w-4 mx-1 text-red-500 fill-current" />
            <span>for the Desi community in Illinois</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
