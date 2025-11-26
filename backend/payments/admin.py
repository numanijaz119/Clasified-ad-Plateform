# payments/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import PaymentProduct, Payment, AdBoost, PaymentRefund, WebhookEvent


@admin.register(PaymentProduct)
class PaymentProductAdmin(admin.ModelAdmin):
    """Admin interface for payment products."""

    list_display = [
        'name',
        'product_type',
        'price_display',
        'duration_days',
        'boost_multiplier',
        'is_active',
        'sort_order',
        'created_at',
    ]
    list_filter = ['product_type', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['sort_order', 'product_type', 'duration_days']

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'product_type', 'description', 'is_active', 'sort_order')
        }),
        ('Pricing & Duration', {
            'fields': ('price', 'duration_days', 'boost_multiplier')
        }),
        ('Stripe Integration', {
            'fields': ('stripe_product_id', 'stripe_price_id'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def price_display(self, obj):
        """Display price with currency symbol."""
        return f'${obj.price}'
    price_display.short_description = 'Price'
    price_display.admin_order_field = 'price'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin interface for payments."""

    list_display = [
        'id',
        'user_email',
        'product_name',
        'amount_display',
        'status_display',
        'payment_date',
        'is_active',
        'created_at',
    ]
    list_filter = ['status', 'payment_date', 'created_at']
    search_fields = ['user__email', 'stripe_payment_intent_id', 'stripe_charge_id']
    readonly_fields = [
        'id',
        'stripe_payment_intent_id',
        'stripe_checkout_session_id',
        'stripe_charge_id',
        'receipt_url_link',
        'created_at',
        'updated_at',
    ]
    date_hierarchy = 'created_at'
    ordering = ['-created_at']

    fieldsets = (
        ('Payment Information', {
            'fields': ('id', 'user', 'product', 'ad', 'amount', 'currency', 'status')
        }),
        ('Stripe Details', {
            'fields': (
                'stripe_payment_intent_id',
                'stripe_checkout_session_id',
                'stripe_charge_id',
                'payment_method',
                'payment_date',
                'receipt_url_link',
                'invoice_url',
            )
        }),
        ('Refund Information', {
            'fields': ('refund_amount', 'refund_reason', 'refunded_at', 'refunded_by'),
            'classes': ('collapse',)
        }),
        ('Benefit Tracking', {
            'fields': ('applied_at', 'expires_at'),
        }),
        ('Failure Details', {
            'fields': ('failure_reason',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def user_email(self, obj):
        """Display user email."""
        return obj.user.email
    user_email.short_description = 'User'
    user_email.admin_order_field = 'user__email'

    def product_name(self, obj):
        """Display product name."""
        return obj.product.name
    product_name.short_description = 'Product'
    product_name.admin_order_field = 'product__name'

    def amount_display(self, obj):
        """Display amount with currency."""
        return f'${obj.amount}'
    amount_display.short_description = 'Amount'
    amount_display.admin_order_field = 'amount'

    def status_display(self, obj):
        """Display status with color."""
        colors = {
            'COMPLETED': 'green',
            'PENDING': 'orange',
            'FAILED': 'red',
            'REFUNDED': 'gray',
            'CANCELED': 'gray',
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.status
        )
    status_display.short_description = 'Status'
    status_display.admin_order_field = 'status'

    def receipt_url_link(self, obj):
        """Display receipt URL as clickable link."""
        if obj.receipt_url:
            return format_html(
                '<a href="{}" target="_blank">View Receipt</a>',
                obj.receipt_url
            )
        return '-'
    receipt_url_link.short_description = 'Receipt'


@admin.register(AdBoost)
class AdBoostAdmin(admin.ModelAdmin):
    """Admin interface for ad boosts."""

    list_display = [
        'id',
        'ad_title',
        'boost_multiplier',
        'started_at',
        'expires_at',
        'is_active',
        'views_during_boost',
    ]
    list_filter = ['started_at', 'expires_at']
    search_fields = ['ad__title', 'ad__slug']
    readonly_fields = ['id', 'started_at', 'created_at']
    date_hierarchy = 'started_at'
    ordering = ['-started_at']

    fieldsets = (
        ('Boost Information', {
            'fields': ('id', 'ad', 'payment', 'boost_multiplier')
        }),
        ('Timeframe', {
            'fields': ('started_at', 'expires_at')
        }),
        ('Analytics', {
            'fields': ('views_during_boost',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

    def ad_title(self, obj):
        """Display ad title."""
        return obj.ad.title
    ad_title.short_description = 'Ad'
    ad_title.admin_order_field = 'ad__title'


@admin.register(PaymentRefund)
class PaymentRefundAdmin(admin.ModelAdmin):
    """Admin interface for payment refunds."""

    list_display = [
        'id',
        'payment_id',
        'amount_display',
        'reason',
        'status_display',
        'processed_by_email',
        'created_at',
    ]
    list_filter = ['reason', 'status', 'created_at']
    search_fields = ['stripe_refund_id', 'payment__stripe_payment_intent_id']
    readonly_fields = ['id', 'stripe_refund_id', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']

    fieldsets = (
        ('Refund Information', {
            'fields': ('id', 'payment', 'stripe_refund_id', 'amount', 'reason', 'status')
        }),
        ('Processing', {
            'fields': ('processed_by', 'admin_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def payment_id(self, obj):
        """Display payment ID."""
        return str(obj.payment.id)[:8] + '...'
    payment_id.short_description = 'Payment'

    def amount_display(self, obj):
        """Display amount with currency."""
        return f'${obj.amount}'
    amount_display.short_description = 'Amount'
    amount_display.admin_order_field = 'amount'

    def status_display(self, obj):
        """Display status with color."""
        colors = {
            'SUCCEEDED': 'green',
            'PENDING': 'orange',
            'FAILED': 'red',
            'CANCELED': 'gray',
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.status
        )
    status_display.short_description = 'Status'
    status_display.admin_order_field = 'status'

    def processed_by_email(self, obj):
        """Display processor email."""
        if obj.processed_by:
            return obj.processed_by.email
        return '-'
    processed_by_email.short_description = 'Processed By'


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    """Admin interface for webhook events."""

    list_display = [
        'id',
        'event_type',
        'stripe_event_id',
        'processed_display',
        'created_at',
    ]
    list_filter = ['event_type', 'processed', 'created_at']
    search_fields = ['stripe_event_id', 'event_type']
    readonly_fields = ['id', 'stripe_event_id', 'event_type', 'payload', 'created_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']

    fieldsets = (
        ('Event Information', {
            'fields': ('id', 'stripe_event_id', 'event_type')
        }),
        ('Processing Status', {
            'fields': ('processed', 'processed_at', 'error_message')
        }),
        ('Payload', {
            'fields': ('payload',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

    def processed_display(self, obj):
        """Display processed status with color."""
        if obj.processed:
            color = 'green' if not obj.error_message else 'orange'
            text = 'Processed' if not obj.error_message else 'Error'
        else:
            color = 'red'
            text = 'Pending'

        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            text
        )
    processed_display.short_description = 'Status'
    processed_display.admin_order_field = 'processed'
