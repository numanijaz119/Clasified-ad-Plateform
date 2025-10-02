# API Integration Documentation

## Overview

This document outlines the complete integration between the Django backend and React TypeScript frontend for the Classified Ad Platform.

## Project Structure

```
Frontend/
├── src/
│   ├── components/
│   │   ├── auth/                 # Authentication components
│   │   │   ├── SignInForm.tsx    # Uses auth context
│   │   │   ├── SignUpForm.tsx    # Uses auth context
│   │   │   ├── EmailVerification.tsx # Uses auth context
│   │   │   └── GoogleSignInButton.tsx
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext.tsx       # Centralized auth state management
│   ├── services/
│   │   ├── authService.ts        # Authentication API calls
│   │   ├── adsService.ts         # Ads API calls
│   │   ├── contentService.ts     # Content API calls
│   │   ├── baseApiService.ts     # Base API service with common functionality
│   │   └── index.ts              # Service exports and utilities
│   ├── types/
│   │   ├── auth.ts               # Authentication types
│   │   ├── ads.ts                # Ads types
│   │   └── content.ts            # Content types
│   ├── config/
│   │   └── api.ts                # API configuration and endpoints
│   └── ...
```

## Backend API Endpoints

### Authentication (`/api/auth/`)

- `POST /register/` - User registration
- `POST /login/` - User login
- `POST /logout/` - User logout
- `POST /google-login/` - Google OAuth login
- `POST /verify-email/` - Email verification
- `POST /verify-email/resend/` - Resend verification email
- `GET /profile/` - Get user profile
- `PUT /profile/update/` - Update user profile
- `POST /password/forgot/` - Forgot password
- `POST /password/reset/` - Reset password
- `POST /password/change/` - Change password
- `DELETE /delete-account/` - Delete user account
- `POST /token/refresh/` - Refresh JWT token

### Ads (`/api/ads/`)

- `GET /ads/` - List ads with filtering
- `POST /ads/` - Create new ad
- `GET /ads/search/` - Search ads
- `GET /ads/featured/` - Get featured ads
- `GET /ads/{slug}/` - Get ad details
- `PUT /ads/{slug}/` - Update ad
- `DELETE /ads/{slug}/` - Delete ad
- `GET /ads/my_ads/` - Get user's ads
- `GET /ads/{slug}/analytics/` - Get ad analytics
- `POST /ads/{slug}/contact_view/` - Track contact view
- `POST /ads/{slug}/promote/` - Promote ad to featured
- `GET/POST /images/` - Manage ad images
- `GET/POST /favorites/` - Manage favorites
- `POST /favorites/remove/` - Remove favorite
- `GET/POST /reports/` - Report ads
- `GET /dashboard/analytics/` - User dashboard analytics

### Content (`/api/content/`)

- `GET /categories/` - Get all categories
- `GET /cities/` - Get all cities
- `GET /states/` - Get all states

## Frontend Services

### AuthService

Handles all authentication-related API calls:

- User registration and login
- Email verification
- Password management
- Profile management
- Token refresh and logout

### AdsService

Handles all ad-related API calls:

- CRUD operations for ads
- Search and filtering
- Image management
- Favorites and reports
- Analytics and dashboard data

### ContentService

Handles content-related API calls:

- Categories, cities, and states
- Location search
- Content statistics
- Caching for performance

## Authentication Flow

1. **Registration**: User registers → Backend sends verification email → User verifies email
2. **Login**: User logs in → Backend returns JWT tokens → Frontend stores tokens
3. **Token Refresh**: When access token expires → Backend refreshes using refresh token
4. **Logout**: Frontend calls logout endpoint → Backend blacklists refresh token

## Auth Context Integration

All authentication components now use the centralized `AuthContext` instead of direct service calls:

```typescript
// Before (direct service call)
await authService.login(credentials);

// After (using context)
const { login } = useAuth();
await login(credentials);
```

Benefits:

- Centralized state management
- Consistent error handling
- Automatic UI updates
- Better separation of concerns

## Type Safety

Comprehensive TypeScript types ensure type safety across the application:

- **Auth Types**: User, LoginRequest, RegisterResponse, etc.
- **Ads Types**: Ad, CreateAdRequest, AdAnalytics, etc.
- **Content Types**: Category, City, State, etc.

## Error Handling

Consistent error handling across all services:

- Network errors with retry logic
- Token refresh on 401 errors
- Detailed error messages from backend
- User-friendly error display

## API Configuration

Centralized API configuration in `src/config/api.ts`:

- Base URL configuration
- All endpoint definitions
- Request headers management
- Timeout and retry settings

## Key Features Implemented

### Authentication

✅ User registration with email verification
✅ Login/logout with JWT tokens
✅ Google OAuth integration
✅ Password reset functionality
✅ Profile management
✅ Account deletion

### Ads Management

✅ Create, read, update, delete ads
✅ Image upload and management
✅ Search and filtering
✅ Favorites system
✅ Reporting system
✅ Analytics and dashboard
✅ Featured ads promotion

### Content Management

✅ Categories hierarchy
✅ Cities and states
✅ Location search
✅ Content statistics
✅ Caching for performance

## Usage Examples

### Authentication

```typescript
import { useAuth } from "../contexts/AuthContext";

const MyComponent = () => {
  const { login, user, isLoading, error } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      // User is automatically logged in and state updated
    } catch (error) {
      // Error is handled by context and displayed in UI
    }
  };
};
```

### Ads Management

```typescript
import { adsService } from "../services";

// Get ads with filtering
const ads = await adsService.getAds({
  category: "electronics",
  city: "chicago",
  price_max: 1000,
});

// Create new ad
const newAd = await adsService.createAd({
  title: "iPhone 13",
  description: "Excellent condition",
  price: 800,
  category: 1,
  city: 1,
  // ... other fields
});
```

### Content Management

```typescript
import { contentService } from "../services";

// Get categories with caching
const categories = await contentService.getCategories();

// Search locations
const results = await contentService.searchLocations("chicago");
```

## Security Considerations

- JWT tokens stored in localStorage
- Automatic token refresh
- CSRF protection
- Input validation
- Secure password handling
- OAuth integration

## Performance Optimizations

- Service caching for content data
- Lazy loading of components
- Image optimization
- Request deduplication
- Error retry logic

## Recent Updates

### ✅ **Completed Integration Updates**

1. **Main App Setup**:

   - Updated `main.tsx` to wrap the app with `AuthProvider`
   - Simplified `App.tsx` to use auth context instead of local auth state management
   - Removed all direct `authServic` calls from `App.tsx`

2. **Auth Components Integration**:

   - `SignInForm.tsx` - Now uses auth context exclusively
   - `SignUpForm.tsx` - Now uses auth context exclusively
   - `EmailVerification.tsx` - Now uses auth context exclusively
   - `GoogleSignInButton.tsx` - Updated to use auth context

3. **Google Auth Utility**:

   - Refactored `googleAuth.ts` to accept callback functions instead of direct service calls
   - Now properly integrates with auth context pattern

4. **Complete Service Integration**:
   - All auth components now use centralized auth context
   - No direct `authService` calls in components
   - Consistent error handling and state management

### **Current Architecture**

```
AuthProvider (main.tsx)
├── App.tsx (uses useAuth hook)
├── Header.tsx (receives auth props from App)
├── Auth Components (use useAuth hook)
│   ├── SignInForm.tsx
│   ├── SignUpForm.tsx
│   ├── EmailVerification.tsx
│   └── GoogleSignInButton.tsx
└── Other Components (can use useAuth hook as needed)
```

## Next Steps

1. Add real-time notifications
2. Implement WebSocket for live updates
3. Add offline support
4. Implement advanced search filters
5. Add admin panel integration
6. Performance monitoring
7. SEO optimization

## Development Guidelines

1. Always use TypeScript types
2. Use auth context for authentication
3. Handle errors consistently
4. Cache static content
5. Follow naming conventions
6. Write comprehensive tests
7. Document API changes

This integration provides a robust, type-safe, and scalable foundation for the Classified Ad Platform.
