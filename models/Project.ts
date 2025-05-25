import { Timestamp } from 'firebase/firestore';

export type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Canceled';

export interface Project {
  id: string; // Firestore document ID
  userId: string; // UID of the user who owns this project
  name: string;
  address?: string;
  clientName?: string; // Simple client name, or use clientId
  clientId?: string; // Optional: Link to a Client document in a 'clients' collection
  startDate?: Timestamp;
  expectedEndDate?: Timestamp;
  actualEndDate?: Timestamp;
  status: ProjectStatus;
  budget?: number;
  actualCost?: number;
  description?: string;
  notes?: string; // For internal notes or details
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Future: attachments (URLs to files in Firebase Storage)
  // attachments?: Array<{ name: string; url: string; uploadedAt: Timestamp }>;
}