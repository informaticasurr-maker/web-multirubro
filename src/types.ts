export interface Barber {
  id: string;
  name: string;
  nickname: string;
  role: string;
  avatar: string;
  phone: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  // Working schedule
  workDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string;  // e.g. "09:00"
  endTime: string;    // e.g. "20:00"
  breakStart?: string;// e.g. "14:00"
  breakEnd?: string;  // e.g. "15:00"
  slotDurationMinutes: number; // e.g. 30 or 45
  active: boolean;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  category: 'corte' | 'barba' | 'combo' | 'color' | 'facial';
  popular?: boolean;
  image?: string;
}

export type AppointmentStatus = 'pendiente' | 'confirmada' | 'completada' | 'cancelada';

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  barberId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  totalPrice: number;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  source: 'web' | 'whatsapp' | 'admin';
  hasReview?: boolean;
}

export type StoryScope = 'dia' | 'semana' | 'mes';

export interface StoryItem {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  thumbnailUrl?: string;
  title: string;
  caption: string;
  barberName: string;
  barberAvatar: string;
  createdAt: string;
  expiresAt: string;
  viewsCount: number;
  scope?: StoryScope;
  tag?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  category: string;
  barberId: string;
  likes: number;
  featured?: boolean;
}

export interface ReviewItem {
  id: string;
  clientName: string;
  clientPhoneLastDigits?: string;
  rating: number;
  comment: string;
  date: string;
  barberName: string;
  serviceName: string;
  verified: boolean;
  highlighted?: boolean;
  appointmentId?: string;
}

export type HeadlineSize = 'compacto' | 'normal' | 'grande' | 'monumental';
export type HeadlineColorTheme =
  | 'amber-gold'
  | 'white-silver'
  | 'emerald-neon'
  | 'cyan-electric'
  | 'ruby-red'
  | 'purple-violet'
  | 'custom';

export type SubheadlineSize = 'compacto' | 'normal' | 'destacado';
export type SubheadlineColorTheme =
  | 'slate-300'
  | 'white'
  | 'amber-200'
  | 'emerald-200'
  | 'sky-200'
  | 'custom';

export interface BarberShopConfig {
  shopName: string;
  slogan: string;
  adminName: string;
  adminPhone: string;
  whatsappNumber: string; // International format without + e.g. 5215512345678
  address: string;
  city: string;
  neighborhood: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  googleMapsUrl: string;
  wazeUrl: string;
  googleBusinessUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  email: string;
  openingHoursText: string;
  logoUrl?: string;
  coverImageUrl?: string;
  currencySymbol: string;
  adminPin: string; // Default admin code
  seoKeywords: string[];

  // Hero Headline / Título principal
  headlinePrefix?: string;
  headlineHighlight?: string;
  headlineColorTheme?: HeadlineColorTheme;
  headlineCustomColor?: string;
  headlineSize?: HeadlineSize;

  // Hero Subheadline / Bajada o Subtítulo
  subheadlineText?: string;
  subheadlineColorTheme?: SubheadlineColorTheme;
  subheadlineCustomColor?: string;
  subheadlineSize?: SubheadlineSize;

  // Firebase Auth & Admin Access Security
  allowedAdminEmails: string[];
  firebaseConfig?: FirebaseCustomConfig;
  adminUserCredentials?: Record<string, UserSecurityRecord>;
}

export interface UserSecurityRecord {
  email: string;
  passwordHashOrPin: string;
  isDefaultPasswordChanged: boolean;
  updatedAt: string;
}

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isPasswordChanged?: boolean;
}

export interface FirebaseCustomConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export interface PushPromo {
  id: string;
  title: string;
  message: string;
  date: string;
  active: boolean;
  linkText?: string;
}

export type MusicGenre =
  | 'todos'
  | 'reggaeton'
  | 'hiphop'
  | 'latin'
  | 'afrobeat'
  | 'neosoul';

export type MusicOccasion =
  | 'general'
  | 'fade_urbano'
  | 'corte_clasico'
  | 'barba_relax'
  | 'ambiente_salon';

export interface InstrumentalTrack {
  id: string;
  title: string;
  artist: string;
  genre: MusicGenre;
  genreLabel: string;
  occasion: MusicOccasion;
  occasionLabel: string;
  bpm: number;
  durationSeconds: number;
  vibeDescription: string;
  proceduralStyle: 'reggaeton' | 'hiphop' | 'latin' | 'afrobeat' | 'neosoul';
  audioUrl?: string;
  coverImage?: string;
}

export interface ShopMetadata {
  slug: string;
  name: string;
  ownerEmail?: string;
  allowedAdminEmails?: string[];
  logoUrl?: string;
  phone?: string;
  createdAt?: string;
  lastUpdated?: string;
}

export interface CreateShopPayload {
  name: string;
  slug: string;
  phone?: string;
  ownerEmail?: string;
  slogan?: string;
  address?: string;
}

