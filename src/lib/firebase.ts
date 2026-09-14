import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { FirebaseCustomConfig } from '../types';

// Default configuration with environment variables or fallback values
export const getEffectiveFirebaseConfig = (customConfig?: FirebaseCustomConfig) => {
  const env = (import.meta as any).env || {};
  return {
    apiKey:
      customConfig?.apiKey?.trim() ||
      env.VITE_FIREBASE_API_KEY ||
      'AIzaSyDemoBarberiaMockKeyForInitialization123',
    authDomain:
      customConfig?.authDomain?.trim() ||
      env.VITE_FIREBASE_AUTH_DOMAIN ||
      'barberia-elite-turnos.firebaseapp.com',
    projectId:
      customConfig?.projectId?.trim() ||
      env.VITE_FIREBASE_PROJECT_ID ||
      'barberia-elite-turnos',
    storageBucket:
      customConfig?.storageBucket?.trim() ||
      env.VITE_FIREBASE_STORAGE_BUCKET ||
      'barberia-elite-turnos.appspot.com',
    messagingSenderId:
      customConfig?.messagingSenderId?.trim() ||
      env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
      '123456789012',
    appId:
      customConfig?.appId?.trim() ||
      env.VITE_FIREBASE_APP_ID ||
      '1:123456789012:web:abcdef123456'
  };
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export const initFirebase = (customConfig?: FirebaseCustomConfig): { app: FirebaseApp; auth: Auth } => {
  const config = getEffectiveFirebaseConfig(customConfig);

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
  } catch (error) {
    console.error('Error initializing Firebase App:', error);
    app = initializeApp(config, 'barberia-app-' + Date.now());
    auth = getAuth(app);
  }

  return { app, auth };
};

// Initial default instance
const { app: defaultApp, auth: defaultAuth } = initFirebase();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { defaultApp as app, defaultAuth as auth };
