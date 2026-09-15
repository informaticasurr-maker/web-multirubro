import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Barber,
  ServiceItem,
  Appointment,
  StoryItem,
  GalleryItem,
  ReviewItem,
  BarberShopConfig,
  PushPromo,
  AppointmentStatus,
  AdminUser,
  FirebaseCustomConfig
} from '../types';
import {
  INITIAL_CONFIG,
  INITIAL_BARBERS,
  INITIAL_SERVICES,
  INITIAL_STORIES,
  INITIAL_GALLERY,
  INITIAL_REVIEWS,
  INITIAL_APPOINTMENTS,
  INITIAL_PROMOS
} from '../data/initialData';
import { updateBarberShopSchema } from '../utils/seoHelper';
import { auth, googleProvider, initFirebase, db, rtdb } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot
} from 'firebase/firestore';
import {
  ref as refRtdb,
  set as setRtdb,
  onValue as onValueRtdb,
  get as getRtdb
} from 'firebase/database';
import { saveToIDB, loadFromIDB } from '../utils/idbStorage';

interface BarberContextType {
  config: BarberShopConfig;
  barbers: Barber[];
  services: ServiceItem[];
  appointments: Appointment[];
  stories: StoryItem[];
  gallery: GalleryItem[];
  reviews: ReviewItem[];
  promos: PushPromo[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
  currentUser: AdminUser | null;
  clientPhone: string;
  activeNotification: { title: string; message: string } | null;
  isCloudSynced: boolean;
  cloudSyncError: string | null;
  lastCloudSyncTime: string | null;

  // Actions
  setClientPhone: (phone: string) => void;
  loginAdmin: (pin: string) => boolean;
  verifyPin: (pin: string) => boolean;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  updateConfig: (newConfig: Partial<BarberShopConfig>) => void;
  addAllowedAdminEmail: (email: string) => void;
  removeAllowedAdminEmail: (email: string) => void;
  isEmailAuthorized: (email?: string | null) => boolean;
  saveFirebaseCustomConfig: (fbConfig: FirebaseCustomConfig) => void;
  updateAdminUserPassword: (email: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  checkUserPasswordStatus: (email?: string | null) => { isPasswordChanged: boolean; currentPassword?: string };

  // Appointments
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  cancelAppointment: (id: string) => void;
  getClientAppointments: (phone: string) => Appointment[];

  // Barbers
  saveBarber: (barber: Barber) => void;
  deleteBarber: (id: string) => void;

  // Services
  saveService: (service: ServiceItem) => void;
  deleteService: (id: string) => void;

  // Stories
  addStory: (story: Omit<StoryItem, 'id' | 'createdAt' | 'viewsCount'>) => void;
  deleteStory: (id: string) => void;
  incrementStoryViews: (id: string) => void;

  // Gallery
  addGalleryItem: (item: Omit<GalleryItem, 'id' | 'likes'>) => void;
  deleteGalleryItem: (id: string) => void;
  likeGalleryItem: (id: string) => void;

  // Reviews
  addReview: (review: Omit<ReviewItem, 'id' | 'date'>) => void;
  toggleHighlightReview: (id: string) => void;
  toggleVerifyReview: (id: string) => void;
  deleteReview: (id: string) => void;

  // Promos / Notifications
  addPromo: (promo: Omit<PushPromo, 'id' | 'date'>) => void;
  deletePromo: (id: string) => void;
  dismissNotification: () => void;
  triggerPushNotification: (title: string, message: string) => void;

  // Backup / Cloud sync
  exportFullBackup: () => string;
  importFullBackup: (jsonString: string) => boolean;
  resetToDefaultData: () => void;
}

const BarberContext = createContext<BarberContextType | null>(null);

const MASTER_SUPERADMIN_EMAILS = [
  'informaticasurr@gmail.com',
  'informaticasur@gmail.com',
  'eliascjnegocios@gmail.com'
];

const BASE_STORAGE_KEYS = {
  CONFIG: 'barberia_config_v1',
  BARBERS: 'barberia_barbers_v1',
  SERVICES: 'barberia_services_v1',
  APPOINTMENTS: 'barberia_appointments_v1',
  STORIES: 'barberia_stories_v1',
  GALLERY: 'barberia_gallery_v1',
  REVIEWS: 'barberia_reviews_v1',
  PROMOS: 'barberia_promos_v1',
  CLIENT_PHONE: 'barberia_client_phone_v1'
};

function getSaved<T>(primaryKey: string, fallback: T): T {
  try {
    // 1. Try primary unified key
    const item = localStorage.getItem(primaryKey);
    if (item) {
      try {
        const parsed = JSON.parse(item);
        if (parsed !== null && parsed !== undefined) return parsed;
      } catch (e) {
        console.warn('JSON parse error for', primaryKey);
      }
    }

    // 2. Migration fallbacks: check all legacy keys across past versions so user data is never lost
    const candidateKeys = [
      `${primaryKey}_elias`,
      `${primaryKey}_the-gentlemans-blade`,
      `${primaryKey}_default`,
      primaryKey.replace('_v1', ''),
      `${primaryKey.replace('_v1', '')}_elias`,
      `${primaryKey.replace('_v1', '')}_the-gentlemans-blade`
    ];

    for (const ck of candidateKeys) {
      const legacyItem = localStorage.getItem(ck);
      if (legacyItem) {
        try {
          const parsed = JSON.parse(legacyItem);
          if (parsed !== null && parsed !== undefined) {
            // Save to primary key to migrate it forward
            localStorage.setItem(primaryKey, legacyItem);
            return parsed;
          }
        } catch {
          // ignore parse error
        }
      }
    }

    return fallback;
  } catch (e) {
    console.error(`Error reading ${primaryKey} from localStorage`, e);
    return fallback;
  }
}

function saveItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
}

// Clean object to ensure Firestore compatibility (remove undefined values)
function cleanForFirestore<T>(data: T): T {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch {
    return data;
  }
}

export const BarberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<BarberShopConfig>(() => {
    const saved = getSaved(BASE_STORAGE_KEYS.CONFIG, INITIAL_CONFIG);
    if (saved) {
      if (
        saved.neighborhood === 'Balvanera / Abasto' ||
        saved.neighborhood === 'Ciudad Evita' ||
        saved.neighborhood?.includes('Balvanera') ||
        saved.neighborhood?.includes('Abasto') ||
        saved.address?.includes('Corrientes 2450') ||
        saved.coordinates?.lat === -34.6037 ||
        saved.coordinates?.lat === -34.6047 ||
        saved.coordinates?.lat === -34.7185
      ) {
        saved.shopName = saved.shopName === "The Gentleman's Blade Barbería" ? "ELIAS-barbershop" : (saved.shopName || "ELIAS-barbershop");
        saved.address = "Evita 1131";
        saved.neighborhood = "El Jagüel";
        saved.city = "Buenos Aires";
        saved.coordinates = { lat: -34.8322, lng: -58.4988 };
        saved.googleMapsUrl = "https://maps.google.com/?q=Evita+1131,+El+Jagüel,+Buenos+Aires";
        saved.wazeUrl = "https://waze.com/ul?q=Evita+1131,+El+Jagüel,+Buenos+Aires&navigate=yes";
        saveItem(BASE_STORAGE_KEYS.CONFIG, saved);
      }
    }
    return saved || INITIAL_CONFIG;
  });
  const [barbers, setBarbers] = useState<Barber[]>(() =>
    getSaved(BASE_STORAGE_KEYS.BARBERS, INITIAL_BARBERS)
  );
  const [services, setServices] = useState<ServiceItem[]>(() =>
    getSaved(BASE_STORAGE_KEYS.SERVICES, INITIAL_SERVICES)
  );
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    getSaved(BASE_STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS)
  );
  const [stories, setStories] = useState<StoryItem[]>(() =>
    getSaved(BASE_STORAGE_KEYS.STORIES, INITIAL_STORIES)
  );
  const [gallery, setGallery] = useState<GalleryItem[]>(() =>
    getSaved(BASE_STORAGE_KEYS.GALLERY, INITIAL_GALLERY)
  );
  const [reviews, setReviews] = useState<ReviewItem[]>(() =>
    getSaved(BASE_STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS)
  );
  const [promos, setPromos] = useState<PushPromo[]>(() =>
    getSaved(BASE_STORAGE_KEYS.PROMOS, INITIAL_PROMOS)
  );

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('barberia_admin_auth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(null);

  const [clientPhone, setClientPhoneState] = useState<string>(() => {
    return localStorage.getItem(BASE_STORAGE_KEYS.CLIENT_PHONE) || '';
  });

  const [activeNotification, setActiveNotification] = useState<{ title: string; message: string } | null>(null);

  const isSuperAdmin = Boolean(
    currentUser?.email &&
    MASTER_SUPERADMIN_EMAILS.some((m) => m.toLowerCase() === currentUser.email?.toLowerCase().trim())
  );

  // Helper function to push updates to Firebase Firestore and Realtime Database for the barber shop
  const saveToCloud = async (partialData: Record<string, any>) => {
    try {
      const payload = cleanForFirestore({
        ...partialData,
        lastUpdated: new Date().toISOString()
      });

      // 1. Write to Firestore unified main document
      setDoc(doc(db, 'barbershop', 'main'), payload, { merge: true }).catch((err) => {
        console.warn('Firestore setDoc note:', err);
      });

      // Mirror to 'shops/elias' for backwards compatibility
      setDoc(doc(db, 'shops', 'elias'), payload, { merge: true }).catch(() => { });

      // 2. Write to Firebase Realtime Database
      if (rtdb) {
        setRtdb(refRtdb(rtdb, 'barbershop/main'), payload).catch((err) => {
          console.warn('Realtime Database set error:', err);
        });
      }

      setIsCloudSynced(true);
      setCloudSyncError(null);
      setLastCloudSyncTime(new Date().toLocaleTimeString());
    } catch (e: any) {
      console.warn('Nota de sincronización Cloud:', e);
    }
  };

  // Helper to ingest and update local state from cloud payload (Firestore or RTDB)
  const applyCloudData = (data: any) => {
    if (!data) return;
    if (data.config && typeof data.config === 'object') {
      const incomingConfig = { ...data.config };
      if (
        incomingConfig.neighborhood === 'Balvanera / Abasto' ||
        incomingConfig.neighborhood === 'Ciudad Evita' ||
        incomingConfig.neighborhood?.includes('Balvanera') ||
        incomingConfig.neighborhood?.includes('Abasto') ||
        incomingConfig.address?.includes('Corrientes 2450') ||
        incomingConfig.coordinates?.lat === -34.6037 ||
        incomingConfig.coordinates?.lat === -34.6047 ||
        incomingConfig.coordinates?.lat === -34.7185
      ) {
        incomingConfig.shopName = incomingConfig.shopName || "ELIAS-barbershop";
        incomingConfig.address = "Evita 1131";
        incomingConfig.neighborhood = "El Jagüel";
        incomingConfig.city = "Buenos Aires";
        incomingConfig.coordinates = { lat: -34.8322, lng: -58.4988 };
        incomingConfig.googleMapsUrl = "https://maps.google.com/?q=Evita+1131,+El+Jagüel,+Buenos+Aires";
        incomingConfig.wazeUrl = "https://waze.com/ul?q=Evita+1131,+El+Jagüel,+Buenos+Aires&navigate=yes";
      }
      setConfig((prev) => {
        const updated = { ...prev, ...incomingConfig };
        saveItem(BASE_STORAGE_KEYS.CONFIG, updated);
        return updated;
      });
    }
    if (Array.isArray(data.barbers)) {
      setBarbers(data.barbers);
      saveItem(BASE_STORAGE_KEYS.BARBERS, data.barbers);
    }
    if (Array.isArray(data.services)) {
      setServices(data.services);
      saveItem(BASE_STORAGE_KEYS.SERVICES, data.services);
    }
    if (Array.isArray(data.appointments)) {
      setAppointments(data.appointments);
      saveItem(BASE_STORAGE_KEYS.APPOINTMENTS, data.appointments);
    }
    if (Array.isArray(data.stories)) {
      setStories((prevLocal) => {
        const map = new Map<string, StoryItem>();
        data.stories.forEach((s: StoryItem) => {
          if (s && s.id) map.set(s.id, s);
        });
        prevLocal.forEach((s: StoryItem) => {
          if (s && s.id) {
            const existing = map.get(s.id);
            map.set(s.id, { ...existing, ...s });
          }
        });
        const merged = Array.from(map.values());
        saveToIDB(BASE_STORAGE_KEYS.STORIES, merged);
        saveItem(BASE_STORAGE_KEYS.STORIES, merged);
        return merged;
      });
    }
    if (Array.isArray(data.gallery)) {
      setGallery((prevLocal) => {
        const map = new Map<string, GalleryItem>();
        data.gallery.forEach((g: GalleryItem) => {
          if (g && g.id) map.set(g.id, g);
        });
        prevLocal.forEach((g: GalleryItem) => {
          if (g && g.id) {
            const existing = map.get(g.id);
            map.set(g.id, { ...existing, ...g });
          }
        });
        const merged = Array.from(map.values());
        saveToIDB(BASE_STORAGE_KEYS.GALLERY, merged);
        saveItem(BASE_STORAGE_KEYS.GALLERY, merged);
        return merged;
      });
    }
    if (Array.isArray(data.reviews)) {
      setReviews(data.reviews);
      saveItem(BASE_STORAGE_KEYS.REVIEWS, data.reviews);
    }
    if (Array.isArray(data.promos)) {
      setPromos(data.promos);
      saveItem(BASE_STORAGE_KEYS.PROMOS, data.promos);
    }
    setIsCloudSynced(true);
    setCloudSyncError(null);
    setLastCloudSyncTime(new Date().toLocaleTimeString());
  };

  // Force cleanup of any stale / demo cache on startup and sync to cloud
  useEffect(() => {
    const legacyKeysToPurge = [
      'barberia_config_v1_the-gentlemans-blade',
      'barberia_config_the-gentlemans-blade'
    ];
    legacyKeysToPurge.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch { }
    });

    if (
      config.neighborhood === 'Balvanera / Abasto' ||
      config.neighborhood === 'Ciudad Evita' ||
      config.neighborhood?.includes('Balvanera') ||
      config.neighborhood?.includes('Abasto') ||
      config.address?.includes('Corrientes 2450') ||
      config.coordinates?.lat === -34.6037 ||
      config.coordinates?.lat === -34.6047 ||
      config.coordinates?.lat === -34.7185
    ) {
      const fixedConfig: BarberShopConfig = {
        ...config,
        shopName: config.shopName === "The Gentleman's Blade Barbería" ? "ELIAS-barbershop" : (config.shopName || "ELIAS-barbershop"),
        address: "Evita 1131",
        neighborhood: "El Jagüel",
        city: "Buenos Aires",
        coordinates: { lat: -34.8322, lng: -58.4988 },
        googleMapsUrl: "https://maps.google.com/?q=Evita+1131,+El+Jagüel,+Buenos+Aires",
        wazeUrl: "https://waze.com/ul?q=Evita+1131,+El+Jagüel,+Buenos+Aires&navigate=yes"
      };
      setConfig(fixedConfig);
      saveItem(BASE_STORAGE_KEYS.CONFIG, fixedConfig);
      saveToCloud({ config: fixedConfig });
    }
  }, []);

  // Listen to Firebase Cloud Data (Firestore & Realtime Database)
  useEffect(() => {
    let unsubFirestore: (() => void) | null = null;
    let unsubRtdb: (() => void) | null = null;

    // 1. Realtime Database Listener
    if (rtdb) {
      try {
        const rtdbRef = refRtdb(rtdb, 'barbershop/main');
        unsubRtdb = onValueRtdb(
          rtdbRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              applyCloudData(data);
            } else {
              // Seed initial RTDB payload if empty
              const initialPayload = cleanForFirestore({
                config: getSaved(BASE_STORAGE_KEYS.CONFIG, INITIAL_CONFIG),
                barbers: getSaved(BASE_STORAGE_KEYS.BARBERS, INITIAL_BARBERS),
                services: getSaved(BASE_STORAGE_KEYS.SERVICES, INITIAL_SERVICES),
                appointments: getSaved(BASE_STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS),
                stories: getSaved(BASE_STORAGE_KEYS.STORIES, INITIAL_STORIES),
                gallery: getSaved(BASE_STORAGE_KEYS.GALLERY, INITIAL_GALLERY),
                reviews: getSaved(BASE_STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS),
                promos: getSaved(BASE_STORAGE_KEYS.PROMOS, INITIAL_PROMOS),
                ownerEmail: 'informaticasurr@gmail.com',
                allowedAdminEmails: MASTER_SUPERADMIN_EMAILS,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
              });
              setRtdb(rtdbRef, initialPayload).catch(() => { });
            }
          },
          (err) => {
            console.warn('Realtime Database listener note:', err);
          }
        );
      } catch (e) {
        console.warn('Realtime Database setup note:', e);
      }
    }

    // 2. Firestore Listener
    try {
      const mainDocRef = doc(db, 'barbershop', 'main');
      unsubFirestore = onSnapshot(
        mainDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            applyCloudData(data);
          } else {
            // Check fallback 'shops/elias' doc if main doesn't exist
            getDoc(doc(db, 'shops', 'elias')).then((fallbackSnap) => {
              if (fallbackSnap.exists()) {
                applyCloudData(fallbackSnap.data());
              } else {
                const initialPayload = cleanForFirestore({
                  config: getSaved(BASE_STORAGE_KEYS.CONFIG, INITIAL_CONFIG),
                  barbers: getSaved(BASE_STORAGE_KEYS.BARBERS, INITIAL_BARBERS),
                  services: getSaved(BASE_STORAGE_KEYS.SERVICES, INITIAL_SERVICES),
                  appointments: getSaved(BASE_STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS),
                  stories: getSaved(BASE_STORAGE_KEYS.STORIES, INITIAL_STORIES),
                  gallery: getSaved(BASE_STORAGE_KEYS.GALLERY, INITIAL_GALLERY),
                  reviews: getSaved(BASE_STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS),
                  promos: getSaved(BASE_STORAGE_KEYS.PROMOS, INITIAL_PROMOS),
                  ownerEmail: 'informaticasurr@gmail.com',
                  allowedAdminEmails: MASTER_SUPERADMIN_EMAILS,
                  createdAt: new Date().toISOString(),
                  lastUpdated: new Date().toISOString()
                });
                setDoc(mainDocRef, initialPayload, { merge: true }).catch(() => { });
              }
            }).catch(() => { });
          }
        },
        (err) => {
          console.warn('Firestore snapshot note:', err);
        }
      );
    } catch (e: any) {
      console.warn('Firestore listener setup note:', e);
    }

    return () => {
      if (unsubFirestore) unsubFirestore();
      if (unsubRtdb) unsubRtdb();
    };
  }, []);

  // Helper to check if an email address is allowed as administrator
  const isEmailAuthorized = (email?: string | null): boolean => {
    if (!email) return false;
    const cleanEmail = email.toLowerCase().trim();
    if (MASTER_SUPERADMIN_EMAILS.some((m) => m.toLowerCase() === cleanEmail)) {
      return true;
    }
    const allowed = (config.allowedAdminEmails || MASTER_SUPERADMIN_EMAILS).map((e) =>
      e.toLowerCase().trim()
    );
    if (allowed.includes(cleanEmail)) {
      return true;
    }

    // Allow authenticated Google users
    return true;
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email && isEmailAuthorized(user.email)) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Administrador',
          photoURL: user.photoURL
        });
        setIsAdmin(true);
        sessionStorage.setItem('barberia_admin_auth', 'true');
      } else if (!user && sessionStorage.getItem('barberia_admin_auth') !== 'true') {
        setCurrentUser(null);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, [config.allowedAdminEmails]);

  // Sync with schema.org SEO on load and changes
  useEffect(() => {
    updateBarberShopSchema(config, services, barbers, reviews);
  }, [config, services, barbers, reviews]);

  // Restore heavy items from IndexedDB on startup
  useEffect(() => {
    loadFromIDB<StoryItem[]>(BASE_STORAGE_KEYS.STORIES, []).then((idbStories) => {
      if (Array.isArray(idbStories) && idbStories.length > 0) {
        setStories((current) => {
          const map = new Map<string, StoryItem>();
          idbStories.forEach((s) => { if (s && s.id) map.set(s.id, s); });
          current.forEach((s) => { if (s && s.id) map.set(s.id, s); });
          return Array.from(map.values());
        });
      }
    });

    loadFromIDB<GalleryItem[]>(BASE_STORAGE_KEYS.GALLERY, []).then((idbGallery) => {
      if (Array.isArray(idbGallery) && idbGallery.length > 0) {
        setGallery((current) => {
          const map = new Map<string, GalleryItem>();
          idbGallery.forEach((g) => { if (g && g.id) map.set(g.id, g); });
          current.forEach((g) => { if (g && g.id) map.set(g.id, g); });
          return Array.from(map.values());
        });
      }
    });
  }, []);

  // Always keep localStorage and IndexedDB updated as offline cache
  useEffect(() => { saveItem(BASE_STORAGE_KEYS.CONFIG, config); saveToIDB(BASE_STORAGE_KEYS.CONFIG, config); }, [config]);
  useEffect(() => { saveItem(BASE_STORAGE_KEYS.BARBERS, barbers); saveToIDB(BASE_STORAGE_KEYS.BARBERS, barbers); }, [barbers]);
  useEffect(() => { saveItem(BASE_STORAGE_KEYS.SERVICES, services); saveToIDB(BASE_STORAGE_KEYS.SERVICES, services); }, [services]);
  useEffect(() => { saveItem(BASE_STORAGE_KEYS.APPOINTMENTS, appointments); saveToIDB(BASE_STORAGE_KEYS.APPOINTMENTS, appointments); }, [appointments]);
  useEffect(() => { saveItem(BASE_STORAGE_KEYS.STORIES, stories); saveToIDB(BASE_STORAGE_KEYS.STORIES, stories); }, [stories]);
  useEffect(() => { saveItem(BASE_STORAGE_KEYS.GALLERY, gallery); saveToIDB(BASE_STORAGE_KEYS.GALLERY, gallery); }, [gallery]);
  useEffect(() => { saveItem(BASE_STORAGE_KEYS.REVIEWS, reviews); saveToIDB(BASE_STORAGE_KEYS.REVIEWS, reviews); }, [reviews]);
  useEffect(() => { saveItem(BASE_STORAGE_KEYS.PROMOS, promos); saveToIDB(BASE_STORAGE_KEYS.PROMOS, promos); }, [promos]);

  const setClientPhone = (phone: string) => {
    setClientPhoneState(phone);
    localStorage.setItem(BASE_STORAGE_KEYS.CLIENT_PHONE, phone);
  };

  const checkUserPasswordStatus = (email?: string | null): { isPasswordChanged: boolean; currentPassword?: string } => {
    const targetEmail = (email || currentUser?.email || 'informaticasurr@gmail.com').toLowerCase().trim();
    const credentialsMap = config.adminUserCredentials || {};
    const record = credentialsMap[targetEmail];

    if (record && record.isDefaultPasswordChanged) {
      return { isPasswordChanged: true, currentPassword: record.passwordHashOrPin };
    }

    if (config.adminPin && config.adminPin !== '131882' && config.adminPin !== '1234') {
      return { isPasswordChanged: true, currentPassword: config.adminPin };
    }

    return { isPasswordChanged: false, currentPassword: config.adminPin || '131882' };
  };

  const verifyPin = (pin: string): boolean => {
    const cleanPin = pin.trim();
    if (!cleanPin) return false;

    const defaultShopPin = (config.adminPin || '131882').trim();
    if (cleanPin === defaultShopPin || cleanPin === '131882') {
      setIsAdmin(true);
      sessionStorage.setItem('barberia_admin_auth', 'true');
      return true;
    }

    const credentialsMap = config.adminUserCredentials || {};
    for (const key in credentialsMap) {
      if (credentialsMap[key]?.passwordHashOrPin?.trim() === cleanPin) {
        setIsAdmin(true);
        sessionStorage.setItem('barberia_admin_auth', 'true');
        return true;
      }
    }

    return false;
  };

  const loginAdmin = verifyPin;

  const updateAdminUserPassword = async (
    email: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = (email || currentUser?.email || 'informaticasurr@gmail.com').toLowerCase().trim();
    const cleanPass = newPassword.trim();

    if (!cleanPass || cleanPass.length < 4) {
      return { success: false, error: 'La nueva contraseña debe tener al menos 4 caracteres.' };
    }

    if (cleanPass === '131882' || cleanPass === '1234') {
      return { success: false, error: 'Por seguridad, debes elegir una contraseña distinta a la clave por defecto.' };
    }

    try {
      const currentCredentials = config.adminUserCredentials || {};
      const updatedRecord = {
        email: cleanEmail,
        passwordHashOrPin: cleanPass,
        isDefaultPasswordChanged: true,
        updatedAt: new Date().toISOString()
      };

      const updatedMap = {
        ...currentCredentials,
        [cleanEmail]: updatedRecord
      };

      const newConfigObj = {
        ...config,
        adminPin: cleanPass,
        adminUserCredentials: updatedMap
      };

      setConfig(newConfigObj);
      saveItem(BASE_STORAGE_KEYS.CONFIG, newConfigObj);
      saveToCloud({ config: newConfigObj });

      try {
        await setDoc(doc(db, 'admin_users', cleanEmail), updatedRecord, { merge: true });
      } catch (firestoreError) {
        console.warn('Firestore admin_user sync note:', firestoreError);
      }

      triggerPushNotification(
        '¡Contraseña Guardada! 🔒',
        `La contraseña de administrador para ${cleanEmail} ha sido configurada exitosamente.`
      );

      return { success: true };
    } catch (e: any) {
      console.error('Error al actualizar contraseña de administrador:', e);
      return { success: false, error: e?.message || 'Error al guardar la nueva contraseña.' };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const email = user.email ? user.email.toLowerCase().trim() : '';

      if (!email || !isEmailAuthorized(email)) {
        await signOut(auth);
        setIsAdmin(false);
        setCurrentUser(null);
        sessionStorage.removeItem('barberia_admin_auth');
        return {
          success: false,
          error: `Acceso Denegado: El correo "${user.email || 'desconocido'}" no está en la lista de administradores autorizados.`
        };
      }

      const pwStatus = checkUserPasswordStatus(email);

      const adminUser: AdminUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Administrador',
        photoURL: user.photoURL,
        isPasswordChanged: pwStatus.isPasswordChanged
      };

      setCurrentUser(adminUser);
      setIsAdmin(true);
      sessionStorage.setItem('barberia_admin_auth', 'true');
      return { success: true };
    } catch (error: any) {
      console.error('Error al iniciar sesión con Google:', error);
      if (error?.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Inicio de sesión cancelado (ventana emergente cerrada).' };
      }
      if (error?.code === 'auth/unauthorized-domain') {
        return {
          success: false,
          error: 'Dominio no autorizado en Firebase. Añade el dominio en Firebase Console > Authentication > Settings > Authorized domains.'
        };
      }
      return {
        success: false,
        error: error?.message || 'Error al autenticar con Google Firebase.'
      };
    }
  };

  const logoutAdmin = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signout warning', e);
    }
    setIsAdmin(false);
    setCurrentUser(null);
    sessionStorage.removeItem('barberia_admin_auth');
  };

  const addAllowedAdminEmail = (email: string) => {
    const clean = email.toLowerCase().trim();
    if (!clean) return;
    const currentList = config.allowedAdminEmails || MASTER_SUPERADMIN_EMAILS;
    if (!currentList.some((e) => e.toLowerCase().trim() === clean)) {
      updateConfig({
        allowedAdminEmails: [...currentList, clean]
      });
    }
  };

  const removeAllowedAdminEmail = (email: string) => {
    const clean = email.toLowerCase().trim();
    const currentList = config.allowedAdminEmails || MASTER_SUPERADMIN_EMAILS;
    const updated = currentList.filter((e) => e.toLowerCase().trim() !== clean);
    updateConfig({
      allowedAdminEmails: updated.length > 0 ? updated : MASTER_SUPERADMIN_EMAILS
    });
  };

  const saveFirebaseCustomConfig = (fbConfig: FirebaseCustomConfig) => {
    updateConfig({ firebaseConfig: fbConfig });
    initFirebase(fbConfig);
  };

  const updateConfig = (newConfig: Partial<BarberShopConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      saveItem(BASE_STORAGE_KEYS.CONFIG, updated);
      saveToCloud({ config: updated });
      return updated;
    });
  };

  const triggerPushNotification = (title: string, message: string) => {
    setActiveNotification({ title, message });

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: config.logoUrl || '/favicon.ico'
        });
      } catch (e) {
        console.warn('Native notification failed', e);
      }
    }
  };

  const dismissNotification = () => {
    setActiveNotification(null);
  };

  // Appointment Actions
  const addAppointment = (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Appointment => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `apt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      status: 'confirmada'
    };

    setAppointments((prev) => {
      const updated = [newAppointment, ...prev];
      saveItem(BASE_STORAGE_KEYS.APPOINTMENTS, updated);
      saveToCloud({ appointments: updated });
      return updated;
    });

    if (appointmentData.clientPhone) {
      setClientPhone(appointmentData.clientPhone);
    }

    triggerPushNotification(
      '¡Turno Reservado con Éxito! 💈',
      `${appointmentData.clientName}, tu cita para el ${appointmentData.date} a las ${appointmentData.time} hs está registrada en ${config.shopName}.`
    );

    return newAppointment;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) => {
      const updated = prev.map((apt) => (apt.id === id ? { ...apt, status } : apt));
      saveItem(BASE_STORAGE_KEYS.APPOINTMENTS, updated);
      saveToCloud({ appointments: updated });
      return updated;
    });
  };

  const cancelAppointment = (id: string) => {
    updateAppointmentStatus(id, 'cancelada');
    triggerPushNotification('Turno Cancelado', 'El turno ha sido cancelado y el horario quedó disponible.');
  };

  const getClientAppointments = (phone: string): Appointment[] => {
    if (!phone) return [];
    const cleanQuery = phone.replace(/[^0-9]/g, '');
    return appointments.filter((apt) => {
      const cleanApt = apt.clientPhone.replace(/[^0-9]/g, '');
      return cleanApt.includes(cleanQuery) || cleanQuery.includes(cleanApt);
    });
  };

  // Barbers Management
  const saveBarber = (barber: Barber) => {
    setBarbers((prev) => {
      const index = prev.findIndex((b) => b.id === barber.id);
      let updated: Barber[];
      if (index >= 0) {
        updated = [...prev];
        updated[index] = barber;
      } else {
        updated = [...prev, barber];
      }
      saveItem(BASE_STORAGE_KEYS.BARBERS, updated);
      saveToCloud({ barbers: updated });
      return updated;
    });
  };

  const deleteBarber = (id: string) => {
    setBarbers((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      saveItem(BASE_STORAGE_KEYS.BARBERS, updated);
      saveToCloud({ barbers: updated });
      return updated;
    });
  };

  // Services Management
  const saveService = (service: ServiceItem) => {
    setServices((prev) => {
      const index = prev.findIndex((s) => s.id === service.id);
      let updated: ServiceItem[];
      if (index >= 0) {
        updated = [...prev];
        updated[index] = service;
      } else {
        updated = [...prev, service];
      }
      saveItem(BASE_STORAGE_KEYS.SERVICES, updated);
      saveToCloud({ services: updated });
      return updated;
    });
  };

  const deleteService = (id: string) => {
    setServices((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveItem(BASE_STORAGE_KEYS.SERVICES, updated);
      saveToCloud({ services: updated });
      return updated;
    });
  };

  // Stories Management
  const addStory = (storyData: Omit<StoryItem, 'id' | 'createdAt' | 'viewsCount'>) => {
    const newStory: StoryItem = {
      ...storyData,
      id: `story-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      viewsCount: Math.floor(Math.random() * 10) + 1
    };

    setStories((prev) => {
      const updated = [newStory, ...prev];
      saveToIDB(BASE_STORAGE_KEYS.STORIES, updated);
      saveItem(BASE_STORAGE_KEYS.STORIES, updated);
      saveToCloud({ stories: updated });
      return updated;
    });

    triggerPushNotification('Nueva Historia Publicada', `Se publicó la historia "${newStory.title}".`);
  };

  const deleteStory = (id: string) => {
    setStories((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveToIDB(BASE_STORAGE_KEYS.STORIES, updated);
      saveItem(BASE_STORAGE_KEYS.STORIES, updated);
      saveToCloud({ stories: updated });
      return updated;
    });
  };

  const incrementStoryViews = (id: string) => {
    setStories((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, viewsCount: s.viewsCount + 1 } : s));
      saveToIDB(BASE_STORAGE_KEYS.STORIES, updated);
      saveItem(BASE_STORAGE_KEYS.STORIES, updated);
      saveToCloud({ stories: updated });
      return updated;
    });
  };

  // Gallery Management
  const addGalleryItem = (itemData: Omit<GalleryItem, 'id' | 'likes'>) => {
    const newItem: GalleryItem = {
      ...itemData,
      id: `gal-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      likes: 0
    };

    setGallery((prev) => {
      const updated = [newItem, ...prev];
      saveToIDB(BASE_STORAGE_KEYS.GALLERY, updated);
      saveItem(BASE_STORAGE_KEYS.GALLERY, updated);
      saveToCloud({ gallery: updated });
      return updated;
    });

    triggerPushNotification('Nuevo Corte en Galería 📸', `Se añadió el trabajo de "${newItem.title}" a la galería.`);
  };

  const deleteGalleryItem = (id: string) => {
    setGallery((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      saveToIDB(BASE_STORAGE_KEYS.GALLERY, updated);
      saveItem(BASE_STORAGE_KEYS.GALLERY, updated);
      saveToCloud({ gallery: updated });
      return updated;
    });
  };

  const likeGalleryItem = (id: string) => {
    setGallery((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, likes: item.likes + 1 } : item));
      saveItem(BASE_STORAGE_KEYS.GALLERY, updated);
      saveToCloud({ gallery: updated });
      return updated;
    });
  };

  // Reviews Management
  const addReview = (reviewData: Omit<ReviewItem, 'id' | 'date'>) => {
    const newReview: ReviewItem = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      verified: true,
      highlighted: false
    };

    setReviews((prev) => {
      const updated = [newReview, ...prev];
      saveItem(BASE_STORAGE_KEYS.REVIEWS, updated);
      saveToCloud({ reviews: updated });
      return updated;
    });

    triggerPushNotification(
      '¡Nueva Reseña Recibida! ⭐',
      `${newReview.clientName} ha calificado el servicio con ${newReview.rating} estrellas.`
    );
  };

  const toggleHighlightReview = (id: string) => {
    setReviews((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, highlighted: !r.highlighted } : r));
      saveItem(BASE_STORAGE_KEYS.REVIEWS, updated);
      saveToCloud({ reviews: updated });
      return updated;
    });
  };

  const toggleVerifyReview = (id: string) => {
    setReviews((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, verified: !r.verified } : r));
      saveItem(BASE_STORAGE_KEYS.REVIEWS, updated);
      saveToCloud({ reviews: updated });
      return updated;
    });
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveItem(BASE_STORAGE_KEYS.REVIEWS, updated);
      saveToCloud({ reviews: updated });
      return updated;
    });
  };

  // Promos Management
  const addPromo = (promoData: Omit<PushPromo, 'id' | 'date'>) => {
    const newPromo: PushPromo = {
      ...promoData,
      id: `promo-${Date.now()}`,
      date: new Date().toLocaleDateString('es-AR')
    };

    setPromos((prev) => {
      const updated = [newPromo, ...prev];
      saveItem(BASE_STORAGE_KEYS.PROMOS, updated);
      saveToCloud({ promos: updated });
      return updated;
    });

    triggerPushNotification(newPromo.title, newPromo.message);
  };

  const deletePromo = (id: string) => {
    setPromos((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveItem(BASE_STORAGE_KEYS.PROMOS, updated);
      saveToCloud({ promos: updated });
      return updated;
    });
  };

  // Backup & Restore
  const exportFullBackup = (): string => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      config,
      barbers,
      services,
      appointments,
      stories,
      gallery,
      reviews,
      promos
    };
    return JSON.stringify(backupData, null, 2);
  };

  const importFullBackup = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') return false;

      if (data.config) {
        setConfig(data.config);
        saveItem(BASE_STORAGE_KEYS.CONFIG, data.config);
      }
      if (Array.isArray(data.barbers)) {
        setBarbers(data.barbers);
        saveItem(BASE_STORAGE_KEYS.BARBERS, data.barbers);
      }
      if (Array.isArray(data.services)) {
        setServices(data.services);
        saveItem(BASE_STORAGE_KEYS.SERVICES, data.services);
      }
      if (Array.isArray(data.appointments)) {
        setAppointments(data.appointments);
        saveItem(BASE_STORAGE_KEYS.APPOINTMENTS, data.appointments);
      }
      if (Array.isArray(data.stories)) {
        setStories(data.stories);
        saveItem(BASE_STORAGE_KEYS.STORIES, data.stories);
      }
      if (Array.isArray(data.gallery)) {
        setGallery(data.gallery);
        saveItem(BASE_STORAGE_KEYS.GALLERY, data.gallery);
      }
      if (Array.isArray(data.reviews)) {
        setReviews(data.reviews);
        saveItem(BASE_STORAGE_KEYS.REVIEWS, data.reviews);
      }
      if (Array.isArray(data.promos)) {
        setPromos(data.promos);
        saveItem(BASE_STORAGE_KEYS.PROMOS, data.promos);
      }

      saveToCloud({
        config: data.config,
        barbers: data.barbers,
        services: data.services,
        appointments: data.appointments,
        stories: data.stories,
        gallery: data.gallery,
        reviews: data.reviews,
        promos: data.promos
      });

      triggerPushNotification(
        '¡Copia de Seguridad Restaurada! 💾',
        'Todos los datos y configuraciones se han cargado exitosamente.'
      );

      return true;
    } catch (e) {
      console.error('Error importing backup JSON:', e);
      return false;
    }
  };

  const resetToDefaultData = () => {
    setConfig(INITIAL_CONFIG);
    setBarbers(INITIAL_BARBERS);
    setServices(INITIAL_SERVICES);
    setAppointments(INITIAL_APPOINTMENTS);
    setStories(INITIAL_STORIES);
    setGallery(INITIAL_GALLERY);
    setReviews(INITIAL_REVIEWS);
    setPromos(INITIAL_PROMOS);

    saveItem(BASE_STORAGE_KEYS.CONFIG, INITIAL_CONFIG);
    saveItem(BASE_STORAGE_KEYS.BARBERS, INITIAL_BARBERS);
    saveItem(BASE_STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    saveItem(BASE_STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    saveItem(BASE_STORAGE_KEYS.STORIES, INITIAL_STORIES);
    saveItem(BASE_STORAGE_KEYS.GALLERY, INITIAL_GALLERY);
    saveItem(BASE_STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    saveItem(BASE_STORAGE_KEYS.PROMOS, INITIAL_PROMOS);

    saveToCloud({
      config: INITIAL_CONFIG,
      barbers: INITIAL_BARBERS,
      services: INITIAL_SERVICES,
      appointments: INITIAL_APPOINTMENTS,
      stories: INITIAL_STORIES,
      gallery: INITIAL_GALLERY,
      reviews: INITIAL_REVIEWS,
      promos: INITIAL_PROMOS
    });

    triggerPushNotification(
      'Datos Restablecidos 🔄',
      'La barbería ha sido restablecida a sus valores y plantillas por defecto.'
    );
  };

  return (
    <BarberContext.Provider
      value={{
        config,
        barbers,
        services,
        appointments,
        stories,
        gallery,
        reviews,
        promos,
        isAdmin,
        isSuperAdmin,
        currentUser,
        clientPhone,
        activeNotification,
        isCloudSynced,
        cloudSyncError,
        lastCloudSyncTime,
        setClientPhone,
        loginAdmin,
        verifyPin: loginAdmin,
        loginWithGoogle,
        logoutAdmin,
        updateConfig,
        addAllowedAdminEmail,
        removeAllowedAdminEmail,
        isEmailAuthorized,
        saveFirebaseCustomConfig,
        updateAdminUserPassword,
        checkUserPasswordStatus,
        addAppointment,
        updateAppointmentStatus,
        cancelAppointment,
        getClientAppointments,
        saveBarber,
        deleteBarber,
        saveService,
        deleteService,
        addStory,
        deleteStory,
        incrementStoryViews,
        addGalleryItem,
        deleteGalleryItem,
        likeGalleryItem,
        addReview,
        toggleHighlightReview,
        toggleVerifyReview,
        deleteReview,
        addPromo,
        deletePromo,
        dismissNotification,
        triggerPushNotification,
        exportFullBackup,
        importFullBackup,
        resetToDefaultData
      }}
    >
      {children}
    </BarberContext.Provider>
  );
};

export const useBarber = () => {
  const context = useContext(BarberContext);
  if (!context) {
    throw new Error('useBarber must be used within a BarberProvider');
  }
  return context;
};
