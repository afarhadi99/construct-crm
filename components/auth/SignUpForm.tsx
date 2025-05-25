'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/client';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast'; // Assuming Shadcn toast
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

const SignUpSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<z.ZodFormattedError<z.infer<typeof SignUpSchema>> | null>(null);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors(null);

    const validationResult = SignUpSchema.safeParse({ displayName, email, password });
    if (!validationResult.success) {
      setErrors(validationResult.error.format());
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(user, { displayName });

      // Create user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        photoURL: user.photoURL, // Initially null, can be updated later
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
        stripeSubscriptionStatus: 'free', // Default to free tier
        subscriptionTier: 'free',
      });

      toast({
        title: "Account Created!",
        description: "Welcome to ConstructCRM. Redirecting you to the dashboard...",
        variant: "default",
      });
      router.push('/dashboard'); // Redirect to dashboard or a welcome page
    } catch (error: any) {
      console.error("Sign up error:", error);
      let errorMessage = "Failed to create account. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already in use. Please try another or sign in.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "The password is too weak. Please choose a stronger password.";
      }
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-6">
      <div>
        <Label htmlFor="displayName" className="text-slate-300">Full Name</Label>
        <Input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="John Doe"
          className="mt-1 bg-white/20 border-slate-500 text-white placeholder:text-slate-400 focus:ring-brand-blue"
          disabled={isLoading}
        />
        {errors?.displayName && <p className="text-red-400 text-sm mt-1">{errors.displayName._errors[0]}</p>}
      </div>
      <div>
        <Label htmlFor="email" className="text-slate-300">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1 bg-white/20 border-slate-500 text-white placeholder:text-slate-400 focus:ring-brand-blue"
          disabled={isLoading}
        />
        {errors?.email && <p className="text-red-400 text-sm mt-1">{errors.email._errors[0]}</p>}
      </div>
      <div>
        <Label htmlFor="password" className="text-slate-300">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1 bg-white/20 border-slate-500 text-white placeholder:text-slate-400 focus:ring-brand-blue"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-200"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors?.password && <p className="text-red-400 text-sm mt-1">{errors.password._errors[0]}</p>}
      </div>
      <Button 
        type="submit" 
        className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold py-3 transition-all duration-300 ease-in-out transform hover:scale-105 focus:ring-2 focus:ring-brand-blue/50 focus:ring-offset-2 focus:ring-offset-slate-900"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
      </Button>
    </form>
  );
}