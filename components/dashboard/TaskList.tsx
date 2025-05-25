'use client'; // If it has client-side interactions for adding/editing tasks inline

import { Task } from '@/models/Task';
// import { createTask } from '@/lib/actions/taskActions'; // For inline form
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks, PlusCircle } from 'lucide-react';

interface TaskListProps {
  projectId: string;
  initialTasks: Task[]; // Passed from server component
  userId: string;
}

export function TaskList({ projectId, initialTasks, userId }: TaskListProps) {
  // const [tasks, setTasks] = useState<Task[]>(initialTasks);
  // State for new task form if inline

  // const handleAddTask = async (formData: FormData) => {
  //   const result = await createTask(userId, projectId, formData);
  //   if (result.success && result.taskId) {
  //     // Add to local state or refetch
  //   } else {
  //     // Show error
  //   }
  // };

  return (
    <Card className="glass-card dark:glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center"><ListChecks className="mr-2 h-5 w-5 text-brand-blue"/>Tasks</CardTitle>
        <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </CardHeader>
      <CardContent>
        {initialTasks.length === 0 ? (
          <p className="text-muted-foreground text-sm">No tasks added to this project yet.</p>
        ) : (
          <ul className="space-y-2">
            {initialTasks.map(task => (
              <li key={task.id} className="p-3 rounded-md border dark:border-gray-700 bg-white/50 dark:bg-slate-800/50 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.status} - Due: {task.dueDate ? new Date(task.dueDate.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                </div>
                {/* Add actions: edit, delete, mark complete */}
              </li>
            ))}
          </ul>
        )}
        {/* Inline form for adding new task can go here */}
      </CardContent>
    </Card>
  );
}