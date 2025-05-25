'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

const SignInSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }), // Min 1 for presence check
});

export function SignInForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<z.ZodFormattedError<z.infer<typeof SignInSchema>> | null>(null);


  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors(null);

    const validationResult = SignInSchema.safeParse({ email, password });
    if (!validationResult.success) {
      setErrors(validationResult.error.format());
      setIsLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Signed In Successfully!",
        description: "Welcome back! Redirecting you to the dashboard...",
        variant: "default",
      });
      router.push('/dashboard'); // Redirect to dashboard
    } catch (error: any) {
      console.error("Sign in error:", error);
      let errorMessage = "Invalid email or password. Please try again.";
       if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed login attempts. Please try again later or reset your password.";
      }
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-6">
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
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
      </Button>
    </form>
  );
}