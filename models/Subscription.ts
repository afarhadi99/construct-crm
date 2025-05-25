```typescript
import { Timestamp } from 'firebase/firestore';

export type SubscriptionTier = 'free' | 'monthly' | 'yearly';

export interface Subscription {
  id?: string; // Stripe Subscription ID
  userId: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'free' | null;
  tier: SubscriptionTier | null;
  priceId?: string | null; // Stripe Price ID
  currentPeriodStart?: Timestamp | null;
  currentPeriodEnd?: Timestamp | null;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Timestamp | null;
  endedAt?: Timestamp | null;
  trialStart?: Timestamp | null;
  trialEnd?: Timestamp | null;
}

// Helper type for pricing plans
export interface PricingPlan {
  id: SubscriptionTier;
  name: string;
  description: string;
  priceMonthly?: number; // For display
  priceYearly?: number; // For display
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
  features: string[];
  isPopular?: boolean;
}
```