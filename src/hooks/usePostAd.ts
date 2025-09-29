// src/hooks/usePostAd.ts - IMPROVED with better feedback

import { useState, useCallback, useEffect } from "react";
import { adsService } from "../services/adsService";
import { contentService } from "../services/contentService";
import { useAuth } from "../contexts/AuthContext";
import type { Category, City } from "../types/content";
import type { PostAdFormState, PostAdFormErrors } from "../types/ads";

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
  const [uploadProgress, setUploadProgress] = useState<string>("");

  // Set user email as default
  useEffect(() => {
    if (user?.email && !formData.contact_email) {
      setFormData((prev) => ({
        ...prev,
        contact_email: user.email,
      }));
    }
  }, [user, formData.contact_email]);

  // Load categories and cities
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

      // Clear error
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
        setErrors({
          ...errors,
          images: `Maximum ${maxImages} images allowed for ${selectedPlan} plan`,
        });
        return;
      }

      // Validate file sizes (5MB max)
      const invalidFiles = fileArray.filter(
        (file) => file.size > 5 * 1024 * 1024
      );
      if (invalidFiles.length > 0) {
        setErrors({
          ...errors,
          images: "Each image must be less than 5MB",
        });
        return;
      }

      // Add new images
      const newImages = [...images, ...fileArray];
      setImages(newImages);

      // Create previews
      const newPreviews = fileArray.map((file) => URL.createObjectURL(file));
      setImagePreview((prev) => [...prev, ...newPreviews]);

      // Clear errors
      if (errors.images) {
        setErrors({ ...errors, images: undefined });
      }
    },
    [images, selectedPlan, errors]
  );

  // Remove image
  const removeImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      const newPreviews = imagePreview.filter((_, i) => i !== index);

      // Revoke URL to prevent memory leaks
      URL.revokeObjectURL(imagePreview[index]);

      setImages(newImages);
      setImagePreview(newPreviews);
    },
    [images, imagePreview]
  );

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: PostAdFormErrors = {};

    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.city) {
      newErrors.city = "City is required";
    }

    // Price validation
    if (
      formData.price_type === "fixed" ||
      formData.price_type === "negotiable"
    ) {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        newErrors.price = "Valid price is required";
      }
    }

    // Contact validation
    if (!formData.contact_phone && !formData.contact_email) {
      newErrors.contact = "At least one contact method is required";
    }

    // Images validation
    if (images.length === 0) {
      newErrors.images = "At least one image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, images]);

  // Submit ad
  const submitAd = useCallback(async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    setLoading(true);
    setUploadProgress("Creating ad...");
    setErrors({});

    try {
      const createAdRequest: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: parseInt(formData.category),
        city: parseInt(formData.city),
        price_type: formData.price_type,
        condition: formData.condition,
        contact_phone: formData.contact_phone || undefined,
        contact_email: formData.contact_email || undefined,
        hide_phone: formData.hide_phone,
        keywords: formData.keywords.trim() || undefined,
        plan: selectedPlan,
        images: images,
      };

      // Add price for fixed/negotiable
      if (
        formData.price_type === "fixed" ||
        formData.price_type === "negotiable"
      ) {
        createAdRequest.price = parseFloat(formData.price);
      }

      console.log("Submitting ad:", createAdRequest);

      // Update progress for images
      if (images.length > 0) {
        setUploadProgress(
          `Creating ad and uploading ${images.length} image(s)...`
        );
      }

      const adData = await adsService.createAd(createAdRequest);

      console.log("✓ Ad created successfully:", adData);

      // Check if images were uploaded
      if (images.length > 0) {
        if (adData.images && adData.images.length === images.length) {
          setUploadProgress("✓ All images uploaded successfully!");
        } else if (adData.images && adData.images.length > 0) {
          setUploadProgress(
            `⚠ Partial success: ${adData.images.length}/${images.length} images uploaded`
          );
        } else {
          setUploadProgress("⚠ Ad created but images failed to upload");
        }
      } else {
        setUploadProgress("✓ Ad created successfully!");
      }

      return true;
    } catch (error: any) {
      console.error("Error creating ad:", error);

      // Handle backend validation errors
      if (error.details) {
        const backendErrors: PostAdFormErrors = {};
        Object.entries(error.details).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            backendErrors[key] = value[0];
          } else {
            backendErrors[key] = value as string;
          }
        });
        setErrors(backendErrors);

        // Show first error
        const firstError = Object.values(backendErrors)[0];
        if (firstError) {
          setErrors({ ...backendErrors, submit: firstError });
        }
      } else {
        const errorMessage =
          error.message || "Failed to create ad. Please try again.";
        setErrors({ submit: errorMessage });
      }

      setUploadProgress("");
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

    // Cleanup image previews
    imagePreview.forEach((preview) => URL.revokeObjectURL(preview));
    setImages([]);
    setImagePreview([]);
    setErrors({});
    setStep("plan");
    setSelectedPlan("free");
    setUploadProgress("");
  }, [imagePreview, user]);

  // Format phone display
  const formatPhoneDisplay = useCallback((phone: string): string => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }
    return phone;
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
    uploadProgress, // NEW: Progress message

    // Actions
    loadData,
    updateField,
    handleImageUpload,
    removeImage,
    submitAd,
    resetForm,
    setSelectedPlan,
    setStep,
    formatPhoneDisplay,
  };
};
