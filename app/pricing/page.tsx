```typescript
'use client'; // Make it a client component to use hooks and handle actions

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { pricingPlans, STRIPE_PRICE_ID_MONTHLY, STRIPE_PRICE_ID_YEARLY } from '@/lib/constants';
import { useAuth } from '@/components/auth/AuthProvider';
import { createCheckoutSession } from '@/lib/actions/stripeActions'; // Server Action
import { useToast } from '@/components/ui/use-toast';
import { Navbar } from '@/components/layout/Navbar'; // Using the main navbar
import { Footer } from '@/components/layout/Footer'; // Using the main footer

export default function PricingPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null); // Store priceId of loading plan

  const handleSubscribe = async (priceId: string | undefined) => {
    if (!priceId) {
      toast({ title: "Error", description: "Price ID is missing for this plan.", variant: "destructive" });
      return;
    }
    if (authLoading) {
      toast({ title: "Please wait", description: "Authentication status is loading."});
      return;
    }
    if (!user) {
      router.push(`/sign-in?redirect=/pricing&priceId=${priceId}`); // Redirect to sign-in if not logged in
      return;
    }

    setIsLoading(priceId);
    try {
      const { sessionId, error } = await createCheckoutSession(priceId, user.uid, userProfile?.stripeCustomerId || null);
      if (error || !sessionId) {
        toast({ title: "Subscription Error", description: error || "Could not create checkout session.", variant: "destructive" });
        setIsLoading(null);
        return;
      }
      // Redirect to Stripe Checkout
      const stripe = (await import('@stripe/stripe-js')).loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      const { error: stripeError } = (await stripe)!.redirectToCheckout({ sessionId });
      if (stripeError) {
        console.error("Stripe redirect error:", stripeError);
        toast({ title: "Stripe Error", description: stripeError.message || "Failed to redirect to Stripe.", variant: "destructive" });
      }
    } catch (err: any) {
      console.error("Subscription process error:", err);
      toast({ title: "Error", description: err.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      // setIsLoading(null); // isLoading is handled by Stripe redirect or error
    }
  };
  
  // Determine current plan for highlighting or disabling options
  const currentPriceId = userProfile?.stripePriceId;
  const currentSubscriptionStatus = userProfile?.stripeSubscriptionStatus;

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <Navbar />
      <main className="flex-grow py-12 md:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Find the Perfect Plan for Your Business
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
              Choose a plan that scales with your construction projects. Simple, transparent pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {pricingPlans.map((plan, index) => {
              const priceIdToUse = plan.id === 'monthly' ? plan.stripePriceIdMonthly : plan.id === 'yearly' ? plan.stripePriceIdYearly : undefined;
              const isCurrentPlan = currentPriceId === priceIdToUse && currentSubscriptionStatus === 'active';
              const isFreeTierActive = plan.id === 'free' && (!currentPriceId || currentSubscriptionStatus === 'free' || currentSubscriptionStatus === 'canceled');
              
              let buttonText = "Get Started";
              if (plan.id !== 'free') buttonText = plan.id === 'monthly' ? "Choose Monthly" : "Choose Yearly";
              if (isCurrentPlan) buttonText = "Current Plan";

              return (
                <Card 
                  key={plan.id} 
                  className={`flex flex-col shadow-2xl rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] animate-fade-in
                              ${plan.isPopular ? 'border-4 border-brand-blue bg-slate-800/50' : 'bg-white/10 backdrop-blur-md shadow-glass'}
                              ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
                  style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
                >
                  <CardHeader className={`p-6 ${plan.isPopular ? 'bg-brand-blue/10' : ''}`}>
                    <CardTitle className={`text-2xl font-bold ${plan.isPopular ? 'text-brand-blue' : 'text-white'}`}>{plan.name}</CardTitle>
                    <CardDescription className={`${plan.isPopular ? 'text-blue-200' : 'text-slate-400'} min-h-[40px]`}>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow p-6 space-y-4">
                    <div className="mb-6">
                      {plan.id === 'free' ? (
                        <span className="text-5xl font-extrabold text-white">Free</span>
                      ) : (
                        <>
                          <span className="text-5xl font-extrabold text-white">
                            ${plan.id === 'monthly' ? (plan.priceMonthly || 29) : (plan.priceYearly ? Math.round((plan.priceYearly || 290) / 12) : 24)}
                          </span>
                          <span className="text-lg text-slate-400">/month</span>
                          {plan.id === 'yearly' && <p className="text-sm text-green-400">Billed annually (${plan.priceYearly || 290}) - Save 15%!</p>}
                        </>
                      )}
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="p-6 bg-black/10 mt-auto">
                    {plan.id === 'free' ? (
                       <Button 
                        className="w-full bg-slate-600 hover:bg-slate-500 text-white font-semibold py-3"
                        disabled={isFreeTierActive || authLoading}
                        onClick={() => router.push(user ? '/dashboard' : '/sign-up')}
                      >
                        {isFreeTierActive ? "Active" : (user ? "Go to Dashboard" : "Get Started")}
                      </Button>
                    ) : (
                      <Button
                        className={`w-full font-semibold py-3 transition-all duration-300 ease-in-out transform hover:scale-105
                                    ${plan.isPopular ? 'bg-brand-blue hover:bg-brand-blue/90 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
                        onClick={() => handleSubscribe(priceIdToUse)}
                        disabled={isLoading === priceIdToUse || authLoading || isCurrentPlan}
                      >
                        {isLoading === priceIdToUse ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isCurrentPlan ? "Current Plan" : buttonText)}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
           <p className="text-center text-slate-400 mt-12 text-sm">
            All prices are in USD. You can upgrade, downgrade, or cancel your plan at any time.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

```