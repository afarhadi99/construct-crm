```typescript
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/client';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { UserProfile } from '@/models/User'; // Using UserProfile for our extended user data

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null; // Our extended user profile from Firestore
  loading: boolean;
  isAdmin: boolean; // Example of a derived role, could be based on custom claims or Firestore data
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Placeholder for admin logic

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // User is signed in, listen to their profile in Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
            // Example: Check for admin role (you might get this from custom claims or a field in userProfile)
            // setIsAdmin(docSnap.data().isAdmin === true);
          } else {
            // This case might happen if the Firestore doc isn't created immediately after signup
            // Or if a user exists in Auth but not Firestore (e.g. imported users)
            setUserProfile(null); 
            console.warn(`No Firestore profile found for user ${firebaseUser.uid}. Consider creating one.`);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
          setLoading(false);
        });
        return () => unsubscribeProfile(); // Cleanup Firestore listener
      } else {
        // User is signed out
        setUserProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth(); // Cleanup Auth listener
  }, []);

  const value = { user, userProfile, loading, isAdmin };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```