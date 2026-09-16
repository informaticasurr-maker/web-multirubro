import { initializeApp, cert, applicationDefault, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getDatabase, Database } from 'firebase-admin/database';
import { getAuth, Auth } from 'firebase-admin/auth';

/**
 * Modern Firebase Admin SDK Initialization.
 * Replaces deprecated Firebase Database Secrets and legacy Token Generators.
 * 
 * Credentials can be supplied via:
 * 1. FIREBASE_SERVICE_ACCOUNT_KEY (JSON string in environment variable)
 * 2. GOOGLE_APPLICATION_CREDENTIALS (path to service account JSON file)
 * 3. Application Default Credentials (ADC) for GCP/Firebase environments.
 */
export const initFirebaseAdmin = (): App => {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'eliascjbarber';
  const databaseURL = process.env.VITE_FIREBASE_DATABASE_URL || 'https://eliascjbarber-default-rtdb.firebaseio.com';
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountEnv) {
    try {
      const serviceAccount = JSON.parse(serviceAccountEnv);
      return initializeApp({
        credential: cert(serviceAccount),
        projectId,
        databaseURL
      });
    } catch (e) {
      console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON, falling back to default credentials:', e);
    }
  }

  return initializeApp({
    credential: applicationDefault(),
    projectId,
    databaseURL
  });
};

export const getAdminFirestore = (): Firestore => getFirestore(initFirebaseAdmin());
export const getAdminAuth = (): Auth => getAuth(initFirebaseAdmin());
export const getAdminDatabase = (): Database => getDatabase(initFirebaseAdmin());
