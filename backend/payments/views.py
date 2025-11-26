# payments/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from decimal import Decimal
import json

from .models import PaymentProduct, Payment, AdBoost, PaymentRefund, WebhookEvent
from .serializers import (
    PaymentProductSerializer,
    PaymentListSerializer,
    PaymentDetailSerializer,
    PaymentCreateSerializer,
    CheckoutSessionSerializer,
    ConfirmPaymentSerializer,
    AdBoostSerializer,
    PaymentRefundSerializer,
    PaymentRefundCreateSerializer,
    PaymentAdminSerializer,
    PaymentStatsSerializer,
    ProductStatsSerializer,
    StripeConfigSerializer,
)
from .services import StripeService, PaymentService
from ads.models import Ad


# ==================== Payment Product ViewSet ====================

class PaymentProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for payment products.
    List and retrieve available products for purchase.
    """
    queryset = PaymentProduct.objects.filter(is_active=True)
    serializer_class = PaymentProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        """Filter products by type if requested."""
        queryset = super().get_queryset()
        product_type = self.request.query_params.get('type', None)

        if product_type:
            queryset = queryset.filter(product_type=product_type.upper())

        return queryset

    @action(detail=False, methods=['get'])
    def for_ad(self, request):
        """
        Get available products for a specific ad.
        Query params: ad_slug
        """
        ad_slug = request.query_params.get('ad_slug')
        if not ad_slug:
            return Response(
                {'error': 'ad_slug parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            ad = Ad.objects.get(slug=ad_slug)
        except Ad.DoesNotExist:
            return Response(
                {'error': 'Ad not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Return featured and boost products
        products = self.get_queryset().filter(
            product_type__in=['FEATURED', 'BOOST']
        )

        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)


# ==================== Payment ViewSet ====================

class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for payment operations.
    Users can view their own payments, initiate new payments, and confirm payments.
    """
    serializer_class = PaymentListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Users can only see their own payments."""
        if self.request.user.is_staff:
            return Payment.objects.all().select_related('user', 'product', 'ad')
        return Payment.objects.filter(user=self.request.user).select_related('product', 'ad')

    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'retrieve':
            return PaymentDetailSerializer
        elif self.action == 'checkout':
            return PaymentCreateSerializer
        elif self.action == 'confirm':
            return ConfirmPaymentSerializer
        return PaymentListSerializer

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        """
        Create a Stripe checkout session for payment.

        Body:
        {
            "product_id": "uuid",
            "ad_id": "uuid" (optional),
            "success_url": "https://...",
            "cancel_url": "https://..."
        }
        """
        serializer = PaymentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product_id = serializer.validated_data['product_id']
        ad_id = serializer.validated_data.get('ad_id')
        success_url = serializer.validated_data['success_url']
        cancel_url = serializer.validated_data['cancel_url']

        try:
            # Get product
            product = PaymentProduct.objects.get(id=product_id)

            # Get ad if provided
            ad = None
            if ad_id:
                ad = Ad.objects.get(id=ad_id)
                # Verify user owns the ad
                if ad.user != request.user:
                    return Response(
                        {'error': 'You do not own this ad'},
                        status=status.HTTP_403_FORBIDDEN
                    )

            # Initialize payment service
            payment_service = PaymentService()

            # Create payment record
            payment = payment_service.initiate_payment(
                user=request.user,
                product=product,
                ad=ad
            )

            # Create checkout session
            session_data = payment_service.create_checkout_session(
                payment=payment,
                success_url=success_url,
                cancel_url=cancel_url
            )

            # Return checkout URL and session info
            response_data = {
                'checkout_url': session_data['checkout_url'],
                'session_id': session_data['session_id'],
                'payment_id': str(payment.id)
            }

            return Response(response_data, status=status.HTTP_201_CREATED)

        except PaymentProduct.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Ad.DoesNotExist:
            return Response(
                {'error': 'Ad not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to create checkout session: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def confirm(self, request):
        """
        Confirm payment after successful Stripe checkout.

        Body:
        {
            "session_id": "cs_..."
        }
        """
        serializer = ConfirmPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        session_id = serializer.validated_data['session_id']

        try:
            payment_service = PaymentService()
            stripe_service = StripeService()

            # Retrieve checkout session
            session = stripe_service.retrieve_checkout_session(session_id)

            if not session.payment_intent:
                return Response(
                    {'error': 'No payment intent found in session'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Complete the payment
            payment = payment_service.complete_payment(session.payment_intent)

            # Return payment details
            serializer = PaymentDetailSerializer(payment)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to confirm payment: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def receipt(self, request, pk=None):
        """Get receipt URL for a payment."""
        payment = self.get_object()

        if payment.receipt_url:
            return Response({'receipt_url': payment.receipt_url})
        else:
            return Response(
                {'error': 'Receipt not available'},
                status=status.HTTP_404_NOT_FOUND
            )


# ==================== Webhook View ====================

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook(request):
    """
    Handle Stripe webhook events.
    This endpoint receives notifications from Stripe about payment events.
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

    if not sig_header:
        return HttpResponse('Missing signature', status=400)

    stripe_service = StripeService()
    payment_service = PaymentService()

    try:
        # Verify webhook signature
        event = stripe_service.verify_webhook_signature(payload, sig_header)
    except ValueError as e:
        # Invalid payload
        return HttpResponse(f'Invalid payload: {str(e)}', status=400)
    except Exception as e:
        # Invalid signature
        return HttpResponse(f'Invalid signature: {str(e)}', status=400)

    # Log webhook event
    try:
        webhook_event = WebhookEvent.objects.create(
            stripe_event_id=event.id,
            event_type=event.type,
            payload=event.to_dict()
        )
    except Exception as e:
        # Event already processed (idempotency)
        return HttpResponse(status=200)

    # Handle the event
    try:
        if event.type == 'checkout.session.completed':
            session = event.data.object
            payment_intent_id = session.get('payment_intent')

            if payment_intent_id:
                # Payment succeeded via checkout
                payment_service.complete_payment(payment_intent_id)

        elif event.type == 'payment_intent.succeeded':
            payment_intent = event.data.object
            payment_service.complete_payment(payment_intent.id)

        elif event.type == 'payment_intent.payment_failed':
            payment_intent = event.data.object
            failure_message = payment_intent.get('last_payment_error', {}).get('message', 'Payment failed')
            payment_service.fail_payment(payment_intent.id, reason=failure_message)

        elif event.type == 'charge.refunded':
            charge = event.data.object
            payment_intent_id = charge.get('payment_intent')
            # Refund handled through admin panel, just log it
            pass

        # Mark webhook as processed
        webhook_event.mark_processed()

    except Exception as e:
        # Log error but return 200 to prevent Stripe from retrying
        webhook_event.mark_processed(error_message=str(e))

    return HttpResponse(status=200)


# ==================== Ad Boost ViewSet ====================

class AdBoostViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for ad boosts.
    Users can view boosts for their ads.
    """
    serializer_class = AdBoostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Users can only see boosts for their own ads."""
        if self.request.user.is_staff:
            return AdBoost.objects.all().select_related('ad', 'payment', 'payment__product')

        return AdBoost.objects.filter(
            ad__user=self.request.user
        ).select_related('ad', 'payment', 'payment__product')

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active boosts for user's ads."""
        boosts = self.get_queryset().filter(expires_at__gt=timezone.now())
        serializer = self.get_serializer(boosts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def for_ad(self, request):
        """
        Get boosts for a specific ad.
        Query params: ad_slug
        """
        ad_slug = request.query_params.get('ad_slug')
        if not ad_slug:
            return Response(
                {'error': 'ad_slug parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        boosts = self.get_queryset().filter(ad__slug=ad_slug)
        serializer = self.get_serializer(boosts, many=True)
        return Response(serializer.data)


# ==================== Stripe Config View ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def stripe_config(request):
    """
    Get Stripe public configuration for frontend.
    Returns public key and currency.
    """
    stripe_service = StripeService()

    config_data = {
        'public_key': stripe_service.get_public_key(),
        'currency': 'USD'
    }

    serializer = StripeConfigSerializer(config_data)
    return Response(serializer.data)


# ==================== Admin Views ====================

class AdminPaymentViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for managing all payments.
    Includes refund functionality.
    """
    queryset = Payment.objects.all().select_related('user', 'product', 'ad', 'refunded_by')
    serializer_class = PaymentAdminSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        """
        Process a refund for a payment.

        Body:
        {
            "amount": 10.50 (optional, full refund if not specified),
            "reason": "ADMIN_REQUESTED",
            "admin_notes": "Customer requested refund"
        }
        """
        payment = self.get_object()
        serializer = PaymentRefundCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        amount = serializer.validated_data.get('amount')
        reason = serializer.validated_data['reason']
        admin_notes = serializer.validated_data.get('admin_notes', '')

        # Default to full refund if amount not specified
        if amount is None:
            amount = payment.remaining_refundable_amount

        try:
            payment_service = PaymentService()
            refund = payment_service.process_refund(
                payment=payment,
                amount=amount,
                reason=reason,
                admin_user=request.user,
                admin_notes=admin_notes
            )

            refund_serializer = PaymentRefundSerializer(refund)
            return Response(refund_serializer.data, status=status.HTTP_201_CREATED)

        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to process refund: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get payment statistics."""
        completed_payments = Payment.objects.filter(status='COMPLETED')

        stats = {
            'total_revenue': completed_payments.aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0.00'),
            'total_payments': Payment.objects.count(),
            'total_refunds': Payment.objects.aggregate(
                total=Sum('refund_amount')
            )['total'] or Decimal('0.00'),
            'pending_payments': Payment.objects.filter(status='PENDING').count(),
            'completed_payments': completed_payments.count(),
            'failed_payments': Payment.objects.filter(status='FAILED').count(),
            'average_payment': completed_payments.aggregate(
                avg=Avg('amount')
            )['avg'] or Decimal('0.00'),
        }

        serializer = PaymentStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_product(self, request):
        """Get statistics by product type."""
        from django.db.models import Count

        stats = PaymentProduct.objects.annotate(
            total_sales=Count('payments', filter=Q(payments__status='COMPLETED')),
            total_revenue=Sum('payments__amount', filter=Q(payments__status='COMPLETED'))
        ).values(
            'id', 'name', 'product_type', 'total_sales', 'total_revenue'
        )

        # Format the data
        formatted_stats = []
        for stat in stats:
            formatted_stats.append({
                'product_id': stat['id'],
                'product_name': stat['name'],
                'product_type': stat['product_type'],
                'total_sales': stat['total_sales'] or 0,
                'total_revenue': stat['total_revenue'] or Decimal('0.00')
            })

        serializer = ProductStatsSerializer(formatted_stats, many=True)
        return Response(serializer.data)


class AdminPaymentProductViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for managing payment products.
    """
    queryset = PaymentProduct.objects.all()
    serializer_class = PaymentProductSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['post'])
    def sync_stripe(self, request):
        """
        Sync products with Stripe.
        Creates Stripe products and prices for products that don't have them.
        """
        stripe_service = StripeService()
        synced_products = []
        errors = []

        for product in PaymentProduct.objects.filter(is_active=True):
            try:
                # Create Stripe product if doesn't exist
                if not product.stripe_product_id:
                    stripe_product = stripe_service.create_product(
                        name=product.name,
                        description=product.description
                    )
                    product.stripe_product_id = stripe_product.id

                # Create Stripe price if doesn't exist
                if not product.stripe_price_id:
                    stripe_price = stripe_service.create_price(
                        product_id=product.stripe_product_id,
                        amount=product.price
                    )
                    product.stripe_price_id = stripe_price.id

                product.save()
                synced_products.append(product.name)

            except Exception as e:
                errors.append(f"{product.name}: {str(e)}")

        return Response({
            'synced': synced_products,
            'errors': errors
        }, status=status.HTTP_200_OK)
