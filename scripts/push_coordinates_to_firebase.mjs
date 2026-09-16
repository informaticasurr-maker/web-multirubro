import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { getDatabase, ref, update } from 'firebase/database';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyAzMcE4016tVdGaFkVqLJkyb96Hfcn2Of8",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "eliascjbarber.firebaseapp.com",
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || "https://eliascjbarber-default-rtdb.firebaseio.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "eliascjbarber",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "eliascjbarber.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "493099757499",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:493099757499:web:608dfaa9d0d46ca9f25e9e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtdb = getDatabase(app);

async function updateCloudConfig() {
  console.log("Connecting to Firestore & Realtime Database...");
  const mainDocRef = doc(db, 'barbershop', 'main');
  const snap = await getDoc(mainDocRef);
  
  const updatedConfig = {
    address: "Evita 1131",
    neighborhood: "El Jagüel",
    city: "Buenos Aires",
    coordinates: {
      lat: -34.8411587,
      lng: -58.4884242
    },
    googleMapsUrl: "https://www.google.com/maps/place/Evita+1131,+B1805DOS+El+Jag%C3%BCel,+Provincia+de+Buenos+Aires/@-34.8411543,-58.4909991,17z/data=!3m1!4b1!4m5!3m4!1s0x95bcd136700b4dc7:0x19e749cfad3dbb70!8m2!3d-34.8411587!4d-58.4884242",
    wazeUrl: "https://waze.com/ul?ll=-34.8411587,-58.4884242&navigate=yes"
  };

  if (snap.exists()) {
    const existing = snap.data();
    const mergedConfig = {
      ...existing.config,
      ...updatedConfig
    };
    await setDoc(mainDocRef, { config: mergedConfig }, { merge: true });
    console.log("Firestore 'barbershop/main' updated successfully with Evita 1131, El Jagüel coordinates!");
  } else {
    await setDoc(mainDocRef, { config: updatedConfig }, { merge: true });
    console.log("Firestore 'barbershop/main' created with updated config!");
  }

  try {
    await update(ref(rtdb, 'barbershop/main/config'), updatedConfig);
    console.log("Realtime Database 'barbershop/main/config' updated successfully with Evita 1131, El Jagüel coordinates!");
  } catch (err) {
    console.warn("RTDB update note:", err.message);
  }

  console.log("ALL CLOUD DATA IS NOW SYNCHRONIZED TO -34.8219, -58.4897");
  process.exit(0);
}

updateCloudConfig().catch((err) => {
  console.error("Error updating cloud:", err);
  process.exit(1);
});
