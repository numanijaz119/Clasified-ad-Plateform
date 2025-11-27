// Flyer types for Desi Favorites
export interface FlyerContact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface Flyer {
  id: number;
  title: string;
  description: string;
  images: string[];
  category: string;
  location: string;
  date?: string;
  contact?: FlyerContact;
}

export interface FlyerListParams {
  category?: string;
  location?: string;
  search?: string;
  page?: number;
  page_size?: number;
}
