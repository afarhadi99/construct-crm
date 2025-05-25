'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom'; // For handling form state with Server Actions
import { createProject, updateProject } from '@/lib/actions/projectActions';
import { Project, ProjectStatus } from '@/models/Project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Assuming Shadcn Textarea
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Assuming Shadcn Select
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Shadcn Popover
import { Calendar } from "@/components/ui/calendar"; // Shadcn Calendar
import { format, parseISO } from 'date-fns'; // For date formatting
import { cn } from "@/lib/utils"; // Shadcn utility

interface ProjectFormProps {
  userId: string;
  project?: Project | null; // Optional project data for editing
}

const projectStatuses: ProjectStatus[] = ['Planning', 'In Progress', 'On Hold', 'Completed', 'Canceled'];

// FormButton component to use useFormStatus
function FormButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-brand-blue hover:bg-brand-blue/90 text-white">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      {isEditing ? 'Save Changes' : 'Create Project'}
    </Button>
  );
}

export function ProjectForm({ userId, project }: ProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!project;

  // Server action setup
  const action = isEditing ? updateProject.bind(null, userId, project.id) : createProject.bind(null, userId);
  // @ts-ignore TODO: Fix type for initialState with Zod errors
  const [state, formAction] = useFormState(action, { success: false, error: null });

  // Client-side state for controlled date inputs
  const [startDate, setStartDate] = useState<Date | undefined>(
    project?.startDate ? new Date(project.startDate.seconds * 1000) : undefined
  );
  const [expectedEndDate, setExpectedEndDate] = useState<Date | undefined>(
    project?.expectedEndDate ? new Date(project.expectedEndDate.seconds * 1000) : undefined
  );
  
  useEffect(() => {
    if (state?.success) {
      toast({
        title: "Success!",
        description: state.message || (isEditing ? "Project updated successfully." : "Project created successfully."),
      });
      router.push(isEditing ? `/projects/${project.id}` : (state.projectId ? `/projects/${state.projectId}`: '/projects'));
      // router.refresh(); // Revalidate and refresh data on the current page if staying
    } else if (state?.error && typeof state.error === 'string') {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      });
    }
    // Zod errors are handled by displaying them next to fields
  }, [state, router, toast, isEditing, project]);


  // Helper to get Zod error for a specific field
  const getFieldError = (fieldName: string): string | undefined => {
    if (state?.error && typeof state.error !== 'string' && state.error[fieldName as keyof typeof state.error]) {
      // @ts-ignore
      return state.error[fieldName]._errors[0];
    }
    return undefined;
  };


  return (
    <form action={formAction} className="space-y-6">
      <div>
        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Project Name <span className="text-red-500">*</span></Label>
        <Input
          id="name"
          name="name"
          defaultValue={project?.name}
          placeholder="e.g., Downtown Office Renovation"
          className="mt-1 bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600"
          required
        />
        {getFieldError('name') && <p className="text-red-500 text-sm mt-1">{getFieldError('name')}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="clientName" className="text-gray-700 dark:text-gray-300">Client Name</Label>
          <Input
            id="clientName"
            name="clientName"
            defaultValue={project?.clientName}
            placeholder="e.g., Innovate Corp"
            className="mt-1 bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600"
          />
          {getFieldError('clientName') && <p className="text-red-500 text-sm mt-1">{getFieldError('clientName')}</p>}
        </div>
        <div>
          <Label htmlFor="status" className="text-gray-700 dark:text-gray-300">Status <span className="text-red-500">*</span></Label>
          <Select name="status" defaultValue={project?.status || 'Planning'}>
            <SelectTrigger className="w-full mt-1 bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800">
              {projectStatuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getFieldError('status') && <p className="text-red-500 text-sm mt-1">{getFieldError('status')}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="address" className="text-gray-700 dark:text-gray-300">Project Address</Label>
        <Textarea
          id="address"
          name="address"
          defaultValue={project?.address}
          placeholder="123 Main St, Anytown, USA"
          className="mt-1 min-h-[80px] bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600"
        />
         {getFieldError('address') && <p className="text-red-500 text-sm mt-1">{getFieldError('address')}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="startDate" className="text-gray-700 dark:text-gray-300">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal mt-1 bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-800" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {/* Hidden input to submit date to server action */}
          {startDate && <input type="hidden" name="startDate" value={startDate.toISOString()} />}
          {getFieldError('startDate') && <p className="text-red-500 text-sm mt-1">{getFieldError('startDate')}</p>}
        </div>
        <div>
          <Label htmlFor="expectedEndDate" className="text-gray-700 dark:text-gray-300">Expected End Date</Label>
           <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal mt-1 bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600",
                  !expectedEndDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {expectedEndDate ? format(expectedEndDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-800" align="start">
              <Calendar
                mode="single"
                selected={expectedEndDate}
                onSelect={setExpectedEndDate}
                disabled={(date) => startDate && date < startDate} // Optional: disable dates before start date
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {expectedEndDate && <input type="hidden" name="expectedEndDate" value={expectedEndDate.toISOString()} />}
          {getFieldError('expectedEndDate') && <p className="text-red-500 text-sm mt-1">{getFieldError('expectedEndDate')}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="budget" className="text-gray-700 dark:text-gray-300">Budget ($)</Label>
        <Input
          id="budget"
          name="budget"
          type="number"
          step="0.01"
          defaultValue={project?.budget !== undefined && project.budget !== null ? project.budget : ''}
          placeholder="e.g., 50000"
          className="mt-1 bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600"
        />
        {getFieldError('budget') && <p className="text-red-500 text-sm mt-1">{getFieldError('budget')}</p>}
      </div>

      <div>
        <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={project?.description}
          placeholder="Brief overview of the project scope, objectives, etc."
          className="mt-1 min-h-[100px] bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600"
        />
        {getFieldError('description') && <p className="text-red-500 text-sm mt-1">{getFieldError('description')}</p>}
      </div>
      
      <div>
        <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300">Internal Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={project?.notes}
          placeholder="Any internal notes, reminders, or specific details for your team."
          className="mt-1 min-h-[100px] bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600"
        />
        {getFieldError('notes') && <p className="text-red-500 text-sm mt-1">{getFieldError('notes')}</p>}
      </div>

      <div className="flex justify-end pt-4">
        <FormButton isEditing={isEditing} />
      </div>
    </form>
  );
}