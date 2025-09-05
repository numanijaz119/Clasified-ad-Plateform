import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Eye, 
  Check, 
  X, 
  Star,
  Calendar,
  TrendingUp,
  MapPin,
  Edit,
  Trash2,
  Plus,
  Filter,
  Download,
  Search,
  User,
  Image,
  Upload,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';

interface PendingPost {
  id: number;
  title: string;
  category: string;
  city: string;
  price: string;
  description: string;
  submittedBy: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  images: string[];
  contactInfo: {
    phone: string;
    email: string;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinedAt: Date;
  totalAds: number;
  status: 'active' | 'suspended' | 'banned';
  lastLogin: Date;
}

interface Category {
  id: number;
  name: string;
  subcategories: string[];
  totalAds: number;
  isActive: boolean;
}

interface EarningsData {
  month: string;
  revenue: number;
  featuredAds: number;
  avgPrice: number;
}

interface BannerAd {
  id: number;
  title: string;
  imageUrl: string;
  targetUrl: string;
  position: 'top' | 'side' | 'bottom' | 'inline' | 'mobile';
  size: string;
  isActive: boolean;
  clicks: number;
  impressions: number;
  startDate: Date;
  endDate: Date;
  advertiser: string;
  price: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'users' | 'categories' | 'earnings' | 'analytics' | 'banners'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock data for pending posts
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([
    {
      id: 1,
      title: 'Software Engineer Position at Tech Startup',
      category: 'Jobs',
      city: 'Chicago',
      price: '$85,000 - $110,000',
      description: 'We are looking for a passionate software engineer to join our growing team...',
      submittedBy: 'Raj Patel',
      submittedAt: new Date('2025-01-12T10:30:00'),
      status: 'pending',
      images: ['https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400'],
      contactInfo: {
        phone: '(312) 555-0123',
        email: 'raj.patel@email.com'
      }
    },
    {
      id: 2,
      title: '2BR Apartment for Rent - Downtown',
      category: 'Real Estate',
      city: 'Naperville',
      price: '$1,800/month',
      description: 'Beautiful 2-bedroom apartment in the heart of downtown...',
      submittedBy: 'Priya Sharma',
      submittedAt: new Date('2025-01-12T09:15:00'),
      status: 'pending',
      images: ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400'],
      contactInfo: {
        phone: '(630) 555-0124',
        email: 'priya.sharma@email.com'
      }
    },
    {
      id: 3,
      title: 'Honda Civic 2019 - Low Mileage',
      category: 'Vehicles',
      city: 'Aurora',
      price: '$19,500',
      description: 'Well-maintained Honda Civic with only 35k miles...',
      submittedBy: 'Amit Kumar',
      submittedAt: new Date('2025-01-11T16:45:00'),
      status: 'pending',
      images: ['https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400'],
      contactInfo: {
        phone: '(630) 555-0125',
        email: 'amit.kumar@email.com'
      }
    }
  ]);

  // Mock data for banner ads
  const [bannerAds, setBannerAds] = useState<BannerAd[]>([
    {
      id: 1,
      title: 'Tech Startup Hiring',
      imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
      targetUrl: 'https://example.com/jobs',
      position: 'top',
      size: '728x90',
      isActive: true,
      clicks: 1250,
      impressions: 45000,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-03-31'),
      advertiser: 'TechCorp Inc.',
      price: 299
    },
    {
      id: 2,
      title: 'Real Estate Deals',
      imageUrl: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
      targetUrl: 'https://example.com/realestate',
      position: 'side',
      size: '300x250',
      isActive: true,
      clicks: 890,
      impressions: 32000,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-04-15'),
      advertiser: 'Prime Properties',
      price: 199
    },
    {
      id: 3,
      title: 'Car Dealership Promo',
      imageUrl: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400',
      targetUrl: 'https://example.com/cars',
      position: 'bottom',
      size: '728x90',
      isActive: false,
      clicks: 567,
      impressions: 28000,
      startDate: new Date('2024-12-01'),
      endDate: new Date('2025-02-28'),
      advertiser: 'AutoMax Motors',
      price: 249
    }
  ]);

  // Mock data for users
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'Raj Patel',
      email: 'raj.patel@email.com',
      phone: '(312) 555-0123',
      joinedAt: new Date('2024-11-15'),
      totalAds: 12,
      status: 'active',
      lastLogin: new Date('2025-01-12T08:30:00')
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '(630) 555-0124',
      joinedAt: new Date('2024-12-01'),
      totalAds: 8,
      status: 'active',
      lastLogin: new Date('2025-01-11T14:20:00')
    },
    {
      id: 3,
      name: 'Amit Kumar',
      email: 'amit.kumar@email.com',
      phone: '(630) 555-0125',
      joinedAt: new Date('2024-10-20'),
      totalAds: 15,
      status: 'suspended',
      lastLogin: new Date('2025-01-10T11:45:00')
    }
  ]);

  // Mock data for categories
  const [categories, setCategories] = useState<Category[]>([
    {
      id: 1,
      name: 'Jobs',
      subcategories: ['Software Engineering', 'Healthcare', 'Finance', 'Education', 'Sales'],
      totalAds: 1247,
      isActive: true
    },
    {
      id: 2,
      name: 'Real Estate',
      subcategories: ['Apartments', 'Houses', 'Commercial', 'Land'],
      totalAds: 856,
      isActive: true
    },
    {
      id: 3,
      name: 'Vehicles',
      subcategories: ['Cars', 'Motorcycles', 'Trucks', 'Parts'],
      totalAds: 634,
      isActive: true
    },
    {
      id: 4,
      name: 'Services',
      subcategories: ['Home Services', 'Professional', 'Beauty', 'Repair'],
      totalAds: 445,
      isActive: true
    }
  ]);

  // Mock earnings data
  const earningsData: EarningsData[] = [
    { month: 'Jan 2025', revenue: 2450, featuredAds: 245, avgPrice: 10 },
    { month: 'Dec 2024', revenue: 2180, featuredAds: 218, avgPrice: 10 },
    { month: 'Nov 2024', revenue: 1950, featuredAds: 195, avgPrice: 10 },
    { month: 'Oct 2024', revenue: 2340, featuredAds: 234, avgPrice: 10 },
    { month: 'Sep 2024', revenue: 2100, featuredAds: 210, avgPrice: 10 },
    { month: 'Aug 2024', revenue: 1890, featuredAds: 189, avgPrice: 10 }
  ];

  const handlePostAction = (postId: number, action: 'approve' | 'reject') => {
    setPendingPosts(posts => 
      posts.map(post => 
        post.id === postId 
          ? { ...post, status: action === 'approve' ? 'approved' : 'rejected' }
          : post
      )
    );
  };

  const handleUserStatusChange = (userId: number, status: 'active' | 'suspended' | 'banned') => {
    setUsers(users => 
      users.map(user => 
        user.id === userId ? { ...user, status } : user
      )
    );
  };

  const toggleCategoryStatus = (categoryId: number) => {
    setCategories(categories => 
      categories.map(category => 
        category.id === categoryId 
          ? { ...category, isActive: !category.isActive }
          : category
      )
    );
  };

  const toggleBannerStatus = (bannerId: number) => {
    setBannerAds(banners => 
      banners.map(banner => 
        banner.id === bannerId 
          ? { ...banner, isActive: !banner.isActive }
          : banner
      )
    );
  };

  const deleteBanner = (bannerId: number) => {
    if (window.confirm('Are you sure you want to delete this banner ad?')) {
      setBannerAds(banners => banners.filter(banner => banner.id !== bannerId));
    }
  };

  const renderBannerAdsManagement = () => (
    <div className="space-y-6">
      {/* Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Image className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Banners</p>
              <p className="text-2xl font-bold text-gray-900">{bannerAds.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Monitor className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Banners</p>
              <p className="text-2xl font-bold text-gray-900">
                {bannerAds.filter(banner => banner.isActive).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">
                {bannerAds.reduce((sum, banner) => sum + banner.clicks, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${bannerAds.reduce((sum, banner) => sum + banner.price, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Banner Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Banner Advertisements</h3>
        <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center space-x-2 text-sm">
          <Upload className="h-4 w-4" />
          <span>Upload New Banner</span>
        </button>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {bannerAds.map((banner) => (
          <div key={banner.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Banner Image */}
            <div className="relative">
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-32 object-cover"
              />
              <div className="absolute top-2 left-2 flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  banner.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {banner.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                  {banner.position === 'top' && <Monitor className="h-3 w-3" />}
                  {banner.position === 'side' && <Tablet className="h-3 w-3" />}
                  {banner.position === 'bottom' && <Monitor className="h-3 w-3" />}
                  {banner.position === 'mobile' && <Smartphone className="h-3 w-3" />}
                  <span className="capitalize">{banner.position}</span>
                </span>
              </div>
            </div>

            {/* Banner Details */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">{banner.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{banner.advertiser}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Size: {banner.size}</span>
                    <span>${banner.price}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleBannerStatus(banner.id)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                      banner.isActive
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {banner.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="text-blue-600 hover:text-blue-800 p-1">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => deleteBanner(banner.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{banner.clicks.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Clicks</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{banner.impressions.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Impressions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {((banner.clicks / banner.impressions) * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">CTR</div>
                </div>
              </div>

              {/* Duration */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Start: {banner.startDate.toLocaleDateString()}</span>
                  <span>End: {banner.endDate.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const filteredPosts = pendingPosts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.submittedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || post.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = earningsData.reduce((sum, data) => sum + data.revenue, 0);
  const totalFeaturedAds = earningsData.reduce((sum, data) => sum + data.featuredAds, 0);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Posts</p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingPosts.filter(p => p.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${earningsData[0]?.revenue.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-gray-900">{earningsData[0]?.featuredAds}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Posts Requiring Review</h3>
          <div className="space-y-3">
            {pendingPosts.filter(p => p.status === 'pending').slice(0, 5).map(post => (
              <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{post.title}</h4>
                  <p className="text-xs text-gray-500">{post.category} • {post.city}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePostAction(post.id, 'approve')}
                    className="text-green-600 hover:text-green-800 p-1"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handlePostAction(post.id, 'reject')}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="space-y-3">
            {earningsData.slice(0, 6).map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{data.month}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900">${data.revenue.toLocaleString()}</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPostsReview = () => (
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
                placeholder="Search posts by title or author..."
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Post Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category & Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <img
                        src={post.images[0]}
                        alt={post.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{post.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{post.description}</p>
                        <div className="text-sm font-semibold text-orange-600 mt-1">{post.price}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{post.category}</div>
                    <div className="text-sm text-gray-500">{post.city}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{post.submittedBy}</div>
                    <div className="text-sm text-gray-500">{post.submittedAt.toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      post.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      post.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900" title="View Details">
                        <Eye className="h-4 w-4" />
                      </button>
                      {post.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handlePostAction(post.id, 'approve')}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handlePostAction(post.id, 'reject')}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUsersManagement = () => (
    <div className="space-y-6">
      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">Joined {user.joinedAt.toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.totalAds} ads posted</div>
                    <div className="text-sm text-gray-500">Last login: {user.lastLogin.toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      value={user.status}
                      onChange={(e) => handleUserStatusChange(user.id, e.target.value as 'active' | 'suspended' | 'banned')}
                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCategoriesManagement = () => (
    <div className="space-y-6">
      {/* Add Category Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Categories Management</h3>
        <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center space-x-2 text-sm">
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">{category.name}</h4>
              <div className="flex items-center space-x-2">
                <button className="text-blue-600 hover:text-blue-800">
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleCategoryStatus(category.id)}
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    category.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {category.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Subcategories:</p>
              <div className="flex flex-wrap gap-1">
                {category.subcategories.map((sub, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {sub}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <strong>{category.totalAds.toLocaleString()}</strong> total ads
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEarnings = () => (
    <div className="space-y-6">
      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue (6 months)</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Featured Ads Sold</p>
              <p className="text-2xl font-bold text-gray-900">{totalFeaturedAds}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Price</p>
              <p className="text-2xl font-bold text-gray-900">${earningsData[0]?.avgPrice}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Earnings Breakdown</h3>
          <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1 rounded-md">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Featured Ads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Price
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {earningsData.map((data, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {data.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${data.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {data.featuredAds}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${data.avgPrice}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Page Views</p>
              <p className="text-2xl font-bold text-gray-900">45,678</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">12.5%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-pink-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900">+18.2%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Overview</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p>Traffic Analytics Chart</p>
              <p className="text-sm">Integration with analytics service required</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Categories</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p>Category Performance Chart</p>
              <p className="text-sm">Shows most popular categories</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'posts', name: 'Posts Review', icon: FileText },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'categories', name: 'Categories', icon: Settings },
    { id: 'earnings', name: 'Earnings', icon: DollarSign },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'banners', name: 'Banner Ads', icon: Image }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your Illinois Connect platform</p>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'posts' && renderPostsReview()}
          {activeTab === 'users' && renderUsersManagement()}
          {activeTab === 'categories' && renderCategoriesManagement()}
          {activeTab === 'earnings' && renderEarnings()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'banners' && renderBannerAdsManagement()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;