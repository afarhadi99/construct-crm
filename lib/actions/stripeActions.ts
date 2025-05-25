'use server';

import { stripeAdmin } from '@/lib/stripe/admin';
import { adminDb } from '@/lib/firebase/admin';
import { UserProfile } from '@/models/User';
import { headers } from 'next/headers';
import { STRIPE_PRICE_ID_MONTHLY, STRIPE_PRICE_ID_YEARLY } from '@/lib/constants'; // Ensure these are correctly imported

// Utility to get the base URL for constructing redirect URLs
function getURL(path: string = '') {
  const host = headers().get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}${path}`;
}

export async function createCheckoutSession(
  priceId: string,
  userId: string,
  stripeCustomerId: string | null | undefined
) {
  if (!userId) {
    return { error: 'User is not authenticated.', sessionId: null };
  }
  if (!priceId) {
    return { error: 'Price ID is missing.', sessionId: null };
  }

  // Validate priceId against known price IDs
  const validPriceIds = [STRIPE_PRICE_ID_MONTHLY, STRIPE_PRICE_ID_YEARLY];
  if (!validPriceIds.includes(priceId)) {
    console.error(`Invalid Price ID: ${priceId}`);
    return { error: 'Invalid subscription plan selected.', sessionId: null };
  }

  try {
    let customerId = stripeCustomerId;

    // If the user doesn't have a Stripe Customer ID, create one
    if (!customerId) {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      const userData = userDoc.data() as UserProfile | undefined;

      if (!userData || !userData.email) {
        return { error: 'User email not found for creating Stripe customer.', sessionId: null };
      }

      const customer = await stripeAdmin.customers.create({
        email: userData.email,
        name: userData.displayName || undefined,
        metadata: { firebaseUID: userId },
      });
      customerId = customer.id;
      // Update Firestore with the new Stripe Customer ID
      await adminDb.collection('users').doc(userId).update({ stripeCustomerId: customerId });
    }

    // Create the Stripe Checkout session
    const session = await stripeAdmin.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Define success and cancel URLs
      success_url: getURL('/account?session_id={CHECKOUT_SESSION_ID}'), // Redirect to account page on success
      cancel_url: getURL('/pricing?canceled=true'), // Redirect back to pricing page on cancellation
      // Pass metadata to the session (optional, but useful)
      metadata: {
        firebaseUID: userId,
        priceId: priceId,
      },
      // Enable automatic tax calculation if configured in Stripe
      // automatic_tax: { enabled: true },
      // Allow promotion codes
      allow_promotion_codes: true,
    });

    return { sessionId: session.id, error: null };

  } catch (error: any) {
    console.error('Error creating Stripe Checkout session:', error);
    return { error: error.message || 'Could not create checkout session.', sessionId: null };
  }
}

export async function createCustomerPortalSession(stripeCustomerId: string) {
  if (!stripeCustomerId) {
    return { error: 'Stripe Customer ID is missing.', portalUrl: null };
  }

  try {
    const portalSession = await stripeAdmin.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: getURL('/account'), // URL to redirect to after leaving the portal
    });

    return { portalUrl: portalSession.url, error: null };

  } catch (error: any) {
    console.error('Error creating Stripe Customer Portal session:', error);
    return { error: error.message || 'Could not create customer portal session.', portalUrl: null };
  }
}