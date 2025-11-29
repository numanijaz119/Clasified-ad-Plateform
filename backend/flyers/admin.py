from django.contrib import admin
from django.utils.html import format_html
from .models import (
    DesiFavorite,
    DesiFavoriteImage,
    Event,
    EventImage,
    Service,
    ServiceImage,
)


class DesiFavoriteImageInline(admin.TabularInline):
    """Inline admin for Desi Favorite images."""
    model = DesiFavoriteImage
    extra = 1
    fields = ['image', 'caption', 'is_primary', 'sort_order']


@admin.register(DesiFavorite)
class DesiFavoriteAdmin(admin.ModelAdmin):
    """Admin interface for Desi Favorites."""

    list_display = [
        'title',
        'category',
        'location_display',
        'status',
        'view_count',
        'created_at',
        'user',
    ]
    list_filter = [
        'status',
        'category',
        'state',
        'city',
        'is_active',
        'created_at',
    ]
    search_fields = [
        'title',
        'description',
        'location',
        'contact_phone',
        'contact_email',
    ]
    readonly_fields = [
        'slug',
        'view_count',
        'created_at',
        'updated_at',
        'approved_at',
    ]
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title',
                'slug',
                'description',
                'category',
            )
        }),
        ('Location', {
            'fields': (
                'location',
                'city',
                'state',
            )
        }),
        ('Contact Information', {
            'fields': (
                'contact_phone',
                'contact_email',
                'website',
            )
        }),
        ('Status & Ownership', {
            'fields': (
                'user',
                'status',
                'is_active',
            )
        }),
        ('Analytics', {
            'fields': (
                'view_count',
            )
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
        ('Admin Fields', {
            'fields': (
                'approved_at',
                'approved_by',
                'admin_notes',
            ),
            'classes': ('collapse',),
        }),
    )
    inlines = [DesiFavoriteImageInline]
    date_hierarchy = 'created_at'

    def location_display(self, obj):
        return f"{obj.city.name}, {obj.state.code}"
    location_display.short_description = 'Location'


class EventImageInline(admin.TabularInline):
    """Inline admin for Event images."""
    model = EventImage
    extra = 1
    fields = ['image', 'caption', 'is_primary', 'sort_order']


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    """Admin interface for Events."""

    list_display = [
        'title',
        'category',
        'event_date',
        'location_display',
        'status',
        'is_free',
        'view_count',
        'user',
    ]
    list_filter = [
        'status',
        'category',
        'state',
        'city',
        'is_free',
        'is_active',
        'event_date',
        'created_at',
    ]
    search_fields = [
        'title',
        'description',
        'location',
        'contact_phone',
        'contact_email',
    ]
    readonly_fields = [
        'slug',
        'view_count',
        'created_at',
        'updated_at',
        'approved_at',
        'is_upcoming',
        'is_past',
    ]
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title',
                'slug',
                'description',
                'category',
            )
        }),
        ('Event Date & Time', {
            'fields': (
                'event_date',
                'end_date',
                'is_upcoming',
                'is_past',
            )
        }),
        ('Location', {
            'fields': (
                'location',
                'city',
                'state',
            )
        }),
        ('Contact Information', {
            'fields': (
                'contact_phone',
                'contact_email',
                'website',
            )
        }),
        ('Registration & Tickets', {
            'fields': (
                'is_free',
                'registration_url',
            )
        }),
        ('Status & Ownership', {
            'fields': (
                'user',
                'status',
                'is_active',
            )
        }),
        ('Analytics', {
            'fields': (
                'view_count',
            )
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
        ('Admin Fields', {
            'fields': (
                'approved_at',
                'approved_by',
                'admin_notes',
            ),
            'classes': ('collapse',),
        }),
    )
    inlines = [EventImageInline]
    date_hierarchy = 'event_date'

    def location_display(self, obj):
        return f"{obj.city.name}, {obj.state.code}"
    location_display.short_description = 'Location'


class ServiceImageInline(admin.TabularInline):
    """Inline admin for Service images."""
    model = ServiceImage
    extra = 1
    fields = ['image', 'caption', 'is_primary', 'sort_order']


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    """Admin interface for Services."""

    list_display = [
        'title',
        'category',
        'location_display',
        'pricing_info',
        'status',
        'view_count',
        'user',
    ]
    list_filter = [
        'status',
        'category',
        'state',
        'city',
        'is_active',
        'created_at',
    ]
    search_fields = [
        'title',
        'description',
        'location',
        'contact_phone',
        'contact_email',
        'service_areas',
    ]
    readonly_fields = [
        'slug',
        'view_count',
        'created_at',
        'updated_at',
        'approved_at',
    ]
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title',
                'slug',
                'description',
                'category',
            )
        }),
        ('Location', {
            'fields': (
                'location',
                'city',
                'state',
                'service_areas',
            )
        }),
        ('Contact Information', {
            'fields': (
                'contact_phone',
                'contact_email',
                'website',
            )
        }),
        ('Pricing & Availability', {
            'fields': (
                'pricing_info',
                'availability',
            )
        }),
        ('Credentials & Experience', {
            'fields': (
                'years_experience',
                'certifications',
            )
        }),
        ('Status & Ownership', {
            'fields': (
                'user',
                'status',
                'is_active',
            )
        }),
        ('Analytics', {
            'fields': (
                'view_count',
            )
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
        ('Admin Fields', {
            'fields': (
                'approved_at',
                'approved_by',
                'admin_notes',
            ),
            'classes': ('collapse',),
        }),
    )
    inlines = [ServiceImageInline]
    date_hierarchy = 'created_at'

    def location_display(self, obj):
        return f"{obj.city.name}, {obj.state.code}"
    location_display.short_description = 'Location'


# Register Image models separately if needed
@admin.register(DesiFavoriteImage)
class DesiFavoriteImageAdmin(admin.ModelAdmin):
    list_display = ['flyer', 'is_primary', 'sort_order', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['flyer__title', 'caption']


@admin.register(EventImage)
class EventImageAdmin(admin.ModelAdmin):
    list_display = ['event', 'is_primary', 'sort_order', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['event__title', 'caption']


@admin.register(ServiceImage)
class ServiceImageAdmin(admin.ModelAdmin):
    list_display = ['service', 'is_primary', 'sort_order', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['service__title', 'caption']
