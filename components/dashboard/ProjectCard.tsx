```typescript
'use client'; // Can be client if it has interactions, or server if just display

import Link from 'next/link';
import { Project } from '@/models/Project';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Users, DollarSign, Edit, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { deleteProject } from '@/lib/actions/projectActions'; // Server Action
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Assuming Shadcn Alert Dialog

interface ProjectCardProps {
  project: Project;
  className?: string;
  style?: React.CSSProperties;
}

export function ProjectCard({ project, className, style }: ProjectCardProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Assuming project.userId is available if needed by deleteProject,
      // but typically the action should verify ownership based on the logged-in user.
      // For this example, let's assume deleteProject takes userId from server context.
      const result = await deleteProject(project.userId, project.id); 
      if (result.success) {
        toast({ title: "Project Deleted", description: result.message });
        // Revalidation is handled by the server action, so the list should update.
      } else {
        throw new Error(result.error as string || "Failed to delete project.");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadgeVariant = (status: Project['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Completed': return 'default'; // Greenish in default theme
      case 'In Progress': return 'secondary'; // Bluish/Grayish
      case 'Planning': return 'outline'; // Neutral
      case 'On Hold': return 'outline'; // Yellowish if customized
      case 'Canceled': return 'destructive';
      default: return 'outline';
    }
  };
  
  const statusColorMap: Record<Project['status'], string> = {
    'Planning': 'border-blue-500 text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-500/20 dark:border-blue-500/50',
    'In Progress': 'border-yellow-500 text-yellow-700 bg-yellow-50 dark:text-yellow-300 dark:bg-yellow-500/20 dark:border-yellow-500/50',
    'On Hold': 'border-orange-500 text-orange-700 bg-orange-50 dark:text-orange-300 dark:bg-orange-500/20 dark:border-orange-500/50',
    'Completed': 'border-green-500 text-green-700 bg-green-50 dark:text-green-300 dark:bg-green-500/20 dark:border-green-500/50',
    'Canceled': 'border-red-500 text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-500/20 dark:border-red-500/50',
  };


  return (
    <Card className={`flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300 glass-card dark:glass-card ${className}`} style={style}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200 hover:text-brand-blue transition-colors">
            <Link href={`/projects/${project.id}`}>{project.name}</Link>
          </CardTitle>
          <Badge variant={getStatusBadgeVariant(project.status)} className={`capitalize ${statusColorMap[project.status]}`}>
            {project.status}
          </Badge>
        </div>
        {project.clientName && (
          <CardDescription className="flex items-center text-sm text-gray-600 dark:text-gray-400 pt-1">
            <Users className="w-4 h-4 mr-2 text-muted-foreground" /> {project.clientName}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3 text-sm flex-grow">
        {project.address && (
          <div className="flex items-start text-gray-700 dark:text-gray-300">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
            <span>{project.address}</span>
          </div>
        )}
        {project.startDate && (
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <CalendarDays className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>
              Starts: {new Date(project.startDate.seconds * 1000).toLocaleDateString()}
              {project.expectedEndDate && ` - Ends: ${new Date(project.expectedEndDate.seconds * 1000).toLocaleDateString()}`}
            </span>
          </div>
        )}
        {project.budget !== undefined && project.budget !== null && (
            <div className="flex items-center text-gray-700 dark:text-gray-300">
                <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Budget: ${project.budget.toLocaleString()}</span>
            </div>
        )}
        {project.description && (
            <p className="text-gray-600 dark:text-gray-400 line-clamp-2 text-xs">
                {project.description}
            </p>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-end gap-2 dark:border-gray-700/50">
        <Button variant="outline" size="sm" asChild className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50">
          <Link href={`/projects/${project.id}`}>
            <Edit className="w-3.5 h-3.5 mr-1.5" /> View/Edit
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isDeleting} className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-1.5" />}
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-card dark:glass-card">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" /> Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                This action cannot be undone. This will permanently delete the project
                <strong className="text-gray-800 dark:text-gray-200"> {project.name} </strong>
                and all its associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-300 dark:border-gray-600">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Yes, delete project"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
```