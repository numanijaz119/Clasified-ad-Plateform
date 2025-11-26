# payments/services/stripe_service.py
"""
Stripe integration service.
Handles all communication with Stripe API.
"""
import stripe
from decimal import Decimal
from django.conf import settings
from administrator.models import AdminSettings


class StripeService:
    """
    Service for interacting with Stripe API.
    Handles payments, refunds, webhooks, and product management.
    """

    def __init__(self):
        """Initialize Stripe with API keys from AdminSettings."""
        self._configure_stripe()

    def _configure_stripe(self):
        """Configure Stripe API with keys from environment variables."""
        try:
            stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')
            if not stripe.api_key:
                print("Warning: STRIPE_SECRET_KEY not configured in environment")
        except Exception as e:
            print(f"Warning: Failed to configure Stripe: {e}")

    def get_public_key(self):
        """Get Stripe publishable key for frontend."""
        return getattr(settings, 'STRIPE_PUBLIC_KEY', '')

    def get_webhook_secret(self):
        """Get Stripe webhook secret for signature verification."""
        return getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')

    # ==================== Product Management ====================

    def create_product(self, name, description=''):
        """
        Create a product in Stripe.

        Args:
            name: Product name
            description: Product description

        Returns:
            Stripe Product object
        """
        try:
            product = stripe.Product.create(
                name=name,
                description=description
            )
            return product
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create Stripe product: {str(e)}")

    def create_price(self, product_id, amount, currency='usd'):
        """
        Create a price for a product in Stripe.

        Args:
            product_id: Stripe product ID
            amount: Price amount in cents (e.g., 999 for $9.99)
            currency: Currency code (default: usd)

        Returns:
            Stripe Price object
        """
        try:
            price = stripe.Price.create(
                product=product_id,
                unit_amount=int(amount * 100),  # Convert dollars to cents
                currency=currency.lower()
            )
            return price
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create Stripe price: {str(e)}")

    def update_product(self, product_id, name=None, description=None):
        """
        Update a Stripe product.

        Args:
            product_id: Stripe product ID
            name: New product name (optional)
            description: New product description (optional)

        Returns:
            Updated Stripe Product object
        """
        try:
            update_data = {}
            if name:
                update_data['name'] = name
            if description is not None:
                update_data['description'] = description

            product = stripe.Product.modify(product_id, **update_data)
            return product
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to update Stripe product: {str(e)}")

    # ==================== Checkout Sessions ====================

    def create_checkout_session(self, price_id, success_url, cancel_url,
                                customer_email=None, metadata=None):
        """
        Create a Stripe Checkout session.

        Args:
            price_id: Stripe Price ID
            success_url: URL to redirect after successful payment
            cancel_url: URL to redirect if payment is canceled
            customer_email: Customer email (optional)
            metadata: Additional metadata dictionary (optional)

        Returns:
            Stripe Checkout Session object
        """
        try:
            session_data = {
                'payment_method_types': ['card'],
                'line_items': [{
                    'price': price_id,
                    'quantity': 1,
                }],
                'mode': 'payment',
                'success_url': success_url,
                'cancel_url': cancel_url,
            }

            if customer_email:
                session_data['customer_email'] = customer_email

            if metadata:
                session_data['metadata'] = metadata

            session = stripe.checkout.Session.create(**session_data)
            return session
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create checkout session: {str(e)}")

    def retrieve_checkout_session(self, session_id):
        """
        Retrieve a Stripe Checkout session.

        Args:
            session_id: Stripe Checkout Session ID

        Returns:
            Stripe Checkout Session object
        """
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            return session
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to retrieve checkout session: {str(e)}")

    # ==================== Payment Intents ====================

    def create_payment_intent(self, amount, currency='usd', customer_email=None,
                             metadata=None):
        """
        Create a Stripe PaymentIntent.

        Args:
            amount: Amount in dollars (will be converted to cents)
            currency: Currency code (default: usd)
            customer_email: Customer email (optional)
            metadata: Additional metadata dictionary (optional)

        Returns:
            Stripe PaymentIntent object
        """
        try:
            intent_data = {
                'amount': int(amount * 100),  # Convert to cents
                'currency': currency.lower(),
                'automatic_payment_methods': {
                    'enabled': True,
                },
            }

            if customer_email:
                intent_data['receipt_email'] = customer_email

            if metadata:
                intent_data['metadata'] = metadata

            intent = stripe.PaymentIntent.create(**intent_data)
            return intent
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create payment intent: {str(e)}")

    def retrieve_payment_intent(self, payment_intent_id):
        """
        Retrieve a Stripe PaymentIntent.

        Args:
            payment_intent_id: Stripe PaymentIntent ID

        Returns:
            Stripe PaymentIntent object
        """
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return intent
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to retrieve payment intent: {str(e)}")

    def confirm_payment_intent(self, payment_intent_id):
        """
        Confirm a Stripe PaymentIntent.

        Args:
            payment_intent_id: Stripe PaymentIntent ID

        Returns:
            Confirmed Stripe PaymentIntent object
        """
        try:
            intent = stripe.PaymentIntent.confirm(payment_intent_id)
            return intent
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to confirm payment intent: {str(e)}")

    # ==================== Refunds ====================

    def create_refund(self, payment_intent_id, amount=None, reason=None):
        """
        Create a refund for a payment.

        Args:
            payment_intent_id: Stripe PaymentIntent ID
            amount: Amount to refund in dollars (None for full refund)
            reason: Refund reason (optional)

        Returns:
            Stripe Refund object
        """
        try:
            refund_data = {
                'payment_intent': payment_intent_id,
            }

            if amount is not None:
                refund_data['amount'] = int(amount * 100)  # Convert to cents

            if reason:
                refund_data['reason'] = reason

            refund = stripe.Refund.create(**refund_data)
            return refund
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create refund: {str(e)}")

    def retrieve_refund(self, refund_id):
        """
        Retrieve a Stripe Refund.

        Args:
            refund_id: Stripe Refund ID

        Returns:
            Stripe Refund object
        """
        try:
            refund = stripe.Refund.retrieve(refund_id)
            return refund
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to retrieve refund: {str(e)}")

    # ==================== Webhooks ====================

    def verify_webhook_signature(self, payload, signature):
        """
        Verify Stripe webhook signature.

        Args:
            payload: Raw request body (bytes)
            signature: Stripe-Signature header value

        Returns:
            Stripe Event object if valid

        Raises:
            ValueError: If signature is invalid
        """
        webhook_secret = self.get_webhook_secret()

        try:
            event = stripe.Webhook.construct_event(
                payload, signature, webhook_secret
            )
            return event
        except ValueError as e:
            raise ValueError(f"Invalid payload: {str(e)}")
        except stripe.error.SignatureVerificationError as e:
            raise ValueError(f"Invalid signature: {str(e)}")

    def construct_event(self, payload, signature):
        """
        Construct and verify a Stripe webhook event.
        Alias for verify_webhook_signature for clarity.

        Args:
            payload: Raw request body (bytes)
            signature: Stripe-Signature header value

        Returns:
            Stripe Event object
        """
        return self.verify_webhook_signature(payload, signature)

    # ==================== Utility Methods ====================

    def get_charge_from_payment_intent(self, payment_intent_id):
        """
        Get the charge associated with a payment intent.

        Args:
            payment_intent_id: Stripe PaymentIntent ID

        Returns:
            Stripe Charge object or None
        """
        try:
            intent = self.retrieve_payment_intent(payment_intent_id)
            if intent.charges and intent.charges.data:
                return intent.charges.data[0]
            return None
        except Exception:
            return None

    def get_receipt_url(self, payment_intent_id):
        """
        Get receipt URL for a payment.

        Args:
            payment_intent_id: Stripe PaymentIntent ID

        Returns:
            Receipt URL string or empty string
        """
        try:
            charge = self.get_charge_from_payment_intent(payment_intent_id)
            if charge and hasattr(charge, 'receipt_url'):
                return charge.receipt_url or ''
            return ''
        except Exception:
            return ''

    def format_amount(self, amount_in_cents):
        """
        Convert Stripe amount (cents) to decimal dollars.

        Args:
            amount_in_cents: Amount in cents (integer)

        Returns:
            Decimal amount in dollars
        """
        return Decimal(str(amount_in_cents / 100))
