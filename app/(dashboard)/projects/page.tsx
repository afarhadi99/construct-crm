import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/dashboard/ProjectCard'; // Will create this
import { getProjectsByUser } from '@/lib/actions/projectActions';
import { getCurrentUser } from '@/lib/utils/authUtils'; // Helper to get user server-side
import { PlusCircle, AlertTriangle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


export const metadata = {
  title: 'My Projects | ConstructCRM',
  description: 'View and manage all your construction projects.',
};

// This page needs to be dynamic as it fetches user-specific data
export const dynamic = 'force-dynamic'; 

export default async function ProjectsPage() {
  const user = await getCurrentUser(); // Helper to get user (e.g., from session cookie)

  if (!user) {
    // This should ideally be handled by middleware, but as a fallback
    return (
      <div className="text-center py-10">
        <p>Please sign in to view your projects.</p>
        <Button asChild className="mt-4">
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </div>
    );
  }

  const projects = await getProjectsByUser(user.uid);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">My Projects</h1>
          <p className="text-muted-foreground mt-1">
            Oversee all your construction ventures from a single dashboard.
          </p>
        </div>
        <Button asChild className="bg-brand-blue hover:bg-brand-blue/90 text-white group shrink-0">
          <Link href="/projects/create">
            <PlusCircle className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
            Create New Project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="text-center py-12 animate-fade-in glass-card dark:glass-card" style={{animationDelay: "0.2s"}}>
          <CardHeader>
            <div className="mx-auto p-3 bg-yellow-400/20 dark:bg-yellow-500/20 rounded-full w-fit mb-4">
                <AlertTriangle className="h-10 w-10 text-yellow-500 dark:text-yellow-400" />
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-200">No Projects Yet</CardTitle>
            <CardDescription className="text-muted-foreground mt-2 max-w-md mx-auto">
              It looks like you haven&apos;t created any projects. Get started by adding your first construction project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="bg-brand-blue hover:bg-brand-blue/90 text-white group">
              <Link href="/projects/create">
                <PlusCircle className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
                Create Your First Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" style={{animationDelay: "0.2s"}}>
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} style={{ animationDelay: `${index * 0.05 + 0.3}s` }} className="animate-fade-in" />
          ))}
        </div>
      )}
    </div>
  );
}