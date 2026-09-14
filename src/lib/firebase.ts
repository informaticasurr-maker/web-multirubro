import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { FirebaseCustomConfig } from '../types';

export const OFFICIAL_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCypDN-qT10QCrXr47ynDnmdX-28AjwuN0",
  authDomain: "web-multirubro.firebaseapp.com",
  projectId: "web-multirubro",
  storageBucket: "web-multirubro.firebasestorage.app",
  messagingSenderId: "1026921238822",
  appId: "1:1026921238822:web:7f23715280a64e726c71e7"
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

export const initFirebase = (
  customConfig?: FirebaseCustomConfig
): { app: FirebaseApp; auth: Auth; db: Firestore } => {
  const config = getEffectiveFirebaseConfig(customConfig);

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error('Error initializing Firebase App:', error);
    app = initializeApp(config, 'web-multirubro-' + Date.now());
    auth = getAuth(app);
    db = getFirestore(app);
  }

  return { app, auth, db };
};

// Initial default instance
const { app: defaultApp, auth: defaultAuth, db: defaultDb } = initFirebase();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { defaultApp as app, defaultAuth as auth, defaultDb as db };
