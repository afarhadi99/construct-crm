```typescript
'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { UserNav } from './UserNav'; // We'll create this next
import { Button } from '@/components/ui/button';
import { LogIn, LayoutDashboard, DollarSign, Users, Briefcase } from 'lucide-react'; // Icons

export function Navbar() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          {/* <Briefcase className="h-6 w-6 text-brand-blue" /> */}
          <span className="font-bold text-xl sm:inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-teal-400 to-green-400">
            ConstructCRM
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {user && (
            <>
              <Link
                href="/dashboard"
                className="text-foreground/70 transition-colors hover:text-foreground"
              >
                <LayoutDashboard className="inline-block w-4 h-4 mr-1 mb-0.5" /> Dashboard
              </Link>
              <Link
                href="/projects"
                className="text-foreground/70 transition-colors hover:text-foreground"
              >
                <Briefcase className="inline-block w-4 h-4 mr-1 mb-0.5" /> Projects
              </Link>
              <Link
                href="/clients"
                className="text-foreground/70 transition-colors hover:text-foreground"
              >
                <Users className="inline-block w-4 h-4 mr-1 mb-0.5" /> Clients
              </Link>
            </>
          )}
          <Link
            href="/pricing"
            className="text-foreground/70 transition-colors hover:text-foreground"
          >
            <DollarSign className="inline-block w-4 h-4 mr-1 mb-0.5" /> Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div>
          ) : user ? (
            <UserNav />
          ) : (
            <Button asChild variant="ghost" className="hover:bg-primary/80 transition-colors">
              <Link href="/sign-in">
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
```