```typescript
'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { UserProfile } from '@/models/User';
import { Subscription, SubscriptionTier, getPlanByTier } from '@/models/Subscription'; // Assuming getPlanByTier is in Subscription model file or constants
import { MAX_FREE_PROJECTS, MAX_FREE_CLIENTS, MAX_FREE_TASKS_PER_PROJECT } from '@/lib/constants';

interface SubscriptionDetails extends Subscription {
  planName: string | null;
  features: string[];
  canCreateProject: boolean;
  canCreateClient: boolean;
  canCreateTask: boolean; // This might need project-specific task count
  maxProjects: number;
  maxClients: number;
  maxTasksPerProject: number;
}

export function useSubscription(): { 
  subscription: SubscriptionDetails | null; 
  loading: boolean; 
  isProTier: boolean;
  isFreeTier: boolean;
} {
  const { userProfile, loading: authLoading } = useAuth();

  if (authLoading) {
    return { 
        subscription: null, 
        loading: true, 
        isProTier: false,
        isFreeTier: false,
    };
  }

  if (!userProfile) {
    // Default to free tier if no profile (e.g., user signed out or profile not loaded)
    const freePlan = getPlanByTier('free');
    return {
      subscription: {
        userId: '', // No user
        status: 'free',
        tier: 'free',
        planName: freePlan?.name || 'Free',
        features: freePlan?.features || [],
        canCreateProject: true, // Based on limits
        canCreateClient: true,
        canCreateTask: true,
        maxProjects: MAX_FREE_PROJECTS,
        maxClients: MAX_FREE_CLIENTS,
        maxTasksPerProject: MAX_FREE_TASKS_PER_PROJECT,
      },
      loading: false,
      isProTier: false,
      isFreeTier: true,
    };
  }

  const currentTier = userProfile.subscriptionTier || 'free';
  const planDetails = getPlanByTier(currentTier);
  
  const isActiveSub = userProfile.stripeSubscriptionStatus === 'active' || userProfile.stripeSubscriptionStatus === 'trialing';
  const isPro = (currentTier === 'monthly' || currentTier === 'yearly') && isActiveSub;

  // Determine capabilities based on tier
  // For a real app, you'd fetch current counts of projects/clients for the user
  // to compare against limits. For this hook, we'll assume checks are done elsewhere
  // or provide the limits.
  let canCreateProject = isPro;
  let canCreateClient = isPro;
  let canCreateTask = isPro; // Simplified: pro can always create tasks

  let maxProjects = Infinity;
  let maxClients = Infinity;
  let maxTasksPerProject = Infinity;

  if (currentTier === 'free' || !isActiveSub && currentTier !== 'free') { // If not pro or if pro but not active
    // Apply free tier limits
    // These checks would typically involve fetching current counts from DB
    // For simplicity, we just set the flags based on potential.
    // The actual enforcement (e.g. "user.projects.length < MAX_FREE_PROJECTS") happens in Server Actions or UI.
    canCreateProject = true; // User can attempt, action will verify count
    canCreateClient = true;
    canCreateTask = true;
    maxProjects = MAX_FREE_PROJECTS;
    maxClients = MAX_FREE_CLIENTS;
    maxTasksPerProject = MAX_FREE_TASKS_PER_PROJECT;
  }


  const subscriptionData: SubscriptionDetails = {
    id: userProfile.stripeSubscriptionId || undefined,
    userId: userProfile.uid,
    status: userProfile.stripeSubscriptionStatus || 'free',
    tier: currentTier,
    priceId: userProfile.stripePriceId || undefined,
    currentPeriodStart: userProfile.stripeCurrentPeriodEnd ? undefined : undefined, // Placeholder, map Timestamps if needed
    currentPeriodEnd: userProfile.stripeCurrentPeriodEnd || undefined,
    planName: planDetails?.name || 'Unknown Plan',
    features: planDetails?.features || [],
    canCreateProject,
    canCreateClient,
    canCreateTask,
    maxProjects,
    maxClients,
    maxTasksPerProject,
  };

  return { 
    subscription: subscriptionData, 
    loading: false,
    isProTier: isPro,
    isFreeTier: !isPro,
 };
}
```