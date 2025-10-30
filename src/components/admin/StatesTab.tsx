import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Globe,
  MapPin,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { useToast } from "../../contexts/ToastContext";
import LoadingSpinner from "../ui/LoadingSpinner";
import Button from "../ui/Button";
import BaseModal from "../modals/BaseModal";
import ConfirmModal from "./ConfirmModal";

interface State {
  id: number;
  code: string;
  name: string;
  domain?: string;
  logo?: string;
  favicon?: string;
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
  total_ads?: number;
  active_ads?: number;
  users_count?: number;
}

interface StateFormData {
  code: string;
  name: string;
  domain: string;
  logo?: File | null;
  favicon?: File | null;
  meta_title: string;
  meta_description: string;
  is_active: boolean;
}

const StatesTab: React.FC = () => {
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingState, setEditingState] = useState<State | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<State | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState<StateFormData>({
    code: "",
    name: "",
    domain: "",
    logo: null,
    favicon: null,
    meta_title: "",
    meta_description: "",
    is_active: true,
  });

  const [logoPreview, setLogoPreview] = useState<string>("");
  const [faviconPreview, setFaviconPreview] = useState<string>("");
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      setLoading(true);
      const data = await adminService.getStates();
      setStates(data.results || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load states");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await loadStates();
      toast.success("States refreshed");
    } catch (error: any) {
      toast.error("Failed to refresh states");
    }
  };

  const filteredStates = useMemo(() => {
    return states.filter(state => {
      if (
        searchQuery &&
        !state.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !state.code.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (showActiveOnly && !state.is_active) {
        return false;
      }
      return true;
    });
  }, [states, searchQuery, showActiveOnly]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "favicon") => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));

      if (formErrors[field]) {
        setFormErrors(prev => ({ ...prev, [field]: false }));
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === "logo") {
          setLogoPreview(reader.result as string);
        } else {
          setFaviconPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, boolean> = {};

    if (!formData.code) errors.code = true;
    if (!formData.name) errors.name = true;
    if (!formData.domain) errors.domain = true;
    if (!formData.meta_title) errors.meta_title = true;
    if (!formData.meta_description) errors.meta_description = true;

    if (!editingState && !formData.logo && !logoPreview) {
      errors.logo = true;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const submitData = new FormData();
      submitData.append("code", formData.code.toUpperCase());
      submitData.append("name", formData.name);
      submitData.append("domain", formData.domain);
      submitData.append("meta_title", formData.meta_title);
      submitData.append("meta_description", formData.meta_description);
      submitData.append("is_active", formData.is_active.toString());

      if (formData.logo) {
        submitData.append("logo", formData.logo);
      }
      if (formData.favicon) {
        submitData.append("favicon", formData.favicon);
      }

      if (editingState) {
        await adminService.updateState(editingState.id, submitData);
        toast.success("State updated successfully!");
      } else {
        await adminService.createState(submitData);
        toast.success("State created successfully!");
      }

      resetForm();
      await loadStates();
    } catch (error: any) {
      let errorMessage = "Failed to save state";

      if (error.details?.error) {
        const err = error.details.error;
        if (err.includes("code") && err.includes("already exists")) {
          errorMessage = "A state with this code already exists";
        } else if (err.includes("domain") && err.includes("already exists")) {
          errorMessage = "A state with this domain already exists";
        } else if (err.includes("name") && err.includes("already exists")) {
          errorMessage = "A state with this name already exists";
        } else {
          errorMessage = err;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (state: State) => {
    setEditingState(state);
    setFormData({
      code: state.code,
      name: state.name,
      domain: state.domain || "",
      logo: null,
      favicon: null,
      meta_title: state.meta_title || "",
      meta_description: state.meta_description || "",
      is_active: state.is_active,
    });
    setLogoPreview(state.logo || "");
    setFaviconPreview(state.favicon || "");
    setShowModal(true);
  };

  const handleToggleActive = async (state: State) => {
    try {
      const submitData = new FormData();
      submitData.append("is_active", (!state.is_active).toString());

      await adminService.updateState(state.id, submitData);
      toast.success(`State ${!state.is_active ? "activated" : "deactivated"} successfully!`);
      await loadStates();
    } catch (error: any) {
      toast.error("Failed to toggle state status");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await adminService.deleteState(deleteConfirm.id);
      toast.success(`State '${deleteConfirm.name}' deleted successfully!`);
      setDeleteConfirm(null);
      await loadStates();
    } catch (error: any) {
      let errorMessage = "Failed to delete state";

      if (error.details?.error) {
        errorMessage = error.details.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (errorMessage.includes("foreign key") || errorMessage.includes("constraint")) {
        errorMessage = "Cannot delete state because it has associated data (cities, ads, etc.)";
      }

      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      domain: "",
      logo: null,
      favicon: null,
      meta_title: "",
      meta_description: "",
      is_active: true,
    });
    setLogoPreview("");
    setFaviconPreview("");
    setFormErrors({});
    setEditingState(null);
    setShowModal(false);
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
          <h2 className="text-2xl font-bold text-gray-900">States Management</h2>
          <p className="text-gray-600 mt-1">Manage states and their configurations</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Button onClick={() => setShowModal(true)} variant="primary">
            <Plus className="w-4 h-4" />
            <span>Add State</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search states..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="activeOnly"
              checked={showActiveOnly}
              onChange={e => setShowActiveOnly(e.target.checked)}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="activeOnly" className="text-sm text-gray-700">
              Active only
            </label>
          </div>
        </div>
      </div>

      {/* States Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  State
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stats
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
              {filteredStates.map(state => (
                <tr key={state.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {state.logo && (
                        <img
                          src={state.logo}
                          alt={state.name}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 mr-4"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{state.name}</div>
                        <div className="text-sm text-gray-500">{state.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Globe className="w-4 h-4 mr-2 text-gray-400" />
                      {state.domain}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>Total: {state.total_ads || 0}</div>
                    <div className="text-gray-500">Active: {state.active_ads || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(state)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        state.is_active
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {state.is_active ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(state)}
                      className="text-orange-600 hover:text-orange-900 mr-3"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(state)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStates.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No states found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? "Try adjusting your search" : "Get started by creating a new state"}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <BaseModal
        isOpen={showModal}
        onClose={resetForm}
        title={editingState ? "Edit State" : "Add New State"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State Code (2 letters) *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                maxLength={2}
                required
                disabled={!!editingState}
                className={`w-full px-3 py-2 border rounded-lg uppercase disabled:bg-gray-100 ${
                  formErrors.code ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="IL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-lg ${
                  formErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Illinois"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain *</label>
              <input
                type="text"
                name="domain"
                value={formData.domain}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-lg ${
                  formErrors.domain ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="desiloginil.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title *</label>
              <input
                type="text"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-lg ${
                  formErrors.meta_title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Classified Ads in Illinois"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description *
            </label>
            <textarea
              name="meta_description"
              value={formData.meta_description}
              onChange={handleInputChange}
              required
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg ${
                formErrors.meta_description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Find and post classified ads in Illinois..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo {!editingState && "*"}
                {editingState && (
                  <span className="text-gray-500 text-xs ml-1">(leave empty to keep current)</span>
                )}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleFileChange(e, "logo")}
                className={`w-full px-3 py-2 border rounded-lg ${
                  formErrors.logo ? "border-red-500" : "border-gray-300"
                }`}
              />
              {formErrors.logo && <p className="text-red-500 text-xs mt-1">Logo is required</p>}
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="mt-2 h-16 object-contain border rounded p-1"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Favicon (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleFileChange(e, "favicon")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              {faviconPreview && (
                <img
                  src={faviconPreview}
                  alt="Favicon preview"
                  className="mt-2 h-8 object-contain border rounded p-1"
                />
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Active (accepting ads)</label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={resetForm} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Saving..." : editingState ? "Update State" : "Create State"}
            </Button>
          </div>
        </form>
      </BaseModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete State"
        message={`Are you sure you want to delete ${deleteConfirm?.name}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default StatesTab;
