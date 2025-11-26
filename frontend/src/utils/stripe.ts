// frontend/src/utils/stripe.ts
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { paymentService } from '../services/paymentService';

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe instance with public key from backend
 * Caches the promise to avoid multiple loads
 */
export const getStripe = async (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = (async () => {
      try {
        // Fetch Stripe config from backend
        const config = await paymentService.getStripeConfig();

        if (!config.public_key) {
          console.error('Stripe public key not configured');
          return null;
        }

        // Load Stripe with the public key
        return await loadStripe(config.public_key);
      } catch (error) {
        console.error('Failed to load Stripe:', error);
        return null;
      }
    })();
  }

  return stripePromise;
};

/**
 * Reset Stripe instance (useful for testing or key rotation)
 */
export const resetStripe = (): void => {
  stripePromise = null;
};

/**
 * Check if Stripe is configured and available
 */
export const isStripeAvailable = async (): Promise<boolean> => {
  try {
    const stripe = await getStripe();
    return stripe !== null;
  } catch {
    return false;
  }
};
