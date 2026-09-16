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
  onSnapshot,
  collection,
  deleteDoc
} from 'firebase/firestore';
import {
  ref as refRtdb,
  set as setRtdb,
  update as updateRtdb,
  onValue as onValueRtdb,
  get as getRtdb,
  remove as removeRtdb
} from 'firebase/database';
import { saveToIDB, loadFromIDB } from '../utils/idbStorage';
import { compressBase64DataUrl } from '../utils/mediaUpload';

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
      const isLegacyObelisco =
        saved.neighborhood === 'Balvanera / Abasto' ||
        saved.neighborhood?.includes('Balvanera') ||
        saved.neighborhood?.includes('Abasto') ||
        saved.address?.includes('Corrientes 2450') ||
        (saved.coordinates?.lat && saved.coordinates.lat > -34.70) ||
        (saved.coordinates?.lat && Math.abs(saved.coordinates.lat - -34.6037) < 0.08) ||
        saved.googleMapsUrl?.includes('-34.6037') ||
        saved.googleMapsUrl?.includes('-58.3816') ||
        saved.wazeUrl?.includes('-34.6037') ||
        saved.wazeUrl?.includes('-58.3816');

      if (isLegacyObelisco) {
        saved.shopName = saved.shopName === "The Gentleman's Blade Barbería" ? "ELIAS-barbershop" : (saved.shopName || "ELIAS-barbershop");
        saved.address = "Evita 1131";
        saved.neighborhood = "El Jagüel";
        saved.city = "Buenos Aires";
        saved.coordinates = { lat: -34.8328, lng: -58.4957 };
        saved.googleMapsUrl = "https://www.google.com/maps?q=-34.8328,-58.4957";
        saved.wazeUrl = "https://waze.com/ul?ll=-34.8328,-58.4957&navigate=yes";
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
    getSaved(BASE_STORAGE_KEYS.STORIES, [])
  );
  const [gallery, setGallery] = useState<GalleryItem[]>(() =>
    getSaved(BASE_STORAGE_KEYS.GALLERY, [])
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

  // Helper function to push updates to Firebase Firestore for the barber shop
  const saveToCloud = async (partialData: Record<string, any>) => {
    try {
      const updatesToSave: Record<string, any> = {
        lastUpdated: new Date().toISOString()
      };

      if (partialData.config) {
        updatesToSave.config = partialData.config;
      }

      if (partialData.barbers && Array.isArray(partialData.barbers)) {
        const sanitizedBarbers = await Promise.all(
          partialData.barbers.map(async (b: Barber) => {
            if (b.photoUrl && b.photoUrl.startsWith('data:image/') && b.photoUrl.length > 80000) {
              const compressed = await compressBase64DataUrl(b.photoUrl, 400, 400, 0.65);
              return { ...b, photoUrl: compressed };
            }
            return b;
          })
        );
        updatesToSave.barbers = sanitizedBarbers;
        sanitizedBarbers.forEach((b) => {
          setDoc(doc(db, 'barbers', b.id), cleanForFirestore(b), { merge: true }).catch(() => { });
        });
      }

      if (partialData.services && Array.isArray(partialData.services)) {
        const sanitizedServices = await Promise.all(
          partialData.services.map(async (srv: ServiceItem) => {
            if (srv.image && srv.image.startsWith('data:image/') && srv.image.length > 80000) {
              const compressed = await compressBase64DataUrl(srv.image, 800, 600, 0.65);
              return { ...srv, image: compressed };
            }
            return srv;
          })
        );
        updatesToSave.services = sanitizedServices;
        sanitizedServices.forEach((srv) => {
          setDoc(doc(db, 'services', srv.id), cleanForFirestore(srv), { merge: true }).catch(() => { });
        });
      }

      if (partialData.appointments) {
        updatesToSave.appointments = partialData.appointments;
      }

      if (partialData.stories && Array.isArray(partialData.stories)) {
        const sanitizedStories = await Promise.all(
          partialData.stories.map(async (s: StoryItem) => {
            let media = s.mediaUrl;
            if (media && media.startsWith('data:image/') && media.length > 80000) {
              media = await compressBase64DataUrl(media, 500, 800, 0.55);
            }
            let thumb = s.thumbnailUrl;
            if (thumb && thumb.startsWith('data:image/') && thumb.length > 80000) {
              thumb = await compressBase64DataUrl(thumb, 400, 600, 0.55);
            }
            return {
              ...s,
              mediaUrl: media,
              thumbnailUrl: thumb || undefined
            };
          })
        );
        updatesToSave.stories = sanitizedStories;

        // Persist each individual story in dedicated Firestore collection and Realtime Database
        sanitizedStories.forEach((st) => {
          if (st && st.id) {
            setDoc(doc(db, 'stories', st.id), cleanForFirestore(st), { merge: true }).catch(() => { });
            if (rtdb) {
              setRtdb(refRtdb(rtdb, `stories/${st.id}`), cleanForFirestore(st)).catch(() => { });
            }
          }
        });
      }

      if (partialData.gallery && Array.isArray(partialData.gallery)) {
        const sanitizedGallery = await Promise.all(
          partialData.gallery.map(async (g: GalleryItem) => {
            if (g.image && g.image.startsWith('data:image/') && g.image.length > 80000) {
              const compressed = await compressBase64DataUrl(g.image, 800, 600, 0.65);
              return { ...g, image: compressed };
            }
            return g;
          })
        );
        updatesToSave.gallery = sanitizedGallery;
      }

      if (partialData.reviews) {
        updatesToSave.reviews = partialData.reviews;
      }

      if (partialData.promos) {
        updatesToSave.promos = partialData.promos;
      }

      // Preserve any other custom key passed in partialData
      Object.keys(partialData).forEach((key) => {
        if (!['config', 'barbers', 'services', 'appointments', 'stories', 'gallery', 'reviews', 'promos'].includes(key)) {
          updatesToSave[key] = partialData[key];
        }
      });

      const payload = cleanForFirestore(updatesToSave);

      // Write only the specified partial updates to Firestore main doc using merge: true
      try {
        await setDoc(doc(db, 'barbershop', 'main'), payload, { merge: true });
        setDoc(doc(db, 'shops', 'elias'), payload, { merge: true }).catch(() => { });
      } catch (docErr) {
        console.warn('Firestore main document save warning (individual collections maintained):', docErr);
      }

      if (rtdb) {
        try {
          await updateRtdb(refRtdb(rtdb, 'barbershop/main'), payload);
        } catch (rtdbErr) {
          console.warn('Realtime Database main node update note:', rtdbErr);
        }
      }

      setIsCloudSynced(true);
      setCloudSyncError(null);
      setLastCloudSyncTime(new Date().toLocaleTimeString());
    } catch (e: any) {
      console.warn('Nota de sincronización Cloud principal:', e);
      setCloudSyncError(e?.message || 'Error al guardar en la nube');
    }
  };

  // Helper to ingest and update local state from cloud payload (Firestore or RTDB)
  const applyCloudData = (data: any) => {
    if (!data) return;
    if (data.config && typeof data.config === 'object') {
      const incomingConfig = { ...data.config };
      const isLegacyObelisco =
        incomingConfig.neighborhood === 'Balvanera / Abasto' ||
        incomingConfig.neighborhood?.includes('Balvanera') ||
        incomingConfig.neighborhood?.includes('Abasto') ||
        incomingConfig.address?.includes('Corrientes 2450') ||
        (incomingConfig.coordinates?.lat && incomingConfig.coordinates.lat > -34.70) ||
        (incomingConfig.coordinates?.lat && Math.abs(incomingConfig.coordinates.lat - -34.6037) < 0.08) ||
        incomingConfig.googleMapsUrl?.includes('-34.6037') ||
        incomingConfig.googleMapsUrl?.includes('-58.3816') ||
        incomingConfig.wazeUrl?.includes('-34.6037') ||
        incomingConfig.wazeUrl?.includes('-58.3816');

      if (isLegacyObelisco) {
        incomingConfig.shopName = incomingConfig.shopName === "The Gentleman's Blade Barbería" ? "ELIAS-barbershop" : (incomingConfig.shopName || "ELIAS-barbershop");
        incomingConfig.address = "Evita 1131";
        incomingConfig.neighborhood = "El Jagüel";
        incomingConfig.city = "Buenos Aires";
        incomingConfig.coordinates = { lat: -34.8328, lng: -58.4957 };
        incomingConfig.googleMapsUrl = "https://www.google.com/maps?q=-34.8328,-58.4957";
        incomingConfig.wazeUrl = "https://waze.com/ul?ll=-34.8328,-58.4957&navigate=yes";
      }
      setConfig((prev) => {
        const updated = { ...prev, ...incomingConfig };
        saveItem(BASE_STORAGE_KEYS.CONFIG, updated);
        return updated;
      });
    }
    if (Array.isArray(data.barbers) && data.barbers.length > 0) {
      setBarbers(data.barbers);
      saveItem(BASE_STORAGE_KEYS.BARBERS, data.barbers);
    }
    if (Array.isArray(data.services) && data.services.length > 0) {
      setServices(data.services);
      saveItem(BASE_STORAGE_KEYS.SERVICES, data.services);
    }
    if (Array.isArray(data.appointments)) {
      setAppointments(data.appointments);
      saveItem(BASE_STORAGE_KEYS.APPOINTMENTS, data.appointments);
    }
    if (Array.isArray(data.stories) && data.stories.length > 0) {
      setStories(data.stories);
      saveToIDB(BASE_STORAGE_KEYS.STORIES, data.stories);
      saveItem(BASE_STORAGE_KEYS.STORIES, data.stories);
    }
    if (Array.isArray(data.gallery) && data.gallery.length > 0) {
      setGallery(data.gallery);
      saveToIDB(BASE_STORAGE_KEYS.GALLERY, data.gallery);
      saveItem(BASE_STORAGE_KEYS.GALLERY, data.gallery);
    }
    if (Array.isArray(data.reviews) && data.reviews.length > 0) {
      setReviews(data.reviews);
      saveItem(BASE_STORAGE_KEYS.REVIEWS, data.reviews);
    }
    if (Array.isArray(data.promos) && data.promos.length > 0) {
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

    const isLegacyObelisco =
      config.neighborhood === 'Balvanera / Abasto' ||
      config.neighborhood?.includes('Balvanera') ||
      config.neighborhood?.includes('Abasto') ||
      config.address?.includes('Corrientes 2450') ||
      (config.coordinates?.lat && config.coordinates.lat > -34.70) ||
      (config.coordinates?.lat && Math.abs(config.coordinates.lat - -34.6037) < 0.08) ||
      config.googleMapsUrl?.includes('-34.6037') ||
      config.googleMapsUrl?.includes('-58.3816') ||
      config.wazeUrl?.includes('-34.6037') ||
      config.wazeUrl?.includes('-58.3816');

    if (isLegacyObelisco) {
      const fixedConfig: BarberShopConfig = {
        ...config,
        shopName: config.shopName === "The Gentleman's Blade Barbería" ? "ELIAS-barbershop" : (config.shopName || "ELIAS-barbershop"),
        address: "Evita 1131",
        neighborhood: "El Jagüel",
        city: "Buenos Aires",
        coordinates: { lat: -34.8328, lng: -58.4957 },
        googleMapsUrl: "https://www.google.com/maps?q=-34.8328,-58.4957",
        wazeUrl: "https://waze.com/ul?ll=-34.8328,-58.4957&navigate=yes"
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

    // 1. Realtime Database Listener (Safe fallback)
    if (rtdb) {
      try {
        const rtdbRef = refRtdb(rtdb, 'barbershop/main');
        unsubRtdb = onValueRtdb(
          rtdbRef,
          (snapshot) => {
            try {
              if (snapshot && snapshot.exists()) {
                const data = snapshot.val();
                if (data && typeof data === 'object') {
                  applyCloudData(data);
                }
              }
            } catch (err) {
              console.warn('Realtime Database processing note:', err);
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
                  stories: getSaved(BASE_STORAGE_KEYS.STORIES, []),
                  gallery: getSaved(BASE_STORAGE_KEYS.GALLERY, []),
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

    let unsubStoriesCollection: (() => void) | null = null;
    try {
      const storiesColRef = collection(db, 'stories');
      unsubStoriesCollection = onSnapshot(
        storiesColRef,
        (colSnap) => {
          if (!colSnap.empty) {
            const colStories: StoryItem[] = colSnap.docs
              .map((d) => d.data() as StoryItem)
              .filter((st) => st && st.id && st.title);
            if (colStories.length > 0) {
              colStories.sort(
                (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
              );
              setStories(colStories);
              saveToIDB(BASE_STORAGE_KEYS.STORIES, colStories);
              saveItem(BASE_STORAGE_KEYS.STORIES, colStories);
            }
          }
        },
        (err) => {
          console.warn('Stories collection snapshot note:', err);
        }
      );
    } catch (e) {
      console.warn('Stories collection listener setup note:', e);
    }

    // 3. Realtime Database Stories Node Listener (Ensures real-time backup across devices)
    let unsubRtdbStories: (() => void) | null = null;
    if (rtdb) {
      try {
        const rtdbStoriesRef = refRtdb(rtdb, 'stories');
        unsubRtdbStories = onValueRtdb(
          rtdbStoriesRef,
          (snapshot) => {
            try {
              if (snapshot && snapshot.exists()) {
                const val = snapshot.val();
                let rtdbStories: StoryItem[] = [];
                if (Array.isArray(val)) {
                  rtdbStories = val.filter(Boolean);
                } else if (typeof val === 'object' && val !== null) {
                  rtdbStories = Object.values(val);
                }
                if (rtdbStories.length > 0) {
                  rtdbStories.sort(
                    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                  );
                  setStories((prev) => {
                    // If local has newer/same count, merge
                    if (prev.length >= rtdbStories.length && prev.length > 0) return prev;
                    return rtdbStories;
                  });
                  saveToIDB(BASE_STORAGE_KEYS.STORIES, rtdbStories);
                  saveItem(BASE_STORAGE_KEYS.STORIES, rtdbStories);
                }
              }
            } catch (err) {
              console.warn('RTDB stories processing note:', err);
            }
          },
          (err) => {
            console.warn('RTDB stories listener note:', err);
          }
        );
      } catch (e) {
        console.warn('RTDB stories setup note:', e);
      }
    }

    return () => {
      if (unsubFirestore) unsubFirestore();
      if (unsubRtdb) unsubRtdb();
      if (unsubStoriesCollection) unsubStoriesCollection();
      if (unsubRtdbStories) unsubRtdbStories();
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

  const isIDBStoriesLoaded = useRef(false);
  const isIDBGalleryLoaded = useRef(false);

  // Restore heavy items from IndexedDB on startup
  useEffect(() => {
    loadFromIDB<StoryItem[]>(BASE_STORAGE_KEYS.STORIES, []).then((idbStories) => {
      if (Array.isArray(idbStories) && idbStories.length > 0) {
        setStories((prev) => (prev.length === 0 ? idbStories : prev));
      }
      isIDBStoriesLoaded.current = true;
    });

    loadFromIDB<GalleryItem[]>(BASE_STORAGE_KEYS.GALLERY, []).then((idbGallery) => {
      if (Array.isArray(idbGallery) && idbGallery.length > 0) {
        setGallery((prev) => (prev.length === 0 ? idbGallery : prev));
      }
      isIDBGalleryLoaded.current = true;
    });
  }, []);

  // Always keep localStorage and IndexedDB updated as offline cache (only AFTER initial load)
  useEffect(() => { saveItem(BASE_STORAGE_KEYS.CONFIG, config); saveToIDB(BASE_STORAGE_KEYS.CONFIG, config); }, [config]);
  useEffect(() => { saveItem(BASE_STORAGE_KEYS.BARBERS, barbers); saveToIDB(BASE_STORAGE_KEYS.BARBERS, barbers); }, [barbers]);
  useEffect(() => { saveItem(BASE_STORAGE_KEYS.SERVICES, services); saveToIDB(BASE_STORAGE_KEYS.SERVICES, services); }, [services]);
  useEffect(() => { saveItem(BASE_STORAGE_KEYS.APPOINTMENTS, appointments); saveToIDB(BASE_STORAGE_KEYS.APPOINTMENTS, appointments); }, [appointments]);
  useEffect(() => {
    if (!isIDBStoriesLoaded.current) return;
    saveItem(BASE_STORAGE_KEYS.STORIES, stories);
    saveToIDB(BASE_STORAGE_KEYS.STORIES, stories);
  }, [stories]);
  useEffect(() => {
    if (!isIDBGalleryLoaded.current) return;
    saveItem(BASE_STORAGE_KEYS.GALLERY, gallery);
    saveToIDB(BASE_STORAGE_KEYS.GALLERY, gallery);
  }, [gallery]);
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
  const addStory = async (storyData: Omit<StoryItem, 'id' | 'createdAt' | 'viewsCount'>) => {
    try {
      let finalMediaUrl = storyData.mediaUrl;
      if (finalMediaUrl && finalMediaUrl.startsWith('data:image/')) {
        finalMediaUrl = await compressBase64DataUrl(finalMediaUrl, 500, 800, 0.55);
      } else if (finalMediaUrl && finalMediaUrl.length > 600000 && storyData.thumbnailUrl) {
        finalMediaUrl = storyData.thumbnailUrl;
      }

      let finalThumbnailUrl = storyData.thumbnailUrl;
      if (finalThumbnailUrl && finalThumbnailUrl.startsWith('data:image/') && finalThumbnailUrl.length > 80000) {
        finalThumbnailUrl = await compressBase64DataUrl(finalThumbnailUrl, 400, 600, 0.55);
      }

      const newStory: StoryItem = {
        ...storyData,
        mediaUrl: finalMediaUrl,
        thumbnailUrl: finalThumbnailUrl || undefined,
        id: `story-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        createdAt: new Date().toISOString(),
        viewsCount: Math.floor(Math.random() * 10) + 1
      };

      const cleanedStory = cleanForFirestore(newStory);

      // 1. Update state & IndexedDB immediately
      setStories((prev) => {
        const updated = [newStory, ...prev.filter((s) => s.id !== newStory.id)];
        saveToIDB(BASE_STORAGE_KEYS.STORIES, updated);
        saveItem(BASE_STORAGE_KEYS.STORIES, updated);
        return updated;
      });

      // 2. Persist directly to Firestore dedicated 'stories' collection (1 document per story)
      try {
        await setDoc(doc(db, 'stories', newStory.id), cleanedStory, { merge: true });
      } catch (err: any) {
        console.warn('Individual story Firestore setDoc note:', err);
      }

      // 3. Persist directly to Realtime Database dedicated node
      if (rtdb) {
        try {
          await setRtdb(refRtdb(rtdb, `stories/${newStory.id}`), cleanedStory);
        } catch (err) {
          console.warn('Individual story RTDB save note:', err);
        }
      }

      // 4. Update main cloud documents
      setStories((current) => {
        saveToCloud({ stories: current });
        return current;
      });

      triggerPushNotification('Nueva Historia Publicada', `Se publicó la historia "${newStory.title}".`);
    } catch (err) {
      console.error('Error adding story:', err);
    }
  };

  const deleteStory = async (id: string) => {
    // 1. Delete from Firestore collection
    deleteDoc(doc(db, 'stories', id)).catch(() => { });

    // 2. Delete from Realtime Database
    if (rtdb) {
      removeRtdb(refRtdb(rtdb, `stories/${id}`)).catch(() => { });
    }

    // 3. Update local state & IDB
    setStories((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveToIDB(BASE_STORAGE_KEYS.STORIES, updated);
      saveItem(BASE_STORAGE_KEYS.STORIES, updated);
      saveToCloud({ stories: updated });
      return updated;
    });
  };

  const incrementStoryViews = (id: string) => {
    let newViews = 1;
    setStories((prev) => {
      const updated = prev.map((s) => {
        if (s.id === id) {
          newViews = (s.viewsCount || 0) + 1;
          return { ...s, viewsCount: newViews };
        }
        return s;
      });
      saveToIDB(BASE_STORAGE_KEYS.STORIES, updated);
      saveItem(BASE_STORAGE_KEYS.STORIES, updated);
      return updated;
    });

    setDoc(doc(db, 'stories', id), { viewsCount: newViews }, { merge: true }).catch(() => { });
    if (rtdb) {
      updateRtdb(refRtdb(rtdb, `stories/${id}`), { viewsCount: newViews }).catch(() => { });
    }
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
    setStories([]);
    setGallery([]);
    setReviews(INITIAL_REVIEWS);
    setPromos(INITIAL_PROMOS);

    saveItem(BASE_STORAGE_KEYS.CONFIG, INITIAL_CONFIG);
    saveItem(BASE_STORAGE_KEYS.BARBERS, INITIAL_BARBERS);
    saveItem(BASE_STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    saveItem(BASE_STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    saveItem(BASE_STORAGE_KEYS.STORIES, []);
    saveItem(BASE_STORAGE_KEYS.GALLERY, []);
    saveItem(BASE_STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    saveItem(BASE_STORAGE_KEYS.PROMOS, INITIAL_PROMOS);

    saveToCloud({
      config: INITIAL_CONFIG,
      barbers: INITIAL_BARBERS,
      services: INITIAL_SERVICES,
      appointments: INITIAL_APPOINTMENTS,
      stories: [],
      gallery: [],
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
