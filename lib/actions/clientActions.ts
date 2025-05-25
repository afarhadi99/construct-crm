```typescript
'use server';

import { adminDb, admin } from '@/lib/firebase/admin';
import { Client } from '@/models/Client';
import { UserProfile } from '@/models/User';
import { MAX_FREE_CLIENTS } from '@/lib/constants';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const ClientSchema = z.object({
  name: z.string().min(2, "Client name must be at least 2 characters.").max(100),
  companyName: z.string().max(100).optional().nullable(),
  email: z.string().email("Invalid email address.").max(100),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  website: z.string().url("Invalid URL.").max(100).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

interface ClientActionResult {
  success: boolean;
  message?: string;
  clientId?: string;
  error?: string | z.ZodFormattedError<z.infer<typeof ClientSchema>>;
}

// Helper to get user profile and check subscription for client limits
async function getUserAndClientSubscription(userId: string): Promise<{ userProfile: UserProfile | null, canProceed: boolean, message?: string }> {
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

  // Free tier: check client count
  const clientsSnapshot = await adminDb.collection('clients').where('userId', '==', userId).get();
  if (clientsSnapshot.size >= MAX_FREE_CLIENTS) {
    return { userProfile, canProceed: false, message: `Free tier limit of ${MAX_FREE_CLIENTS} clients reached. Please upgrade.` };
  }
  return { userProfile, canProceed: true };
}


export async function createClient(userId: string, formData: FormData): Promise<ClientActionResult> {
  if (!userId) return { success: false, error: "User not authenticated." };

  const rawData = Object.fromEntries(formData.entries());
  const validation = ClientSchema.safeParse(rawData);

  if (!validation.success) {
    return { success: false, error: validation.error.format() };
  }
  const data = validation.data;

  const subCheck = await getUserAndClientSubscription(userId);
  if (!subCheck.canProceed) {
    return { success: false, error: subCheck.message || "Subscription limit reached for clients." };
  }

  try {
    const newClientRef = adminDb.collection('clients').doc();
    const newClient: Client = {
      id: newClientRef.id,
      userId,
      name: data.name,
      companyName: data.companyName || undefined,
      email: data.email,
      phone: data.phone || undefined,
      address: data.address || undefined,
      website: data.website || undefined,
      notes: data.notes || undefined,
      createdAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
      updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
    };
    await newClientRef.set(newClient);
    revalidatePath('/clients');
    revalidatePath('/dashboard'); // If dashboard shows client count
    return { success: true, clientId: newClient.id, message: "Client created successfully." };
  } catch (error: any) {
    console.error("Error creating client:", error);
    return { success: false, error: error.message || "Failed to create client." };
  }
}

export async function getClientsByUser(userId: string): Promise<Client[]> {
  if (!userId) return [];
  try {
    const snapshot = await adminDb.collection('clients')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => doc.data() as Client);
  } catch (error) {
    console.error("Error fetching clients for user:", error);
    return [];
  }
}

// Add getClientById, updateClient, deleteClient stubs similarly if needed for full structure
export async function getClientById(userId: string, clientId: string): Promise<Client | null> {
    // Implementation stub
    return null;
}
export async function updateClient(userId: string, clientId: string, formData: FormData): Promise<ClientActionResult> {
    // Implementation stub
    return {success: false, error: "Not implemented"};
}
export async function deleteClient(userId: string, clientId: string): Promise<ClientActionResult> {
    // Implementation stub
    return {success: false, error: "Not implemented"};
}

```