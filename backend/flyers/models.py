from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.validators import URLValidator
from datetime import timedelta
from core.utils import generate_unique_slug, generate_unique_filename

User = get_user_model()


class FlyerManager(models.Manager):
    """Custom manager for Flyer models with common filters."""

    def active(self):
        """Get active (approved) flyers."""
        return self.filter(status="approved", is_active=True)

    def for_state(self, state_code):
        """Get flyers for a specific state."""
        return self.filter(state__code__iexact=state_code)

    def by_category(self, category):
        """Get flyers by category."""
        return self.filter(category=category)

    def recent(self, days=7):
        """Get recent flyers within specified days."""
        since = timezone.now() - timedelta(days=days)
        return self.filter(created_at__gte=since)


class DesiFavorite(models.Model):
    """Model for Desi Favorites - Businesses, Restaurants, Stores, etc."""

    CATEGORY_CHOICES = [
        ("restaurants", _("Restaurants")),
        ("grocery_stores", _("Grocery Stores")),
        ("clothing", _("Clothing")),
        ("event_venues", _("Event Venues")),
        ("bakery", _("Bakery")),
        ("jewelry", _("Jewelry")),
        ("sweet_shops", _("Sweet Shops")),
        ("catering", _("Catering Services")),
        ("salon_spa", _("Salon & Spa")),
        ("electronics", _("Electronics")),
        ("home_decor", _("Home Decor")),
        ("bookstore", _("Bookstore")),
        ("travel_agency", _("Travel Agency")),
        ("temples", _("Temples & Religious Places")),
        ("other", _("Other")),
    ]

    STATUS_CHOICES = [
        ("draft", _("Draft")),
        ("pending", _("Pending Review")),
        ("approved", _("Approved")),
        ("rejected", _("Rejected")),
    ]

    # Basic Information
    title = models.CharField(
        _("Title"),
        max_length=255,
        help_text=_("Business or location name")
    )
    slug = models.SlugField(
        _("Slug"),
        unique=True,
        blank=True,
        help_text=_("URL-friendly version of the title"),
    )
    description = models.TextField(
        _("Description"),
        help_text=_("Detailed description of the business")
    )
    category = models.CharField(
        _("Category"),
        max_length=50,
        choices=CATEGORY_CHOICES,
        help_text=_("Business category")
    )

    # Location Information
    location = models.CharField(
        _("Location"),
        max_length=500,
        help_text=_("Full address or location description")
    )
    city = models.ForeignKey(
        "content.City",
        on_delete=models.CASCADE,
        related_name="desi_favorites",
        verbose_name=_("City"),
    )
    state = models.ForeignKey(
        "content.State",
        on_delete=models.CASCADE,
        related_name="desi_favorites",
        verbose_name=_("State"),
    )

    # Contact Information
    contact_phone = models.CharField(
        _("Contact Phone"),
        max_length=20,
        blank=True,
        help_text=_("Phone number for contact")
    )
    contact_email = models.EmailField(
        _("Contact Email"),
        blank=True,
        help_text=_("Email for contact")
    )
    website = models.URLField(
        _("Website"),
        blank=True,
        validators=[URLValidator()],
        help_text=_("Business website URL")
    )

    # Status & Ownership
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="desi_favorites",
        verbose_name=_("User")
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
        help_text=_("Current status of the flyer"),
        verbose_name=_("Status"),
    )
    is_active = models.BooleanField(
        _("Is Active"),
        default=True,
        help_text=_("Whether this flyer is currently active")
    )

    # Analytics
    view_count = models.PositiveIntegerField(
        _("View Count"),
        default=0,
        help_text=_("Number of times this flyer has been viewed")
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Admin fields
    approved_at = models.DateTimeField(_("Approved At"), null=True, blank=True)
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_desi_favorites",
        verbose_name=_("Approved By"),
    )
    admin_notes = models.TextField(
        _("Admin Notes"),
        blank=True,
        help_text=_("Internal notes for administrators")
    )

    objects = FlyerManager()

    class Meta:
        verbose_name = _("Desi Favorite")
        verbose_name_plural = _("Desi Favorites")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["category", "state", "status"]),
            models.Index(fields=["city", "status", "-created_at"]),
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["slug"]),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, self.title)
        super().save(*args, **kwargs)

    @property
    def primary_image(self):
        """Get the primary image for this flyer."""
        return self.images.filter(is_primary=True).first()

    def increment_view_count(self):
        """Increment view count."""
        self.view_count += 1
        self.save(update_fields=["view_count"])


class Event(models.Model):
    """Model for Events - Community Events, Festivals, Concerts, etc."""

    CATEGORY_CHOICES = [
        ("festivals", _("Festivals")),
        ("concerts", _("Concerts")),
        ("cultural_events", _("Cultural Events")),
        ("religious_events", _("Religious Events")),
        ("workshops", _("Workshops")),
        ("seminars", _("Seminars")),
        ("networking", _("Networking Events")),
        ("sports", _("Sports Events")),
        ("exhibitions", _("Exhibitions")),
        ("fundraisers", _("Fundraisers")),
        ("competitions", _("Competitions")),
        ("conferences", _("Conferences")),
        ("community_gatherings", _("Community Gatherings")),
        ("other", _("Other")),
    ]

    STATUS_CHOICES = [
        ("draft", _("Draft")),
        ("pending", _("Pending Review")),
        ("approved", _("Approved")),
        ("rejected", _("Rejected")),
        ("cancelled", _("Cancelled")),
        ("completed", _("Completed")),
    ]

    # Basic Information
    title = models.CharField(
        _("Title"),
        max_length=255,
        help_text=_("Event name")
    )
    slug = models.SlugField(
        _("Slug"),
        unique=True,
        blank=True,
        help_text=_("URL-friendly version of the title"),
    )
    description = models.TextField(
        _("Description"),
        help_text=_("Detailed description of the event")
    )
    category = models.CharField(
        _("Category"),
        max_length=50,
        choices=CATEGORY_CHOICES,
        help_text=_("Event category")
    )

    # Event Date & Time
    event_date = models.DateTimeField(
        _("Event Date & Time"),
        help_text=_("When the event takes place")
    )
    end_date = models.DateTimeField(
        _("Event End Date & Time"),
        null=True,
        blank=True,
        help_text=_("When the event ends (optional)")
    )

    # Location Information
    location = models.CharField(
        _("Location"),
        max_length=500,
        help_text=_("Event venue address or location description")
    )
    city = models.ForeignKey(
        "content.City",
        on_delete=models.CASCADE,
        related_name="events",
        verbose_name=_("City"),
    )
    state = models.ForeignKey(
        "content.State",
        on_delete=models.CASCADE,
        related_name="events",
        verbose_name=_("State"),
    )

    # Contact Information
    contact_phone = models.CharField(
        _("Contact Phone"),
        max_length=20,
        blank=True,
        help_text=_("Phone number for inquiries")
    )
    contact_email = models.EmailField(
        _("Contact Email"),
        blank=True,
        help_text=_("Email for inquiries")
    )
    website = models.URLField(
        _("Website"),
        blank=True,
        validators=[URLValidator()],
        help_text=_("Event website or registration URL")
    )

    # Registration & Tickets
    is_free = models.BooleanField(
        _("Free Event"),
        default=True,
        help_text=_("Whether this is a free event")
    )
    registration_url = models.URLField(
        _("Registration URL"),
        blank=True,
        validators=[URLValidator()],
        help_text=_("URL for event registration or ticket purchase")
    )

    # Status & Ownership
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="events",
        verbose_name=_("User")
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
        help_text=_("Current status of the event"),
        verbose_name=_("Status"),
    )
    is_active = models.BooleanField(
        _("Is Active"),
        default=True,
        help_text=_("Whether this event is currently active")
    )

    # Analytics
    view_count = models.PositiveIntegerField(
        _("View Count"),
        default=0,
        help_text=_("Number of times this event has been viewed")
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Admin fields
    approved_at = models.DateTimeField(_("Approved At"), null=True, blank=True)
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_events",
        verbose_name=_("Approved By"),
    )
    admin_notes = models.TextField(
        _("Admin Notes"),
        blank=True,
        help_text=_("Internal notes for administrators")
    )

    objects = FlyerManager()

    class Meta:
        verbose_name = _("Event")
        verbose_name_plural = _("Events")
        ordering = ["event_date"]
        indexes = [
            models.Index(fields=["status", "event_date"]),
            models.Index(fields=["category", "state", "status"]),
            models.Index(fields=["city", "status", "event_date"]),
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["slug"]),
            models.Index(fields=["event_date"]),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, self.title)
        super().save(*args, **kwargs)

    @property
    def primary_image(self):
        """Get the primary image for this event."""
        return self.images.filter(is_primary=True).first()

    @property
    def is_upcoming(self):
        """Check if event is upcoming."""
        return self.event_date > timezone.now()

    @property
    def is_past(self):
        """Check if event has passed."""
        return self.event_date < timezone.now()

    def increment_view_count(self):
        """Increment view count."""
        self.view_count += 1
        self.save(update_fields=["view_count"])


class Service(models.Model):
    """Model for Services - Professional Services, Home Services, etc."""

    CATEGORY_CHOICES = [
        ("home_services", _("Home Services")),
        ("legal_services", _("Legal Services")),
        ("beauty_wellness", _("Beauty & Wellness")),
        ("financial_services", _("Financial Services")),
        ("education", _("Education & Tutoring")),
        ("professional_services", _("Professional Services")),
        ("technology", _("Technology & IT Services")),
        ("healthcare", _("Healthcare Services")),
        ("automotive", _("Automotive Services")),
        ("real_estate", _("Real Estate Services")),
        ("photography", _("Photography & Videography")),
        ("event_planning", _("Event Planning")),
        ("translation", _("Translation Services")),
        ("consulting", _("Consulting Services")),
        ("repair_maintenance", _("Repair & Maintenance")),
        ("other", _("Other Services")),
    ]

    STATUS_CHOICES = [
        ("draft", _("Draft")),
        ("pending", _("Pending Review")),
        ("approved", _("Approved")),
        ("rejected", _("Rejected")),
    ]

    # Basic Information
    title = models.CharField(
        _("Title"),
        max_length=255,
        help_text=_("Service name or title")
    )
    slug = models.SlugField(
        _("Slug"),
        unique=True,
        blank=True,
        help_text=_("URL-friendly version of the title"),
    )
    description = models.TextField(
        _("Description"),
        help_text=_("Detailed description of the service")
    )
    category = models.CharField(
        _("Category"),
        max_length=50,
        choices=CATEGORY_CHOICES,
        help_text=_("Service category")
    )

    # Location Information
    location = models.CharField(
        _("Location"),
        max_length=500,
        help_text=_("Service area or business address")
    )
    city = models.ForeignKey(
        "content.City",
        on_delete=models.CASCADE,
        related_name="services",
        verbose_name=_("City"),
    )
    state = models.ForeignKey(
        "content.State",
        on_delete=models.CASCADE,
        related_name="services",
        verbose_name=_("State"),
    )

    # Service Areas (for services that cover multiple areas)
    service_areas = models.TextField(
        _("Service Areas"),
        blank=True,
        help_text=_("Comma-separated list of areas covered (optional)")
    )

    # Contact Information
    contact_phone = models.CharField(
        _("Contact Phone"),
        max_length=20,
        blank=True,
        help_text=_("Phone number for contact")
    )
    contact_email = models.EmailField(
        _("Contact Email"),
        blank=True,
        help_text=_("Email for contact")
    )
    website = models.URLField(
        _("Website"),
        blank=True,
        validators=[URLValidator()],
        help_text=_("Business website URL")
    )

    # Pricing Information
    pricing_info = models.CharField(
        _("Pricing Information"),
        max_length=255,
        default="Contact for pricing",
        help_text=_("Brief pricing information (e.g., 'Starting from $50/hour')")
    )

    # Availability
    availability = models.CharField(
        _("Availability"),
        max_length=255,
        blank=True,
        help_text=_("Business hours or availability (e.g., 'Mon-Fri 9AM-5PM')")
    )

    # Credentials & Experience
    years_experience = models.PositiveIntegerField(
        _("Years of Experience"),
        null=True,
        blank=True,
        help_text=_("Number of years in business")
    )
    certifications = models.TextField(
        _("Certifications"),
        blank=True,
        help_text=_("Professional certifications or licenses")
    )

    # Status & Ownership
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="services",
        verbose_name=_("User")
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
        help_text=_("Current status of the service"),
        verbose_name=_("Status"),
    )
    is_active = models.BooleanField(
        _("Is Active"),
        default=True,
        help_text=_("Whether this service is currently active")
    )

    # Analytics
    view_count = models.PositiveIntegerField(
        _("View Count"),
        default=0,
        help_text=_("Number of times this service has been viewed")
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Admin fields
    approved_at = models.DateTimeField(_("Approved At"), null=True, blank=True)
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_services",
        verbose_name=_("Approved By"),
    )
    admin_notes = models.TextField(
        _("Admin Notes"),
        blank=True,
        help_text=_("Internal notes for administrators")
    )

    objects = FlyerManager()

    class Meta:
        verbose_name = _("Service")
        verbose_name_plural = _("Services")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["category", "state", "status"]),
            models.Index(fields=["city", "status", "-created_at"]),
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["slug"]),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, self.title)
        super().save(*args, **kwargs)

    @property
    def primary_image(self):
        """Get the primary image for this service."""
        return self.images.filter(is_primary=True).first()

    def increment_view_count(self):
        """Increment view count."""
        self.view_count += 1
        self.save(update_fields=["view_count"])


# Shared Image Models for all three flyer types
class DesiFavoriteImage(models.Model):
    """Model for Desi Favorite images."""

    flyer = models.ForeignKey(
        DesiFavorite,
        on_delete=models.CASCADE,
        related_name="images",
        verbose_name=_("Desi Favorite")
    )
    image = models.ImageField(
        _("Image"),
        upload_to=generate_unique_filename,
        help_text=_("Image file (max 5MB)"),
    )
    caption = models.CharField(
        _("Caption"),
        max_length=255,
        blank=True,
        help_text=_("Optional caption for the image"),
    )
    is_primary = models.BooleanField(
        _("Is Primary"),
        default=False,
        help_text=_("Whether this is the main image"),
    )
    sort_order = models.PositiveIntegerField(
        _("Sort Order"),
        default=0,
        help_text=_("Order for displaying images")
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Desi Favorite Image")
        verbose_name_plural = _("Desi Favorite Images")
        ordering = ["sort_order", "created_at"]
        indexes = [
            models.Index(fields=["flyer", "is_primary"]),
            models.Index(fields=["flyer", "sort_order"]),
        ]

    def __str__(self):
        return f"Image for {self.flyer.title}"

    def save(self, *args, **kwargs):
        if self.is_primary:
            DesiFavoriteImage.objects.filter(flyer=self.flyer, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)


class EventImage(models.Model):
    """Model for Event images."""

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="images",
        verbose_name=_("Event")
    )
    image = models.ImageField(
        _("Image"),
        upload_to=generate_unique_filename,
        help_text=_("Image file (max 5MB)"),
    )
    caption = models.CharField(
        _("Caption"),
        max_length=255,
        blank=True,
        help_text=_("Optional caption for the image"),
    )
    is_primary = models.BooleanField(
        _("Is Primary"),
        default=False,
        help_text=_("Whether this is the main image"),
    )
    sort_order = models.PositiveIntegerField(
        _("Sort Order"),
        default=0,
        help_text=_("Order for displaying images")
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Event Image")
        verbose_name_plural = _("Event Images")
        ordering = ["sort_order", "created_at"]
        indexes = [
            models.Index(fields=["event", "is_primary"]),
            models.Index(fields=["event", "sort_order"]),
        ]

    def __str__(self):
        return f"Image for {self.event.title}"

    def save(self, *args, **kwargs):
        if self.is_primary:
            EventImage.objects.filter(event=self.event, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)


class ServiceImage(models.Model):
    """Model for Service images."""

    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name="images",
        verbose_name=_("Service")
    )
    image = models.ImageField(
        _("Image"),
        upload_to=generate_unique_filename,
        help_text=_("Image file (max 5MB)"),
    )
    caption = models.CharField(
        _("Caption"),
        max_length=255,
        blank=True,
        help_text=_("Optional caption for the image"),
    )
    is_primary = models.BooleanField(
        _("Is Primary"),
        default=False,
        help_text=_("Whether this is the main image"),
    )
    sort_order = models.PositiveIntegerField(
        _("Sort Order"),
        default=0,
        help_text=_("Order for displaying images")
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Service Image")
        verbose_name_plural = _("Service Images")
        ordering = ["sort_order", "created_at"]
        indexes = [
            models.Index(fields=["service", "is_primary"]),
            models.Index(fields=["service", "sort_order"]),
        ]

    def __str__(self):
        return f"Image for {self.service.title}"

    def save(self, *args, **kwargs):
        if self.is_primary:
            ServiceImage.objects.filter(service=self.service, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)
