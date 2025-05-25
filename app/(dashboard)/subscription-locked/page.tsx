'use client';

import { useSubscription } from '@/lib/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Lock, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export default function SubscriptionLockedPage() {
  const { subscription, loading, isProTier } = useSubscription();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-6 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-brand-blue mb-4" />
        <p className="text-lg text-muted-foreground">Checking your subscription status...</p>
      </div>
    );
  }

  // If user is already on a Pro tier, this page might show a "You have access!" message
  // or redirect them. For this example, we assume it's for features ONLY for Pro.
  if (isProTier) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-6 text-center animate-fade-in">
        <ShieldCheck className="h-16 w-16 text-green-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">You Have Full Access!</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
          As a Pro subscriber, you already have access to this feature and all premium functionalities of ConstructCRM.
        </p>
        <Button asChild className="bg-brand-blue hover:bg-brand-blue/90 text-white group">
          <Link href="/dashboard">
            Go to Dashboard <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    );
  }

  // If user is on Free tier or no active subscription
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
      <Card className="w-full max-w-lg text-center shadow-xl animate-fade-in glass-card dark:glass-card">
        <CardHeader className="pt-8">
          <div className="mx-auto p-3 bg-yellow-400/20 dark:bg-yellow-500/20 rounded-full w-fit mb-4">
            <Lock className="h-10 w-10 text-yellow-500 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-200">Unlock Premium Features</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            This feature is exclusively available for our Pro subscribers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-8">
          <p className="text-gray-700 dark:text-gray-300">
            Upgrade your ConstructCRM experience to access advanced project management tools, unlimited resources, insightful analytics, and priority support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-brand-blue hover:bg-brand-blue/90 text-white group w-full sm:w-auto">
              <Link href="/pricing">
                View Pro Plans <Zap className="ml-2 h-4 w-4 transition-transform group-hover:rotate-12" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 group">
              <Link href="/dashboard">
                Back to Dashboard <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </CardContent>
         <CardFooter className="bg-black/5 dark:bg-white/5 p-4 text-xs text-muted-foreground">
            <p>Your current plan: <span className="font-semibold">{subscription?.planName || 'Free'}</span>. Pro plans unlock the full potential of ConstructCRM.</p>
        </CardFooter>
      </Card>
    </div>
  );
}

// Helper component (could be in ui folder)
const Loader2 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);