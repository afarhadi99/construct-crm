'use server';

import { auth } from '@/lib/firebase/client'; // Client SDK for signout
import { adminAuth } from '@/lib/firebase/admin'; // Admin SDK for more complex ops if needed
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Note: Firebase client SDK's signOut is usually sufficient and simpler for client-initiated sign-out.
// A server action for sign-out is more about server-side cleanup or cookie management if you were
// using custom session cookies. For Firebase's default client-side persistence,
// client-side signOut is standard. However, to demonstrate a server action:

export async function signOutUser() {
  try {
    // If you were using custom session cookies managed by the server:
    // const sessionCookie = cookies().get('session')?.value;
    // if (sessionCookie) {
    //   await adminAuth.verifySessionCookie(sessionCookie); // Verifies and decodes
    //   await adminAuth.revokeRefreshTokens(decodedClaims.sub); // Revokes tokens for the user
    //   cookies().delete('session');
    // }
    // For standard Firebase client auth, this server action might just be a wrapper
    // or could be called after client-side signOut if there are server tasks to perform.
    // The actual sign-out state change is handled by Firebase client SDK.
    
    // This action primarily serves to revalidate paths if needed after sign-out,
    // or to perform server-side logging/cleanup.
    // The client will call auth.signOut() and then potentially call this.
    
    console.log("User sign-out action invoked on server.");
    // Revalidate relevant paths if your UI changes significantly based on auth state
    // that isn't immediately reflected by client-side routing after sign-out.
    revalidatePath('/');
    revalidatePath('/dashboard');
    
    return { success: true, message: "Sign out action processed." };
  } catch (error: any) {
    console.error('Error in signOutUser server action:', error);
    return { success: false, message: error.message || "Sign out failed." };
  }
}

// Example: Update user display name (can also be done client-side)
// This demonstrates using admin SDK if needed, but for simple profile updates,
// client-side `updateProfile` on FirebaseUser is often easier.
export async function updateUserDisplayName(uid: string, newDisplayName: string) {
  if (!uid || !newDisplayName) {
    return { success: false, message: "UID and new display name are required." };
  }
  try {
    await adminAuth.updateUser(uid, {
      displayName: newDisplayName,
    });
    // Also update in Firestore if you store it there separately
    // const userDocRef = adminDb.collection('users').doc(uid);
    // await userDocRef.update({ displayName: newDisplayName, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    
    revalidatePath('/account'); // Revalidate account page to show updated name
    return { success: true, message: "Display name updated successfully." };
  } catch (error: any) {
    console.error('Error updating display name:', error);
    return { success: false, message: error.message || "Failed to update display name." };
  }
}