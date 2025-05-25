```typescript
import { ProjectForm } from '@/components/dashboard/ProjectForm'; // Will create this
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
  title: 'Create New Project | ConstructCRM',
  description: 'Add a new construction project to your portfolio.',
};

export default async function CreateProjectPage() {
  const user = await getCurrentUser();

  if (!user) {
    // Redirect or show an error, middleware should handle this
    return <p>Please sign in to create a project.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4 animate-fade-in">
        <Link href="/projects" className="p-2 rounded-md hover:bg-muted transition-colors">
          <ArrowLeft className="h-6 w-6 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Create New Project</h1>
          <p className="text-muted-foreground mt-1">
            Fill in the details below to add a new project to ConstructCRM.
          </p>
        </div>
      </div>

      <Card className="shadow-lg animate-fade-in glass-card dark:glass-card" style={{animationDelay: "0.1s"}}>
        <CardHeader>
          <CardTitle className="text-xl text-gray-800 dark:text-gray-200">Project Details</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Provide as much information as possible for better tracking.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm userId={user.uid} />
        </CardContent>
      </Card>
    </div>
  );
}
```