import React, { useState } from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Star, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  Plus,
  Search,
  Filter,
  BarChart3,
  Clock,
  DollarSign,
  Users,
  MessageCircle
} from 'lucide-react';

interface UserAd {
  id: number;
  title: string;
  category: string;
  price: string;
  location: string;
  image: string;
  views: number;
  inquiries: number;
  timeAgo: string;
  postedDate: Date;
  expiresAt: Date;
  featured: boolean;
  status: 'active' | 'pending' | 'expired' | 'rejected';
  description: string;
  phone?: string;
  email?: string;
}

const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ads' | 'stats' | 'promote'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock user ads data
  const [userAds, setUserAds] = useState<UserAd[]>([
    {
      id: 1,
      title: 'Software Engineer Position - Full Stack Developer',
      category: 'Jobs',
      price: '$95,000',
      location: 'Chicago, IL',
      image: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 345,
      inquiries: 12,
      timeAgo: '2 hours ago',
      postedDate: new Date('2025-01-12'),
      expiresAt: new Date('2025-02-12'),
      featured: true,
      status: 'active',
      description: 'Join our dynamic team as a Full Stack Developer. React, Node.js experience required.',
      phone: '(312) 555-0101',
      email: 'hr@techcompany.com'
    },
    {
      id: 2,
      title: '3BR Luxury Apartment in Downtown',
      category: 'Real Estate',
      price: '$2,800/month',
      location: 'Naperville, IL',
      image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 189,
      inquiries: 8,
      timeAgo: '4 hours ago',
      postedDate: new Date('2025-01-12'),
      expiresAt: new Date('2025-02-12'),
      featured: false,
      status: 'active',
      description: 'Beautiful 3-bedroom apartment with modern amenities and city views.'
    },
    {
      id: 3,
      title: '2018 Honda Accord - Excellent Condition',
      category: 'Vehicles',
      price: '$18,500',
      location: 'Aurora, IL',
      image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 156,
      inquiries: 5,
      timeAgo: '6 hours ago',
      postedDate: new Date('2025-01-11'),
      expiresAt: new Date('2025-02-11'),
      featured: false,
      status: 'pending',
      description: 'Well-maintained Honda Accord with low mileage. Single owner.'
    },
    {
      id: 4,
      title: 'Wedding Photography Services',
      category: 'Services',
      price: 'Starting $1,200',
      location: 'Peoria, IL',
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 134,
      inquiries: 15,
      timeAgo: '12 hours ago',
      postedDate: new Date('2025-01-10'),
      expiresAt: new Date('2025-01-25'),
      featured: true,
      status: 'active',
      description: 'Professional wedding photography with Indian cultural expertise.'
    },
    {
      id: 5,
      title: 'MacBook Pro 2021 - Like New',
      category: 'Buy & Sell',
      price: '$1,800',
      location: 'Springfield, IL',
      image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: 267,
      inquiries: 3,
      timeAgo: '1 day ago',
      postedDate: new Date('2025-01-09'),
      expiresAt: new Date('2025-02-08'),
      featured: false,
      status: 'expired',
      description: 'MacBook Pro 14" with M1 Pro chip. Barely used, includes original box.'
    }
  ]);

  const categories = [
    'all', 'Jobs', 'Real Estate', 'Vehicles', 'Buy & Sell', 'Services', 
    'Education', 'Community Events', 'Health & Wellness'
  ];

  const filteredAds = userAds.filter(ad => {
    const matchesSearch = searchQuery === '' || 
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || ad.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || ad.category === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDeleteAd = (adId: number) => {
    if (confirm('Are you sure you want to delete this ad?')) {
      setUserAds(ads => ads.filter(ad => ad.id !== adId));
    }
  };

  const handlePromoteAd = (adId: number) => {
    setUserAds(ads => 
      ads.map(ad => 
        ad.id === adId ? { ...ad, featured: true } : ad
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalViews = userAds.reduce((sum, ad) => sum + ad.views, 0);
  const totalInquiries = userAds.reduce((sum, ad) => sum + ad.inquiries, 0);
  const activeAds = userAds.filter(ad => ad.status === 'active').length;
  const featuredAds = userAds.filter(ad => ad.featured).length;

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Ads</p>
              <p className="text-2xl font-bold text-gray-900">{userAds.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">{totalInquiries}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Featured Ads</p>
              <p className="text-2xl font-bold text-gray-900">{featuredAds}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Ads</h3>
          <div className="space-y-3">
            {userAds
              .sort((a, b) => b.views - a.views)
              .slice(0, 5)
              .map(ad => (
                <div key={ad.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{ad.title}</h4>
                    <p className="text-xs text-gray-500">{ad.category} • {ad.location}</p>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{ad.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{ad.inquiries}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {userAds
              .sort((a, b) => b.postedDate.getTime() - a.postedDate.getTime())
              .slice(0, 5)
              .map(ad => (
                <div key={ad.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{ad.title}</h4>
                    <p className="text-xs text-gray-500">Posted {ad.timeAgo}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ad.status)}`}>
                    {ad.status}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdsManagement = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your ads..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
              />
            </div>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAds.map((ad) => (
          <div key={ad.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Image */}
            <div className="relative">
              <img
                src={ad.image}
                alt={ad.title}
                className="w-full h-48 object-cover"
              />
              {ad.featured && (
                <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-current" />
                  <span>Featured</span>
                </div>
              )}
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(ad.status)}`}>
                {ad.status}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                {ad.title}
              </h3>
              
              <div className="text-lg font-bold text-orange-600 mb-2">
                {ad.price}
              </div>
              
              <div className="flex items-center text-xs text-gray-500 mb-3">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{ad.location}</span>
                <span className="mx-2">•</span>
                <span>{ad.category}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{ad.views} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{ad.inquiries} inquiries</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{ad.timeAgo}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 p-1" title="Edit">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteAd(ad.id)}
                    className="text-red-600 hover:text-red-800 p-1" 
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {!ad.featured && ad.status === 'active' && (
                  <button
                    onClick={() => handlePromoteAd(ad.id)}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded text-xs font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                  >
                    Promote
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredAds.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <BarChart3 className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No ads found</h3>
            <p className="text-gray-600">Try adjusting your filters or create a new ad.</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Views</h3>
            <Eye className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{totalViews.toLocaleString()}</div>
          <div className="flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>+12% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Inquiries</h3>
            <MessageCircle className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{totalInquiries}</div>
          <div className="flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>+8% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
            <BarChart3 className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) : 0}%
          </div>
          <div className="flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>+2.1% from last month</span>
          </div>
        </div>
      </div>

      {/* Detailed Stats Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Ad Performance Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ad Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inquiries
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userAds.map((ad) => (
                <tr key={ad.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={ad.image}
                        alt={ad.title}
                        className="w-10 h-10 object-cover rounded-lg mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">{ad.title}</div>
                        <div className="text-sm text-gray-500">{ad.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ad.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ad.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ad.inquiries}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ad.views > 0 ? ((ad.inquiries / ad.views) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ad.status)}`}>
                      {ad.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPromote = () => (
    <div className="space-y-6">
      {/* Promotion Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Featured Ad</h3>
            <Star className="h-6 w-6 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-orange-600 mb-4">$9.99</div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              60 days duration
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Featured badge & priority placement
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              3x more visibility
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Detailed analytics
            </li>
          </ul>
          <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200">
            Promote Ad
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Premium Boost</h3>
            <TrendingUp className="h-6 w-6 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-4">$19.99</div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              90 days duration
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Top placement in search results
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              5x more visibility
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Priority customer support
            </li>
          </ul>
          <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200">
            Premium Boost
          </button>
        </div>
      </div>

      {/* Eligible Ads */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Ads Eligible for Promotion</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userAds
              .filter(ad => !ad.featured && ad.status === 'active')
              .map((ad) => (
                <div key={ad.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src={ad.image}
                      alt={ad.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{ad.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{ad.category} • {ad.location}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-gray-500">
                          {ad.views} views • {ad.inquiries} inquiries
                        </div>
                        <button
                          onClick={() => handlePromoteAd(ad.id)}
                          className="bg-orange-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-orange-600 transition-colors"
                        >
                          Promote
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          
          {userAds.filter(ad => !ad.featured && ad.status === 'active').length === 0 && (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No ads eligible for promotion</h3>
              <p className="text-gray-600">All your active ads are already featured or you don't have any active ads.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'ads', name: 'My Ads', icon: Edit },
    { id: 'stats', name: 'Statistics', icon: TrendingUp },
    { id: 'promote', name: 'Promote Ads', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Manage your ads and track performance</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'ads' && renderAdsManagement()}
          {activeTab === 'stats' && renderStats()}
          {activeTab === 'promote' && renderPromote()}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;