# payments/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import PaymentProduct, Payment, AdBoost, PaymentRefund, WebhookEvent

User = get_user_model()


# ==================== Payment Product Serializers ====================

class PaymentProductSerializer(serializers.ModelSerializer):
    """Serializer for payment products (public view)."""

    duration_display = serializers.SerializerMethodField()

    class Meta:
        model = PaymentProduct
        fields = [
            'id',
            'name',
            'product_type',
            'description',
            'price',
            'duration_days',
            'duration_display',
            'boost_multiplier',
            'is_active',
            'sort_order',
        ]

    def get_duration_display(self, obj):
        """Get human-readable duration."""
        return obj.get_duration_display_text()


class PaymentProductDetailSerializer(PaymentProductSerializer):
    """Detailed serializer for payment products."""

    class Meta(PaymentProductSerializer.Meta):
        fields = PaymentProductSerializer.Meta.fields + [
            'stripe_product_id',
            'stripe_price_id',
            'created_at',
            'updated_at',
        ]


class PaymentProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating payment products (admin only)."""

    class Meta:
        model = PaymentProduct
        fields = [
            'name',
            'product_type',
            'description',
            'price',
            'duration_days',
            'boost_multiplier',
            'stripe_product_id',
            'stripe_price_id',
            'is_active',
            'sort_order',
        ]

    def validate_price(self, value):
        """Validate price is positive."""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value


# ==================== Payment Serializers ====================

class PaymentListSerializer(serializers.ModelSerializer):
    """Serializer for payment list view."""

    product_name = serializers.CharField(source='product.name', read_only=True)
    product_type = serializers.CharField(source='product.product_type', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    ad_title = serializers.CharField(source='ad.title', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_refundable = serializers.BooleanField(read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id',
            'user_email',
            'product_name',
            'product_type',
            'ad_title',
            'amount',
            'currency',
            'status',
            'payment_method',
            'payment_date',
            'is_active',
            'is_refundable',
            'applied_at',
            'expires_at',
            'created_at',
        ]


class PaymentDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for individual payment."""

    product = PaymentProductSerializer(read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    ad_title = serializers.CharField(source='ad.title', read_only=True)
    ad_slug = serializers.CharField(source='ad.slug', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_refundable = serializers.BooleanField(read_only=True)
    remaining_refundable_amount = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = Payment
        fields = [
            'id',
            'user_email',
            'product',
            'ad_title',
            'ad_slug',
            'stripe_payment_intent_id',
            'stripe_checkout_session_id',
            'stripe_charge_id',
            'amount',
            'currency',
            'status',
            'payment_method',
            'payment_date',
            'failure_reason',
            'refund_amount',
            'refund_reason',
            'refunded_at',
            'receipt_url',
            'invoice_url',
            'applied_at',
            'expires_at',
            'is_active',
            'is_refundable',
            'remaining_refundable_amount',
            'metadata',
            'created_at',
            'updated_at',
        ]


class PaymentCreateSerializer(serializers.Serializer):
    """Serializer for initiating a payment."""

    product_id = serializers.UUIDField(required=True)
    ad_id = serializers.UUIDField(required=False, allow_null=True)
    success_url = serializers.URLField(required=True)
    cancel_url = serializers.URLField(required=True)

    def validate_product_id(self, value):
        """Validate product exists and is active."""
        try:
            product = PaymentProduct.objects.get(id=value)
            if not product.is_active:
                raise serializers.ValidationError("This product is not available")
            return value
        except PaymentProduct.DoesNotExist:
            raise serializers.ValidationError("Product not found")

    def validate_ad_id(self, value):
        """Validate ad exists if provided."""
        if value:
            from ads.models import Ad
            try:
                Ad.objects.get(id=value)
                return value
            except Ad.DoesNotExist:
                raise serializers.ValidationError("Ad not found")
        return value


class CheckoutSessionSerializer(serializers.Serializer):
    """Serializer for checkout session response."""

    checkout_url = serializers.URLField()
    session_id = serializers.CharField()
    payment_id = serializers.UUIDField()


class ConfirmPaymentSerializer(serializers.Serializer):
    """Serializer for confirming payment after checkout."""

    session_id = serializers.CharField(required=True)


# ==================== Ad Boost Serializers ====================

class AdBoostSerializer(serializers.ModelSerializer):
    """Serializer for ad boosts."""

    ad_title = serializers.CharField(source='ad.title', read_only=True)
    ad_slug = serializers.CharField(source='ad.slug', read_only=True)
    product_name = serializers.CharField(source='payment.product.name', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    remaining_time = serializers.SerializerMethodField()

    class Meta:
        model = AdBoost
        fields = [
            'id',
            'ad_title',
            'ad_slug',
            'product_name',
            'boost_multiplier',
            'started_at',
            'expires_at',
            'is_active',
            'remaining_time',
            'views_during_boost',
            'created_at',
        ]

    def get_remaining_time(self, obj):
        """Get remaining time for boost in seconds."""
        remaining = obj.remaining_time
        if remaining:
            return int(remaining.total_seconds())
        return 0


# ==================== Refund Serializers ====================

class PaymentRefundSerializer(serializers.ModelSerializer):
    """Serializer for payment refunds."""

    payment_id = serializers.UUIDField(source='payment.id', read_only=True)
    processed_by_email = serializers.CharField(source='processed_by.email', read_only=True)

    class Meta:
        model = PaymentRefund
        fields = [
            'id',
            'payment_id',
            'stripe_refund_id',
            'amount',
            'reason',
            'admin_notes',
            'processed_by_email',
            'status',
            'created_at',
            'updated_at',
        ]


class PaymentRefundCreateSerializer(serializers.Serializer):
    """Serializer for creating a refund (admin only)."""

    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        help_text="Amount to refund (leave empty for full refund)"
    )
    reason = serializers.ChoiceField(
        choices=PaymentRefund.REASON_CHOICES,
        required=True
    )
    admin_notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Internal notes about the refund"
    )

    def validate_amount(self, value):
        """Validate refund amount."""
        if value is not None and value <= 0:
            raise serializers.ValidationError("Refund amount must be positive")
        return value


# ==================== Webhook Event Serializers ====================

class WebhookEventSerializer(serializers.ModelSerializer):
    """Serializer for webhook events (admin only)."""

    class Meta:
        model = WebhookEvent
        fields = [
            'id',
            'stripe_event_id',
            'event_type',
            'payload',
            'processed',
            'processed_at',
            'error_message',
            'created_at',
        ]
        read_only_fields = fields


# ==================== Admin Serializers ====================

class PaymentAdminSerializer(PaymentDetailSerializer):
    """Extended payment serializer for admin view."""

    user_id = serializers.UUIDField(source='user.id', read_only=True)
    user_name = serializers.SerializerMethodField()
    refunded_by_email = serializers.CharField(source='refunded_by.email', read_only=True)
    refunds = PaymentRefundSerializer(many=True, read_only=True)

    class Meta(PaymentDetailSerializer.Meta):
        fields = PaymentDetailSerializer.Meta.fields + [
            'user_id',
            'user_name',
            'refunded_by_email',
            'refunds',
        ]

    def get_user_name(self, obj):
        """Get full user name."""
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email


# ==================== Statistics Serializers ====================

class PaymentStatsSerializer(serializers.Serializer):
    """Serializer for payment statistics."""

    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_payments = serializers.IntegerField()
    total_refunds = serializers.DecimalField(max_digits=12, decimal_places=2)
    pending_payments = serializers.IntegerField()
    completed_payments = serializers.IntegerField()
    failed_payments = serializers.IntegerField()
    average_payment = serializers.DecimalField(max_digits=10, decimal_places=2)


class ProductStatsSerializer(serializers.Serializer):
    """Serializer for product-specific statistics."""

    product_id = serializers.UUIDField()
    product_name = serializers.CharField()
    product_type = serializers.CharField()
    total_sales = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)


# ==================== Settings Serializers ====================

class StripeConfigSerializer(serializers.Serializer):
    """Serializer for Stripe public configuration."""

    public_key = serializers.CharField()
    currency = serializers.CharField()
