import { useState, useCallback } from 'react';
import { adsService } from '../services';

// Interface for the detailed ad response
export interface DetailedAd {
  id: number;
  slug: string;
  title: string;
  description: string;
  display_price: string;
  price: string;
  price_type: "fixed" | "negotiable" | "contact";
  condition: string;
  contact_phone: string;
  contact_email_display: string;
  hide_phone: boolean;
  user: {
    id: number;
    full_name: string;
    avatar: string | null;
    email: string | null;
    phone: string;
    email_verified: boolean;
  };
  category: {
    id: number;
    name: string;
    icon: string;
  };
  city: {
    id: number;
    name: string;
    photo_url: string;
  };
  state: {
    id: number;
    name: string;
    code: string;
  };
  plan: "free" | "featured";
  view_count: number;
  unique_view_count: number;
  contact_count: number;
  favorite_count: number;
  keywords: string;
  images: Array<{
    id: number;
    image: string;
    caption: string;
    is_primary: boolean;
    sort_order: number;
    file_size: number;
    width: number | null;
    height: number | null;
    created_at: string;
  }>;
  time_since_posted: string;
  is_featured_active: boolean;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

// Interface for basic ad from search results
export interface BasicAd {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  price_type: "fixed" | "negotiable" | "contact";
  display_price: string;
  condition?: "new" | "used" | "like_new";
  category: {
    id: number;
    name: string;
    icon: string;
  };
  city: {
    id: number;
    name: string;
  };
  state: {
    id: number;
    name: string;
    code: string;
  };
  plan: "free" | "featured";
  primary_image?: {
    id: number;
    image: string;
    caption?: string;
  };
  view_count: number;
  time_since_posted: string;
  is_featured_active: boolean;
  created_at: string;
}

// Interface for modal listing (what ListingModal expects)
export interface ModalListing {
  id: number;
  title: string;
  category: string;
  price: string;
  location: string;
  image: string;
  views: number;
  timeAgo: string;
  postedDate: Date;
  featured: boolean;
  description: string;
  phone?: string;
  email?: string;
  images: string[];
  user?: {
    full_name: string;
    avatar: string | null;
  };
}

export const useAdDetails = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdDetails = useCallback(async (slug: string): Promise<DetailedAd | null> => {
    try {
      setLoading(true);
      setError(null);
      const detailedAd = await adsService.getAd(slug) as unknown as DetailedAd;
      return detailedAd;
    } catch (err) {
      console.error('Error fetching ad details:', err);
      setError('Failed to load ad details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const transformToModalListing = useCallback((
    detailedAd: DetailedAd, 
    fallbackAd?: BasicAd
  ): ModalListing => {
    // Get images with proper fallback
    const images = detailedAd.images?.length > 0 
      ? detailedAd.images.map(img => img.image)
      : fallbackAd?.primary_image?.image 
        ? [fallbackAd.primary_image.image]
        : ['/placeholder.svg'];

    // Get primary image
    const primaryImage = detailedAd.images?.find(img => img.is_primary)?.image || 
                        detailedAd.images?.[0]?.image || 
                        fallbackAd?.primary_image?.image ||
                        '/placeholder.svg';

    return {
      id: detailedAd.id,
      title: detailedAd.title,
      category: detailedAd.category.name,
      price: detailedAd.display_price,
      location: `${detailedAd.city.name}, ${detailedAd.state.code}`,
      image: primaryImage,
      views: detailedAd.view_count,
      timeAgo: detailedAd.time_since_posted,
      postedDate: new Date(detailedAd.created_at),
      featured: detailedAd.is_featured_active,
      description: detailedAd.description,
      phone: detailedAd.hide_phone ? undefined : detailedAd.contact_phone,
      email: detailedAd.contact_email_display,
      images,
      user: {
        full_name: detailedAd.user.full_name,
        avatar: detailedAd.user.avatar,
      },
    };
  }, []);

  const createFallbackModalListing = useCallback((basicAd: BasicAd): ModalListing => {
    const fallbackImage = basicAd.primary_image?.image || '/placeholder.svg';
    
    return {
      id: basicAd.id,
      title: basicAd.title,
      category: basicAd.category.name,
      price: basicAd.display_price,
      location: `${basicAd.city.name}, ${basicAd.state.code}`,
      image: fallbackImage,
      views: basicAd.view_count,
      timeAgo: basicAd.time_since_posted,
      postedDate: new Date(basicAd.created_at),
      featured: basicAd.is_featured_active,
      description: basicAd.description,
      phone: undefined,
      email: undefined,
      images: [fallbackImage],
    };
  }, []);

  return {
    loading,
    error,
    fetchAdDetails,
    transformToModalListing,
    createFallbackModalListing,
  };
};
