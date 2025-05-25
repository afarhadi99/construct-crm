```typescript
import { Timestamp } from 'firebase/firestore';

export type TaskStatus = 'To Do' | 'In Progress' | 'Blocked' | 'In Review' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Task {
  id: string; // Firestore document ID
  userId: string; // UID of the user who owns this task
  projectId: string; // ID of the project this task belongs to
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string; // Optional: if tasks can be assigned to other users/team members in future
  dueDate?: Timestamp;
  completedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Future: subtasks, comments, attachments
  // subTasks?: Array<{ title: string; completed: boolean }>;
  // comments?: Array<{ userId: string; text: string; createdAt: Timestamp }>;
}
```