// src/hooks/usePostAd.ts
import { useState, useEffect, useCallback } from "react";
import { adsService, contentService } from "../services";
import { useAuth } from "../contexts/AuthContext";
import type {
  CreateAdRequest,
  PostAdFormState,
  PostAdFormErrors,
} from "../types/ads";
import type { Category, City } from "../types/content";

export const usePostAd = () => {
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState<PostAdFormState>({
    title: "",
    description: "",
    category: "",
    city: "",
    price: "",
    price_type: "fixed",
    condition: "not_applicable",
    contact_phone: "",
    contact_email: "",
    hide_phone: false,
    keywords: "",
  });

  // Data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  // UI state
  const [selectedPlan, setSelectedPlan] = useState<"free" | "featured">("free");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState<PostAdFormErrors>({});
  const [step, setStep] = useState<"plan" | "form">("plan");

  // Set user email as default when user is available
  useEffect(() => {
    if (user?.email && !formData.contact_email) {
      setFormData((prev) => ({
        ...prev,
        contact_email: user.email,
      }));
    }
  }, [user, formData.contact_email]);

  // Load categories and cities data
  const loadData = useCallback(async () => {
    try {
      setLoadingData(true);
      const [categoriesData, citiesData] = await Promise.all([
        contentService.getCategories(),
        contentService.getCities(),
      ]);

      setCategories(categoriesData.filter((cat) => cat.is_active));
      setCities(citiesData.filter((city) => city.is_active));
    } catch (error) {
      console.error("Error loading data:", error);
      setErrors({ submit: "Failed to load categories and cities" });
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Update form field
  const updateField = useCallback(
    (field: keyof PostAdFormState, value: string | boolean) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    },
    [errors]
  );

  // Handle image upload
  const handleImageUpload = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);
      const maxImages = selectedPlan === "free" ? 3 : 10;

      if (images.length + fileArray.length > maxImages) {
        setErrors((prev) => ({
          ...prev,
          images: `You can only upload ${maxImages} images with the ${selectedPlan} plan`,
        }));
        return;
      }

      // Validate files
      const validFiles: File[] = [];
      const invalidFiles: string[] = [];

      fileArray.forEach((file) => {
        const isImage = file.type.startsWith("image/");
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

        if (!isImage) {
          invalidFiles.push(`${file.name}: Only image files allowed`);
        } else if (!isValidSize) {
          invalidFiles.push(`${file.name}: File too large (max 5MB)`);
        } else {
          validFiles.push(file);
        }
      });

      if (invalidFiles.length > 0) {
        setErrors((prev) => ({
          ...prev,
          images: invalidFiles[0], // Show first error
        }));
        return;
      }

      if (validFiles.length > 0) {
        // Add valid files
        setImages((prev) => [...prev, ...validFiles]);

        // Generate previews
        validFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            setImagePreview((prev) => [...prev, e.target?.result as string]);
          };
          reader.readAsDataURL(file);
        });

        // Clear image errors
        setErrors((prev) => ({ ...prev, images: undefined }));
      }
    },
    [images.length, selectedPlan]
  );

  // Remove image
  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: PostAdFormErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    } else if (formData.description.length > 2000) {
      newErrors.description = "Description must be less than 2000 characters";
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    // City validation
    if (!formData.city) {
      newErrors.city = "Please select a city";
    }

    // Price validation
    if (
      formData.price_type === "fixed" ||
      formData.price_type === "negotiable"
    ) {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        newErrors.price = "Price is required for this price type";
      } else if (parseFloat(formData.price) > 999999) {
        newErrors.price = "Price must be less than $1,000,000";
      }
    }

    // Contact validation
    if (!formData.contact_phone && !formData.contact_email) {
      newErrors.contact = "At least one contact method is required";
    }

    if (
      formData.contact_phone &&
      !/^\d{10}$/.test(formData.contact_phone.replace(/\D/g, ""))
    ) {
      newErrors.contact_phone = "Please enter a valid 10-digit phone number";
    }

    if (
      formData.contact_email &&
      !/\S+@\S+\.\S+/.test(formData.contact_email)
    ) {
      newErrors.contact_email = "Please enter a valid email address";
    }

    // Images validation
    if (images.length === 0) {
      newErrors.images = "At least one image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, images.length]);

  // Submit form
  const submitAd = useCallback(async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    try {
      setLoading(true);
      setErrors({});

      // Prepare data for API
      const adData: CreateAdRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price:
          formData.price_type === "fixed" ||
          formData.price_type === "negotiable"
            ? parseFloat(formData.price)
            : undefined,
        price_type: formData.price_type,
        condition: formData.condition,
        category: parseInt(formData.category),
        city: parseInt(formData.city),
        contact_phone: formData.contact_phone.replace(/\D/g, ""),
        contact_email: formData.contact_email,
        hide_phone: formData.hide_phone,
        keywords: formData.keywords.trim() || undefined,
        plan: selectedPlan,
        images: images,
      };

      // Submit to API
      await adsService.createAd(adData);
      return true;
    } catch (error: any) {
      console.error("Error creating ad:", error);

      // Handle backend validation errors
      if (error.response?.data) {
        const backendErrors: PostAdFormErrors = {};
        Object.entries(error.response.data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            backendErrors[key] = value[0];
          } else {
            backendErrors[key] = value as string;
          }
        });
        setErrors(backendErrors);
      } else {
        setErrors({ submit: "Failed to create ad. Please try again." });
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [formData, images, selectedPlan, validateForm]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      category: "",
      city: "",
      price: "",
      price_type: "fixed",
      condition: "not_applicable",
      contact_phone: "",
      contact_email: user?.email || "",
      hide_phone: false,
      keywords: "",
    });
    setImages([]);
    setImagePreview([]);
    setSelectedPlan("free");
    setStep("plan");
    setErrors({});
  }, [user?.email]);

  // Format phone number for display
  const formatPhoneDisplay = useCallback((phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length >= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    } else if (cleaned.length >= 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    }
    return cleaned;
  }, []);

  return {
    // State
    formData,
    categories,
    cities,
    images,
    imagePreview,
    selectedPlan,
    loading,
    loadingData,
    errors,
    step,

    // Actions
    loadData,
    updateField,
    handleImageUpload,
    removeImage,
    validateForm,
    submitAd,
    resetForm,
    setSelectedPlan,
    setStep,
    formatPhoneDisplay,
  };
};
