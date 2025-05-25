import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin'; // Using admin SDK to verify token

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public paths that don't require authentication
  const publicPaths = ['/sign-in', '/sign-up', '/pricing', '/api/stripe/webhooks'];

  // Check if the current path is a public path or an API/static file path
  if (
    publicPaths.some(path => pathname.startsWith(path)) ||
    pathname.startsWith('/_next/') || // Next.js internal assets
    pathname.startsWith('/static/') || // Your static assets folder if you have one
    pathname.includes('.') // Generally, files with extensions (favicon.ico, images)
  ) {
    return NextResponse.next();
  }

  // For all other paths, assume authentication is required.
  // This is a simplified example. In a real app, you'd verify a session cookie
  // or an Authorization header containing a Firebase ID token.

  // Example: Using a session cookie (if you implement server-side session cookies)
  const sessionCookie = request.cookies.get('session')?.value;

  if (!sessionCookie) {
    // If no session cookie, redirect to sign-in
    // Preserve the original path for redirection after login
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  try {
    // Verify the session cookie with Firebase Admin SDK
    // This is a server-side check.
    // Note: This requires `FIREBASE_PRIVATE_KEY` to be correctly set up for `adminAuth`.
    // If adminAuth is not initialized properly, this will fail.
    // Ensure your Firebase Admin SDK setup in `lib/firebase/admin.ts` is robust.
    if (adminAuth) { // Check if adminAuth is initialized
        await adminAuth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
    } else {
        throw new Error("Firebase Admin SDK not initialized. Cannot verify session cookie.");
    }
    // If verification is successful, allow the request to proceed
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware: Session cookie verification failed or Admin SDK issue:', error);
    // If verification fails (e.g., cookie expired, revoked, or admin SDK issue), clear the invalid cookie and redirect to sign-in
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    url.searchParams.set('redirectedFrom', pathname);
    
    const response = NextResponse.redirect(url);
    // Clear the potentially invalid session cookie
    response.cookies.delete('session'); 
    return response;
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - we handle /api/stripe/webhooks explicitly above
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     * This ensures the middleware runs on pages and not on static assets.
     */
    // '/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)', // More complex regex
    // Simpler approach: let the middleware logic handle public paths.
    // The middleware will run on all paths, and we'll explicitly bypass for public/static ones.
    "/:path*", // Runs on all paths, logic inside handles exclusions.
  ],
};

/*
Important Considerations for Firebase Auth in Middleware:

1.  **Client-Side vs. Server-Side Auth State:**
    *   Firebase Auth primarily manages sessions on the client-side using IndexedDB.
    *   For server-side rendering (SSR) and middleware, you need a way to pass this auth state to the server.

2.  **ID Tokens:**
    *   When a user signs in, the Firebase client SDK provides an ID token.
    *   You can send this ID token to your server (e.g., in an `Authorization: Bearer <ID_TOKEN>` header or a cookie).
    *   The server (middleware, API routes, Server Actions) can then verify this ID token using the Firebase Admin SDK.

3.  **Session Cookies (Recommended for SSR/Middleware):**
    *   For better SSR/middleware integration, Firebase offers session cookies.
    *   **Flow:**
        a.  After user signs in (client-side), get their ID token.
        b.  Send this ID token to a server endpoint (e.g., an API route `/api/auth/sessionLogin`).
        c.  This server endpoint uses `adminAuth.createSessionCookie(idToken, { expiresIn })` to create a session cookie.
        d.  Set this session cookie in the HTTP response (HttpOnly, Secure, SameSite).
        e.  The middleware can then check for this `session` cookie and verify it using `adminAuth.verifySessionCookie()`.
    *   This approach is more robust for server-rendered pages as the auth state is available via a standard HTTP cookie.

4.  **Middleware Limitations:**
    *   Middleware runs on the Edge, so ensure your Firebase Admin SDK initialization is compatible or conditionally handled if it relies on Node.js-specific APIs not available on the Edge (though `firebase-admin` generally works).
    *   Accessing environment variables for Firebase Admin SDK in middleware needs to be correctly configured for your deployment environment (e.g., Vercel Edge Functions).

**This middleware example assumes you've implemented a session cookie mechanism.**
If you are relying purely on client-side Firebase Auth and protecting routes mainly via client-side checks + Server Action/API route verification, your middleware might be simpler or focus on other tasks.
However, for true route protection at the edge/server level before rendering, a server-verifiable token (like a session cookie) is necessary.
The `request.cookies.get('session')?.value;` line implies such a cookie is being set elsewhere (e.g., after login via an API route).
*/