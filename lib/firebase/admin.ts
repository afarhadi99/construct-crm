```typescript
import admin from 'firebase-admin';

// Ensure that the environment variables are correctly loaded
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      // databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com` // Optional: if using Realtime Database
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
    // Optionally, re-throw the error or handle it as needed
    // throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
  }
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();
const adminStorage = admin.storage();

export { adminAuth, adminDb, adminStorage, admin };
```