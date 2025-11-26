# payments/models.py
import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from decimal import Decimal

User = get_user_model()


class PaymentProduct(models.Model):
    """
    Defines purchasable products/services.
    Admin can configure pricing and duration for different payment products.
    """

    PRODUCT_TYPE_CHOICES = [
        ('FEATURED', _('Featured Ad')),
        ('BOOST', _('Ad Boost')),
        ('MEMBERSHIP', _('Premium Membership')),
        ('RENEWAL', _('Ad Renewal')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, help_text=_('Product name (e.g., "Featured Ad - 30 Days")'))
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPE_CHOICES)
    description = models.TextField(blank=True, help_text=_('Product description shown to users'))

    # Pricing
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text=_('Price in USD')
    )

    # Duration for time-based products
    duration_days = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text=_('Duration in days for featured/boost products')
    )

    # Boost multiplier
    boost_multiplier = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text=_('Multiplier for ad visibility (e.g., 10 = 10x more visible)')
    )

    # Stripe integration
    stripe_product_id = models.CharField(
        max_length=255,
        blank=True,
        help_text=_('Stripe Product ID from Stripe Dashboard')
    )
    stripe_price_id = models.CharField(
        max_length=255,
        blank=True,
        help_text=_('Stripe Price ID from Stripe Dashboard')
    )

    # Status
    is_active = models.BooleanField(default=True, help_text=_('Product available for purchase'))
    sort_order = models.IntegerField(default=0, help_text=_('Display order (lower numbers first)'))

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'product_type', 'duration_days']
        verbose_name = _('Payment Product')
        verbose_name_plural = _('Payment Products')
        indexes = [
            models.Index(fields=['product_type', 'is_active']),
            models.Index(fields=['sort_order']),
        ]

    def __str__(self):
        return f"{self.name} - ${self.price}"

    def get_duration_display_text(self):
        """Human-readable duration text."""
        if not self.duration_days:
            return "N/A"
        if self.duration_days == 1:
            return "1 day"
        elif self.duration_days < 30:
            return f"{self.duration_days} days"
        elif self.duration_days == 30:
            return "1 month"
        else:
            months = self.duration_days // 30
            return f"{months} months"


class Payment(models.Model):
    """
    Records all payment transactions.
    Tracks Stripe payment details and application of benefits.
    """

    STATUS_CHOICES = [
        ('PENDING', _('Pending')),
        ('COMPLETED', _('Completed')),
        ('FAILED', _('Failed')),
        ('REFUNDED', _('Refunded')),
        ('CANCELED', _('Canceled')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Relationships
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='payments',
        help_text=_('User who made the payment')
    )
    ad = models.ForeignKey(
        'ads.Ad',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments',
        help_text=_('Ad this payment is for (if applicable)')
    )
    product = models.ForeignKey(
        PaymentProduct,
        on_delete=models.PROTECT,
        related_name='payments',
        help_text=_('Product purchased')
    )

    # Stripe fields
    stripe_payment_intent_id = models.CharField(
        max_length=255,
        unique=True,
        db_index=True,
        help_text=_('Stripe PaymentIntent ID')
    )
    stripe_checkout_session_id = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        help_text=_('Stripe Checkout Session ID (if using Checkout)')
    )
    stripe_charge_id = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        help_text=_('Stripe Charge ID')
    )

    # Payment details
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text=_('Actual amount paid')
    )
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    # Payment method info
    payment_method = models.CharField(
        max_length=50,
        blank=True,
        help_text=_('Payment method type (card, wallet, etc.)')
    )
    payment_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_('When payment was completed')
    )
    failure_reason = models.TextField(
        blank=True,
        help_text=_('Reason for payment failure')
    )

    # Refund tracking
    refund_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_('Total amount refunded')
    )
    refund_reason = models.TextField(blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)
    refunded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_refunds',
        help_text=_('Admin who processed the refund')
    )

    # Receipt/Invoice
    receipt_url = models.URLField(blank=True, help_text=_('Stripe receipt URL'))
    invoice_url = models.URLField(blank=True, help_text=_('Stripe invoice URL'))

    # Benefit application tracking
    applied_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_('When the benefit was applied to the ad')
    )
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_('When the benefit expires')
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Additional metadata
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text=_('Additional payment metadata')
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Payment')
        verbose_name_plural = _('Payments')
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['ad', '-created_at']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['-payment_date']),
        ]

    def __str__(self):
        return f"Payment {self.id} - {self.user.email} - ${self.amount} ({self.status})"

    @property
    def is_active(self):
        """Check if payment benefit is currently active."""
        if self.status != 'COMPLETED':
            return False
        if not self.applied_at:
            return False
        if self.expires_at and timezone.now() > self.expires_at:
            return False
        return True

    @property
    def is_refundable(self):
        """Check if payment can be refunded."""
        if self.status != 'COMPLETED':
            return False
        if self.refund_amount >= self.amount:
            return False
        return True

    @property
    def remaining_refundable_amount(self):
        """Calculate remaining refundable amount."""
        return self.amount - self.refund_amount

    def mark_completed(self, payment_date=None, payment_method='', charge_id='', receipt_url=''):
        """Mark payment as completed and update related fields."""
        self.status = 'COMPLETED'
        self.payment_date = payment_date or timezone.now()
        if payment_method:
            self.payment_method = payment_method
        if charge_id:
            self.stripe_charge_id = charge_id
        if receipt_url:
            self.receipt_url = receipt_url
        self.save(update_fields=['status', 'payment_date', 'payment_method', 'stripe_charge_id', 'receipt_url', 'updated_at'])

    def mark_failed(self, reason=''):
        """Mark payment as failed."""
        self.status = 'FAILED'
        self.failure_reason = reason
        self.save(update_fields=['status', 'failure_reason', 'updated_at'])

    def apply_benefit(self, expires_at=None):
        """Mark benefit as applied."""
        self.applied_at = timezone.now()
        self.expires_at = expires_at
        self.save(update_fields=['applied_at', 'expires_at', 'updated_at'])


class AdBoost(models.Model):
    """
    Tracks ad boost history and status.
    Boosts increase ad visibility for a specified duration.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Relationships
    ad = models.ForeignKey(
        'ads.Ad',
        on_delete=models.CASCADE,
        related_name='boosts',
        help_text=_('Ad being boosted')
    )
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name='boosts',
        help_text=_('Payment for this boost')
    )

    # Boost details
    boost_multiplier = models.PositiveIntegerField(
        default=10,
        help_text=_('Visibility multiplier (e.g., 10 = 10x more visible)')
    )

    # Timeframe
    started_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(help_text=_('When boost expires'))

    # Analytics
    views_during_boost = models.PositiveIntegerField(
        default=0,
        help_text=_('Views received during boost period')
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-started_at']
        verbose_name = _('Ad Boost')
        verbose_name_plural = _('Ad Boosts')
        indexes = [
            models.Index(fields=['ad', '-started_at']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"Boost for Ad {self.ad.id} - {self.boost_multiplier}x until {self.expires_at}"

    @property
    def is_active(self):
        """Check if boost is currently active."""
        return timezone.now() < self.expires_at

    @property
    def remaining_time(self):
        """Get remaining time for boost."""
        if not self.is_active:
            return None
        return self.expires_at - timezone.now()


class PaymentRefund(models.Model):
    """
    Detailed refund tracking for payments.
    Stores refund requests, processing, and completion.
    """

    REASON_CHOICES = [
        ('ADMIN_REQUESTED', _('Admin Requested')),
        ('CUSTOMER_REQUESTED', _('Customer Requested')),
        ('DUPLICATE', _('Duplicate Payment')),
        ('FRAUDULENT', _('Fraudulent')),
        ('OTHER', _('Other')),
    ]

    STATUS_CHOICES = [
        ('PENDING', _('Pending')),
        ('SUCCEEDED', _('Succeeded')),
        ('FAILED', _('Failed')),
        ('CANCELED', _('Canceled')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Relationships
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name='refunds',
        help_text=_('Payment being refunded')
    )

    # Stripe refund ID
    stripe_refund_id = models.CharField(
        max_length=255,
        unique=True,
        help_text=_('Stripe Refund ID')
    )

    # Refund details
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text=_('Refund amount')
    )
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    admin_notes = models.TextField(blank=True, help_text=_('Internal notes about refund'))

    # Processing
    processed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='refunds_processed',
        help_text=_('Admin who processed this refund')
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Payment Refund')
        verbose_name_plural = _('Payment Refunds')
        indexes = [
            models.Index(fields=['payment', '-created_at']),
            models.Index(fields=['status', '-created_at']),
        ]

    def __str__(self):
        return f"Refund {self.id} - ${self.amount} ({self.status})"


class WebhookEvent(models.Model):
    """
    Logs Stripe webhook events for debugging and tracking.
    Helps troubleshoot payment issues and ensures idempotency.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Stripe event details
    stripe_event_id = models.CharField(
        max_length=255,
        unique=True,
        db_index=True,
        help_text=_('Stripe Event ID')
    )
    event_type = models.CharField(
        max_length=100,
        help_text=_('Stripe event type (e.g., payment_intent.succeeded)')
    )

    # Event data
    payload = models.JSONField(help_text=_('Full event payload from Stripe'))

    # Processing status
    processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(
        blank=True,
        help_text=_('Error message if processing failed')
    )

    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Webhook Event')
        verbose_name_plural = _('Webhook Events')
        indexes = [
            models.Index(fields=['event_type', '-created_at']),
            models.Index(fields=['processed', '-created_at']),
        ]

    def __str__(self):
        return f"{self.event_type} - {self.stripe_event_id} ({'Processed' if self.processed else 'Pending'})"

    def mark_processed(self, error_message=''):
        """Mark webhook event as processed."""
        self.processed = True
        self.processed_at = timezone.now()
        if error_message:
            self.error_message = error_message
        self.save(update_fields=['processed', 'processed_at', 'error_message'])
