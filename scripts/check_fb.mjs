import { initializeApp, cert, applicationDefault, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'eliascjbarber';
const databaseURL = process.env.VITE_FIREBASE_DATABASE_URL || 'https://eliascjbarber-default-rtdb.firebaseio.com';

let app;
if (!getApps().length) {
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountEnv) {
    app = initializeApp({
      credential: cert(JSON.parse(serviceAccountEnv)),
      projectId,
      databaseURL
    });
  } else {
    app = initializeApp({
      credential: applicationDefault(),
      projectId,
      databaseURL
    });
  }
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const rtdb = getDatabase(app);

async function checkCloud() {
  console.log(`=== CHECKING FIRESTORE (Firebase Admin SDK - ${projectId}) ===`);
  try {
    const docSnap = await db.collection('barbershop').doc('main').get();
    if (docSnap.exists) {
      const data = docSnap.data();
      console.log("Firestore config address:", data.config?.address, data.config?.neighborhood);
      console.log("Firestore stories count:", data.stories?.length);
      console.log("Firestore stories titles:", data.stories?.map(s => s.title));
    } else {
      console.log("Firestore doc barbershop/main DOES NOT EXIST");
    }
  } catch (e) {
    console.error("Firestore read error:", e.message);
  }

  console.log(`=== CHECKING REALTIME DATABASE (Firebase Admin SDK - ${projectId}) ===`);
  try {
    const rtdbSnap = await rtdb.ref('barbershop/main').once('value');
    if (rtdbSnap.exists()) {
      const data = rtdbSnap.val();
      console.log("RTDB config address:", data.config?.address, data.config?.neighborhood);
      console.log("RTDB stories count:", data.stories?.length);
      console.log("RTDB stories titles:", data.stories?.map(s => s.title));
    } else {
      console.log("RTDB node barbershop/main DOES NOT EXIST");
    }
  } catch (e) {
    console.error("RTDB read error:", e.message);
  }

  process.exit(0);
}

checkCloud().catch(console.error);
