import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';
import type { User as FirebaseUser } from 'firebase/auth'; // For return type consistency if needed

interface AuthenticatedUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  // Add any other fields you might get from verifying the token/cookie
  // For example, custom claims like stripeRole
  stripeRole?: string; 
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const sessionCookie = cookies().get('session')?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    // Ensure adminAuth is initialized before calling verifySessionCookie
    if (!adminAuth) {
        console.error("authUtils: Firebase Admin SDK not initialized.");
        // Potentially throw an error or handle this case based on your app's needs
        // For now, returning null as if no user is authenticated.
        return null; 
    }
      
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
    
    // You can map decodedClaims to your AuthenticatedUser interface
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      displayName: decodedClaims.name, // 'name' in claims often maps to displayName
      photoURL: decodedClaims.picture, // 'picture' in claims often maps to photoURL
      stripeRole: decodedClaims.stripeRole as string | undefined, // Example custom claim
    };
  } catch (error) {
    // Session cookie is invalid or expired.
    // console.error('Error verifying session cookie in getCurrentUser:', error);
    // It's common for this to fail if the cookie is old, so might not always be an "error" to log verbosely.
    return null;
  }
}

// This function is a placeholder for how you would set the session cookie after login.
// It would typically be called from an API route.
export async function setSessionCookie(idToken: string): Promise<void> {
  // const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  // const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
  // cookies().set('session', sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
  console.log("setSessionCookie function needs to be implemented in an API route.");
}

export async function clearSessionCookie(): Promise<void> {
    // cookies().delete('session');
    console.log("clearSessionCookie function needs to be implemented.");
}