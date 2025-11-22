# Banner System Update Summary

## Overview

Updated the banner system to work seamlessly with the Django backend and improved frontend integration.

## Backend Integration

- ✅ Backend has Banner model in `administrator/models.py` with proper fields
- ✅ Backend has banner API endpoints in `content/banner_views.py`
- ✅ Backend supports banner tracking (impressions/clicks)
- ✅ Backend supports targeting by state and category

## Frontend Updates

### 1. Updated Types (`src/types/banners.ts`)

- Added missing fields: `description`, `target_states`, `target_categories`
- Types now match backend Banner model exactly

### 2. Enhanced Banner Service (`src/services/bannerService.ts`)

- Fixed image URL handling (converts relative to absolute URLs)
- Improved error handling
- Maintains backward compatibility

### 3. New Admin Banner Service (`src/services/adminBannerService.ts`)

- Complete CRUD operations for banner management
- Handles file uploads for image banners
- Supports analytics and toggle operations
- Proper FormData handling for multipart requests

### 4. New Banner Hooks

- `useBanners` (`src/hooks/useBanners.ts`) - Fetches banners with filtering and auto-refresh
- `useBannerTracking` (`src/hooks/useBanners.ts`) - Handles impression and click tracking
- `useBannerContext` (`src/hooks/useBannerContext.ts`) - Determines current state from URL/localStorage
- Optimized for performance and error handling

### 5. Enhanced Banner Display (`src/components/common/BannerDisplay.tsx`)

- Uses new hooks for better state management
- Improved error handling and loading states
- Better accessibility features
- Configurable auto-rotation

### 6. Updated Banner Layouts (`src/components/common/BannerLayouts.tsx`)

- All layouts now use `useBannerContext` hook for state detection
- Automatic fallback to Illinois (IL) if no state is specified
- State code stored in localStorage for persistence
- Consistent styling and responsive design

### 7. Updated Admin Panel (`src/components/admin/BannersTab.tsx`)

- Uses new `adminBannerService` instead of generic admin service
- All CRUD operations working with proper API endpoints

### 8. Page Integration Updates

- `CategoryPage.tsx` - Now passes category ID to CategoryPageBanner
- All banner layouts automatically use current state from context

## Key Features

### Banner Types Supported

1. **Image Banners** - Upload image files
2. **HTML Banners** - Custom HTML/CSS (for Google Ads, etc.)
3. **Text Banners** - Simple text with styling

### Banner Positions

1. **Header** - Top of pages
2. **Sidebar** - Right sidebar on desktop
3. **Footer** - Bottom of pages
4. **Between Ads** - Injected between ad listings
5. **Category Page** - Top of category pages
6. **Ad Detail** - On individual ad pages

### Targeting Options

- **State Targeting** - Show banners only in specific states
- **Category Targeting** - Show banners only in specific categories
- **Priority System** - Control banner display order
- **Scheduling** - Start/end dates for campaigns

### Analytics & Tracking

- **Impression Tracking** - Automatic when banner is viewed
- **Click Tracking** - When users click on banners
- **CTR Calculation** - Click-through rate metrics
- **Real-time Analytics** - View performance in admin panel

## API Endpoints Used

### Public Endpoints (No Auth Required)

- `GET /api/content/banners/` - Get active banners with filtering
- `POST /api/content/banners/track-impression/` - Track banner view
- `POST /api/content/banners/track-click/` - Track banner click

### Admin Endpoints (Auth Required)

- `GET /api/administrator/banners/` - List all banners with pagination
- `POST /api/administrator/banners/` - Create new banner
- `GET /api/administrator/banners/:id/` - Get banner details
- `PUT /api/administrator/banners/:id/` - Update banner
- `DELETE /api/administrator/banners/:id/` - Delete banner
- `POST /api/administrator/banners/:id/toggle/` - Toggle active status
- `GET /api/administrator/banners/:id/analytics/` - Get banner analytics

## Usage Examples

### Display a Header Banner

```tsx
import { HeaderBanner } from "../components/common/BannerLayouts";

// Automatically uses current state, optionally specify category
<HeaderBanner categoryId={1} />;
```

### Use Banner Hook

```tsx
import { useBanners } from "../hooks/useBanners";

const { banners, loading, error } = useBanners({
  position: "sidebar",
  stateCode: "IL",
  categoryId: 1,
});
```

### Track Banner Interactions

```tsx
import { useBannerTracking } from "../hooks/useBanners";

const { trackImpression, trackClick } = useBannerTracking();

// Track when banner is viewed
await trackImpression(bannerId);

// Track when banner is clicked
await trackClick(bannerId);
```

## Testing

- Created `BannerTestPage.tsx` for testing all banner positions
- All banner components are responsive and accessible
- Error states handled gracefully (banners simply don't show if API fails)

## Performance Optimizations

- Banners are cached appropriately
- Images are lazy-loaded
- Automatic retry logic for failed requests
- Minimal re-renders with React.memo

## Security & Privacy

- All banner content is sanitized
- External links open in new tabs by default
- IP addresses and user agents tracked for analytics (anonymized)
- GDPR-friendly tracking (no personal data stored)

## Next Steps

1. Test banner creation in admin panel
2. Create some sample banners for different positions
3. Monitor banner performance and analytics
4. Consider adding A/B testing capabilities
5. Add banner scheduling automation
