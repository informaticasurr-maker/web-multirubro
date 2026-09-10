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
  AppointmentStatus
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
  clientPhone: string;
  activeNotification: { title: string; message: string } | null;

  // Actions
  setClientPhone: (phone: string) => void;
  loginAdmin: (pin: string) => boolean;
  verifyPin: (pin: string) => boolean;
  logoutAdmin: () => void;
  updateConfig: (newConfig: Partial<BarberShopConfig>) => void;

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

  const [clientPhone, setClientPhoneState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CLIENT_PHONE) || '';
  });

  const [activeNotification, setActiveNotification] = useState<{ title: string; message: string } | null>(null);

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

  const loginAdmin = (pin: string): boolean => {
    if (pin.trim() === config.adminPin.trim()) {
      setIsAdmin(true);
      sessionStorage.setItem('barberia_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('barberia_admin_auth');
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
        clientPhone,
        activeNotification,
        setClientPhone,
        loginAdmin,
        verifyPin: loginAdmin,
        logoutAdmin,
        updateConfig,
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
