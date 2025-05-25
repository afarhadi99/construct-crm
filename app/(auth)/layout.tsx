```typescript
import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The background gradient and centering is handled by individual page.tsx files (SignInPage, SignUpPage)
    // This layout can be used for any shared elements specific to the auth flow, if any.
    // For now, it's a simple pass-through.
    <div className="auth-layout-container"> 
      {children}
    </div>
  );
}

// If you wanted a specific background or structure for all auth pages, you'd add it here.
// For example:
// <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
//   <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
//     {children}
//   </div>
// </div>
// However, the current design has a full-page gradient background defined in the page.tsx files.
```