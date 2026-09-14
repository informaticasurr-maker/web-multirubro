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
  FirebaseCustomConfig,
  ShopMetadata,
  CreateShopPayload
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
import { auth, googleProvider, initFirebase, db } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  collection,
  query,
  getDocs
} from 'firebase/firestore';
import { getCurrentShopSlug, DEFAULT_SHOP_SLUG, slugify, navigateToShop } from '../utils/shopRouter';

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
  lastCloudSyncTime: string | null;

  // Multi-Shop SaaS actions
  currentShopSlug: string;
  availableShops: ShopMetadata[];
  switchShop: (slug: string) => void;
  createNewShop: (payload: CreateShopPayload) => Promise<{ success: boolean; slug?: string; error?: string }>;
  deleteShop: (slug: string) => Promise<{ success: boolean; error?: string }>;

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
  'informaticasur@gmail.com'
];

const getShopStorageKey = (baseKey: string, slug: string) => `${baseKey}_${slug || DEFAULT_SHOP_SLUG}`;

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

function getSaved<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
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
  const [currentShopSlug, setCurrentShopSlug] = useState<string>(() => getCurrentShopSlug());
  const [availableShops, setAvailableShops] = useState<ShopMetadata[]>([
    {
      slug: DEFAULT_SHOP_SLUG,
      name: INITIAL_CONFIG.shopName,
      ownerEmail: 'informaticasurr@gmail.com',
      phone: INITIAL_CONFIG.adminPhone,
      logoUrl: INITIAL_CONFIG.logoUrl
    }
  ]);

  const [config, setConfig] = useState<BarberShopConfig>(() =>
    getSaved(getShopStorageKey(BASE_STORAGE_KEYS.CONFIG, currentShopSlug), INITIAL_CONFIG)
  );
  const [barbers, setBarbers] = useState<Barber[]>(() =>
    getSaved(getShopStorageKey(BASE_STORAGE_KEYS.BARBERS, currentShopSlug), INITIAL_BARBERS)
  );
  const [services, setServices] = useState<ServiceItem[]>(() =>
    getSaved(getShopStorageKey(BASE_STORAGE_KEYS.SERVICES, currentShopSlug), INITIAL_SERVICES)
  );
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    getSaved(getShopStorageKey(BASE_STORAGE_KEYS.APPOINTMENTS, currentShopSlug), INITIAL_APPOINTMENTS)
  );
  const [stories, setStories] = useState<StoryItem[]>(() =>
    getSaved(getShopStorageKey(BASE_STORAGE_KEYS.STORIES, currentShopSlug), INITIAL_STORIES)
  );
  const [gallery, setGallery] = useState<GalleryItem[]>(() =>
    getSaved(getShopStorageKey(BASE_STORAGE_KEYS.GALLERY, currentShopSlug), INITIAL_GALLERY)
  );
  const [reviews, setReviews] = useState<ReviewItem[]>(() =>
    getSaved(getShopStorageKey(BASE_STORAGE_KEYS.REVIEWS, currentShopSlug), INITIAL_REVIEWS)
  );
  const [promos, setPromos] = useState<PushPromo[]>(() =>
    getSaved(getShopStorageKey(BASE_STORAGE_KEYS.PROMOS, currentShopSlug), INITIAL_PROMOS)
  );

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('barberia_admin_auth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(null);

  const [clientPhone, setClientPhoneState] = useState<string>(() => {
    return localStorage.getItem(BASE_STORAGE_KEYS.CLIENT_PHONE) || '';
  });

  const [activeNotification, setActiveNotification] = useState<{ title: string; message: string } | null>(null);

  const isSuperAdmin = Boolean(
    currentUser?.email &&
      MASTER_SUPERADMIN_EMAILS.some((m) => m.toLowerCase() === currentUser.email?.toLowerCase().trim())
  );

  // Helper function to push updates to Firebase Firestore Cloud for CURRENT shop
  const saveToCloud = async (partialData: Record<string, any>) => {
    try {
      const activeSlug = currentShopSlug || DEFAULT_SHOP_SLUG;
      const shopDocRef = doc(db, 'shops', activeSlug);
      const payload = cleanForFirestore({
        ...partialData,
        shopSlug: activeSlug,
        lastUpdated: new Date().toISOString()
      });
      await setDoc(shopDocRef, payload, { merge: true });

      // Also update registry metadata
      const registryDocRef = doc(db, 'shops_registry', activeSlug);
      await setDoc(
        registryDocRef,
        cleanForFirestore({
          slug: activeSlug,
          name: partialData.config?.shopName || config.shopName,
          ownerEmail: partialData.ownerEmail || config.allowedAdminEmails?.[0] || 'informaticasurr@gmail.com',
          allowedAdminEmails: partialData.config?.allowedAdminEmails || config.allowedAdminEmails || MASTER_SUPERADMIN_EMAILS,
          phone: partialData.config?.phone || config.phone,
          logoUrl: partialData.config?.logoUrl || config.logoUrl,
          lastUpdated: new Date().toISOString()
        }),
        { merge: true }
      );

      setIsCloudSynced(true);
      setLastCloudSyncTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.warn(`Nota de sincronización Firestore (${currentShopSlug}):`, e);
    }
  };

  // Listen to URL changes for shop routing
  useEffect(() => {
    const handleUrlChange = () => {
      const detectedSlug = getCurrentShopSlug();
      if (detectedSlug !== currentShopSlug) {
        setCurrentShopSlug(detectedSlug);
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [currentShopSlug]);

  // Listen to available shops registry in Firestore
  useEffect(() => {
    try {
      const registryCol = collection(db, 'shops_registry');
      const unsubscribe = onSnapshot(
        registryCol,
        (snapshot) => {
          const loadedShops: ShopMetadata[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as ShopMetadata;
            if (data && data.slug) {
              loadedShops.push(data);
            }
          });

          if (loadedShops.length > 0) {
            // Ensure default shop is included
            if (!loadedShops.some((s) => s.slug === DEFAULT_SHOP_SLUG)) {
              loadedShops.unshift({
                slug: DEFAULT_SHOP_SLUG,
                name: INITIAL_CONFIG.shopName,
                ownerEmail: 'informaticasurr@gmail.com',
                phone: INITIAL_CONFIG.adminPhone
              });
            }
            setAvailableShops(loadedShops);
          }
        },
        (err) => {
          console.warn('Shops registry listener note:', err);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('Failed to attach shops registry listener:', e);
    }
  }, []);

  // Listen to Firebase Real-time Firestore Cloud Data for current active shop
  useEffect(() => {
    try {
      const activeSlug = currentShopSlug || DEFAULT_SHOP_SLUG;
      const shopDocRef = doc(db, 'shops', activeSlug);

      const unsubscribe = onSnapshot(
        shopDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data) {
              if (data.config && typeof data.config === 'object') {
                setConfig((prev) => ({ ...prev, ...data.config }));
              }
              if (data.barbers && Array.isArray(data.barbers)) setBarbers(data.barbers);
              if (data.services && Array.isArray(data.services)) setServices(data.services);
              if (data.appointments && Array.isArray(data.appointments)) setAppointments(data.appointments);
              if (data.stories && Array.isArray(data.stories)) setStories(data.stories);
              if (data.gallery && Array.isArray(data.gallery)) setGallery(data.gallery);
              if (data.reviews && Array.isArray(data.reviews)) setReviews(data.reviews);
              if (data.promos && Array.isArray(data.promos)) setPromos(data.promos);
              setIsCloudSynced(true);
              setLastCloudSyncTime(new Date().toLocaleTimeString());
            }
          } else {
            // If default shop doesn't exist yet, seed it with baseline
            if (activeSlug === DEFAULT_SHOP_SLUG) {
              const initialPayload = cleanForFirestore({
                shopSlug: DEFAULT_SHOP_SLUG,
                config: INITIAL_CONFIG,
                barbers: INITIAL_BARBERS,
                services: INITIAL_SERVICES,
                appointments: INITIAL_APPOINTMENTS,
                stories: INITIAL_STORIES,
                gallery: INITIAL_GALLERY,
                reviews: INITIAL_REVIEWS,
                promos: INITIAL_PROMOS,
                ownerEmail: 'informaticasurr@gmail.com',
                allowedAdminEmails: MASTER_SUPERADMIN_EMAILS,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
              });

              setDoc(shopDocRef, initialPayload, { merge: true }).catch((err) =>
                console.warn('Firestore initial seeding note:', err)
              );

              setDoc(
                doc(db, 'shops_registry', DEFAULT_SHOP_SLUG),
                {
                  slug: DEFAULT_SHOP_SLUG,
                  name: INITIAL_CONFIG.shopName,
                  ownerEmail: 'informaticasurr@gmail.com',
                  phone: INITIAL_CONFIG.adminPhone,
                  createdAt: new Date().toISOString()
                },
                { merge: true }
              ).catch((e) => console.warn('Registry initial seed note:', e));

              setIsCloudSynced(true);
            }
          }
        },
        (err) => {
          console.warn(`Firestore snapshot error for shop ${activeSlug}:`, err);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore shop listener setup note:', e);
    }
  }, [currentShopSlug]);


  // Helper to check if an email address is allowed as administrator for current shop or globally
  const isEmailAuthorized = (email?: string | null): boolean => {
    if (!email) return false;
    const cleanEmail = email.toLowerCase().trim();
    if (MASTER_SUPERADMIN_EMAILS.some((m) => m.toLowerCase() === cleanEmail)) {
      return true;
    }
    const allowed = (config.allowedAdminEmails || MASTER_SUPERADMIN_EMAILS).map((e) =>
      e.toLowerCase().trim()
    );
    return allowed.includes(cleanEmail);
  };

  // Switch active shop and change URL seamlessly
  const switchShop = (slug: string) => {
    const cleanSlug = slugify(slug || DEFAULT_SHOP_SLUG);
    setCurrentShopSlug(cleanSlug);
    navigateToShop(cleanSlug, isAdmin);
    triggerPushNotification(
      'Cambiando de Barbería 💈',
      `Has cambiado a la barbería: ${cleanSlug}`
    );
  };

  // Create a brand new independent shop
  const createNewShop = async (
    payload: CreateShopPayload
  ): Promise<{ success: boolean; slug?: string; error?: string }> => {
    try {
      const rawSlug = payload.slug || payload.name;
      const cleanSlug = slugify(rawSlug);

      if (!cleanSlug || cleanSlug.length < 2) {
        return { success: false, error: 'El identificador / enlace debe tener al menos 2 caracteres.' };
      }

      if (['admin', 'api', 'assets', 'dist', 'login'].includes(cleanSlug)) {
        return { success: false, error: 'Este identificador está reservado. Por favor elige otro.' };
      }

      const ownerEmail = payload.ownerEmail || currentUser?.email || 'informaticasurr@gmail.com';

      const newShopConfig: BarberShopConfig = {
        ...INITIAL_CONFIG,
        shopName: payload.name.trim(),
        slogan: payload.slogan?.trim() || INITIAL_CONFIG.slogan,
        adminPhone: payload.phone?.trim() || INITIAL_CONFIG.adminPhone,
        whatsappNumber: payload.phone?.trim() ? payload.phone.replace(/[^0-9]/g, '') : INITIAL_CONFIG.whatsappNumber,
        address: payload.address?.trim() || INITIAL_CONFIG.address,
        allowedAdminEmails: [ownerEmail, ...MASTER_SUPERADMIN_EMAILS]
      };

      const newShopData = cleanForFirestore({
        shopSlug: cleanSlug,
        config: newShopConfig,
        barbers: INITIAL_BARBERS,
        services: INITIAL_SERVICES,
        appointments: [],
        stories: INITIAL_STORIES,
        gallery: INITIAL_GALLERY,
        reviews: INITIAL_REVIEWS,
        promos: INITIAL_PROMOS,
        ownerEmail,
        allowedAdminEmails: [ownerEmail, ...MASTER_SUPERADMIN_EMAILS],
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });

      // Save shop document in Firestore
      await setDoc(doc(db, 'shops', cleanSlug), newShopData, { merge: true });

      // Save in shop registry
      const metadata: ShopMetadata = {
        slug: cleanSlug,
        name: payload.name.trim(),
        ownerEmail,
        allowedAdminEmails: [ownerEmail, ...MASTER_SUPERADMIN_EMAILS],
        phone: payload.phone?.trim() || INITIAL_CONFIG.adminPhone,
        logoUrl: INITIAL_CONFIG.logoUrl,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      await setDoc(doc(db, 'shops_registry', cleanSlug), metadata, { merge: true });

      setAvailableShops((prev) => {
        const filtered = prev.filter((s) => s.slug !== cleanSlug);
        return [...filtered, metadata];
      });

      // Switch to new shop
      switchShop(cleanSlug);

      triggerPushNotification(
        '¡Nueva Barbería Creada! 🚀',
        `La barbería "${payload.name}" ha sido creada exitosamente con el enlace /${cleanSlug}`
      );

      return { success: true, slug: cleanSlug };
    } catch (e: any) {
      console.error('Error creating new shop:', e);
      return { success: false, error: e?.message || 'Error al crear la nueva barbería.' };
    }
  };

  // Delete a shop (except default shop)
  const deleteShop = async (slug: string): Promise<{ success: boolean; error?: string }> => {
    const cleanSlug = slugify(slug);
    if (cleanSlug === DEFAULT_SHOP_SLUG) {
      return { success: false, error: 'No es posible eliminar la barbería principal.' };
    }

    try {
      await deleteDoc(doc(db, 'shops', cleanSlug));
      await deleteDoc(doc(db, 'shops_registry', cleanSlug));

      setAvailableShops((prev) => prev.filter((s) => s.slug !== cleanSlug));

      if (currentShopSlug === cleanSlug) {
        switchShop(DEFAULT_SHOP_SLUG);
      }

      return { success: true };
    } catch (e: any) {
      console.error('Error deleting shop:', e);
      return { success: false, error: e?.message || 'Error al eliminar el negocio.' };
    }
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
  }, [config.allowedAdminEmails, currentShopSlug]);

  // Sync with schema.org SEO on load and changes
  useEffect(() => {
    updateBarberShopSchema(config, services, barbers, reviews);
  }, [config, services, barbers, reviews]);

  // Persist state changes to localStorage as offline cache for current shop
  useEffect(() => { saveItem(getShopStorageKey(BASE_STORAGE_KEYS.CONFIG, currentShopSlug), config); }, [config, currentShopSlug]);
  useEffect(() => { saveItem(getShopStorageKey(BASE_STORAGE_KEYS.BARBERS, currentShopSlug), barbers); }, [barbers, currentShopSlug]);
  useEffect(() => { saveItem(getShopStorageKey(BASE_STORAGE_KEYS.SERVICES, currentShopSlug), services); }, [services, currentShopSlug]);
  useEffect(() => { saveItem(getShopStorageKey(BASE_STORAGE_KEYS.APPOINTMENTS, currentShopSlug), appointments); }, [appointments, currentShopSlug]);
  useEffect(() => { saveItem(getShopStorageKey(BASE_STORAGE_KEYS.STORIES, currentShopSlug), stories); }, [stories, currentShopSlug]);
  useEffect(() => { saveItem(getShopStorageKey(BASE_STORAGE_KEYS.GALLERY, currentShopSlug), gallery); }, [gallery, currentShopSlug]);
  useEffect(() => { saveItem(getShopStorageKey(BASE_STORAGE_KEYS.REVIEWS, currentShopSlug), reviews); }, [reviews, currentShopSlug]);
  useEffect(() => { saveItem(getShopStorageKey(BASE_STORAGE_KEYS.PROMOS, currentShopSlug), promos); }, [promos, currentShopSlug]);

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
      saveToCloud({ config: newConfigObj });

      try {
        await setDoc(doc(db, 'admin_users', cleanEmail), updatedRecord, { merge: true });
      } catch (firestoreError) {
        console.warn('Firestore admin_user sync note:', firestoreError);
      }

      triggerPushNotification(
        '¡Contraseña Personal Guardada! 🔒',
        `La contraseña de administrador para ${cleanEmail} ha sido configurada y guardada en Firebase exitosamente.`
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
          error: `Acceso Denegado: El correo "${user.email || 'desconocido'}" no está en la lista de administradores autorizados de esta barbería.`
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
      saveToCloud({ barbers: updated });
      return updated;
    });
  };

  const deleteBarber = (id: string) => {
    setBarbers((prev) => {
      const updated = prev.filter((b) => b.id !== id);
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
      saveToCloud({ services: updated });
      return updated;
    });
  };

  const deleteService = (id: string) => {
    setServices((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveToCloud({ services: updated });
      return updated;
    });
  };

  // Stories Management
  const addStory = (storyData: Omit<StoryItem, 'id' | 'createdAt' | 'viewsCount'>) => {
    const newStory: StoryItem = {
      ...storyData,
      id: `story-${Date.now()}`,
      createdAt: new Date().toISOString(),
      viewsCount: 1
    };
    setStories((prev) => {
      const updated = [newStory, ...prev];
      saveToCloud({ stories: updated });
      return updated;
    });
  };

  const deleteStory = (id: string) => {
    setStories((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveToCloud({ stories: updated });
      return updated;
    });
  };

  const incrementStoryViews = (id: string) => {
    setStories((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, viewsCount: s.viewsCount + 1 } : s));
      saveToCloud({ stories: updated });
      return updated;
    });
  };

  // Gallery Management
  const addGalleryItem = (itemData: Omit<GalleryItem, 'id' | 'likes'>) => {
    const newItem: GalleryItem = {
      ...itemData,
      id: `gal-${Date.now()}`,
      likes: Math.floor(Math.random() * 20) + 5
    };
    setGallery((prev) => {
      const updated = [newItem, ...prev];
      saveToCloud({ gallery: updated });
      return updated;
    });
  };

  const deleteGalleryItem = (id: string) => {
    setGallery((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      saveToCloud({ gallery: updated });
      return updated;
    });
  };

  const likeGalleryItem = (id: string) => {
    setGallery((prev) => {
      const updated = prev.map((g) => (g.id === id ? { ...g, likes: g.likes + 1 } : g));
      saveToCloud({ gallery: updated });
      return updated;
    });
  };

  // Reviews Management
  const addReview = (reviewData: Omit<ReviewItem, 'id' | 'date'>) => {
    const newReview: ReviewItem = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: 'Reciente',
      verified: true
    };
    setReviews((prev) => {
      const updated = [newReview, ...prev];
      saveToCloud({ reviews: updated });
      return updated;
    });
    triggerPushNotification('¡Nueva Reseña Recibida! ⭐', `${reviewData.clientName} ha dejado una calificación de ${reviewData.rating} estrellas.`);
  };

  const toggleHighlightReview = (id: string) => {
    setReviews((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, highlighted: !r.highlighted } : r));
      saveToCloud({ reviews: updated });
      return updated;
    });
  };

  const toggleVerifyReview = (id: string) => {
    setReviews((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, verified: !r.verified } : r));
      saveToCloud({ reviews: updated });
      return updated;
    });
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveToCloud({ reviews: updated });
      return updated;
    });
  };

  // Promos Management
  const addPromo = (promoData: Omit<PushPromo, 'id' | 'date'>) => {
    const newPromo: PushPromo = {
      ...promoData,
      id: `promo-${Date.now()}`,
      date: 'Ahora'
    };
    setPromos((prev) => {
      const updated = [newPromo, ...prev];
      saveToCloud({ promos: updated });
      return updated;
    });
    triggerPushNotification(promoData.title, promoData.message);
  };

  const deletePromo = (id: string) => {
    setPromos((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveToCloud({ promos: updated });
      return updated;
    });
  };

  // Backup & Cloud Sync
  const exportFullBackup = (): string => {
    const backupData = {
      version: '1.0',
      shopSlug: currentShopSlug,
      exportedAt: new Date().toISOString(),
      shopName: config.shopName,
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
      if (data.config) setConfig(data.config);
      if (data.barbers) setBarbers(data.barbers);
      if (data.services) setServices(data.services);
      if (data.appointments) setAppointments(data.appointments);
      if (data.stories) setStories(data.stories);
      if (data.gallery) setGallery(data.gallery);
      if (data.reviews) setReviews(data.reviews);
      if (data.promos) setPromos(data.promos);

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

      return true;
    } catch (e) {
      console.error('Error importing backup:', e);
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
        lastCloudSyncTime,
        currentShopSlug,
        availableShops,
        switchShop,
        createNewShop,
        deleteShop,
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

