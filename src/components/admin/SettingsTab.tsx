import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useSettings } from '../../contexts/SettingsContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import Button from '../ui/Button';

const SettingsTab: React.FC = () => {
  const toast = useToast();
  const { refreshSettings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    site_name: 'Classified Ads',
    contact_email: '',
    support_phone: '',
    allow_registration: true,
    require_email_verification: true,
    auto_approve_ads: false,
    featured_ad_price: 9.99,
    featured_ad_duration_days: 30,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSettings();
      setFormData({
        site_name: data.site_name,
        contact_email: data.contact_email,
        support_phone: data.support_phone,
        allow_registration: data.allow_registration,
        require_email_verification: data.require_email_verification,
        auto_approve_ads: data.auto_approve_ads,
        featured_ad_price: data.featured_ad_price,
        featured_ad_duration_days: data.featured_ad_duration_days,
      });
    } catch (error: any) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminService.updateSettings(formData);
      await refreshSettings(); // Refresh global settings
      toast.success('Settings updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex space-x-3">

          <button
            onClick={loadSettings}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
          <Button onClick={handleSave} variant="primary" disabled={saving}>
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>
      </div>

      {/* Site Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <SettingsIcon className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Site Information</h3>
            <p className="text-sm text-gray-600">Basic site configuration and contact details</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Name
            </label>
            <input
              type="text"
              name="site_name"
              value={formData.site_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Classified Ads"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="contact@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Phone
              </label>
              <input
                type="tel"
                name="support_phone"
                value={formData.support_phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Registration Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Registration Settings</h3>
            <p className="text-sm text-gray-600">Control user registration and verification</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Allow New Registrations</p>
              <p className="text-sm text-gray-600">Enable or disable new user sign-ups</p>
            </div>
            <input
              type="checkbox"
              name="allow_registration"
              checked={formData.allow_registration}
              onChange={handleChange}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
          </div>

          {/* <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Require Email Verification</p>
              <p className="text-sm text-gray-600">Force users to verify email before accessing features</p>
            </div>
            <input
              type="checkbox"
              name="require_email_verification"
              checked={formData.require_email_verification}
              onChange={handleChange}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
          </div> */}
        </div>

        {!formData.allow_registration && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Registration Disabled</p>
                <p className="text-sm text-yellow-700 mt-1">
                  New users cannot create accounts. The sign-up option is hidden from the login form.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ad Management Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <SettingsIcon className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ad Management</h3>
            <p className="text-sm text-gray-600">Configure ad approval and featured ad settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Auto-Approve Ads</p>
              <p className="text-sm text-gray-600">Automatically approve new ads without manual review</p>
            </div>
            <input
              type="checkbox"
              name="auto_approve_ads"
              checked={formData.auto_approve_ads}
              onChange={handleChange}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Ad Price ($)
              </label>
              <input
                type="number"
                name="featured_ad_price"
                value={formData.featured_ad_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Ad Duration (days)
              </label>
              <input
                type="number"
                name="featured_ad_duration_days"
                value={formData.featured_ad_duration_days}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Current Status Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Current Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Registration:</span>
            <span className={`ml-2 font-medium ${formData.allow_registration ? 'text-green-600' : 'text-red-600'}`}>
              {formData.allow_registration ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>
          <div>
            <span className="text-blue-700">Auto-Approve:</span>
            <span className={`ml-2 font-medium ${formData.auto_approve_ads ? 'text-green-600' : 'text-gray-600'}`}>
              {formData.auto_approve_ads ? 'ON' : 'OFF'}
            </span>
          </div>
          <div>
            <span className="text-blue-700">Featured Price:</span>
            <span className="ml-2 font-medium text-gray-900">
              ${formData.featured_ad_price}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
