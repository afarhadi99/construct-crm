```typescript
import { SignInForm } from '@/components/auth/SignInForm';
import Link from 'next/link';

export const metadata = {
  title: 'Sign In | ConstructCRM',
  description: 'Sign in to your ConstructCRM account.',
};

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-md shadow-glass rounded-xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">ConstructCRM</h1>
          <p className="mt-2 text-lg text-slate-300">Welcome Back!</p>
        </div>
        
        <SignInForm />
        
        <p className="mt-8 text-sm text-center text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="font-medium text-brand-blue hover:text-brand-blue/80 transition-colors">
            Sign Up
          </Link>
        </p>
        {/* Optional: Add Forgot Password link later */}
        {/* <p className="mt-2 text-sm text-center">
          <Link href="/forgot-password" className="text-slate-400 hover:text-slate-200 transition-colors">
            Forgot password?
          </Link>
        </p> */}
      </div>
      <Link href="/" className="mt-8 text-sm text-slate-400 hover:text-slate-200 transition-colors">
        &larr; Back to Home
      </Link>
    </div>
  );
}
```