import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_CONFIG } from '../config/api';

interface StateInfo {
  id: number;
  name: string;
  code: string;
  domain: string;
  logo: string;
  favicon?: string;
  meta_title: string;
  meta_description: string;
  is_active: boolean;
  cities_count: number;
}

interface StateContextType {
  currentState: StateInfo | null;
  loading: boolean;
  refreshState: () => Promise<void>;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentState, setCurrentState] = useState<StateInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshState = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTENT.CURRENT_STATE}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch state');
      }
      
      const data = await response.json();
      setCurrentState(data);
      
      // Update document title, meta tags, logo, and favicon
      if (data) {
        updateSEO(data);
        updateBranding(data);
      }
    } catch (error) {
      // Silently fail - state detection is optional
    } finally {
      setLoading(false);
    }
  };

  const updateSEO = (state: StateInfo) => {
    // Update page title
    document.title = state.meta_title;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', state.meta_description);
    
    // Update Open Graph tags
    updateMetaTag('og:title', state.meta_title);
    updateMetaTag('og:description', state.meta_description);
    updateMetaTag('og:site_name', state.name);
    updateMetaTag('og:url', window.location.href);
    
    // Update Twitter Card tags
    updateMetaTag('twitter:title', state.meta_title);
    updateMetaTag('twitter:description', state.meta_description);
    updateMetaTag('twitter:card', 'summary_large_image');
  };

  const updateBranding = (state: StateInfo) => {
    // Update favicon
    if (state.favicon) {
      // Remove existing favicons
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(icon => icon.remove());
      
      // Add new favicon
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.type = 'image/x-icon';
      favicon.href = state.favicon;
      document.head.appendChild(favicon);
      
      // Add apple touch icon
      const appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      appleTouchIcon.href = state.favicon;
      document.head.appendChild(appleTouchIcon);
    }
    
    // Logo is accessed via currentState.logo in components
  };

  const updateMetaTag = (property: string, content: string) => {
    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement;
    }
    if (!meta) {
      meta = document.createElement('meta');
      if (property.startsWith('og:') || property.startsWith('twitter:')) {
        meta.setAttribute('property', property);
      } else {
        meta.setAttribute('name', property);
      }
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  useEffect(() => {
    refreshState();
  }, []);

  return (
    <StateContext.Provider value={{ currentState, loading, refreshState }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useStateContext must be used within a StateProvider');
  }
  return context;
};
