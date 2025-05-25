import { SignUpForm } from '@/components/auth/SignUpForm';
import Link from 'next/link';

export const metadata = {
  title: 'Sign Up | ConstructCRM',
  description: 'Create your ConstructCRM account.',
};

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-md shadow-glass rounded-xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">ConstructCRM</h1>
          <p className="mt-2 text-lg text-slate-300">Create Your Account</p>
        </div>
        
        <SignUpForm />
        
        <p className="mt-8 text-sm text-center text-slate-400">
          Already have an account?{' '}
          <Link href="/sign-in" className="font-medium text-brand-blue hover:text-brand-blue/80 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
       <Link href="/" className="mt-8 text-sm text-slate-400 hover:text-slate-200 transition-colors">
        &larr; Back to Home
      </Link>
    </div>
  );
}