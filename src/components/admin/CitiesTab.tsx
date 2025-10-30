// src/components/admin/CitiesTab.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  MapPin,
  Search,
  Filter,
  X,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "../../contexts/ToastContext";
import { adminService } from "../../services/adminService";
import { contentService } from "../../services/contentService";
import { AdminCityCreateRequest, AdminCityUpdateRequest } from "../../types/admin";
import { City, State } from "../../types/content";
import BaseModal from "../modals/BaseModal";
import ConfirmModal from "./ConfirmModal";

const CitiesTab: React.FC = () => {
  const toast = useToast();

  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [showMajorOnly, setShowMajorOnly] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(true); // Default to showing active cities
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    state: 0,
    photo: null as File | null,
    latitude: "",
    longitude: "",
    is_major: false,
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [citiesData, statesData] = await Promise.all([
        adminService.getCities(), // Get all cities (both active and inactive)
        contentService.getStates(false), // Get states from content service
      ]);
      setCities(citiesData);
      setStates(statesData);
    } catch (err) {
      toast.error("Failed to load cities data");
      console.error("Load data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await loadData();
      toast.success("Cities refreshed");
    } catch (err) {
      toast.error("Failed to refresh cities");
      console.error("Refresh error:", err);
    }
  };

  // Filter cities based on search and filters
  const filteredCities = useMemo(() => {
    return cities.filter(city => {
      // Search filter
      if (searchQuery && !city.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // State filter
      if (selectedState !== "all" && city.state_code !== selectedState) {
        return false;
      }

      // Major cities filter
      if (showMajorOnly && !city.is_major) {
        return false;
      }

      // Active/Inactive filter
      if (showActiveOnly && !city.is_active) {
        return false;
      }
      if (!showActiveOnly && city.is_active) {
        return false;
      }

      return true;
    });
  }, [cities, searchQuery, selectedState, showMajorOnly, showActiveOnly]);

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (city: City) => {
    setSelectedCity(city);
    setFormData({
      name: city.name,
      state: city.state || 0,
      photo: null, // Keep as null - existing photo will be preserved on backend
      latitude: city.latitude?.toString() || "",
      longitude: city.longitude?.toString() || "",
      is_major: city.is_major || false,
    });
    setImagePreview(city.photo || "");
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      state: 0,
      photo: null,
      latitude: "",
      longitude: "",
      is_major: false,
    });
    setImagePreview("");
    setFormErrors({});
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormErrors({ photo: "Please select a valid image file" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors({ photo: "Image size must be less than 5MB" });
      return;
    }

    setFormData(prev => ({ ...prev, photo: file }));
    setFormErrors(prev => ({ ...prev, photo: "" }));

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "City name is required";
    }

    if (!formData.state || formData.state === 0) {
      errors.state = "State is required";
    }

    if (formData.latitude && isNaN(Number(formData.latitude))) {
      errors.latitude = "Latitude must be a valid number";
    }

    if (formData.longitude && isNaN(Number(formData.longitude))) {
      errors.longitude = "Longitude must be a valid number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (showEditModal && selectedCity) {
        const updateData: AdminCityUpdateRequest = {
          name: formData.name.trim(),
          state: formData.state,
          latitude: formData.latitude ? Number(formData.latitude) : undefined,
          longitude: formData.longitude ? Number(formData.longitude) : undefined,
          is_major: formData.is_major,
          is_active: selectedCity.is_active,
        };

        if (formData.photo) {
          updateData.photo = formData.photo;
        }

        await adminService.updateCity(selectedCity.id, updateData);
        toast.success("City updated successfully");
        setShowEditModal(false);
      } else {
        const cityData: AdminCityCreateRequest = {
          name: formData.name.trim(),
          state: formData.state,
          latitude: formData.latitude ? Number(formData.latitude) : undefined,
          longitude: formData.longitude ? Number(formData.longitude) : undefined,
          is_major: formData.is_major,
          is_active: true, // Set new cities as active by default
        };

        if (formData.photo) {
          cityData.photo = formData.photo;
        }

        await adminService.createCity(cityData);
        toast.success("City created successfully");
        setShowCreateModal(false);
      }

      resetForm();
      // Reload data
      await loadData();
    } catch (err: any) {
      const errorMsg = err.message || "Failed to save city";
      if (err.message === "The fields name, state must make a unique set.") {
        toast.error("The city already exists.");
      } else {
        toast.error(errorMsg);
      }
      if (err.details) setFormErrors(err.details);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCity) return;
    try {
      await adminService.deleteCity(selectedCity.id);
      toast.success("City deleted successfully");
      setShowDeleteModal(false);
      setSelectedCity(null);
      // Reload data
      await loadData();
    } catch (err: any) {
      console.error("Delete city error:", err);
      toast.error(err.message || "Failed to delete city");
    }
  };

  const toggleCityStatus = async (city: City) => {
    try {
      const newStatus = !city.is_active;
      const updateData: AdminCityUpdateRequest = {
        is_active: newStatus,
      };
      await adminService.updateCity(city.id, updateData);

      // Reload data
      await loadData();

      toast.success(`City ${city.is_active ? "deactivated" : "activated"} successfully`);
    } catch (err: any) {
      console.error("Toggle city status error:", err);
      toast.error(err.message || "Failed to update city status");
    }
  };

  const toggleMajorStatus = async (city: City) => {
    try {
      const newMajorStatus = !city.is_major;
      const updateData: AdminCityUpdateRequest = {
        is_major: newMajorStatus,
      };
      await adminService.updateCity(city.id, updateData);

      // Reload data
      await loadData();

      toast.success(`City ${city.is_major ? "unmarked" : "marked"} as major city`);
    } catch (err: any) {
      console.error("Toggle major status error:", err);
      toast.error(err.message || "Failed to update major city status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cities Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage cities across all states in the platform
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 rounded-lg font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add City</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center justify-between w-full space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search cities..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
                />
              </div>

              <div className="flex gap-x-2">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="sm:hidden flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Options */}
          <div className={`mt-4 ${showMobileFilters ? "block" : "hidden sm:block"}`}>
            <div className="flex items-center justify-between mb-4 sm:hidden">
              <h3 className="text-sm font-medium text-gray-900">Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  value={selectedState}
                  onChange={e => setSelectedState(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All States</option>
                  {states.map(state => (
                    <option key={state.id} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showMajorOnly}
                    onChange={e => setShowMajorOnly(e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Major cities only</span>
                </label>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showActiveOnly}
                    onChange={e => setShowActiveOnly(e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {showActiveOnly ? "Show active cities" : "Show inactive cities"}
                  </span>
                </label>
              </div>

              <div className="text-sm text-gray-600">
                Showing {filteredCities.length} of {cities.length} cities
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cities List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : filteredCities.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || selectedState !== "all" || showMajorOnly
              ? "No cities match your filters"
              : "No cities found"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedState !== "all" || showMajorOnly
              ? "Try adjusting your search terms or filters"
              : "Get started by adding your first city"}
          </p>
          {!searchQuery && selectedState === "all" && !showMajorOnly && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add City</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCities.map(city => (
                  <tr key={city.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {city.photo ? (
                          <img
                            src={city.photo}
                            alt={city.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{city.name}</p>
                          {city.is_major && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Star className="h-3 w-3 mr-1" />
                              Major City
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {city.state_name} ({city.state_code})
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {city.latitude && city.longitude ? (
                        <span>
                          {Number(city.latitude).toFixed(4)}, {Number(city.longitude).toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleCityStatus(city)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                            city.is_active
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          {city.is_active ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => toggleMajorStatus(city)}
                          className={`p-2 rounded-lg transition-colors ${
                            city.is_major
                              ? "text-blue-600 hover:bg-blue-50"
                              : "text-gray-400 hover:bg-gray-50"
                          }`}
                          title={city.is_major ? "Remove major city status" : "Mark as major city"}
                        >
                          <Star className={`h-4 w-4 ${city.is_major ? "fill-current" : ""}`} />
                        </button>
                        <button
                          onClick={() => openEditModal(city)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit city"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCity(city);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete city"
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
        </div>
      )}

      {/* Create/Edit Modal */}
      <BaseModal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          resetForm();
        }}
        maxWidth="max-w-2xl"
        title={showEditModal ? "Edit City" : "Add New City"}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter city name"
                />
                {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.state}
                  onChange={e => setFormData(prev => ({ ...prev, state: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value={0}>Select a state</option>
                  {states.map(state => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
                {formErrors.state && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.state}</p>
                )}
              </div>
            </div>

            {/* City Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City Photo (Optional)
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-orange-500 transition-colors">
                    <div className="flex flex-col items-center">
                      <MapPin className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click to upload city photo</span>
                      <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </label>
                {imagePreview && (
                  <div className="flex-shrink-0">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-24 w-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
              {formErrors.photo && <p className="text-red-600 text-sm mt-1">{formErrors.photo}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={e => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 41.8781"
                />
                {formErrors.latitude && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.latitude}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={e => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., -87.6298"
                />
                {formErrors.longitude && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.longitude}</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_major"
                checked={formData.is_major}
                onChange={e => setFormData(prev => ({ ...prev, is_major: e.target.checked }))}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="is_major" className="ml-2 block text-sm text-gray-700">
                Mark as major city (appears first in lists)
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : showEditModal ? "Update City" : "Add City"}
            </button>
          </div>
        </form>
      </BaseModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCity(null);
        }}
        onConfirm={handleDelete}
        title="Delete City"
        message={`Are you sure you want to delete "${selectedCity?.name}"? This action cannot be undone and may affect existing ads in this city.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default CitiesTab;
