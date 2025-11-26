# payments/services/payment_service.py
"""
Payment service for business logic.
Handles payment processing, benefit application, and refunds.
"""
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
from decimal import Decimal

from payments.models import Payment, PaymentProduct, AdBoost, PaymentRefund
from payments.services.stripe_service import StripeService
from ads.models import Ad


class PaymentService:
    """
    Service for handling payment business logic.
    Manages payment lifecycle, benefit application, and refunds.
    """

    def __init__(self):
        self.stripe_service = StripeService()

    # ==================== Payment Creation ====================

    @transaction.atomic
    def initiate_payment(self, user, product, ad=None, metadata=None):
        """
        Initiate a new payment.

        Args:
            user: User making the payment
            product: PaymentProduct instance
            ad: Ad instance (optional, for ad-specific payments)
            metadata: Additional metadata dictionary (optional)

        Returns:
            Payment instance

        Raises:
            ValueError: If payment cannot be initiated
        """
        # Validate product is active
        if not product.is_active:
            raise ValueError("This product is no longer available")

        # Validate ad ownership if ad is provided
        if ad and ad.user != user:
            raise ValueError("You don't own this ad")

        # Validate ad-specific product requirements
        if product.product_type in ['FEATURED', 'BOOST'] and not ad:
            raise ValueError(f"{product.product_type} requires an ad")

        # Create payment record
        payment = Payment.objects.create(
            user=user,
            ad=ad,
            product=product,
            amount=product.price,
            currency='USD',
            status='PENDING',
            metadata=metadata or {},
            stripe_payment_intent_id='pending_' + str(timezone.now().timestamp())  # Temporary
        )

        return payment

    @transaction.atomic
    def create_checkout_session(self, payment, success_url, cancel_url):
        """
        Create Stripe checkout session for a payment.

        Args:
            payment: Payment instance
            success_url: URL to redirect after success
            cancel_url: URL to redirect on cancel

        Returns:
            dict with checkout_url and session_id

        Raises:
            Exception: If checkout session creation fails
        """
        product = payment.product

        # Ensure product has Stripe price ID
        if not product.stripe_price_id:
            raise Exception("Product is not configured for Stripe payments")

        # Prepare metadata
        metadata = {
            'payment_id': str(payment.id),
            'user_id': str(payment.user.id),
            'product_id': str(product.id),
            'product_type': product.product_type,
        }
        if payment.ad:
            metadata['ad_id'] = str(payment.ad.id)

        # Create checkout session
        session = self.stripe_service.create_checkout_session(
            price_id=product.stripe_price_id,
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=payment.user.email,
            metadata=metadata
        )

        # Update payment with session details
        payment.stripe_checkout_session_id = session.id
        payment.stripe_payment_intent_id = session.payment_intent
        payment.save(update_fields=['stripe_checkout_session_id', 'stripe_payment_intent_id', 'updated_at'])

        return {
            'checkout_url': session.url,
            'session_id': session.id
        }

    @transaction.atomic
    def complete_payment(self, payment_intent_id):
        """
        Complete a payment after successful Stripe payment.

        Args:
            payment_intent_id: Stripe PaymentIntent ID

        Returns:
            Updated Payment instance

        Raises:
            Payment.DoesNotExist: If payment not found
            Exception: If completion fails
        """
        # Find payment
        try:
            payment = Payment.objects.get(stripe_payment_intent_id=payment_intent_id)
        except Payment.DoesNotExist:
            raise Payment.DoesNotExist(f"Payment with intent {payment_intent_id} not found")

        # Check if already completed
        if payment.status == 'COMPLETED':
            return payment

        # Get payment details from Stripe
        intent = self.stripe_service.retrieve_payment_intent(payment_intent_id)

        if intent.status != 'succeeded':
            raise Exception(f"Payment intent status is {intent.status}, not succeeded")

        # Get charge and receipt
        charge = self.stripe_service.get_charge_from_payment_intent(payment_intent_id)
        receipt_url = self.stripe_service.get_receipt_url(payment_intent_id)

        # Update payment
        payment.mark_completed(
            payment_date=timezone.now(),
            payment_method=charge.payment_method_details.type if charge else '',
            charge_id=charge.id if charge else '',
            receipt_url=receipt_url
        )

        # Apply benefits
        self.apply_payment_benefits(payment)

        return payment

    @transaction.atomic
    def fail_payment(self, payment_intent_id, reason=''):
        """
        Mark a payment as failed.

        Args:
            payment_intent_id: Stripe PaymentIntent ID
            reason: Failure reason

        Returns:
            Updated Payment instance
        """
        try:
            payment = Payment.objects.get(stripe_payment_intent_id=payment_intent_id)
            payment.mark_failed(reason=reason)
            return payment
        except Payment.DoesNotExist:
            raise Payment.DoesNotExist(f"Payment with intent {payment_intent_id} not found")

    # ==================== Benefit Application ====================

    @transaction.atomic
    def apply_payment_benefits(self, payment):
        """
        Apply benefits to ad based on payment product type.

        Args:
            payment: Payment instance

        Raises:
            Exception: If benefit application fails
        """
        if payment.status != 'COMPLETED':
            raise Exception("Cannot apply benefits to incomplete payment")

        if payment.applied_at:
            # Already applied
            return

        product = payment.product
        product_type = product.product_type

        if product_type == 'FEATURED':
            self._apply_featured_benefit(payment)
        elif product_type == 'BOOST':
            self._apply_boost_benefit(payment)
        elif product_type == 'RENEWAL':
            self._apply_renewal_benefit(payment)
        # Add more product types as needed

        # Mark as applied
        expires_at = timezone.now() + timedelta(days=product.duration_days) if product.duration_days else None
        payment.apply_benefit(expires_at=expires_at)

    def _apply_featured_benefit(self, payment):
        """Apply featured ad benefit."""
        if not payment.ad:
            raise Exception("No ad associated with this payment")

        ad = payment.ad
        product = payment.product

        # Calculate expiration
        expires_at = timezone.now() + timedelta(days=product.duration_days)

        # Update ad
        ad.plan = 'featured'
        ad.featured_payment_id = str(payment.id)
        ad.featured_expires_at = expires_at
        ad.save(update_fields=['plan', 'featured_payment_id', 'featured_expires_at', 'updated_at'])

    def _apply_boost_benefit(self, payment):
        """Apply ad boost benefit."""
        if not payment.ad:
            raise Exception("No ad associated with this payment")

        ad = payment.ad
        product = payment.product

        # Calculate expiration
        expires_at = timezone.now() + timedelta(days=product.duration_days)

        # Create boost record
        AdBoost.objects.create(
            ad=ad,
            payment=payment,
            boost_multiplier=product.boost_multiplier,
            expires_at=expires_at
        )

    def _apply_renewal_benefit(self, payment):
        """Apply ad renewal benefit."""
        if not payment.ad:
            raise Exception("No ad associated with this payment")

        ad = payment.ad
        product = payment.product

        # Extend expiration
        if ad.expires_at and ad.expires_at > timezone.now():
            # Extend from current expiration
            new_expiration = ad.expires_at + timedelta(days=product.duration_days)
        else:
            # Extend from now
            new_expiration = timezone.now() + timedelta(days=product.duration_days)

        ad.expires_at = new_expiration
        ad.status = 'approved'  # Reactivate if expired
        ad.save(update_fields=['expires_at', 'status', 'updated_at'])

    # ==================== Refunds ====================

    @transaction.atomic
    def process_refund(self, payment, amount, reason, admin_user, admin_notes=''):
        """
        Process a payment refund.

        Args:
            payment: Payment instance to refund
            amount: Amount to refund (Decimal)
            reason: Refund reason (from PaymentRefund.REASON_CHOICES)
            admin_user: Admin user processing the refund
            admin_notes: Internal notes about the refund

        Returns:
            PaymentRefund instance

        Raises:
            ValueError: If refund cannot be processed
            Exception: If Stripe refund fails
        """
        # Validate payment can be refunded
        if not payment.is_refundable:
            raise ValueError("This payment cannot be refunded")

        # Validate amount
        if amount <= 0:
            raise ValueError("Refund amount must be positive")

        if amount > payment.remaining_refundable_amount:
            raise ValueError(f"Refund amount exceeds remaining refundable amount of ${payment.remaining_refundable_amount}")

        # Create Stripe refund
        stripe_refund = self.stripe_service.create_refund(
            payment_intent_id=payment.stripe_payment_intent_id,
            amount=float(amount),
            reason=self._map_refund_reason_to_stripe(reason)
        )

        # Create refund record
        refund = PaymentRefund.objects.create(
            payment=payment,
            stripe_refund_id=stripe_refund.id,
            amount=amount,
            reason=reason,
            admin_notes=admin_notes,
            processed_by=admin_user,
            status='PENDING'
        )

        # Update refund status based on Stripe response
        if stripe_refund.status == 'succeeded':
            refund.status = 'SUCCEEDED'
            refund.save(update_fields=['status', 'updated_at'])

            # Update payment refund tracking
            payment.refund_amount += amount
            if payment.refund_amount >= payment.amount:
                payment.status = 'REFUNDED'
            payment.refunded_at = timezone.now()
            payment.refunded_by = admin_user
            payment.refund_reason = f"{reason}: {admin_notes}"
            payment.save(update_fields=['refund_amount', 'status', 'refunded_at', 'refunded_by', 'refund_reason', 'updated_at'])

            # Revert benefits if full refund
            if payment.refund_amount >= payment.amount:
                self._revert_payment_benefits(payment)

        return refund

    def _map_refund_reason_to_stripe(self, reason):
        """Map internal refund reason to Stripe reason."""
        mapping = {
            'DUPLICATE': 'duplicate',
            'FRAUDULENT': 'fraudulent',
            'CUSTOMER_REQUESTED': 'requested_by_customer',
        }
        return mapping.get(reason, None)

    @transaction.atomic
    def _revert_payment_benefits(self, payment):
        """Revert benefits applied by a payment after refund."""
        product_type = payment.product.product_type

        if product_type == 'FEATURED' and payment.ad:
            # Revert featured status
            ad = payment.ad
            if ad.featured_payment_id == str(payment.id):
                ad.plan = 'free'
                ad.featured_payment_id = ''
                ad.featured_expires_at = None
                ad.save(update_fields=['plan', 'featured_payment_id', 'featured_expires_at', 'updated_at'])

        elif product_type == 'BOOST':
            # Deactivate boost by setting expiration to now
            AdBoost.objects.filter(payment=payment, expires_at__gt=timezone.now()).update(
                expires_at=timezone.now()
            )

    def can_refund(self, payment, refund_window_days=None):
        """
        Check if a payment can be refunded based on refund window.

        Args:
            payment: Payment instance
            refund_window_days: Refund window in days (from AdminSettings if None)

        Returns:
            bool
        """
        if not payment.is_refundable:
            return False

        if refund_window_days is None:
            from administrator.models import AdminSettings
            settings = AdminSettings.objects.first()
            refund_window_days = settings.refund_window_days if settings else 3

        if not payment.payment_date:
            return False

        refund_deadline = payment.payment_date + timedelta(days=refund_window_days)
        return timezone.now() <= refund_deadline

    # ==================== Query Methods ====================

    def get_user_payment_history(self, user, limit=None):
        """Get payment history for a user."""
        queryset = Payment.objects.filter(user=user).select_related('product', 'ad')
        if limit:
            queryset = queryset[:limit]
        return queryset

    def get_ad_payments(self, ad):
        """Get all payments for an ad."""
        return Payment.objects.filter(ad=ad).select_related('product', 'user')

    def get_active_boosts(self, ad):
        """Get active boosts for an ad."""
        return AdBoost.objects.filter(
            ad=ad,
            expires_at__gt=timezone.now()
        ).select_related('payment', 'payment__product')

    def has_active_boost(self, ad):
        """Check if ad has any active boost."""
        return self.get_active_boosts(ad).exists()

    # ==================== Expiration Management ====================

    def expire_payment_benefits(self):
        """
        Expire payment benefits that have reached their expiration date.
        This should be run as a periodic task (cron job).

        Returns:
            dict with counts of expired items
        """
        now = timezone.now()
        expired_count = 0

        # Expire featured ads
        featured_ads = Ad.objects.filter(
            plan='featured',
            featured_expires_at__lte=now
        )
        for ad in featured_ads:
            ad.plan = 'free'
            ad.save(update_fields=['plan', 'updated_at'])
            expired_count += 1

        # Note: Boosts expire automatically via the expires_at field
        # No action needed for boosts

        return {
            'expired_featured_ads': expired_count,
        }
