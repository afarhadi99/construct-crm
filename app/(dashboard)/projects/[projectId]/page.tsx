import { getProjectById } from '@/lib/actions/projectActions';
import { getCurrentUser } from '@/lib/utils/authUtils';
import { ProjectForm } from '@/components/dashboard/ProjectForm'; // Re-use for editing
import { TaskList } from '@/components/dashboard/TaskList'; // Placeholder for tasks
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit, AlertTriangle, Info, ListChecks, DollarSign, CalendarDays, MapPin, Users as ClientIcon } from 'lucide-react';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator'; // Shadcn Separator

export async function generateMetadata({ params }: { params: { projectId: string } }) {
  const user = await getCurrentUser();
  if (!user) return { title: 'Project Details' }; // Or handle appropriately

  const project = await getProjectById(user.uid, params.projectId);
  if (!project) return { title: 'Project Not Found' };

  return {
    title: `${project.name} | ConstructCRM`,
    description: `Details for project: ${project.name}`,
  };
}

// This page needs to be dynamic
export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const user = await getCurrentUser();

  if (!user) {
    // Redirect or show error, middleware should handle
    return <p>Please sign in to view project details.</p>;
  }

  const project = await getProjectById(user.uid, params.projectId);

  if (!project) {
    notFound(); // Triggers the not-found.tsx or default Next.js 404 page
  }
  
  const statusColorMap: Record<Project['status'], string> = {
    'Planning': 'border-blue-500 text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-500/20 dark:border-blue-500/50',
    'In Progress': 'border-yellow-500 text-yellow-700 bg-yellow-50 dark:text-yellow-300 dark:bg-yellow-500/20 dark:border-yellow-500/50',
    'On Hold': 'border-orange-500 text-orange-700 bg-orange-50 dark:text-orange-300 dark:bg-orange-500/20 dark:border-orange-500/50',
    'Completed': 'border-green-500 text-green-700 bg-green-50 dark:text-green-300 dark:bg-green-500/20 dark:border-green-500/50',
    'Canceled': 'border-red-500 text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-500/20 dark:border-red-500/50',
  };


  // For now, we'll have a state for edit mode, but a better UX might be a separate edit page or modal
  // This example will show project details and then the form for editing.
  // A more sophisticated approach might use query params to toggle edit mode: ?edit=true

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-3">
            <Link href="/projects" className="p-2 rounded-md hover:bg-muted transition-colors -ml-2">
            <ArrowLeft className="h-6 w-6 text-muted-foreground" />
            </Link>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center">
                    {project.name} 
                    <Badge variant="outline" className={`ml-3 capitalize ${statusColorMap[project.status]}`}>{project.status}</Badge>
                </h1>
                <p className="text-muted-foreground mt-1">
                    Detailed overview and management options for your project.
                </p>
            </div>
        </div>
        {/* <Button variant="outline" asChild>
          <Link href={`/projects/${project.id}?edit=true`}> <Edit className="mr-2 h-4 w-4" /> Edit Project </Link>
        </Button> */}
      </div>

      {/* Project Overview Section */}
      <Card className="shadow-lg animate-fade-in glass-card dark:glass-card" style={{animationDelay: "0.1s"}}>
        <CardHeader>
          <CardTitle className="text-xl text-gray-800 dark:text-gray-200 flex items-center"><Info className="mr-2 h-5 w-5 text-brand-blue"/>Project Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            {project.clientName && (
                <div className="flex items-center">
                    <ClientIcon className="w-4 h-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <strong className="text-gray-600 dark:text-gray-400 mr-2">Client:</strong>
                    <span className="text-gray-800 dark:text-gray-200">{project.clientName}</span>
                </div>
            )}
            {project.address && (
                <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <strong className="text-gray-600 dark:text-gray-400 mr-2">Address:</strong>
                    <span className="text-gray-800 dark:text-gray-200">{project.address}</span>
                </div>
            )}
            {project.startDate && (
                <div className="flex items-center">
                    <CalendarDays className="w-4 h-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <strong className="text-gray-600 dark:text-gray-400 mr-2">Start Date:</strong>
                    <span className="text-gray-800 dark:text-gray-200">{new Date(project.startDate.seconds * 1000).toLocaleDateString()}</span>
                </div>
            )}
            {project.expectedEndDate && (
                <div className="flex items-center">
                    <CalendarDays className="w-4 h-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <strong className="text-gray-600 dark:text-gray-400 mr-2">Expected End:</strong>
                    <span className="text-gray-800 dark:text-gray-200">{new Date(project.expectedEndDate.seconds * 1000).toLocaleDateString()}</span>
                </div>
            )}
            {project.budget !== undefined && project.budget !== null && (
                <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <strong className="text-gray-600 dark:text-gray-400 mr-2">Budget:</strong>
                    <span className="text-gray-800 dark:text-gray-200">${project.budget.toLocaleString()}</span>
                </div>
            )}
             <div className="flex items-center md:col-span-2"> {/* Status again for clarity if needed */}
                <Info className="w-4 h-4 mr-2 text-muted-foreground flex-shrink-0" />
                <strong className="text-gray-600 dark:text-gray-400 mr-2">Current Status:</strong>
                <Badge variant="outline" className={`capitalize ${statusColorMap[project.status]}`}>{project.status}</Badge>
            </div>
            {project.description && (
                <div className="md:col-span-2 pt-2">
                    <strong className="text-gray-600 dark:text-gray-400 block mb-1">Description:</strong>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md border dark:border-slate-700">{project.description}</p>
                </div>
            )}
            {project.notes && (
                <div className="md:col-span-2 pt-2">
                    <strong className="text-gray-600 dark:text-gray-400 block mb-1">Internal Notes:</strong>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md border dark:border-slate-700">{project.notes}</p>
                </div>
            )}
        </CardContent>
      </Card>
      
      <Separator className="my-8 dark:bg-gray-700/50" />

      {/* Edit Project Form Section */}
      <Card className="shadow-lg animate-fade-in glass-card dark:glass-card" style={{animationDelay: "0.2s"}}>
        <CardHeader>
          <CardTitle className="text-xl text-gray-800 dark:text-gray-200 flex items-center"><Edit className="mr-2 h-5 w-5 text-brand-blue"/>Edit Project Details</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Modify the project information below.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm userId={user.uid} project={project} />
        </CardContent>
      </Card>
      
      <Separator className="my-8 dark:bg-gray-700/50" />

      {/* Placeholder for Task Management Section */}
      <Card className="shadow-lg animate-fade-in glass-card dark:glass-card" style={{animationDelay: "0.3s"}}>
        <CardHeader>
          <CardTitle className="text-xl text-gray-800 dark:text-gray-200 flex items-center"><ListChecks className="mr-2 h-5 w-5 text-brand-blue"/>Project Tasks</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Manage tasks associated with this project.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* <TaskList projectId={project.id} /> */}
          <p className="text-muted-foreground">Task management functionality will be implemented here.</p>
          <Button variant="outline" className="mt-4 border-gray-300 dark:border-gray-600">Add New Task</Button>
        </CardContent>
      </Card>

    </div>
  );
}

// You might want a not-found.tsx in app/(dashboard)/projects/[projectId]/
// or a global one in app/