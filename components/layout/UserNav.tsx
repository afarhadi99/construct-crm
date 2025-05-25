```typescript
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/components/auth/AuthProvider';
import { signOutUser } from '@/lib/actions/authActions'; // Server action for sign out
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, User, CreditCard, LogOut, Settings, LifeBuoy, Loader2 } from 'lucide-react';
import { useToast } from "../ui/use-toast";
import { useState } from "react";

export function UserNav() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      // Client-side sign out from Firebase
      await auth.signOut(); 
      
      // Optional: Call server action for any server-side cleanup or logging
      // await signOutUser(); 

      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      router.push('/'); // Redirect to home page after sign out
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign Out Failed",
        description: error.message || "An error occurred during sign out.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  if (authLoading) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div>;
  }

  if (!user) {
    return null; // Or a sign-in button if appropriate for the context
  }

  const displayName = userProfile?.displayName || user.displayName || "User";
  const email = userProfile?.email || user.email || "No email";
  const avatarSrc = userProfile?.photoURL || user.photoURL;
  const avatarFallback = displayName.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9 border-2 border-transparent hover:border-brand-blue transition-colors">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
            <AvatarFallback className="bg-muted text-muted-foreground">{avatarFallback}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mt-2 glass-card" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/dashboard" passHref>
            <DropdownMenuItem className="cursor-pointer hover:bg-primary/10">
              <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Dashboard</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/account" passHref>
            <DropdownMenuItem className="cursor-pointer hover:bg-primary/10">
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>My Account</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/pricing" passHref>
            <DropdownMenuItem className="cursor-pointer hover:bg-primary/10">
              <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Billing</span>
            </DropdownMenuItem>
          </Link>
           <Link href="/settings" passHref> {/* Placeholder for future settings page */}
            <DropdownMenuItem className="cursor-pointer hover:bg-primary/10" disabled>
              <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer hover:bg-primary/10" disabled>
            <LifeBuoy className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut} className="cursor-pointer text-red-500 hover:!text-red-500 hover:!bg-red-500/10 focus:!text-red-500 focus:!bg-red-500/10">
          {isSigningOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Need to import auth from firebase client for signout
import { auth } from '@/lib/firebase/client';
```