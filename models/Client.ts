import { Timestamp } from 'firebase/firestore';

export interface Client {
  id: string; // Firestore document ID
  userId: string; // UID of the user who owns this client
  name: string;
  companyName?: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  notes?: string; // For internal notes or details about the client
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Future: projectHistory (array of projectIds associated with this client)
  // projectIds?: string[];
}