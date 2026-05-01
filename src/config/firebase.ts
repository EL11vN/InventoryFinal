/**
 * Firebase Admin Configuration
 */

import * as admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

let firebaseApp: admin.app.App | null = null;

/**
 * Initialize Firebase Admin SDK
 */
export function initializeFirebaseAdmin() {
  if (firebaseApp) return firebaseApp;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const useEmulator = process.env.USE_FIRESTORE_EMULATOR === 'true';

  // Production mode - use environment variables FIRST
  if (projectId && clientEmail && privateKey && !useEmulator) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n')
      }),
      projectId
    });
    console.log('✅ Firebase Production Mode (env vars)');
  } else if (useEmulator) {
    // Emulator mode
    firebaseApp = admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'inventory-system-demo'
    });
    process.env.FIRESTORE_EMULATOR_HOST =
      process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
    console.log('✅ Firebase Emulator Mode');
  } else {
    // Fallback - try local file
    const serviceAccountPath = join(__dirname, '../../firebase-service-account.json');
    if (existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      console.log('✅ Firebase Production Mode (file)');
    } else {
      // Try default app (last resort)
      try {
        firebaseApp = admin.app();
        console.log('✅ Firebase using default app');
      } catch {
        throw new Error('Firebase credentials not found. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY env vars.');
      }
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
