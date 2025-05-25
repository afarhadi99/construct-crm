```typescript
import { ClientForm } from '@/components/dashboard/ClientForm'; // Will create this stub
import { getCurrentUser } from '@/lib/utils/authUtils';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata = {
  title: 'Add New Client | ConstructCRM',
  description: 'Add a new client to your ConstructCRM database.',
};

export default async function CreateClientPage() {
  const user = await getCurrentUser();
  if (!user) return <p>Please sign in to add a client.</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4 animate-fade-in">
        <Link href="/clients" className="p-2 rounded-md hover:bg-muted transition-colors">
          <ArrowLeft className="h-6 w-6 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Add New Client</h1>
          <p className="text-muted-foreground mt-1">
            Enter the details for your new client.
          </p>
        </div>
      </div>
      <Card className="shadow-lg animate-fade-in glass-card dark:glass-card" style={{animationDelay: "0.1s"}}>
        <CardHeader>
            <CardTitle className="text-xl text-gray-800 dark:text-gray-200">Client Information</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Accurate client data helps build strong relationships.</CardDescription>
        </CardHeader>
        <CardContent>
            <ClientForm userId={user.uid} />
        </CardContent>
      </Card>
    </div>
  );
}
```