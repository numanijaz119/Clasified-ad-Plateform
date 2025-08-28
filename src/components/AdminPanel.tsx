import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Star, MapPin, Calendar } from 'lucide-react';

interface Ad {
  id: number;
  title: string;
  category: string;
  city: string;
  price: string;
  status: 'active' | 'pending' | 'expired';
  featured: boolean;
  views: number;
  createdAt: Date;
  expiresAt: Date;
}

const AdminPanel: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([
    {
      id: 1,
      title: 'Software Engineer Position',
      category: 'Jobs',
      city: 'Chicago',
      price: '$95,000',
      status: 'active',
      featured: true,
      views: 345,
      createdAt: new Date('2025-01-10'),
      expiresAt: new Date('2025-02-10')
    },
    {
      id: 2,
      title: '3BR Downtown Apartment',
      category: 'Real Estate',
      city: 'Naperville',
      price: '$2,200/month',
      status: 'active',
      featured: false,
      views: 289,
      createdAt: new Date('2025-01-11'),
      expiresAt: new Date('2025-02-11')
    },
    {
      id: 3,
      title: 'Honda Civic 2020',
      category: 'Vehicles',
      city: 'Aurora',
      price: '$22,500',
      status: 'pending',
      featured: false,
      views: 156,
      createdAt: new Date('2025-01-12'),
      expiresAt: new Date('2025-02-12')
    }
  ]);

  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const cities = ['all', 'Chicago', 'Aurora', 'Naperville', 'Bloomington-Normal', 'Peoria', 'Springfield', 'Urbana-Champaign', 'Rockford'];
  const statuses = ['all', 'active', 'pending', 'expired'];

  const filteredAds = ads.filter(ad => {
    const matchesCity = selectedCity === 'all' || ad.city === selectedCity;
    const matchesStatus = selectedStatus === 'all' || ad.status === selectedStatus;
    return matchesCity && matchesStatus;
  });

  const toggleFeatured = (id: number) => {
    setAds(ads.map(ad => 
      ad.id === id ? { ...ad, featured: !ad.featured } : ad
    ));
  };

  const updateStatus = (id: number, status: 'active' | 'pending' | 'expired') => {
    setAds(ads.map(ad => 
      ad.id === id ? { ...ad, status } : ad
    ));
  };

  const deleteAd = (id: number) => {
    if (confirm('Are you sure you want to delete this ad?')) {
      setAds(ads.filter(ad => ad.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ad Management</h1>
          <p className="text-gray-600">Manage all advertisements across cities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Ads</p>
                <p className="text-2xl font-bold text-gray-900">{ads.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Ads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ads.filter(ad => ad.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-orange-600 fill-current" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Featured Ads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ads.filter(ad => ad.featured).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cities</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(ads.map(ad => ad.city)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  {cities.map(city => (
                    <option key={city} value={city}>
                      {city === 'all' ? 'All Cities' : city}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center space-x-2 font-semibold">
              <Plus className="h-4 w-4" />
              <span>Add New Ad</span>
            </button>
          </div>
        </div>

        {/* Ads Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ad Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location & Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAds.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {ad.featured && (
                          <Star className="h-4 w-4 text-orange-500 fill-current mr-2" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {ad.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ad.city}</div>
                      <div className="text-sm text-gray-500">{ad.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ad.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ad.status)}`}>
                        {ad.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Eye className="h-4 w-4 mr-1" />
                        {ad.views} views
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleFeatured(ad.id)}
                          className={`p-1 rounded ${ad.featured ? 'text-orange-500' : 'text-gray-400'} hover:text-orange-600`}
                          title={ad.featured ? 'Remove from featured' : 'Make featured'}
                        >
                          <Star className={`h-4 w-4 ${ad.featured ? 'fill-current' : ''}`} />
                        </button>
                        
                        <select
                          value={ad.status}
                          onChange={(e) => updateStatus(ad.id, e.target.value as 'active' | 'pending' | 'expired')}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="expired">Expired</option>
                        </select>
                        
                        <button className="text-blue-600 hover:text-blue-900" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button 
                          onClick={() => deleteAd(ad.id)}
                          className="text-red-600 hover:text-red-900" 
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAds.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Eye className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No ads found</h3>
              <p className="text-gray-600">Try adjusting your filters or add a new ad.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;