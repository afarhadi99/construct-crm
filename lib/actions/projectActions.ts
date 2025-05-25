```typescript
'use server';

import { adminDb, admin } from '@/lib/firebase/admin';
import { Project, ProjectStatus } from '@/models/Project';
import { UserProfile } from '@/models/User'; // To check subscription status
import { MAX_FREE_PROJECTS } from '@/lib/constants';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const ProjectSchema = z.object({
  name: z.string().min(3, { message: "Project name must be at least 3 characters." }).max(100),
  address: z.string().max(200).optional().nullable(),
  clientName: z.string().max(100).optional().nullable(),
  clientId: z.string().max(50).optional().nullable(),
  startDate: z.string().optional().nullable().transform((val) => val ? new Date(val) : null), // Assuming string date from client
  expectedEndDate: z.string().optional().nullable().transform((val) => val ? new Date(val) : null),
  status: z.enum(['Planning', 'In Progress', 'On Hold', 'Completed', 'Canceled']),
  budget: z.number().positive().optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

interface ProjectActionResult {
  success: boolean;
  message?: string;
  projectId?: string;
  error?: string | z.ZodFormattedError<z.infer<typeof ProjectSchema>>;
}

// Helper to get user profile and check subscription
async function getUserAndSubscription(userId: string): Promise<{ userProfile: UserProfile | null, canProceed: boolean, message?: string }> {
  const userDoc = await adminDb.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    return { userProfile: null, canProceed: false, message: "User not found." };
  }
  const userProfile = userDoc.data() as UserProfile;
  const isActiveSub = userProfile.stripeSubscriptionStatus === 'active' || userProfile.stripeSubscriptionStatus === 'trialing';
  const isPro = (userProfile.subscriptionTier === 'monthly' || userProfile.subscriptionTier === 'yearly') && isActiveSub;

  if (isPro) {
    return { userProfile, canProceed: true };
  }

  // Free tier: check project count
  const projectsSnapshot = await adminDb.collection('projects').where('userId', '==', userId).get();
  if (projectsSnapshot.size >= MAX_FREE_PROJECTS) {
    return { userProfile, canProceed: false, message: `Free tier limit of ${MAX_FREE_PROJECTS} projects reached. Please upgrade.` };
  }
  return { userProfile, canProceed: true };
}


export async function createProject(userId: string, formData: FormData): Promise<ProjectActionResult> {
  if (!userId) return { success: false, error: "User not authenticated." };

  const rawData = Object.fromEntries(formData.entries());
   // Convert budget from string to number if present
  if (rawData.budget && typeof rawData.budget === 'string' && rawData.budget.trim() !== '') {
    rawData.budget = parseFloat(rawData.budget);
    if (isNaN(rawData.budget as number)) delete rawData.budget; // Remove if not a valid number
  } else if (rawData.budget === '' || rawData.budget === undefined) {
    delete rawData.budget; // Remove if empty or undefined
  }


  const validation = ProjectSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, error: validation.error.format() };
  }
  const data = validation.data;

  const subCheck = await getUserAndSubscription(userId);
  if (!subCheck.canProceed) {
    return { success: false, error: subCheck.message || "Subscription limit reached." };
  }

  try {
    const newProjectRef = adminDb.collection('projects').doc();
    const newProject: Project = {
      id: newProjectRef.id,
      userId,
      name: data.name,
      address: data.address || undefined,
      clientName: data.clientName || undefined,
      clientId: data.clientId || undefined,
      startDate: data.startDate ? admin.firestore.Timestamp.fromDate(data.startDate) : undefined,
      expectedEndDate: data.expectedEndDate ? admin.firestore.Timestamp.fromDate(data.expectedEndDate) : undefined,
      status: data.status as ProjectStatus, // Zod enum ensures this is valid
      budget: data.budget || undefined,
      description: data.description || undefined,
      notes: data.notes || undefined,
      createdAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
      updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
    };

    await newProjectRef.set(newProject);
    revalidatePath('/projects');
    revalidatePath('/dashboard');
    return { success: true, projectId: newProject.id, message: "Project created successfully." };
  } catch (error: any) {
    console.error("Error creating project:", error);
    return { success: false, error: error.message || "Failed to create project." };
  }
}

export async function getProjectById(userId: string, projectId: string): Promise<Project | null> {
  if (!userId || !projectId) return null;
  try {
    const projectDoc = await adminDb.collection('projects').doc(projectId).get();
    if (!projectDoc.exists || projectDoc.data()?.userId !== userId) {
      return null; // Not found or not owned by user
    }
    return projectDoc.data() as Project;
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export async function getProjectsByUser(userId: string): Promise<Project[]> {
  if (!userId) return [];
  try {
    const snapshot = await adminDb.collection('projects')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => doc.data() as Project);
  } catch (error) {
    console.error("Error fetching projects for user:", error);
    return [];
  }
}

export async function updateProject(userId: string, projectId: string, formData: FormData): Promise<ProjectActionResult> {
  if (!userId || !projectId) return { success: false, error: "User or Project ID missing." };
  
  const project = await getProjectById(userId, projectId);
  if (!project) {
    return { success: false, error: "Project not found or access denied." };
  }

  const rawData = Object.fromEntries(formData.entries());
  if (rawData.budget && typeof rawData.budget === 'string' && rawData.budget.trim() !== '') {
    rawData.budget = parseFloat(rawData.budget);
    if (isNaN(rawData.budget as number)) delete rawData.budget;
  } else if (rawData.budget === '' || rawData.budget === undefined) {
    delete rawData.budget;
  }

  const validation = ProjectSchema.safeParse(rawData); // Use same schema for updates
  if (!validation.success) {
    return { success: false, error: validation.error.format() };
  }
  const data = validation.data;

  try {
    const projectRef = adminDb.collection('projects').doc(projectId);
    const updateData: Partial<Project> = {
      name: data.name,
      address: data.address || undefined,
      clientName: data.clientName || undefined,
      clientId: data.clientId || undefined,
      startDate: data.startDate ? admin.firestore.Timestamp.fromDate(data.startDate) : undefined,
      expectedEndDate: data.expectedEndDate ? admin.firestore.Timestamp.fromDate(data.expectedEndDate) : undefined,
      status: data.status as ProjectStatus,
      budget: data.budget || undefined,
      description: data.description || undefined,
      notes: data.notes || undefined,
      updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
    };

    await projectRef.update(updateData);
    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/dashboard');
    return { success: true, message: "Project updated successfully." };
  } catch (error: any) {
    console.error("Error updating project:", error);
    return { success: false, error: error.message || "Failed to update project." };
  }
}

export async function deleteProject(userId: string, projectId: string): Promise<ProjectActionResult> {
  if (!userId || !projectId) return { success: false, error: "User or Project ID missing." };

  const project = await getProjectById(userId, projectId);
  if (!project) {
    return { success: false, error: "Project not found or access denied." };
  }
  
  try {
    // In a real app, you might want to delete associated tasks, etc. (batch write)
    await adminDb.collection('projects').doc(projectId).delete();
    revalidatePath('/projects');
    revalidatePath('/dashboard');
    return { success: true, message: "Project deleted successfully." };
  } catch (error: any) {
    console.error("Error deleting project:", error);
    return { success: false, error: error.message || "Failed to delete project." };
  }
}
```