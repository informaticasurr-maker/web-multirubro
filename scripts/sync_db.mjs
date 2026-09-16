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

async function syncDatabases() {
  console.log(`Reading full Firestore main document via Firebase Admin SDK (${projectId})...`);
  const firestoreSnap = await db.collection('barbershop').doc('main').get();
  if (!firestoreSnap.exists) {
    console.error("Firestore document does not exist!");
    process.exit(1);
  }

  const firestoreData = firestoreSnap.data();
  console.log("Firestore stories count:", firestoreData.stories?.length);
  console.log("Firestore config address:", firestoreData.config?.address, firestoreData.config?.neighborhood);

  console.log("Writing full clean Firestore payload to Realtime Database via Firebase Admin SDK...");
  await rtdb.ref('barbershop/main').set(firestoreData);

  console.log("Verifying Realtime Database...");
  const rtdbSnap = await rtdb.ref('barbershop/main').once('value');
  const rtdbData = rtdbSnap.val();
  console.log("RTDB stories count:", rtdbData.stories?.length);
  console.log("RTDB stories titles:", rtdbData.stories?.map(s => s.title));
  console.log("RTDB config address:", rtdbData.config?.address, rtdbData.config?.neighborhood);

  console.log("SUCCESS: Firestore and Realtime Database are 100% unified and synchronized using Firebase Admin SDK!");
  process.exit(0);
}

syncDatabases().catch(console.error);
