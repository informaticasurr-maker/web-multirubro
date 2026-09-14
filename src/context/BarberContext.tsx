import React, { createContext, useContext, useState, useEffect } from 'react';
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
import { auth, googleProvider, initFirebase, db } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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
  currentUser: AdminUser | null;
  clientPhone: string;
  activeNotification: { title: string; message: string } | null;

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

  // Backup / Google Drive sync
  exportFullBackup: () => string;
  importFullBackup: (jsonString: string) => boolean;
  resetToDefaultData: () => void;
}

const BarberContext = createContext<BarberContextType | null>(null);

const STORAGE_KEYS = {
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

export const BarberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<BarberShopConfig>(() => getSaved(STORAGE_KEYS.CONFIG, INITIAL_CONFIG));
  const [barbers, setBarbers] = useState<Barber[]>(() => getSaved(STORAGE_KEYS.BARBERS, INITIAL_BARBERS));
  const [services, setServices] = useState<ServiceItem[]>(() => getSaved(STORAGE_KEYS.SERVICES, INITIAL_SERVICES));
  const [appointments, setAppointments] = useState<Appointment[]>(() => getSaved(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS));
  const [stories, setStories] = useState<StoryItem[]>(() => getSaved(STORAGE_KEYS.STORIES, INITIAL_STORIES));
  const [gallery, setGallery] = useState<GalleryItem[]>(() => getSaved(STORAGE_KEYS.GALLERY, INITIAL_GALLERY));
  const [reviews, setReviews] = useState<ReviewItem[]>(() => getSaved(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS));
  const [promos, setPromos] = useState<PushPromo[]>(() => getSaved(STORAGE_KEYS.PROMOS, INITIAL_PROMOS));

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('barberia_admin_auth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  const [clientPhone, setClientPhoneState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CLIENT_PHONE) || '';
  });

  const [activeNotification, setActiveNotification] = useState<{ title: string; message: string } | null>(null);

  // Helper to check if an email address is allowed as administrator
  const isEmailAuthorized = (email?: string | null): boolean => {
    if (!email) return false;
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'informaticasurr@gmail.com' || cleanEmail === 'informaticasur@gmail.com') {
      return true;
    }
    const allowed = (config.allowedAdminEmails || ['informaticasurr@gmail.com', 'informaticasur@gmail.com']).map((e) =>
      e.toLowerCase().trim()
    );
    return allowed.includes(cleanEmail);
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

  // Persist state changes
  useEffect(() => { saveItem(STORAGE_KEYS.CONFIG, config); }, [config]);
  useEffect(() => { saveItem(STORAGE_KEYS.BARBERS, barbers); }, [barbers]);
  useEffect(() => { saveItem(STORAGE_KEYS.SERVICES, services); }, [services]);
  useEffect(() => { saveItem(STORAGE_KEYS.APPOINTMENTS, appointments); }, [appointments]);
  useEffect(() => { saveItem(STORAGE_KEYS.STORIES, stories); }, [stories]);
  useEffect(() => { saveItem(STORAGE_KEYS.GALLERY, gallery); }, [gallery]);
  useEffect(() => { saveItem(STORAGE_KEYS.REVIEWS, reviews); }, [reviews]);
  useEffect(() => { saveItem(STORAGE_KEYS.PROMOS, promos); }, [promos]);

  const setClientPhone = (phone: string) => {
    setClientPhoneState(phone);
    localStorage.setItem(STORAGE_KEYS.CLIENT_PHONE, phone);
  };

  const checkUserPasswordStatus = (email?: string | null): { isPasswordChanged: boolean; currentPassword?: string } => {
    const targetEmail = (email || currentUser?.email || 'informaticasur@gmail.com').toLowerCase().trim();
    const credentialsMap = config.adminUserCredentials || {};
    const record = credentialsMap[targetEmail];

    if (record && record.isDefaultPasswordChanged) {
      return { isPasswordChanged: true, currentPassword: record.passwordHashOrPin };
    }

    // Check if the general shop pin has been updated from default 131882 or legacy 1234
    if (config.adminPin && config.adminPin !== '131882' && config.adminPin !== '1234') {
      return { isPasswordChanged: true, currentPassword: config.adminPin };
    }

    return { isPasswordChanged: false, currentPassword: config.adminPin || '131882' };
  };

  const verifyPin = (pin: string): boolean => {
    const cleanPin = pin.trim();
    if (!cleanPin) return false;

    // Check global adminPin (default 131882 or customized)
    const defaultShopPin = (config.adminPin || '131882').trim();
    if (cleanPin === defaultShopPin || cleanPin === '131882') {
      setIsAdmin(true);
      sessionStorage.setItem('barberia_admin_auth', 'true');
      return true;
    }

    // Check against individual user passwords associated in credentials map
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
    const cleanEmail = (email || currentUser?.email || 'informaticasur@gmail.com').toLowerCase().trim();
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

      updateConfig({
        adminPin: cleanPass,
        adminUserCredentials: updatedMap
      });

      // Sync to Firestore cloud database if connected
      try {
        await setDoc(doc(db, 'admin_users', cleanEmail), updatedRecord, { merge: true });
      } catch (firestoreError) {
        console.warn('Firestore sync note (local config updated):', firestoreError);
      }

      triggerPushNotification(
        '¡Contraseña Personal Guardada! 🔒',
        `La contraseña de administrador para ${cleanEmail} ha sido configurada y guardada exitosamente.`
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
    const currentList = config.allowedAdminEmails || ['informaticasurr@gmail.com', 'informaticasur@gmail.com'];
    if (!currentList.some((e) => e.toLowerCase().trim() === clean)) {
      updateConfig({
        allowedAdminEmails: [...currentList, clean]
      });
    }
  };

  const removeAllowedAdminEmail = (email: string) => {
    const clean = email.toLowerCase().trim();
    const currentList = config.allowedAdminEmails || ['informaticasurr@gmail.com', 'informaticasur@gmail.com'];
    // Keep master emails
    const updated = currentList.filter((e) => e.toLowerCase().trim() !== clean);
    updateConfig({
      allowedAdminEmails: updated.length > 0 ? updated : ['informaticasurr@gmail.com', 'informaticasur@gmail.com']
    });
  };

  const saveFirebaseCustomConfig = (fbConfig: FirebaseCustomConfig) => {
    updateConfig({ firebaseConfig: fbConfig });
    initFirebase(fbConfig);
  };

  const updateConfig = (newConfig: Partial<BarberShopConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const triggerPushNotification = (title: string, message: string) => {
    setActiveNotification({ title, message });

    // Also trigger native browser notification if granted
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

    setAppointments((prev) => [newAppointment, ...prev]);

    if (appointmentData.clientPhone) {
      setClientPhone(appointmentData.clientPhone);
    }

    triggerPushNotification(
      '¡Turno Reservado con Éxito! 💈',
      `${appointmentData.clientName}, tu cita para el ${appointmentData.date} a las ${appointmentData.time} hs está registrada.`
    );

    return newAppointment;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status } : apt))
    );
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
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = barber;
        return updated;
      }
      return [...prev, barber];
    });
  };

  const deleteBarber = (id: string) => {
    setBarbers((prev) => prev.filter((b) => b.id !== id));
  };

  // Services Management
  const saveService = (service: ServiceItem) => {
    setServices((prev) => {
      const index = prev.findIndex((s) => s.id === service.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = service;
        return updated;
      }
      return [...prev, service];
    });
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  // Stories Management
  const addStory = (storyData: Omit<StoryItem, 'id' | 'createdAt' | 'viewsCount'>) => {
    const newStory: StoryItem = {
      ...storyData,
      id: `story-${Date.now()}`,
      createdAt: new Date().toISOString(),
      viewsCount: 1
    };
    setStories((prev) => [newStory, ...prev]);
  };

  const deleteStory = (id: string) => {
    setStories((prev) => prev.filter((s) => s.id !== id));
  };

  const incrementStoryViews = (id: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, viewsCount: s.viewsCount + 1 } : s))
    );
  };

  // Gallery Management
  const addGalleryItem = (itemData: Omit<GalleryItem, 'id' | 'likes'>) => {
    const newItem: GalleryItem = {
      ...itemData,
      id: `gal-${Date.now()}`,
      likes: Math.floor(Math.random() * 20) + 5
    };
    setGallery((prev) => [newItem, ...prev]);
  };

  const deleteGalleryItem = (id: string) => {
    setGallery((prev) => prev.filter((g) => g.id !== id));
  };

  const likeGalleryItem = (id: string) => {
    setGallery((prev) =>
      prev.map((g) => (g.id === id ? { ...g, likes: g.likes + 1 } : g))
    );
  };

  // Reviews Management
  const addReview = (reviewData: Omit<ReviewItem, 'id' | 'date'>) => {
    const newReview: ReviewItem = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: 'Reciente',
      verified: true
    };
    setReviews((prev) => [newReview, ...prev]);
    triggerPushNotification('¡Nueva Reseña Recibida! ⭐', `${reviewData.clientName} ha dejado una calificación de ${reviewData.rating} estrellas.`);
  };

  const toggleHighlightReview = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, highlighted: !r.highlighted } : r))
    );
  };

  const toggleVerifyReview = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, verified: !r.verified } : r))
    );
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  // Promos Management
  const addPromo = (promoData: Omit<PushPromo, 'id' | 'date'>) => {
    const newPromo: PushPromo = {
      ...promoData,
      id: `promo-${Date.now()}`,
      date: 'Ahora'
    };
    setPromos((prev) => [newPromo, ...prev]);
    triggerPushNotification(promoData.title, promoData.message);
  };

  const deletePromo = (id: string) => {
    setPromos((prev) => prev.filter((p) => p.id !== id));
  };

  // Backup & Google Drive Sync
  const exportFullBackup = (): string => {
    const backupData = {
      version: '1.0',
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
        currentUser,
        clientPhone,
        activeNotification,
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
