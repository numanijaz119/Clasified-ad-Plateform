// src/components/admin/CategoriesTab.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  FileText,
  ToggleLeft,
  ToggleRight,
  Search,
} from "lucide-react";
import { adminService } from "../../services";
import { AdminCategoryStats } from "../../types/admin";
import BaseModal from "../modals/BaseModal";
import Button from "../ui/Button";
import ConfirmModal from "./ConfirmModal";

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
}

const CategoriesTab: React.FC = () => {
  const [categories, setCategories] = useState<AdminCategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<AdminCategoryStats | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    categoryId: number | null;
  }>({ isOpen: false, categoryId: null });

  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
    icon: "📦",
    sort_order: 0,
  });

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof CategoryFormData, string>>
  >({});

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getCategoryStats();
      setCategories(response.categories);
    } catch (err: any) {
      setError(err.message || "Failed to load categories");
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenModal = (category?: AdminCategoryStats) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        icon: category.icon || "📦",
        sort_order: category.sort_order || 0,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        icon: "📦",
        sort_order: 0,
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      icon: "📦",
      sort_order: 0,
    });
    setFormErrors({});
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CategoryFormData, string>> = {};

    if (!formData.name.trim()) {
      errors.name = "Category name is required";
    }

    if (!formData.slug.trim()) {
      errors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setActionLoading(editingCategory?.id || -1);

      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, formData);
      } else {
        await adminService.createCategory(formData);
      }

      await fetchCategories();
      handleCloseModal();
    } catch (err: any) {
      setError(
        err.message ||
          `Failed to ${editingCategory ? "update" : "create"} category`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (categoryId: number) => {
    try {
      setActionLoading(categoryId);
      await adminService.deleteCategory(categoryId);
      await fetchCategories();
      setConfirmDelete({ isOpen: false, categoryId: null });
    } catch (err: any) {
      setError(err.message || "Failed to delete category");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex sm:items-center flex-col sm:flex-row gap-y-2 sm:gap-y-0   justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Categories Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {categories.length} total categories
          </p>
        </div>
        <div className="flex items-center self-end sm:self-auto space-x-3">
          <button
            onClick={() => fetchCategories()}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </Button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <div className="flex-1">
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-600 hover:text-red-700 underline text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{category.icon || "📦"}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500">{category.slug}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenModal(category)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    setConfirmDelete({ isOpen: true, categoryId: category.id })
                  }
                  disabled={actionLoading === category.id}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {category.total_ads}
                </div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {category.active_ads}
                </div>
                <div className="text-xs text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {category.pending_ads}
                </div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No categories found</p>
          <p className="text-sm text-gray-500">
            Try adjusting your search or add a new category
          </p>
        </div>
      )}

      {showModal && (
        <BaseModal
          isOpen={showModal}
          onClose={handleCloseModal}
          maxWidth="max-w-lg"
          title={editingCategory ? "Edit Category" : "Add New Category"}
        >
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  formErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., Electronics"
              />
              {formErrors.name && (
                <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  formErrors.slug ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., electronics"
              />
              {formErrors.slug && (
                <p className="text-red-500 text-xs mt-1">{formErrors.slug}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                URL-friendly identifier (lowercase, no spaces)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon (Emoji)
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, icon: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="📦"
                maxLength={2}
              />
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
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                placeholder="Category description..."
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sort_order: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first
              </p>
            </div> */}
          </div>

          <div className="flex items-center justify-end space-x-3 px-6 pb-6 border-t border-gray-200 pt-4">
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={actionLoading !== null}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={actionLoading !== null}
            >
              {actionLoading !== null
                ? "Saving..."
                : editingCategory
                ? "Update"
                : "Create"}
            </Button>
          </div>
        </BaseModal>
      )}

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, categoryId: null })}
        onConfirm={() =>
          confirmDelete.categoryId && handleDelete(confirmDelete.categoryId)
        }
        title="Delete Category"
        message="Are you sure you want to delete this category? This will deactivate it but not remove existing ads."
        confirmText="Delete"
        type="danger"
        loading={actionLoading !== null}
      />
    </div>
  );
};

export default CategoriesTab;
