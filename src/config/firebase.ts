/**
 * Firebase Admin Configuration
 */

import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

let firebaseApp: admin.app.App | null = null;

/**
 * Initialize Firebase Admin SDK
 */
export function initializeFirebaseAdmin() {
  const useEmulator = process.env.USE_FIRESTORE_EMULATOR === 'true';

  if (firebaseApp) return firebaseApp;

  try {
    firebaseApp = admin.app();
  } catch {
    if (useEmulator) {
      firebaseApp = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'inventory-system-demo'
      });
      process.env.FIRESTORE_EMULATOR_HOST = 
        process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
      console.log('✅ Firebase Emulator Mode');
    } else {
      const serviceAccountPath = join(__dirname, '../../firebase-service-account.json');
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      console.log('✅ Firebase Production Mode');
    }
  }

  return firebaseApp;
}

/**
 * Get Firestore database instance
 */
export function getFirestore() {
  if (!firebaseApp) throw new Error('Firebase not initialized');
  return admin.firestore();
}

/**
 * Get Firebase Auth instance
 */
export function getAuth() {
  if (!firebaseApp) throw new Error('Firebase not initialized');
  return admin.auth();
}

/**
 * Get Firebase Storage instance
 */
export function getStorage() {
  if (!firebaseApp) throw new Error('Firebase not initialized');
  return admin.storage();
}
