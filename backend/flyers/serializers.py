from rest_framework import serializers
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import (
    DesiFavorite,
    DesiFavoriteImage,
    Event,
    EventImage,
    Service,
    ServiceImage,
)
from content.serializers import (
    CitySimpleSerializer,
    StateSimpleSerializer,
)
from accounts.serializers import UserPublicSerializer

User = get_user_model()


# ============================================================
# DESI FAVORITES SERIALIZERS
# ============================================================

class DesiFavoriteImageSerializer(serializers.ModelSerializer):
    """Serializer for Desi Favorite images."""

    class Meta:
        model = DesiFavoriteImage
        fields = [
            "id",
            "image",
            "caption",
            "is_primary",
            "sort_order",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class DesiFavoriteImageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Desi Favorite images."""

    class Meta:
        model = DesiFavoriteImage
        fields = ["image", "caption", "is_primary", "sort_order"]


class DesiFavoriteListSerializer(serializers.ModelSerializer):
    """Serializer for Desi Favorites listings."""

    city = CitySimpleSerializer(read_only=True)
    state = StateSimpleSerializer(read_only=True)
    primary_image = DesiFavoriteImageSerializer(read_only=True)
    is_owner = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    # Add contact information for the list view
    contact = serializers.SerializerMethodField()

    class Meta:
        model = DesiFavorite
        fields = [
            "id",
            "slug",
            "title",
            "description",
            "category",
            "location",
            "city",
            "state",
            "primary_image",
            "view_count",
            "created_at",
            "is_owner",
            "user_id",
            "contact",
        ]

    def get_is_owner(self, obj):
        """Check if the current user owns this flyer."""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False

    def get_contact(self, obj):
        """Return contact information."""
        return {
            "phone": obj.contact_phone or None,
            "email": obj.contact_email or None,
            "website": obj.website or None,
        }


class DesiFavoriteDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single Desi Favorite view."""

    user = UserPublicSerializer(read_only=True)
    city = CitySimpleSerializer(read_only=True)
    state = StateSimpleSerializer(read_only=True)
    images = DesiFavoriteImageSerializer(many=True, read_only=True)
    is_owner = serializers.SerializerMethodField()
    contact = serializers.SerializerMethodField()

    class Meta:
        model = DesiFavorite
        fields = [
            "id",
            "slug",
            "title",
            "description",
            "category",
            "location",
            "city",
            "state",
            "images",
            "view_count",
            "user",
            "status",
            "is_active",
            "created_at",
            "updated_at",
            "is_owner",
            "contact",
        ]
        read_only_fields = ["id", "slug", "view_count", "created_at", "updated_at"]

    def get_is_owner(self, obj):
        """Check if the current user owns this flyer."""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False

    def get_contact(self, obj):
        """Return contact information."""
        return {
            "phone": obj.contact_phone or None,
            "email": obj.contact_email or None,
            "website": obj.website or None,
        }


class DesiFavoriteCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating Desi Favorites."""

    images = DesiFavoriteImageCreateSerializer(many=True, required=False)

    class Meta:
        model = DesiFavorite
        fields = [
            "title",
            "description",
            "category",
            "location",
            "city",
            "state",
            "contact_phone",
            "contact_email",
            "website",
            "status",
            "is_active",
            "images",
        ]

    def create(self, validated_data):
        images_data = validated_data.pop("images", [])
        request = self.context.get("request")
        validated_data["user"] = request.user

        flyer = DesiFavorite.objects.create(**validated_data)

        for image_data in images_data:
            DesiFavoriteImage.objects.create(flyer=flyer, **image_data)

        return flyer

    def update(self, instance, validated_data):
        images_data = validated_data.pop("images", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if images_data is not None:
            instance.images.all().delete()
            for image_data in images_data:
                DesiFavoriteImage.objects.create(flyer=instance, **image_data)

        return instance


# ============================================================
# EVENTS SERIALIZERS
# ============================================================

class EventImageSerializer(serializers.ModelSerializer):
    """Serializer for Event images."""

    class Meta:
        model = EventImage
        fields = [
            "id",
            "image",
            "caption",
            "is_primary",
            "sort_order",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class EventImageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Event images."""

    class Meta:
        model = EventImage
        fields = ["image", "caption", "is_primary", "sort_order"]


class EventListSerializer(serializers.ModelSerializer):
    """Serializer for Events listings."""

    city = CitySimpleSerializer(read_only=True)
    state = StateSimpleSerializer(read_only=True)
    primary_image = EventImageSerializer(read_only=True)
    is_owner = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    is_past = serializers.BooleanField(read_only=True)
    contact = serializers.SerializerMethodField()

    # Format event_date for display
    date = serializers.DateTimeField(source="event_date", read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "slug",
            "title",
            "description",
            "category",
            "location",
            "city",
            "state",
            "date",
            "event_date",
            "end_date",
            "is_free",
            "primary_image",
            "view_count",
            "is_upcoming",
            "is_past",
            "created_at",
            "is_owner",
            "user_id",
            "contact",
        ]

    def get_is_owner(self, obj):
        """Check if the current user owns this event."""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False

    def get_contact(self, obj):
        """Return contact information."""
        return {
            "phone": obj.contact_phone or None,
            "email": obj.contact_email or None,
            "website": obj.website or None,
        }


class EventDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single Event view."""

    user = UserPublicSerializer(read_only=True)
    city = CitySimpleSerializer(read_only=True)
    state = StateSimpleSerializer(read_only=True)
    images = EventImageSerializer(many=True, read_only=True)
    is_owner = serializers.SerializerMethodField()
    is_upcoming = serializers.BooleanField(read_only=True)
    is_past = serializers.BooleanField(read_only=True)
    contact = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "slug",
            "title",
            "description",
            "category",
            "location",
            "city",
            "state",
            "event_date",
            "end_date",
            "is_free",
            "registration_url",
            "images",
            "view_count",
            "user",
            "status",
            "is_active",
            "is_upcoming",
            "is_past",
            "created_at",
            "updated_at",
            "is_owner",
            "contact",
        ]
        read_only_fields = ["id", "slug", "view_count", "created_at", "updated_at"]

    def get_is_owner(self, obj):
        """Check if the current user owns this event."""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False

    def get_contact(self, obj):
        """Return contact information."""
        return {
            "phone": obj.contact_phone or None,
            "email": obj.contact_email or None,
            "website": obj.website or None,
        }


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating Events."""

    images = EventImageCreateSerializer(many=True, required=False)

    class Meta:
        model = Event
        fields = [
            "title",
            "description",
            "category",
            "location",
            "city",
            "state",
            "event_date",
            "end_date",
            "is_free",
            "registration_url",
            "contact_phone",
            "contact_email",
            "website",
            "status",
            "is_active",
            "images",
        ]

    def create(self, validated_data):
        images_data = validated_data.pop("images", [])
        request = self.context.get("request")
        validated_data["user"] = request.user

        event = Event.objects.create(**validated_data)

        for image_data in images_data:
            EventImage.objects.create(event=event, **image_data)

        return event

    def update(self, instance, validated_data):
        images_data = validated_data.pop("images", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if images_data is not None:
            instance.images.all().delete()
            for image_data in images_data:
                EventImage.objects.create(event=instance, **image_data)

        return instance


# ============================================================
# SERVICES SERIALIZERS
# ============================================================

class ServiceImageSerializer(serializers.ModelSerializer):
    """Serializer for Service images."""

    class Meta:
        model = ServiceImage
        fields = [
            "id",
            "image",
            "caption",
            "is_primary",
            "sort_order",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class ServiceImageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Service images."""

    class Meta:
        model = ServiceImage
        fields = ["image", "caption", "is_primary", "sort_order"]


class ServiceListSerializer(serializers.ModelSerializer):
    """Serializer for Services listings."""

    city = CitySimpleSerializer(read_only=True)
    state = StateSimpleSerializer(read_only=True)
    primary_image = ServiceImageSerializer(read_only=True)
    is_owner = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    contact = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            "id",
            "slug",
            "title",
            "description",
            "category",
            "location",
            "city",
            "state",
            "pricing_info",
            "availability",
            "years_experience",
            "primary_image",
            "view_count",
            "created_at",
            "is_owner",
            "user_id",
            "contact",
        ]

    def get_is_owner(self, obj):
        """Check if the current user owns this service."""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False

    def get_contact(self, obj):
        """Return contact information."""
        return {
            "phone": obj.contact_phone or None,
            "email": obj.contact_email or None,
            "website": obj.website or None,
        }


class ServiceDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single Service view."""

    user = UserPublicSerializer(read_only=True)
    city = CitySimpleSerializer(read_only=True)
    state = StateSimpleSerializer(read_only=True)
    images = ServiceImageSerializer(many=True, read_only=True)
    is_owner = serializers.SerializerMethodField()
    contact = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            "id",
            "slug",
            "title",
            "description",
            "category",
            "location",
            "city",
            "state",
            "service_areas",
            "pricing_info",
            "availability",
            "years_experience",
            "certifications",
            "images",
            "view_count",
            "user",
            "status",
            "is_active",
            "created_at",
            "updated_at",
            "is_owner",
            "contact",
        ]
        read_only_fields = ["id", "slug", "view_count", "created_at", "updated_at"]

    def get_is_owner(self, obj):
        """Check if the current user owns this service."""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False

    def get_contact(self, obj):
        """Return contact information."""
        return {
            "phone": obj.contact_phone or None,
            "email": obj.contact_email or None,
            "website": obj.website or None,
        }


class ServiceCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating Services."""

    images = ServiceImageCreateSerializer(many=True, required=False)

    class Meta:
        model = Service
        fields = [
            "title",
            "description",
            "category",
            "location",
            "city",
            "state",
            "service_areas",
            "pricing_info",
            "availability",
            "years_experience",
            "certifications",
            "contact_phone",
            "contact_email",
            "website",
            "status",
            "is_active",
            "images",
        ]

    def create(self, validated_data):
        images_data = validated_data.pop("images", [])
        request = self.context.get("request")
        validated_data["user"] = request.user

        service = Service.objects.create(**validated_data)

        for image_data in images_data:
            ServiceImage.objects.create(service=service, **image_data)

        return service

    def update(self, instance, validated_data):
        images_data = validated_data.pop("images", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if images_data is not None:
            instance.images.all().delete()
            for image_data in images_data:
                ServiceImage.objects.create(service=instance, **image_data)

        return instance
