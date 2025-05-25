'use server';

// Basic stub for task actions
// In a real app, this would be as detailed as projectActions.ts,
// including validation, subscription checks (e.g., MAX_FREE_TASKS_PER_PROJECT), etc.

import { adminDb, admin } from '@/lib/firebase/admin';
import { Task } from '@/models/Task';
import { revalidatePath } from 'next/cache';

interface TaskActionResult {
  success: boolean;
  message?: string;
  taskId?: string;
  error?: string; // Simplified error handling for stub
}

export async function createTask(userId: string, projectId: string, formData: FormData): Promise<TaskActionResult> {
  const title = formData.get('title') as string;
  if (!title) return { success: false, error: "Title is required." };

  // TODO: Add subscription limit checks (e.g., MAX_FREE_TASKS_PER_PROJECT)

  try {
    const newTaskRef = adminDb.collection('tasks').doc();
    const newTaskData = {
      id: newTaskRef.id,
      userId,
      projectId,
      title,
      description: formData.get('description') as string || '',
      status: formData.get('status') as Task['status'] || 'To Do',
      // dueDate: formData.get('dueDate') ? admin.firestore.Timestamp.fromDate(new Date(formData.get('dueDate') as string)) : undefined,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await newTaskRef.set(newTaskData);
    revalidatePath(`/projects/${projectId}`); // Revalidate project page where tasks are shown
    return { success: true, taskId: newTaskRef.id, message: "Task created." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTasksByProject(userId: string, projectId: string): Promise<Task[]> {
    if (!userId || !projectId) return [];
    try {
        const snapshot = await adminDb.collection('tasks')
            .where('userId', '==', userId)
            .where('projectId', '==', projectId)
            .orderBy('createdAt', 'asc')
            .get();
        return snapshot.docs.map(doc => doc.data() as Task);
    } catch (error) {
        console.error("Error fetching tasks for project:", error);
        return [];
    }
}

// Stubs for updateTask, deleteTask
export async function updateTask(userId: string, taskId: string, formData: FormData): Promise<TaskActionResult> {
    return { success: false, error: "Not implemented" };
}
export async function deleteTask(userId: string, taskId: string): Promise<TaskActionResult> {
    return { success: false, error: "Not implemented" };
}