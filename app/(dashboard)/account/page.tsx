'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { createCustomerPortalSession } from '@/lib/actions/stripeActions';
import { updateUserDisplayName } from '@/lib/actions/authActions'; // Assuming this updates Firestore too or is combined
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client'; // Client SDK for Firestore updates by user
import { Loader2, ExternalLink, Edit3, Save, UserCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import { getPlanByTier, pricingPlans } from '@/lib/constants'; // Import getPlanByTier
import { Badge } from '@/components/ui/badge'; // Assuming Shadcn Badge

export default function AccountPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || user?.displayName || '');
    } else if (user && !userProfile && !authLoading) {
      // Fallback if userProfile is somehow null after auth loading finishes
      setDisplayName(user.displayName || '');
    }
  }, [userProfile, user, authLoading]);

  const handleNameUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !displayName.trim()) {
      toast({ title: "Error", description: "Display name cannot be empty.", variant: "destructive" });
      return;
    }
    setIsSavingName(true);
    try {
      // Update Firebase Auth profile (client-side)
      // await updateProfile(user, { displayName }); // This is an option

      // Update Firestore document (client-side, or use a Server Action for more complex logic/permissions)
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: displayName.trim(),
        updatedAt: serverTimestamp(),
      });
      
      // Optionally call server action if admin SDK operations are needed or for revalidation
      // const result = await updateUserDisplayName(user.uid, displayName.trim());
      // if (!result.success) throw new Error(result.message);

      toast({ title: "Success", description: "Display name updated successfully." });
      setIsEditingName(false);
    } catch (error: any) {
      console.error("Error updating display name:", error);
      toast({ title: "Error", description: error.message || "Failed to update display name.", variant: "destructive" });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!userProfile?.stripeCustomerId) {
      toast({ title: "Error", description: "Stripe customer ID not found. Cannot manage subscription.", variant: "destructive" });
      return;
    }
    setIsPortalLoading(true);
    try {
      const { portalUrl, error } = await createCustomerPortalSession(userProfile.stripeCustomerId);
      if (error || !portalUrl) {
        toast({ title: "Error", description: error || "Could not open customer portal.", variant: "destructive" });
        setIsPortalLoading(false);
        return;
      }
      window.location.href = portalUrl;
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to redirect to Stripe portal.", variant: "destructive" });
      setIsPortalLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader><div className="h-6 bg-muted rounded w-1/3 mb-2"></div><div className="h-4 bg-muted rounded w-1/2"></div></CardHeader>
            <CardContent><div className="h-10 bg-muted rounded w-3/4"></div></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!user) {
    // This should ideally be caught by middleware, but as a fallback:
    return <p className="text-center text-lg text-muted-foreground">Please sign in to view your account.</p>;
  }

  const currentPlanDetails = userProfile?.subscriptionTier ? getPlanByTier(userProfile.subscriptionTier) : getPlanByTier('free');
  const subscriptionStatus = userProfile?.stripeSubscriptionStatus;
  const isSubscriptionActive = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header className="animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and subscription details.</p>
      </header>

      {/* Profile Information Card */}
      <Card className="shadow-lg animate-fade-in glass-card dark:glass-card" style={{animationDelay: "0.1s"}}>
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-gray-800 dark:text-gray-200">
            <UserCircle className="mr-2 h-6 w-6 text-brand-blue" /> Profile Information
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleNameUpdate} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
              <Input id="email" type="email" value={user.email || ''} disabled className="mt-1 bg-slate-100 dark:bg-slate-700 cursor-not-allowed" />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here.</p>
            </div>
            <div>
              <Label htmlFor="displayName" className="text-gray-700 dark:text-gray-300">Display Name</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={!isEditingName || isSavingName}
                  className={`transition-colors ${!isEditingName ? 'bg-slate-100 dark:bg-slate-700 cursor-not-allowed' : 'bg-white dark:bg-slate-800'}`}
                />
                {!isEditingName ? (
                  <Button type="button" variant="outline" size="icon" onClick={() => setIsEditingName(true)} aria-label="Edit name" className="border-gray-300 dark:border-gray-600">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" size="icon" disabled={isSavingName} aria-label="Save name" className="bg-green-500 hover:bg-green-600">
                    {isSavingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Subscription Details Card */}
      <Card className="shadow-lg animate-fade-in glass-card dark:glass-card" style={{animationDelay: "0.2s"}}>
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-gray-800 dark:text-gray-200">
            <ShieldCheck className="mr-2 h-6 w-6 text-green-500" /> Subscription Details
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">View and manage your current subscription plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Current Plan:</span>
            <Badge variant={isSubscriptionActive ? "default" : "secondary"} 
                   className={isSubscriptionActive ? "bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300" : "bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300"}>
              {currentPlanDetails?.name || 'N/A'}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Status:</span>
            <span className={`font-semibold ${isSubscriptionActive ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
              {subscriptionStatus ? subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1) : 'N/A'}
            </span>
          </div>
          {userProfile?.stripeCurrentPeriodEnd && isSubscriptionActive && (
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Renews/Expires on:</span>
              <span className="text-gray-600 dark:text-gray-400">
                {new Date(userProfile.stripeCurrentPeriodEnd.toMillis()).toLocaleDateString()}
              </span>
            </div>
          )}
          {subscriptionStatus === 'past_due' || subscriptionStatus === 'unpaid' && (
             <div className="p-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your subscription payment is overdue. Please update your payment method to maintain access.
                </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6 dark:border-gray-700">
          {userProfile?.stripeCustomerId ? (
            <Button onClick={handleManageSubscription} disabled={isPortalLoading} className="w-full md:w-auto bg-brand-blue hover:bg-brand-blue/90 text-white transition-all duration-300 ease-in-out transform hover:scale-105">
              {isPortalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
              Manage Subscription in Stripe
            </Button>
          ) : (
            <Button asChild className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white">
              <Link href="/pricing">Upgrade to Pro</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}