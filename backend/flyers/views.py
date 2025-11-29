from rest_framework import status, filters
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
import logging

from core.simple_mixins import StateAwareViewMixin
from core.pagination import SearchResultsPagination
from core.permissions import IsOwnerOrReadOnly

from .models import DesiFavorite, Event, Service
from .serializers import (
    DesiFavoriteListSerializer,
    DesiFavoriteDetailSerializer,
    DesiFavoriteCreateUpdateSerializer,
    EventListSerializer,
    EventDetailSerializer,
    EventCreateUpdateSerializer,
    ServiceListSerializer,
    ServiceDetailSerializer,
    ServiceCreateUpdateSerializer,
)
from .filters import DesiFavoriteFilter, EventFilter, ServiceFilter

logger = logging.getLogger(__name__)


class DesiFavoriteViewSet(StateAwareViewMixin, ModelViewSet):
    """ViewSet for Desi Favorites with state-aware filtering."""

    pagination_class = SearchResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = DesiFavoriteFilter

    # State filtering configuration
    state_field_path = 'state__code'
    allow_cross_state = True

    # Search configuration
    search_fields = [
        'title',
        'description',
        'location',
        'category',
    ]

    # Ordering configuration
    ordering_fields = ['created_at', 'title', 'view_count']
    ordering = ['-created_at']

    lookup_field = 'slug'
    lookup_url_kwarg = 'slug'

    def get_queryset(self):
        """Get queryset based on action and user."""
        if self.action == 'my_favorites':
            # User's own flyers
            return DesiFavorite.objects.filter(
                user=self.request.user
            ).select_related('city', 'state', 'user').prefetch_related('images')

        # Public listing - only approved, active flyers
        return DesiFavorite.objects.filter(
            status='approved',
            is_active=True
        ).select_related('city', 'state', 'user').prefetch_related('images')

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action in ['create', 'update', 'partial_update']:
            return DesiFavoriteCreateUpdateSerializer
        elif self.action == 'retrieve':
            return DesiFavoriteDetailSerializer
        return DesiFavoriteListSerializer

    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['create', 'my_favorites']:
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsOwnerOrReadOnly()]
        return [AllowAny()]

    def retrieve(self, request, *args, **kwargs):
        """Get detailed view and track the view."""
        instance = self.get_object()

        # Check permissions for non-approved flyers
        if instance.status != 'approved' and instance.user != request.user:
            return Response(
                {'error': 'Desi Favorite not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Track the view for approved flyers
        if instance.status == 'approved':
            instance.increment_view_count()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        """Create a new Desi Favorite."""
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """Update existing Desi Favorite."""
        serializer.save()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_favorites(self, request):
        """Get current user's Desi Favorites."""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = DesiFavoriteListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = DesiFavoriteListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get list of all categories with counts."""
        from .models import DesiFavorite
        categories = []
        for category_value, category_label in DesiFavorite.CATEGORY_CHOICES:
            count = DesiFavorite.objects.filter(
                category=category_value,
                status='approved',
                is_active=True
            ).count()
            categories.append({
                'value': category_value,
                'label': str(category_label),
                'count': count
            })
        return Response(categories)


class EventViewSet(StateAwareViewMixin, ModelViewSet):
    """ViewSet for Events with state-aware filtering."""

    pagination_class = SearchResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = EventFilter

    # State filtering configuration
    state_field_path = 'state__code'
    allow_cross_state = True

    # Search configuration
    search_fields = [
        'title',
        'description',
        'location',
        'category',
    ]

    # Ordering configuration
    ordering_fields = ['created_at', 'event_date', 'title', 'view_count']
    ordering = ['event_date']  # Default: upcoming events first

    lookup_field = 'slug'
    lookup_url_kwarg = 'slug'

    def get_queryset(self):
        """Get queryset based on action and user."""
        if self.action == 'my_events':
            # User's own events
            return Event.objects.filter(
                user=self.request.user
            ).select_related('city', 'state', 'user').prefetch_related('images')

        # Public listing - only approved, active events
        queryset = Event.objects.filter(
            status='approved',
            is_active=True
        ).select_related('city', 'state', 'user').prefetch_related('images')

        # Filter upcoming events by default for list view
        if self.action == 'list' and self.request.query_params.get('show_past') != 'true':
            queryset = queryset.filter(event_date__gte=timezone.now())

        return queryset

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action in ['create', 'update', 'partial_update']:
            return EventCreateUpdateSerializer
        elif self.action == 'retrieve':
            return EventDetailSerializer
        return EventListSerializer

    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['create', 'my_events']:
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsOwnerOrReadOnly()]
        return [AllowAny()]

    def retrieve(self, request, *args, **kwargs):
        """Get detailed view and track the view."""
        instance = self.get_object()

        # Check permissions for non-approved events
        if instance.status != 'approved' and instance.user != request.user:
            return Response(
                {'error': 'Event not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Track the view for approved events
        if instance.status == 'approved':
            instance.increment_view_count()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        """Create a new Event."""
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """Update existing Event."""
        serializer.save()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_events(self, request):
        """Get current user's Events."""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = EventListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = EventListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming events only."""
        queryset = self.get_queryset().filter(event_date__gte=timezone.now())
        queryset = self.filter_queryset(queryset)
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = EventListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = EventListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def past(self, request):
        """Get past events only."""
        queryset = self.get_queryset().filter(event_date__lt=timezone.now())
        queryset = self.filter_queryset(queryset)
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = EventListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = EventListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get list of all categories with counts."""
        from .models import Event
        categories = []
        for category_value, category_label in Event.CATEGORY_CHOICES:
            count = Event.objects.filter(
                category=category_value,
                status='approved',
                is_active=True,
                event_date__gte=timezone.now()
            ).count()
            categories.append({
                'value': category_value,
                'label': str(category_label),
                'count': count
            })
        return Response(categories)


class ServiceViewSet(StateAwareViewMixin, ModelViewSet):
    """ViewSet for Services with state-aware filtering."""

    pagination_class = SearchResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ServiceFilter

    # State filtering configuration
    state_field_path = 'state__code'
    allow_cross_state = True

    # Search configuration
    search_fields = [
        'title',
        'description',
        'location',
        'category',
        'service_areas',
    ]

    # Ordering configuration
    ordering_fields = ['created_at', 'title', 'view_count', 'years_experience']
    ordering = ['-created_at']

    lookup_field = 'slug'
    lookup_url_kwarg = 'slug'

    def get_queryset(self):
        """Get queryset based on action and user."""
        if self.action == 'my_services':
            # User's own services
            return Service.objects.filter(
                user=self.request.user
            ).select_related('city', 'state', 'user').prefetch_related('images')

        # Public listing - only approved, active services
        return Service.objects.filter(
            status='approved',
            is_active=True
        ).select_related('city', 'state', 'user').prefetch_related('images')

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action in ['create', 'update', 'partial_update']:
            return ServiceCreateUpdateSerializer
        elif self.action == 'retrieve':
            return ServiceDetailSerializer
        return ServiceListSerializer

    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['create', 'my_services']:
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsOwnerOrReadOnly()]
        return [AllowAny()]

    def retrieve(self, request, *args, **kwargs):
        """Get detailed view and track the view."""
        instance = self.get_object()

        # Check permissions for non-approved services
        if instance.status != 'approved' and instance.user != request.user:
            return Response(
                {'error': 'Service not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Track the view for approved services
        if instance.status == 'approved':
            instance.increment_view_count()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        """Create a new Service."""
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """Update existing Service."""
        serializer.save()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_services(self, request):
        """Get current user's Services."""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = ServiceListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = ServiceListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get list of all categories with counts."""
        from .models import Service
        categories = []
        for category_value, category_label in Service.CATEGORY_CHOICES:
            count = Service.objects.filter(
                category=category_value,
                status='approved',
                is_active=True
            ).count()
            categories.append({
                'value': category_value,
                'label': str(category_label),
                'count': count
            })
        return Response(categories)
