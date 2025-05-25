```typescript
import { PricingPlan, SubscriptionTier } from "@/models/Subscription";

export const MAX_FREE_PROJECTS = 3;
export const MAX_FREE_CLIENTS = 5;
export const MAX_FREE_TASKS_PER_PROJECT = 10;

export const APP_NAME = "ConstructCRM";

// Stripe Price IDs should be stored in .env.local and accessed via process.env
// These are placeholders; replace with your actual Price IDs from Stripe dashboard.
export const STRIPE_PRICE_ID_MONTHLY = process.env.STRIPE_PRICE_ID_MONTHLY || 'price_monthly_placeholder';
export const STRIPE_PRICE_ID_YEARLY = process.env.STRIPE_PRICE_ID_YEARLY || 'price_yearly_placeholder';

export const subscriptionTiers: Record<SubscriptionTier, Omit<PricingPlan, 'id' | 'stripePriceIdMonthly' | 'stripePriceIdYearly'>> = {
  free: {
    name: "Free Tier",
    description: "Get started with basic features for small projects.",
    priceMonthly: 0,
    features: [
      `Up to ${MAX_FREE_PROJECTS} projects`,
      `Up to ${MAX_FREE_CLIENTS} clients`,
      `Up to ${MAX_FREE_TASKS_PER_PROJECT} tasks per project`,
      "Basic project tracking",
      "Community support",
    ],
  },
  monthly: {
    name: "Pro Monthly",
    description: "Full access to all features, billed monthly.",
    // priceMonthly: 29, // Example price, actual price is managed in Stripe
    features: [
      "Unlimited projects",
      "Unlimited clients",
      "Unlimited tasks",
      "Advanced project management tools",
      "Client portal (future)",
      "Reporting and analytics",
      "Priority email support",
    ],
    isPopular: true,
  },
  yearly: {
    name: "Pro Yearly",
    description: "Full access, save with an annual subscription.",
    // priceYearly: 290, // Example price, actual price is managed in Stripe
    features: [
      "All Pro Monthly features",
      "Save 2 months (vs. monthly)",
      "Dedicated account manager (future)",
      "Early access to new features",
    ],
  },
};

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    ...subscriptionTiers.free,
  },
  {
    id: 'monthly',
    ...subscriptionTiers.monthly,
    stripePriceIdMonthly: STRIPE_PRICE_ID_MONTHLY,
  },
  {
    id: 'yearly',
    ...subscriptionTiers.yearly,
    stripePriceIdYearly: STRIPE_PRICE_ID_YEARLY, // Assuming yearly plan has its own price ID
    // If yearly is just a discount on monthly, Stripe setup might differ (e.g. using coupons or separate products)
    // For simplicity, we assume distinct price IDs.
  },
];

// Helper function to get plan details by Stripe Price ID
export function getPlanByPriceId(priceId: string): PricingPlan | undefined {
  return pricingPlans.find(plan => plan.stripePriceIdMonthly === priceId || plan.stripePriceIdYearly === priceId);
}

export function getPlanByTier(tier: SubscriptionTier): PricingPlan | undefined {
  return pricingPlans.find(plan => plan.id === tier);
}
```