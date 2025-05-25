```typescript
import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  createdAt: Timestamp;
  updatedAt?: Timestamp;

  // Stripe specific fields
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null; // Current active price ID
  stripeCurrentPeriodEnd?: Timestamp | null; // When the current subscription period ends
  stripeSubscriptionStatus?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'free' | null;

  // Application-specific role or tier
  subscriptionTier?: 'free' | 'monthly' | 'yearly' | null;
}
```