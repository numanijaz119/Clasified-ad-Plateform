# payments/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PaymentProductViewSet,
    PaymentViewSet,
    AdBoostViewSet,
    AdminPaymentViewSet,
    AdminPaymentProductViewSet,
    stripe_webhook,
    stripe_config,
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'products', PaymentProductViewSet, basename='payment-products')
router.register(r'payments', PaymentViewSet, basename='payments')
router.register(r'boosts', AdBoostViewSet, basename='ad-boosts')

# Admin router
admin_router = DefaultRouter()
admin_router.register(r'payments', AdminPaymentViewSet, basename='admin-payments')
admin_router.register(r'products', AdminPaymentProductViewSet, basename='admin-payment-products')

urlpatterns = [
    # Public/User endpoints
    path('', include(router.urls)),

    # Stripe webhook (no authentication)
    path('webhook/', stripe_webhook, name='stripe-webhook'),

    # Stripe config (public)
    path('config/', stripe_config, name='stripe-config'),

    # Admin endpoints
    path('admin/', include(admin_router.urls)),
]

"""
PAYMENT API ENDPOINTS:

USER ENDPOINTS:
===============

Payment Products:
- GET    /api/payments/products/                  - List all active products
- GET    /api/payments/products/{id}/              - Get product details
- GET    /api/payments/products/for_ad/?ad_slug=X  - Get products for specific ad

Payments:
- GET    /api/payments/payments/                   - List user's payments
- GET    /api/payments/payments/{id}/              - Get payment details
- POST   /api/payments/payments/checkout/          - Create checkout session
         Body: {
             "product_id": "uuid",
             "ad_id": "uuid" (optional),
             "success_url": "https://...",
             "cancel_url": "https://..."
         }
         Response: {
             "checkout_url": "https://checkout.stripe.com/...",
             "session_id": "cs_...",
             "payment_id": "uuid"
         }

- POST   /api/payments/payments/confirm/           - Confirm payment after checkout
         Body: {"session_id": "cs_..."}

- GET    /api/payments/payments/{id}/receipt/      - Get receipt URL

Ad Boosts:
- GET    /api/payments/boosts/                     - List user's boosts
- GET    /api/payments/boosts/{id}/                - Get boost details
- GET    /api/payments/boosts/active/              - Get active boosts
- GET    /api/payments/boosts/for_ad/?ad_slug=X    - Get boosts for specific ad

Stripe Config:
- GET    /api/payments/config/                     - Get Stripe public key


WEBHOOK:
========
- POST   /api/payments/webhook/                    - Stripe webhook endpoint
         (No authentication, validates via signature)


ADMIN ENDPOINTS:
================

Payment Management:
- GET    /api/payments/admin/payments/             - List all payments
- GET    /api/payments/admin/payments/{id}/        - Get payment details
- POST   /api/payments/admin/payments/{id}/refund/ - Process refund
         Body: {
             "amount": 10.50 (optional, full refund if not provided),
             "reason": "ADMIN_REQUESTED",
             "admin_notes": "Customer requested refund"
         }

- GET    /api/payments/admin/payments/stats/       - Get payment statistics
- GET    /api/payments/admin/payments/by_product/  - Get stats by product

Product Management:
- GET    /api/payments/admin/products/             - List all products
- POST   /api/payments/admin/products/             - Create new product
- GET    /api/payments/admin/products/{id}/        - Get product details
- PUT    /api/payments/admin/products/{id}/        - Update product
- PATCH  /api/payments/admin/products/{id}/        - Partial update
- DELETE /api/payments/admin/products/{id}/        - Delete product
- POST   /api/payments/admin/products/sync_stripe/ - Sync products with Stripe


PAYMENT FLOW:
=============

1. User initiates payment:
   POST /api/payments/payments/checkout/
   → Returns checkout_url

2. User completes payment on Stripe
   → Stripe redirects to success_url with session_id

3. Frontend confirms payment:
   POST /api/payments/payments/confirm/
   → Benefits applied automatically

4. Webhook processes event (background):
   POST /api/payments/webhook/
   → Stripe sends payment confirmation


EXAMPLE USAGE:
==============

# Feature an ad for 30 days:
1. Get products: GET /api/payments/products/?type=FEATURED
2. Create checkout: POST /api/payments/payments/checkout/
   {
       "product_id": "{featured-30day-product-id}",
       "ad_id": "{ad-id}",
       "success_url": "https://mysite.com/payment/success",
       "cancel_url": "https://mysite.com/payment/cancel"
   }
3. Redirect user to checkout_url
4. After payment, confirm: POST /api/payments/payments/confirm/
   {"session_id": "cs_..."}

# Boost an ad:
1. Get products: GET /api/payments/products/?type=BOOST
2. Follow same flow as above with BOOST product
"""
