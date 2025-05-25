import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getClientsByUser } from '@/lib/actions/clientActions';
import { getCurrentUser } from '@/lib/utils/authUtils';
import { PlusCircle, Users, AlertTriangle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: 'My Clients | ConstructCRM',
  description: 'View and manage all your clients.',
};
export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const user = await getCurrentUser();
  if (!user) return <p>Please sign in to view clients.</p>;

  const clients = await getClientsByUser(user.uid);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">My Clients</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your client relationships and contact information.
          </p>
        </div>
        <Button asChild className="bg-brand-blue hover:bg-brand-blue/90 text-white group shrink-0">
          <Link href="/clients/create">
            <PlusCircle className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
            Add New Client
          </Link>
        </Button>
      </div>

      {clients.length === 0 ? (
        <Card className="text-center py-12 animate-fade-in glass-card dark:glass-card" style={{animationDelay: "0.2s"}}>
           <CardHeader>
            <div className="mx-auto p-3 bg-yellow-400/20 dark:bg-yellow-500/20 rounded-full w-fit mb-4">
                <AlertTriangle className="h-10 w-10 text-yellow-500 dark:text-yellow-400" />
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-200">No Clients Yet</CardTitle>
            <CardDescription className="text-muted-foreground mt-2 max-w-md mx-auto">
              You haven&apos;t added any clients. Start building your client database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="bg-brand-blue hover:bg-brand-blue/90 text-white group">
              <Link href="/clients/create">
                <PlusCircle className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
                Add Your First Client
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" style={{animationDelay: "0.2s"}}>
          {clients.map((client, index) => (
            <Card key={client.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 glass-card dark:glass-card animate-fade-in" style={{ animationDelay: `${index * 0.05 + 0.3}s` }}>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200 hover:text-brand-blue transition-colors">
                  <Link href={`/clients/${client.id}`}>{client.name}</Link>
                </CardTitle>
                {client.companyName && <CardDescription className="text-gray-600 dark:text-gray-400">{client.companyName}</CardDescription>}
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> {client.email}</p>
                {client.phone && <p className="text-gray-700 dark:text-gray-300"><strong>Phone:</strong> {client.phone}</p>}
              </CardContent>
              <CardFooter className="border-t pt-4 dark:border-gray-700/50">
                <Button variant="outline" size="sm" asChild className="border-gray-300 dark:border-gray-600">
                  <Link href={`/clients/${client.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}