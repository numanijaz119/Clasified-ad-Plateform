from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DesiFavoriteViewSet, EventViewSet, ServiceViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'favorites', DesiFavoriteViewSet, basename='desi-favorite')
router.register(r'events', EventViewSet, basename='event')
router.register(r'services', ServiceViewSet, basename='service')

app_name = 'flyers'

urlpatterns = [
    path('', include(router.urls)),
]

# Available endpoints:
#
# Desi Favorites:
# - GET    /api/flyers/favorites/                 - List all Desi Favorites
# - POST   /api/flyers/favorites/                 - Create new Desi Favorite
# - GET    /api/flyers/favorites/<slug>/          - Get Desi Favorite detail
# - PUT    /api/flyers/favorites/<slug>/          - Update Desi Favorite
# - PATCH  /api/flyers/favorites/<slug>/          - Partial update Desi Favorite
# - DELETE /api/flyers/favorites/<slug>/          - Delete Desi Favorite
# - GET    /api/flyers/favorites/my_favorites/    - Get current user's Desi Favorites
# - GET    /api/flyers/favorites/categories/      - Get list of categories with counts
#
# Events:
# - GET    /api/flyers/events/                    - List all Events
# - POST   /api/flyers/events/                    - Create new Event
# - GET    /api/flyers/events/<slug>/             - Get Event detail
# - PUT    /api/flyers/events/<slug>/             - Update Event
# - PATCH  /api/flyers/events/<slug>/             - Partial update Event
# - DELETE /api/flyers/events/<slug>/             - Delete Event
# - GET    /api/flyers/events/my_events/          - Get current user's Events
# - GET    /api/flyers/events/upcoming/           - Get upcoming events
# - GET    /api/flyers/events/past/               - Get past events
# - GET    /api/flyers/events/categories/         - Get list of categories with counts
#
# Services:
# - GET    /api/flyers/services/                  - List all Services
# - POST   /api/flyers/services/                  - Create new Service
# - GET    /api/flyers/services/<slug>/           - Get Service detail
# - PUT    /api/flyers/services/<slug>/           - Update Service
# - PATCH  /api/flyers/services/<slug>/           - Partial update Service
# - DELETE /api/flyers/services/<slug>/           - Delete Service
# - GET    /api/flyers/services/my_services/      - Get current user's Services
# - GET    /api/flyers/services/categories/       - Get list of categories with counts
#
# Query Parameters (all endpoints):
# - search=<text>           - Search in title, description, location
# - category=<category>     - Filter by category
# - city=<city_id>          - Filter by city ID
# - state=<state_code>      - Filter by state code (e.g., IL, TX)
# - search_states=IL,TX,FL  - Cross-state search
# - posted_since=7          - Filter items posted within last N days
# - ordering=-created_at    - Sort results (created_at, title, view_count, etc.)
# - page=1                  - Pagination
# - page_size=20            - Items per page
