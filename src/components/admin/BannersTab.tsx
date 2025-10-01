// src/components/admin/BannersTab.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  ExternalLink,
  TrendingUp,
  RefreshCw,
  Image as ImageIcon,
  MapPin,
  BarChart3,
  Tag,
  Filter,
  Search,
  X,
} from "lucide-react";
import { useToast } from "../../contexts/ToastContext";
import { adminService } from "../../services/adminService";
import { contentService } from "../../services/contentService";
import {
  AdminBanner,
  AdminBannerListParams,
  BannerPosition,
  BannerType,
  AdminBannerCreateRequest,
  AdminBannerUpdateRequest,
  AdminBannerAnalytics,
} from "../../types/admin";
import { State, Category } from "../../types/content";
import BaseModal from "../modals/BaseModal";
import ConfirmModal from "./ConfirmModal";

const BannersTab: React.FC = () => {
  const toast = useToast();

  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });

  const [filters, setFilters] = useState<AdminBannerListParams>({
    page: 1,
    page_size: 20,
    is_active: undefined,
    position: undefined,
    banner_type: undefined,
    ordering: "-created_at",
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<AdminBanner | null>(
    null
  );
  const [analytics, setAnalytics] = useState<AdminBannerAnalytics | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    banner_type: "image" as BannerType,
    image: null as File | null,
    html_content: "",
    text_content: "",
    position: "header" as BannerPosition,
    target_states: [] as number[],
    target_categories: [] as number[],
    click_url: "",
    open_new_tab: true,
    start_date: "",
    end_date: "",
    priority: 0,
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // New state for tabs and mobile features
  const [activeTab, setActiveTab] = useState<"stats" | "banners">("stats");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadBanners();
    loadStates();
    loadCategories();
  }, [filters]);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const response = await adminService.getBanners(filters);
      setBanners(response.results);
      setPagination({
        count: response.count,
        next: response.next,
        previous: response.previous,
      });
    } catch (err) {
      toast.error("Failed to load banners");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStates = async () => {
    try {
      const response = await contentService.getStates();
      setStates(response);
    } catch (err) {
      console.error("Failed to load states:", err);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await contentService.getCategories();
      setCategories(response);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBanners();
    setRefreshing(false);
    toast.success("Banners refreshed");
  };

  const handleFilterChange = (key: keyof AdminBannerListParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
      page: 1,
    }));
  };

  const handleToggle = async (banner: AdminBanner) => {
    try {
      const response = await adminService.toggleBanner(banner.id);
      toast.success(response.message);
      loadBanners();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle banner");
    }
  };

  const handleDelete = async () => {
    if (!selectedBanner) return;
    try {
      await adminService.deleteBanner(selectedBanner.id);
      toast.success("Banner deleted successfully");
      setShowDeleteModal(false);
      setSelectedBanner(null);
      loadBanners();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete banner");
    }
  };

  const handleViewAnalytics = async (banner: AdminBanner) => {
    try {
      setSelectedBanner(banner);
      setAnalytics(null); // Reset analytics to show loading state
      setShowAnalyticsModal(true); // Show modal immediately
      const data = await adminService.getBannerAnalytics(banner.id);
      setAnalytics(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load analytics");
      setShowAnalyticsModal(false);
      setSelectedBanner(null);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (banner: AdminBanner) => {
    setSelectedBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || "",
      banner_type: banner.banner_type,
      image: null,
      html_content: banner.html_content || "",
      text_content: banner.text_content || "",
      position: banner.position,
      target_states: banner.target_states || [],
      target_categories: banner.target_categories || [],
      click_url: banner.click_url || "",
      open_new_tab: banner.open_new_tab,
      start_date: banner.start_date ? banner.start_date.split("T")[0] : "",
      end_date: banner.end_date ? banner.end_date.split("T")[0] : "",
      priority: banner.priority || 0,
    });
    setImagePreview(banner.image || "");
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      banner_type: "image",
      image: null,
      html_content: "",
      text_content: "",
      position: "header",
      target_states: [],
      target_categories: [],
      click_url: "",
      open_new_tab: true,
      start_date: "",
      end_date: "",
      priority: 0,
    });
    setImagePreview("");
    setFormErrors({});
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormErrors({ image: "Please select a valid image file" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors({ image: "Image size must be less than 5MB" });
      return;
    }

    setFormData((prev) => ({ ...prev, image: file }));
    setFormErrors((prev) => ({ ...prev, image: "" }));

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.position) errors.position = "Position is required";

    if (formData.banner_type === "image" && !showEditModal && !formData.image) {
      errors.image = "Image is required for image banners";
    }
    if (formData.banner_type === "html" && !formData.html_content.trim()) {
      errors.html_content = "HTML content is required for HTML banners";
    }
    if (formData.banner_type === "text" && !formData.text_content.trim()) {
      errors.text_content = "Text content is required for text banners";
    }

    if (formData.click_url) {
      try {
        new URL(formData.click_url);
      } catch {
        errors.click_url = "Please enter a valid URL";
      }
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        errors.end_date = "End date must be after start date";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (showEditModal && selectedBanner) {
        const updateData: AdminBannerUpdateRequest = {
          title: formData.title,
          description: formData.description,
          banner_type: formData.banner_type,
          position: formData.position,
          target_states: formData.target_states,
          target_categories: formData.target_categories,
          click_url: formData.click_url,
          open_new_tab: formData.open_new_tab,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
          priority: formData.priority,
        };

        if (formData.image) updateData.image = formData.image;
        if (formData.banner_type === "html")
          updateData.html_content = formData.html_content;
        if (formData.banner_type === "text")
          updateData.text_content = formData.text_content;

        await adminService.updateBanner(selectedBanner.id, updateData);
        toast.success("Banner updated successfully");
        setShowEditModal(false);
      } else {
        const createData: AdminBannerCreateRequest = {
          title: formData.title,
          description: formData.description,
          banner_type: formData.banner_type,
          position: formData.position,
          target_states: formData.target_states,
          target_categories: formData.target_categories,
          click_url: formData.click_url,
          open_new_tab: formData.open_new_tab,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
          priority: formData.priority,
        };

        if (formData.banner_type === "image" && formData.image) {
          createData.image = formData.image;
        }
        if (formData.banner_type === "html") {
          createData.html_content = formData.html_content;
        }
        if (formData.banner_type === "text") {
          createData.text_content = formData.text_content;
        }

        await adminService.createBanner(createData);
        toast.success("Banner created successfully");
        setShowCreateModal(false);
      }

      resetForm();
      loadBanners();
    } catch (err: any) {
      const errorMsg = err.message || "Failed to save banner";
      toast.error(errorMsg);
      if (err.details) setFormErrors(err.details);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const totalPages = Math.ceil(pagination.count / (filters.page_size || 20));
  const currentPage = filters.page || 1;

  // Filter banners based on search query for the banner list tab
  const filteredBanners = useMemo(() => {
    if (!searchQuery.trim()) return banners;

    return banners.filter(
      (banner) =>
        banner.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banner.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banner.click_url?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [banners, searchQuery]);

  const getPositionLabel = (position: BannerPosition) => {
    const labels: Record<BannerPosition, string> = {
      header: "Header",
      sidebar: "Sidebar",
      footer: "Footer",
      between_ads: "Between Ads",
      category_page: "Category Page",
      ad_detail: "Ad Detail",
    };
    return labels[position];
  };

  const getBannerTypeLabel = (type: BannerType) => {
    const labels: Record<BannerType, string> = {
      image: "Image",
      html: "HTML",
      text: "Text",
    };
    return labels[type];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Banner Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage promotional banners across the platform
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Banner</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("stats")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "stats"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Highlights & Stats</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("banners")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "banners"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <ImageIcon className="h-4 w-4" />
                <span>Banner List</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "stats" ? (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Banners</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {pagination.count}
                      </p>
                    </div>
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active</p>
                      <p className="text-2xl font-bold text-green-600">
                        {banners.filter((b) => b.is_active).length}
                      </p>
                    </div>
                    <Eye className="h-8 w-8 text-green-400" />
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Inactive</p>
                      <p className="text-2xl font-bold text-gray-600">
                        {banners.filter((b) => !b.is_active).length}
                      </p>
                    </div>
                    <EyeOff className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Clicks</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {banners
                          .reduce((sum, b) => sum + b.clicks, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-400" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search and Mobile Filter Toggle */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search banners..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
                    />
                  </div>
                </div>

                <div className="flex gap-x-2 sm:hidden">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="sm:hidden flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                  </button>

                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                    />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Filters - Desktop always visible, Mobile collapsible */}
              <div
                className={`bg-gray-50 rounded-lg border border-gray-200 p-4 ${
                  showMobileFilters ? "block" : "hidden sm:block"
                }`}
              >
                <div className="flex items-center justify-between mb-4 sm:hidden">
                  <h3 className="text-sm font-medium text-gray-900">Filters</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={
                        filters.is_active === undefined
                          ? "all"
                          : filters.is_active
                          ? "active"
                          : "inactive"
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        handleFilterChange(
                          "is_active",
                          val === "all" ? undefined : val === "active"
                        );
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={filters.banner_type || "all"}
                      onChange={(e) =>
                        handleFilterChange("banner_type", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="all">All Types</option>
                      <option value="image">Image</option>
                      <option value="html">HTML</option>
                      <option value="text">Text</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <select
                      value={filters.position || "all"}
                      onChange={(e) =>
                        handleFilterChange("position", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="all">All Positions</option>
                      <option value="header">Header</option>
                      <option value="sidebar">Sidebar</option>
                      <option value="footer">Footer</option>
                      <option value="between_ads">Between Ads</option>
                      <option value="category_page">Category Page</option>
                      <option value="ad_detail">Ad Detail</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Banner List Content - Only show when banners tab is active */}
      {activeTab === "banners" && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : filteredBanners.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery
                  ? "No banners match your search"
                  : "No banners found"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Get started by creating your first banner"}
              </p>
              {!searchQuery && (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Banner</span>
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
                        Banner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type & Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Targeting
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Performance
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
                    {filteredBanners.map((banner) => (
                      <tr key={banner.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {banner.banner_type === "image" && banner.image ? (
                              <img
                                src={banner.image}
                                alt={banner.title}
                                className="h-16 w-24 object-cover rounded border border-gray-200"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-16 w-24 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                <span className="text-xs text-gray-500">
                                  {getBannerTypeLabel(banner.banner_type)}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                {banner.title}
                              </p>
                              {banner.click_url && (
                                <a
                                  href={banner.click_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline flex items-center space-x-1 mt-1"
                                >
                                  <span className="truncate max-w-xs">
                                    {banner.click_url}
                                  </span>
                                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {getBannerTypeLabel(banner.banner_type)}
                            </span>
                            <div className="text-sm text-gray-600">
                              {getPositionLabel(banner.position)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="space-y-1">
                            {banner.target_states_display &&
                            banner.target_states_display.length > 0 ? (
                              <div className="flex items-center space-x-1 text-gray-900">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span>
                                  {banner.target_states_display.length} state(s)
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">All States</span>
                            )}
                            {banner.target_categories_display &&
                            banner.target_categories_display.length > 0 ? (
                              <div className="flex items-center space-x-1 text-gray-900">
                                <Tag className="h-4 w-4 text-gray-400" />
                                <span>
                                  {banner.target_categories_display.length}{" "}
                                  category(ies)
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">
                                All Categories
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-gray-900 font-medium">
                              {banner.clicks.toLocaleString()} clicks
                            </div>
                            <div className="text-gray-500">
                              {banner.impressions.toLocaleString()} views
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              CTR: {(banner.ctr * 100).toFixed(2)}%
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggle(banner)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              banner.is_active
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            } transition-colors`}
                            aria-label={`Toggle banner ${
                              banner.is_active ? "off" : "on"
                            }`}
                          >
                            {banner.is_active ? (
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
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewAnalytics(banner)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Analytics"
                              aria-label="View banner analytics"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(banner)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Edit"
                              aria-label="Edit banner"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBanner(banner);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                              aria-label="Delete banner"
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

              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * (filters.page_size || 20) + 1}{" "}
                    to{" "}
                    {Math.min(
                      currentPage * (filters.page_size || 20),
                      pagination.count
                    )}{" "}
                    of {pagination.count} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <div className="flex space-x-1">
                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                currentPage === pageNum
                                  ? "bg-orange-500 text-white"
                                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <BaseModal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          resetForm();
        }}
        maxWidth="max-w-3xl"
        title={showEditModal ? "Edit Banner" : "Create New Banner"}
      >
        {/* <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter banner title"
              />
              {formErrors.title && (
                <p className="text-red-600 text-sm mt-1">{formErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Optional description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.banner_type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      banner_type: e.target.value as BannerType,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="image">Image</option>
                  <option value="html">HTML</option>
                  <option value="text">Text</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.position}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      position: e.target.value as BannerPosition,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="header">Header</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="footer">Footer</option>
                  <option value="between_ads">Between Ads</option>
                  <option value="category_page">Category Page</option>
                  <option value="ad_detail">Ad Detail</option>
                </select>
                {formErrors.position && (
                  <p className="text-red-600 text-sm mt-1">
                    {formErrors.position}
                  </p>
                )}
              </div>
            </div>

            {formData.banner_type === "image" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Image{" "}
                  {!showEditModal && <span className="text-red-500">*</span>}
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-orange-500 transition-colors">
                      <div className="flex flex-col items-center">
                        <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          Click to upload image
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PNG, JPG up to 5MB
                        </span>
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
                {formErrors.image && (
                  <p className="text-red-600 text-sm mt-1">
                    {formErrors.image}
                  </p>
                )}
              </div>
            )}

            {formData.banner_type === "html" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HTML Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.html_content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      html_content: e.target.value,
                    }))
                  }
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                  placeholder="Enter HTML code"
                />
                {formErrors.html_content && (
                  <p className="text-red-600 text-sm mt-1">
                    {formErrors.html_content}
                  </p>
                )}
              </div>
            )}

            {formData.banner_type === "text" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.text_content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      text_content: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter text content"
                />
                {formErrors.text_content && (
                  <p className="text-red-600 text-sm mt-1">
                    {formErrors.text_content}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Click URL
              </label>
              <input
                type="url"
                value={formData.click_url}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    click_url: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="https://example.com"
              />
              {formErrors.click_url && (
                <p className="text-red-600 text-sm mt-1">
                  {formErrors.click_url}
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="open_new_tab"
                checked={formData.open_new_tab}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    open_new_tab: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label
                htmlFor="open_new_tab"
                className="ml-2 block text-sm text-gray-700"
              >
                Open link in new tab
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target States (leave empty for all)
              </label>
              <select
                multiple
                value={formData.target_states.map(String)}
                onChange={(e) => {
                  const selected = Array.from(
                    e.target.selectedOptions,
                    (option) => Number(option.value)
                  );
                  setFormData((prev) => ({ ...prev, target_states: selected }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                size={5}
              >
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Hold Ctrl/Cmd to select multiple
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Categories (leave empty for all)
              </label>
              <select
                multiple
                value={formData.target_categories.map(String)}
                onChange={(e) => {
                  const selected = Array.from(
                    e.target.selectedOptions,
                    (option) => Number(option.value)
                  );
                  setFormData((prev) => ({
                    ...prev,
                    target_categories: selected,
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                size={5}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Hold Ctrl/Cmd to select multiple
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      start_date: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      end_date: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {formErrors.end_date && (
                  <p className="text-red-600 text-sm mt-1">
                    {formErrors.end_date}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: Number(e.target.value),
                    }))
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
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
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Saving..."
                : showEditModal
                ? "Update Banner"
                : "Create Banner"}
            </button>
          </div>
        </form> */}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter banner title"
              />
              {formErrors.title && (
                <p className="text-red-600 text-sm mt-1">{formErrors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Optional description"
              />
            </div>

            {/* Banner Type and Position */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.banner_type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      banner_type: e.target.value as BannerType,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="image">Image Banner</option>
                  <option value="html">HTML Banner (Custom Code)</option>
                  <option value="text">Text Banner (Plain Text)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.banner_type === "image" && "Upload an image file"}
                  {formData.banner_type === "html" &&
                    "Write custom HTML/CSS code (e.g., Google Ads)"}
                  {formData.banner_type === "text" && "Simple text message"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.position}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      position: e.target.value as BannerPosition,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="header">Header</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="footer">Footer</option>
                  <option value="between_ads">Between Ads</option>
                  <option value="category_page">Category Page</option>
                  <option value="ad_detail">Ad Detail</option>
                </select>
                {formErrors.position && (
                  <p className="text-red-600 text-sm mt-1">
                    {formErrors.position}
                  </p>
                )}
              </div>
            </div>

            {/* Content based on type */}
            {formData.banner_type === "image" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Image{" "}
                  {!showEditModal && <span className="text-red-500">*</span>}
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-orange-500 transition-colors">
                      <div className="flex flex-col items-center">
                        <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          Click to upload image
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PNG, JPG up to 5MB
                        </span>
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
                {formErrors.image && (
                  <p className="text-red-600 text-sm mt-1">
                    {formErrors.image}
                  </p>
                )}
              </div>
            )}

            {formData.banner_type === "html" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HTML Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.html_content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      html_content: e.target.value,
                    }))
                  }
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                  placeholder="<div>Your custom HTML here</div>"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use for Google AdSense, custom styled ads, or embedded content
                </p>
                {formErrors.html_content && (
                  <p className="text-red-600 text-sm mt-1">
                    {formErrors.html_content}
                  </p>
                )}
              </div>
            )}

            {formData.banner_type === "text" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.text_content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      text_content: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter your text message, e.g., 'Special Offer: 50% Off!'"
                />
                {formErrors.text_content && (
                  <p className="text-red-600 text-sm mt-1">
                    {formErrors.text_content}
                  </p>
                )}
              </div>
            )}

            {/* Click URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Click URL (Optional)
              </label>
              <input
                type="url"
                value={formData.click_url}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    click_url: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="https://example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Where users go when they click the banner
              </p>
              {formErrors.click_url && (
                <p className="text-red-600 text-sm mt-1">
                  {formErrors.click_url}
                </p>
              )}
            </div>

            {/* Open in New Tab */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="open_new_tab"
                checked={formData.open_new_tab}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    open_new_tab: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label
                htmlFor="open_new_tab"
                className="ml-2 block text-sm text-gray-700"
              >
                Open link in new tab
              </label>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>
            <h3 className="text-sm font-semibold text-gray-900">
              Targeting & Priority
            </h3>

            {/* Target States - Dropdown Multi-Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target States
              </label>
              <select
                value=""
                onChange={(e) => {
                  const stateId = Number(e.target.value);
                  if (stateId && !formData.target_states.includes(stateId)) {
                    setFormData((prev) => ({
                      ...prev,
                      target_states: [...prev.target_states, stateId],
                    }));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select state to add...</option>
                {states
                  .filter((state) => !formData.target_states.includes(state.id))
                  .map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
              </select>

              {/* Selected States Display */}
              {formData.target_states.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.target_states.map((stateId) => {
                    const state = states.find((s) => s.id === stateId);
                    return (
                      <span
                        key={stateId}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        {state?.name}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              target_states: prev.target_states.filter(
                                (id) => id !== stateId
                              ),
                            }));
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-2">
                  No states selected - banner will show in ALL states
                </p>
              )}
            </div>

            {/* Target Categories - Tag Style Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Categories
              </label>
              <select
                value=""
                onChange={(e) => {
                  const catId = Number(e.target.value);
                  if (catId && !formData.target_categories.includes(catId)) {
                    setFormData((prev) => ({
                      ...prev,
                      target_categories: [...prev.target_categories, catId],
                    }));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select category to add...</option>
                {categories
                  .filter((cat) => !formData.target_categories.includes(cat.id))
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>

              {/* Selected Categories Display */}
              {formData.target_categories.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.target_categories.map((catId) => {
                    const category = categories.find((c) => c.id === catId);
                    return (
                      <span
                        key={catId}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {category?.name}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              target_categories: prev.target_categories.filter(
                                (id) => id !== catId
                              ),
                            }));
                          }}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-2">
                  No categories selected - banner will show in ALL categories
                </p>
              )}
            </div>

            {/* Priority Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority (Higher = Shows First)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: Number(e.target.value),
                    }))
                  }
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #f97316 0%, #f97316 ${formData.priority}%, #e5e7eb ${formData.priority}%, #e5e7eb 100%)`,
                  }}
                />
                <span className="text-lg font-semibold text-gray-900 w-12 text-right">
                  {formData.priority}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low (0)</span>
                <span>Medium (50)</span>
                <span>High (100)</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Banners with higher priority appear first. Same priority? Newer
                shows first.
              </p>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      start_date: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      end_date: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {formErrors.end_date && (
                  <p className="text-red-600 text-sm mt-1">
                    {formErrors.end_date}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
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
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Saving..."
                : showEditModal
                ? "Update Banner"
                : "Create Banner"}
            </button>
          </div>
        </form>
      </BaseModal>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedBanner(null);
        }}
        onConfirm={handleDelete}
        title="Delete Banner"
        message={`Are you sure you want to delete "${selectedBanner?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />

      <BaseModal
        isOpen={showAnalyticsModal}
        onClose={() => {
          setShowAnalyticsModal(false);
          setSelectedBanner(null);
          setAnalytics(null);
        }}
        maxWidth="max-w-4xl"
        title={`Analytics: ${selectedBanner?.title}`}
      >
        <div className="p-6">
          {analytics ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 font-medium">
                    Total Impressions
                  </p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {analytics.total_impressions.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 font-medium">
                    Total Clicks
                  </p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {analytics.total_clicks.toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600 font-medium">
                    Click-Through Rate
                  </p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">
                    {(analytics.ctr * 100).toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Banner Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Type</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {getBannerTypeLabel(
                        selectedBanner?.banner_type || "image"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Position</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {getPositionLabel(selectedBanner?.position || "header")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Start Date</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {formatDate(selectedBanner?.start_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">End Date</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {formatDate(selectedBanner?.end_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {formatDate(selectedBanner?.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {selectedBanner?.is_active ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-gray-600">Inactive</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          )}
        </div>
      </BaseModal>
    </div>
  );
};

export default BannersTab;
