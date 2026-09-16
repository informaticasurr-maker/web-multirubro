import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';
import { FirebaseCustomConfig } from '../types';

export const OFFICIAL_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAzMcE4016tVdGaFkVqLJkyb96Hfcn2Of8", // inspector:ignore
  authDomain: "eliascjbarber.firebaseapp.com",
  databaseURL: "https://eliascjbarber-default-rtdb.firebaseio.com",
  projectId: "eliascjbarber",
  storageBucket: "eliascjbarber.firebasestorage.app",
  messagingSenderId: "493099757499",
  appId: "1:493099757499:web:608dfaa9d0d46ca9f25e9e"
};

// Default configuration with user's official project parameters or custom overrides
export const getEffectiveFirebaseConfig = (customConfig?: FirebaseCustomConfig) => {
  const env = (import.meta as any).env || {};
  return {
    apiKey:
      customConfig?.apiKey?.trim() ||
      env.VITE_FIREBASE_API_KEY ||
      OFFICIAL_FIREBASE_CONFIG.apiKey,
    authDomain:
      customConfig?.authDomain?.trim() ||
      env.VITE_FIREBASE_AUTH_DOMAIN ||
      OFFICIAL_FIREBASE_CONFIG.authDomain,
    databaseURL:
      customConfig?.databaseURL?.trim() ||
      env.VITE_FIREBASE_DATABASE_URL ||
      OFFICIAL_FIREBASE_CONFIG.databaseURL,
    projectId:
      customConfig?.projectId?.trim() ||
      env.VITE_FIREBASE_PROJECT_ID ||
      OFFICIAL_FIREBASE_CONFIG.projectId,
    storageBucket:
      customConfig?.storageBucket?.trim() ||
      env.VITE_FIREBASE_STORAGE_BUCKET ||
      OFFICIAL_FIREBASE_CONFIG.storageBucket,
    messagingSenderId:
      customConfig?.messagingSenderId?.trim() ||
      env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
      OFFICIAL_FIREBASE_CONFIG.messagingSenderId,
    appId:
      customConfig?.appId?.trim() ||
      env.VITE_FIREBASE_APP_ID ||
      OFFICIAL_FIREBASE_CONFIG.appId
  };
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let rtdb: Database | null = null;

export const initFirebase = (
  customConfig?: FirebaseCustomConfig
): { app: FirebaseApp; auth: Auth; db: Firestore; rtdb: Database } => {
  const config = getEffectiveFirebaseConfig(customConfig);

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    rtdb = getDatabase(app);
  } catch (error) {
    console.error('Error initializing Firebase App:', error);
    app = initializeApp(config, 'web-multirubro-' + Date.now());
    auth = getAuth(app);
    db = getFirestore(app);
    rtdb = getDatabase(app);
  }

  return { app, auth, db, rtdb };
};

// Initial default instance
const { app: defaultApp, auth: defaultAuth, db: defaultDb, rtdb: defaultRtdb } = initFirebase();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { defaultApp as app, defaultAuth as auth, defaultDb as db, defaultRtdb as rtdb };
