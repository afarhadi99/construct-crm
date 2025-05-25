```typescript
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
// import { Sidebar } from '@/components/layout/Sidebar'; // Optional: if you add a sidebar

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        {/* Optional Sidebar:
        <aside className="hidden md:block w-64 border-r p-4">
          <Sidebar />
        </aside>
        */}
        <main className="flex-1 p-4 md:p-8 lg:p-10 bg-slate-50 dark:bg-slate-900/50"> 
          {/* Added some padding and a subtle background for content area */}
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
```