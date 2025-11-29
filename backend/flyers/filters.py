import django_filters
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from .models import DesiFavorite, Event, Service


# ============================================================================
# DESI FAVORITES FILTERS
# ============================================================================

class DesiFavoriteFilter(django_filters.FilterSet):
    """Filter for Desi Favorites listings."""

    # Location Filters
    category = django_filters.ChoiceFilter(
        field_name='category',
        help_text='Filter by category'
    )
    city = django_filters.NumberFilter(
        field_name='city__id',
        help_text='Filter by city ID'
    )
    state = django_filters.CharFilter(
        field_name='state__code',
        lookup_expr='iexact',
        help_text='Filter by state code (e.g., IL, TX)'
    )

    # Cross-state search
    search_states = django_filters.CharFilter(
        method='filter_search_states',
        help_text='Comma-separated state codes for cross-state search (e.g., IL,TX,FL)'
    )

    # Date Filters
    posted_since = django_filters.NumberFilter(
        method='filter_posted_since',
        help_text='Filter flyers posted within last N days'
    )
    posted_after = django_filters.DateTimeFilter(
        field_name='created_at',
        lookup_expr='gte',
        help_text='Filter flyers posted after this date (ISO format)'
    )

    class Meta:
        model = DesiFavorite
        fields = ['category', 'city', 'state', 'search_states', 'posted_since']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Dynamically set category choices from model
        self.filters['category'].extra['choices'] = DesiFavorite.CATEGORY_CHOICES

    def filter_posted_since(self, queryset, name, value):
        """Filter flyers posted within specified number of days."""
        if value:
            since = timezone.now() - timedelta(days=value)
            return queryset.filter(created_at__gte=since)
        return queryset

    def filter_search_states(self, queryset, name, value):
        """Filter flyers by multiple states (comma-separated state codes)."""
        if value:
            state_codes = [s.strip().upper() for s in value.split(',')]
            return queryset.filter(state__code__in=state_codes)
        return queryset


# ============================================================================
# EVENTS FILTERS
# ============================================================================

class EventFilter(django_filters.FilterSet):
    """Filter for Events listings."""

    # Location Filters
    category = django_filters.ChoiceFilter(
        field_name='category',
        help_text='Filter by category'
    )
    city = django_filters.NumberFilter(
        field_name='city__id',
        help_text='Filter by city ID'
    )
    state = django_filters.CharFilter(
        field_name='state__code',
        lookup_expr='iexact',
        help_text='Filter by state code (e.g., IL, TX)'
    )

    # Cross-state search
    search_states = django_filters.CharFilter(
        method='filter_search_states',
        help_text='Comma-separated state codes for cross-state search (e.g., IL,TX,FL)'
    )

    # Event Date Filters
    event_date_from = django_filters.DateTimeFilter(
        field_name='event_date',
        lookup_expr='gte',
        help_text='Filter events starting from this date (ISO format)'
    )
    event_date_to = django_filters.DateTimeFilter(
        field_name='event_date',
        lookup_expr='lte',
        help_text='Filter events up to this date (ISO format)'
    )
    upcoming = django_filters.BooleanFilter(
        method='filter_upcoming',
        help_text='Filter upcoming events only (true/false)'
    )
    is_free = django_filters.BooleanFilter(
        field_name='is_free',
        help_text='Filter free events (true/false)'
    )

    # Posted Date Filters
    posted_since = django_filters.NumberFilter(
        method='filter_posted_since',
        help_text='Filter events posted within last N days'
    )
    posted_after = django_filters.DateTimeFilter(
        field_name='created_at',
        lookup_expr='gte',
        help_text='Filter events posted after this date (ISO format)'
    )

    class Meta:
        model = Event
        fields = [
            'category', 'city', 'state', 'search_states',
            'event_date_from', 'event_date_to', 'upcoming', 'is_free',
            'posted_since'
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Dynamically set category choices from model
        self.filters['category'].extra['choices'] = Event.CATEGORY_CHOICES

    def filter_upcoming(self, queryset, name, value):
        """Filter upcoming events only."""
        if value:
            return queryset.filter(event_date__gte=timezone.now())
        return queryset

    def filter_posted_since(self, queryset, name, value):
        """Filter events posted within specified number of days."""
        if value:
            since = timezone.now() - timedelta(days=value)
            return queryset.filter(created_at__gte=since)
        return queryset

    def filter_search_states(self, queryset, name, value):
        """Filter events by multiple states (comma-separated state codes)."""
        if value:
            state_codes = [s.strip().upper() for s in value.split(',')]
            return queryset.filter(state__code__in=state_codes)
        return queryset


# ============================================================================
# SERVICES FILTERS
# ============================================================================

class ServiceFilter(django_filters.FilterSet):
    """Filter for Services listings."""

    # Location Filters
    category = django_filters.ChoiceFilter(
        field_name='category',
        help_text='Filter by category'
    )
    city = django_filters.NumberFilter(
        field_name='city__id',
        help_text='Filter by city ID'
    )
    state = django_filters.CharFilter(
        field_name='state__code',
        lookup_expr='iexact',
        help_text='Filter by state code (e.g., IL, TX)'
    )

    # Cross-state search
    search_states = django_filters.CharFilter(
        method='filter_search_states',
        help_text='Comma-separated state codes for cross-state search (e.g., IL,TX,FL)'
    )

    # Experience Filters
    years_experience_min = django_filters.NumberFilter(
        field_name='years_experience',
        lookup_expr='gte',
        help_text='Minimum years of experience'
    )
    years_experience_max = django_filters.NumberFilter(
        field_name='years_experience',
        lookup_expr='lte',
        help_text='Maximum years of experience'
    )

    # Date Filters
    posted_since = django_filters.NumberFilter(
        method='filter_posted_since',
        help_text='Filter services posted within last N days'
    )
    posted_after = django_filters.DateTimeFilter(
        field_name='created_at',
        lookup_expr='gte',
        help_text='Filter services posted after this date (ISO format)'
    )

    class Meta:
        model = Service
        fields = [
            'category', 'city', 'state', 'search_states',
            'years_experience_min', 'years_experience_max',
            'posted_since'
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Dynamically set category choices from model
        self.filters['category'].extra['choices'] = Service.CATEGORY_CHOICES

    def filter_posted_since(self, queryset, name, value):
        """Filter services posted within specified number of days."""
        if value:
            since = timezone.now() - timedelta(days=value)
            return queryset.filter(created_at__gte=since)
        return queryset

    def filter_search_states(self, queryset, name, value):
        """Filter services by multiple states (comma-separated state codes)."""
        if value:
            state_codes = [s.strip().upper() for s in value.split(',')]
            return queryset.filter(state__code__in=state_codes)
        return queryset


# USAGE DOCUMENTATION
"""
API USAGE EXAMPLES:

1. DESI FAVORITES (/api/flyers/favorites/):
   - ?category=restaurants&city=1
   - ?state=IL&posted_since=7
   - ?search_states=IL,TX,FL (cross-state search)
   - ?search=pizza (combined with DRF SearchFilter)

2. EVENTS (/api/flyers/events/):
   - ?category=festivals&city=1&is_free=true
   - ?upcoming=true&state=IL
   - ?event_date_from=2025-01-01&event_date_to=2025-12-31
   - ?search_states=IL,TX,FL (cross-state search)
   - ?search=diwali (combined with DRF SearchFilter)

3. SERVICES (/api/flyers/services/):
   - ?category=home_services&city=1
   - ?years_experience_min=5&state=IL
   - ?search_states=IL,TX,FL (cross-state search)
   - ?search=plumbing (combined with DRF SearchFilter)

BENEFITS:
✅ Consistent filtering across all three flyer types
✅ Cross-state search support
✅ Date-based filtering
✅ Category-specific filtering
✅ Easy to extend with additional filters
"""
