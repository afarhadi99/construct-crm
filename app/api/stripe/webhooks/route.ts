```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripeAdmin } from '@/lib/stripe/admin';
import { adminDb, admin } from '@/lib/firebase/admin'; // admin for Timestamp
import { UserProfile } from '@/models/User';
import { getPlanByPriceId } from '@/lib/constants';

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.trial_will_end',
  // 'invoice.payment_succeeded', // Useful for granting access after payment confirmation
  // 'invoice.payment_failed', // Useful for handling payment failures
]);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('Stripe webhook error: Missing signature or secret.');
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripeAdmin.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Stripe webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      let firebaseUID: string | null = null;
      let stripeCustomerId: string | null = null;
      let subscriptionData: Partial<UserProfile> = {};

      switch (event.type) {
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          firebaseUID = checkoutSession.metadata?.firebaseUID || null;
          stripeCustomerId = typeof checkoutSession.customer === 'string' ? checkoutSession.customer : null;
          const subscriptionId = typeof checkoutSession.subscription === 'string' ? checkoutSession.subscription : null;

          if (!firebaseUID || !stripeCustomerId || !subscriptionId) {
            console.error('Webhook Error (checkout.session.completed): Missing firebaseUID, customerId, or subscriptionId in session.', checkoutSession);
            return NextResponse.json({ error: 'Missing required data in checkout session.' }, { status: 400 });
          }
          
          // Retrieve the subscription to get the price ID
          const subscription = await stripeAdmin.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;
          const plan = getPlanByPriceId(priceId);

          subscriptionData = {
            stripeCustomerId: stripeCustomerId,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
            stripeSubscriptionStatus: subscription.status, // e.g., 'active', 'trialing'
            stripeCurrentPeriodEnd: admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000),
            subscriptionTier: plan?.id || null,
          };
          console.log(`Checkout completed for user ${firebaseUID}, subscription ${subscriptionId}, status ${subscription.status}`);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const sub = event.data.object as Stripe.Subscription;
          stripeCustomerId = typeof sub.customer === 'string' ? sub.customer : null;
          
          // For updates/deletes, we need to find the Firebase UID via Stripe Customer ID
          if (stripeCustomerId && !firebaseUID) {
             const userQuery = await adminDb.collection('users').where('stripeCustomerId', '==', stripeCustomerId).limit(1).get();
             if (!userQuery.empty) {
               firebaseUID = userQuery.docs[0].id;
             }
          }
          
          if (!firebaseUID) {
            console.error(`Webhook Error (${event.type}): Could not find Firebase UID for Stripe Customer ${stripeCustomerId}`);
            // Depending on your logic, you might want to still proceed if it's a delete for an unknown user
            // or return an error. For now, we'll log and potentially skip updating if no UID.
            if (event.type !== 'customer.subscription.deleted') {
                 return NextResponse.json({ error: 'Firebase UID not found for customer.' }, { status: 404 });
            }
          }

          const updatedPriceId = sub.items.data[0]?.price.id;
          const updatedPlan = getPlanByPriceId(updatedPriceId);

          subscriptionData = {
            stripeSubscriptionId: sub.id,
            stripePriceId: updatedPriceId,
            stripeSubscriptionStatus: sub.status,
            stripeCurrentPeriodEnd: admin.firestore.Timestamp.fromMillis(sub.current_period_end * 1000),
            subscriptionTier: updatedPlan?.id || (sub.status === 'canceled' || sub.status === 'incomplete_expired' ? 'free' : null),
          };
          
          if (sub.status === 'canceled' || sub.status === 'incomplete_expired') {
            // If subscription is truly canceled (not just pending cancellation at period end)
            // or ended due to payment failure, reset to free tier.
            subscriptionData.stripePriceId = null;
            subscriptionData.stripeSubscriptionId = null;
            subscriptionData.subscriptionTier = 'free';
          }
          console.log(`Subscription ${event.type} for user ${firebaseUID || 'unknown'}, sub ID ${sub.id}, status ${sub.status}`);
          break;
        
        case 'customer.subscription.trial_will_end':
          // Handle trial ending notifications if needed (e.g., send email to user)
          const trialSub = event.data.object as Stripe.Subscription;
          console.log(`Subscription trial will end soon for sub ID ${trialSub.id}`);
          // No direct Firestore update needed here unless you track trial status specifically beyond Stripe's status.
          break;

        default:
          console.warn(`Unhandled relevant event type: ${event.type}`);
          return NextResponse.json({ received: true, message: `Unhandled event: ${event.type}` });
      }

      if (firebaseUID && Object.keys(subscriptionData).length > 0) {
        try {
          await adminDb.collection('users').doc(firebaseUID).set(
            { ...subscriptionData, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
            { merge: true }
          );
          console.log(`Firestore updated for user ${firebaseUID} due to ${event.type}.`);
          
          // Optional: Update Firebase Auth Custom Claims for role-based access
          // const plan = getPlanByPriceId(subscriptionData.stripePriceId || '');
          // if (plan && subscriptionData.stripeSubscriptionStatus === 'active') {
          //   await adminAuth.setCustomUserClaims(firebaseUID, { stripeRole: plan.id });
          // } else {
          //   await adminAuth.setCustomUserClaims(firebaseUID, { stripeRole: 'free' });
          // }

        } catch (dbError) {
          console.error(`Error updating Firestore for user ${firebaseUID}:`, dbError);
          return NextResponse.json({ error: 'Database update failed.' }, { status: 500 });
        }
      } else if (firebaseUID && event.type === 'customer.subscription.deleted' && Object.keys(subscriptionData).length === 0) {
        // This case handles if a subscription is deleted but we didn't form subscriptionData (e.g. UID found but no specific data to set other than reset)
         await adminDb.collection('users').doc(firebaseUID).set(
            { 
              stripePriceId: null,
              stripeSubscriptionId: null,
              stripeSubscriptionStatus: 'free', // or 'canceled'
              subscriptionTier: 'free',
              updatedAt: admin.firestore.FieldValue.serverTimestamp() 
            },
            { merge: true }
          );
        console.log(`Subscription deleted, user ${firebaseUID} reset to free tier.`);
      }


    } catch (error: any) {
      console.error(`Webhook handler error for ${event.type}:`, error.message);
      return NextResponse.json({ error: `Webhook handler failed: ${error.message}` }, { status: 500 });
    }
  } else {
    console.log(`Received irrelevant Stripe event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

// Note: Stripe CLI can be used to test webhooks locally:
// `stripe listen --forward-to localhost:3000/api/stripe/webhooks`
// Ensure your STRIPE_WEBHOOK_SECRET is set in .env.local for local testing.
```