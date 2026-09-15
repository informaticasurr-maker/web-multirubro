import { Barber, ServiceItem, Appointment, StoryItem, GalleryItem, ReviewItem, BarberShopConfig, PushPromo } from '../types';

export const INITIAL_CONFIG: BarberShopConfig = {
  shopName: "ELIAS-barbershop",
  slogan: "Cortes de alta precisión, afeitados clásicos y estilo que impone presencia.",
  adminName: "Carlos 'Don' Mendoza",
  adminPhone: "+54 9 11 4567-8901",
  whatsappNumber: "5491145678901", // WhatsApp ready format
  address: "Evita 1131",
  city: "Buenos Aires",
  neighborhood: "El Jagüel",
  coordinates: {
    lat: -34.8322,
    lng: -58.4988
  },
  googleMapsUrl: "https://maps.google.com/?q=Evita+1131,+El+Jagüel,+Buenos+Aires",
  wazeUrl: "https://waze.com/ul?q=Evita+1131,+El+Jagüel,+Buenos+Aires&navigate=yes",
  googleBusinessUrl: "https://business.google.com",
  instagramUrl: "https://instagram.com/thegentlemansblade",
  tiktokUrl: "https://tiktok.com/@gentlemansblade",
  facebookUrl: "https://facebook.com/thegentlemansblade",
  email: "contacto@gentlemansblade.com",
  openingHoursText: "Lunes a Sábado: 09:00 a 21:00 hs | Domingos: 11:00 a 18:00 hs",
  logoUrl: "/barber-logo.png",
  coverImageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1600&auto=format&fit=crop&q=80",
  currencySymbol: "$",
  adminPin: "131882",
  seoKeywords: [
    "barberia cerca de mi",
    "corte degradado hombre",
    "barber shop buenos aires",
    "arreglo de barba toalla caliente",
    "turnos barberia en el acto",
    "corte fade moderno",
    "mejor barbero centro"
  ],
  headlinePrefix: "Tu Corte Perfecto,",
  headlineHighlight: "En Tiempo Real",
  headlineColorTheme: "amber-gold",
  headlineCustomColor: "#f59e0b",
  headlineSize: "normal",

  subheadlineText: "Cortes de alta precisión, afeitados clásicos y estilo que impone presencia. Selecciona a tu barbero de confianza, consulta los turnos disponibles calculados al instante y recibe tu confirmación directa en WhatsApp.",
  subheadlineColorTheme: "slate-300",
  subheadlineCustomColor: "#cbd5e1",
  allowedAdminEmails: ["informaticasurr@gmail.com", "informaticasur@gmail.com", "eliascjnegocios@gmail.com"]
};

export const INITIAL_BARBERS: Barber[] = [
  {
    id: "barber-1",
    name: "Mateo 'El Maestro' Rossi",
    nickname: "Mateo Rossi",
    role: "Master Barber & Educador",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    phone: "+54 9 11 5551-1122",
    rating: 4.9,
    reviewCount: 148,
    specialties: ["Skin Fade", "Texturizado", "Diseños Custom", "Tijera Clásica"],
    workDays: [1, 2, 3, 4, 5, 6], // Mon - Sat
    startTime: "09:00",
    endTime: "19:00",
    breakStart: "13:30",
    breakEnd: "14:30",
    slotDurationMinutes: 45,
    active: true
  },
  {
    id: "barber-2",
    name: "Lucas 'Barba Negra' Silva",
    nickname: "Lucas Silva",
    role: "Especialista en Barba & Ritual Spa",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    phone: "+54 9 11 5552-3344",
    rating: 5.0,
    reviewCount: 182,
    specialties: ["Perfilado de Barba", "Toalla Caliente", "Navaja Japonesa", "Low Fade"],
    workDays: [2, 3, 4, 5, 6, 0], // Tue - Sun
    startTime: "11:00",
    endTime: "21:00",
    breakStart: "15:00",
    breakEnd: "16:00",
    slotDurationMinutes: 40,
    active: true
  },
  {
    id: "barber-3",
    name: "Joaquín 'Freestyle' Méndez",
    nickname: "Joaco Méndez",
    role: "Artista Urbano & Colorista",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    phone: "+54 9 11 5553-5566",
    rating: 4.8,
    reviewCount: 96,
    specialties: ["Taper Fade", "Platinados & Mechas", "Líneas & Hair Tattoo", "Mullet Moderno"],
    workDays: [1, 3, 4, 5, 6], // Mon, Wed, Thu, Fri, Sat
    startTime: "10:00",
    endTime: "20:00",
    breakStart: "14:00",
    breakEnd: "15:00",
    slotDurationMinutes: 45,
    active: true
  },
  {
    id: "barber-4",
    name: "Diego 'Old School' Valenzuela",
    nickname: "Diego Valenzuela",
    role: "Cortes Ejecutivos & Afeitado Tradicional",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    phone: "+54 9 11 5554-7788",
    rating: 4.9,
    reviewCount: 114,
    specialties: ["Pompadour", "Side Part Clásico", "Masaje Capilar", "Corte Tijera"],
    workDays: [1, 2, 4, 5, 6], // Mon, Tue, Thu, Fri, Sat
    startTime: "09:30",
    endTime: "18:30",
    breakStart: "13:00",
    breakEnd: "14:00",
    slotDurationMinutes: 40,
    active: true
  }
];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: "srv-1",
    name: "Corte de Autor + Peinado",
    description: "Lavado previo, diagnóstico capilar, degradado a tijera o navaja, textura y fijación con pomada mate premium.",
    price: 9500,
    durationMinutes: 45,
    category: "corte",
    popular: true,
    image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "srv-2",
    name: "Ritual Completo de Barba & Toalla Caliente",
    description: "Perfilado a navaja, exfoliación, vapor ozono con toalla aromatizada de eucalipto, aceites orgánicos y bálsamo hidratante.",
    price: 7500,
    durationMinutes: 40,
    category: "barba",
    popular: true,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "srv-3",
    name: "Combo VIP: Corte + Ritual de Barba",
    description: "Experiencia completa para el caballero exigente. Corte personalizado, perfilado milimétrico de barba y bebida de cortesía.",
    price: 15500,
    durationMinutes: 75,
    category: "combo",
    popular: true,
    image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "srv-4",
    name: "Fade Skin / Buzz Cut Ultra Limpio",
    description: "Degradado a piel pulido a shaver, desvanecido milimétrico en sienes y nuca con líneas de contorno ultra definidas.",
    price: 8500,
    durationMinutes: 40,
    category: "corte",
    image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "srv-5",
    name: "Platinado Polar / Grey Hair & Color",
    description: "Decoloración profesional controlada con protección Olaplex, matizador silver o ceniza y peinado con cera modeladora.",
    price: 24000,
    durationMinutes: 120,
    category: "color",
    image: "https://images.unsplash.com/photo-1520338661084-680395057c93?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "srv-6",
    name: "Limpieza Facial Express & Black Mask",
    description: "Purificación profunda de poros, extracción de puntos negros con mascarilla de carbón activado e hidratación facial anti-fatiga.",
    price: 6000,
    durationMinutes: 30,
    category: "facial",
    image: "https://images.unsplash.com/photo-1512290900672-1f48039f60f6?w=500&auto=format&fit=crop&q=80"
  }
];

export const INITIAL_STORIES: StoryItem[] = [
  {
    id: "story-1",
    mediaUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&auto=format&fit=crop&q=80",
    mediaType: "image",
    title: "Mid Taper Fade 🔥",
    caption: "Corte texturizado arriba con degradado medio impecable. Obra de Mateo.",
    barberName: "Mateo Rossi",
    barberAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 22 * 3600 * 1000).toISOString(),
    viewsCount: 184,
    scope: "dia",
    tag: "Corte del Día"
  },
  {
    id: "story-semana-1",
    mediaUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80",
    mediaType: "image",
    title: "Promo 2x1 Esta Semana 🏷️",
    caption: "¡Noticia de la semana! De martes a jueves 2x1 en cortes clásicos reservando online.",
    barberName: "Noticias Staff",
    barberAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
    viewsCount: 420,
    scope: "semana",
    tag: "Semana"
  },
  {
    id: "story-mes-1",
    mediaUrl: "https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=800&auto=format&fit=crop&q=80",
    mediaType: "image",
    title: "Sorteo VIP del Mes 🏆",
    caption: "¡Gran anuncio del mes! Todos los turnos de este mes participan automáticamente por un kit profesional de cuidado personal.",
    barberName: "Anuncio del Mes",
    barberAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 25 * 24 * 3600 * 1000).toISOString(),
    viewsCount: 890,
    scope: "mes",
    tag: "Mes"
  },
  {
    id: "story-2",
    mediaUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80",
    mediaType: "image",
    title: "Ritual Barba Vikinga 🪓",
    caption: "Toalla caliente con aceites esenciales de cedro y perfilado con navaja japonesa.",
    barberName: "Lucas Silva",
    barberAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 19 * 3600 * 1000).toISOString(),
    viewsCount: 242,
    scope: "dia",
    tag: "Corte del Día"
  },
  {
    id: "story-3",
    mediaUrl: "https://images.unsplash.com/photo-1520338661084-680395057c93?w=800&auto=format&fit=crop&q=80",
    mediaType: "image",
    title: "Platinado White Ice ⚡",
    caption: "Decoloración limpia nivel 10 sin dañar la hebra. Trabajo de Joaco.",
    barberName: "Joaco Méndez",
    barberAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    createdAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 17 * 3600 * 1000).toISOString(),
    viewsCount: 310,
    scope: "dia",
    tag: "Corte del Día"
  },
  {
    id: "story-4",
    mediaUrl: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&auto=format&fit=crop&q=80",
    mediaType: "image",
    title: "Skin Fade Pompadour 💈",
    caption: "El clásico que nunca pasa de moda. Perfección geométrica por Diego.",
    barberName: "Diego Valenzuela",
    barberAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
    createdAt: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 15 * 3600 * 1000).toISOString(),
    viewsCount: 156,
    scope: "semana",
    tag: "Semana"
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Burst Fade Moderno",
    description: "Desvanecido curvo alrededor de la oreja con texturizado cropped superior.",
    mediaUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&auto=format&fit=crop&q=80",
    mediaType: "image",
    category: "Degradados (Fade)",
    barberId: "barber-1",
    likes: 87,
    featured: true
  },
  {
    id: "gal-2",
    title: "Barba Larga Esculpida & Aceite Nutritivo",
    description: "Líneas afiladas en pómulos, degradado en patillas y peinado con secador.",
    mediaUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80",
    mediaType: "image",
    category: "Barbas y Ritual",
    barberId: "barber-2",
    likes: 124,
    featured: true
  },
  {
    id: "gal-3",
    title: "Mullet Contemporáneo con Textura",
    description: "Estilo audaz con caídos en la nuca y flequillo desmechado matte.",
    mediaUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
    mediaType: "image",
    category: "Estilo Urbano",
    barberId: "barber-3",
    likes: 95,
    featured: true
  },
  {
    id: "gal-4",
    title: "Executive Side Part con Navaja",
    description: "Raya marcada milimétricamente con navaja clásica y fijación brillo medio.",
    mediaUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80",
    mediaType: "image",
    category: "Cortes Clásicos",
    barberId: "barber-4",
    likes: 64,
    featured: false
  },
  {
    id: "gal-5",
    title: "Low Fade Drop con Rizos Definidos",
    description: "Degradado sutil bajo que resalta el volumen natural de los rizos esponjados.",
    mediaUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
    mediaType: "image",
    category: "Degradados (Fade)",
    barberId: "barber-1",
    likes: 78,
    featured: true
  },
  {
    id: "gal-6",
    title: "Tijera 100% Sin Máquina",
    description: "Corte puramente manual que respeta el flujo y dirección natural del cabello.",
    mediaUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80",
    mediaType: "image",
    category: "Cortes Clásicos",
    barberId: "barber-4",
    likes: 52,
    featured: false
  }
];

export const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    clientName: "Gonzalo Fernández",
    clientPhoneLastDigits: "8412",
    rating: 5,
    comment: "Increíble atención de Mateo. Es la primera vez que un barbero entiende exactamente lo que quiero sin tener que explicarle mil veces. El desvanecido quedó limpio como ningún otro.",
    date: "Ayer",
    barberName: "Mateo Rossi",
    serviceName: "Corte de Autor + Peinado",
    verified: true,
    highlighted: true
  },
  {
    id: "rev-2",
    clientName: "Martín Benítez",
    clientPhoneLastDigits: "3319",
    rating: 5,
    comment: "El ritual de barba con toalla caliente de Lucas es adictivo. Sales renovado, el ambiente con buena música y la puntualidad en el turno reservado por la web fue perfecta.",
    date: "Hace 3 días",
    barberName: "Lucas Silva",
    serviceName: "Ritual Completo de Barba",
    verified: true,
    highlighted: true
  },
  {
    id: "rev-3",
    clientName: "Nicolás Giménez",
    clientPhoneLastDigits: "9042",
    rating: 5,
    comment: "Fui con Joaco para hacerme un platinado y fade. Me cuidó el pelo un 100%, quedó blanco polar sin picazón ni nada roto. Recomiendo reservar con anticipación porque vuelan los turnos.",
    date: "Hace 5 días",
    barberName: "Joaco Méndez",
    serviceName: "Platinado Polar / Grey Hair",
    verified: true,
    highlighted: true
  },
  {
    id: "rev-4",
    clientName: "Alejandro Paoli",
    clientPhoneLastDigits: "1157",
    rating: 5,
    comment: "Excelente experiencia con Diego. Corte ejecutivo perfecto para una boda que tenía el fin de semana. El café de cortesía y la puntualidad son destacables.",
    date: "Hace 1 semana",
    barberName: "Diego Valenzuela",
    serviceName: "Combo VIP: Corte + Barba",
    verified: true,
    highlighted: false
  }
];

// Today and tomorrow dates for sample appointments
const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-101",
    clientName: "Esteban Morales",
    clientPhone: "+54 9 11 4455-8899",
    barberId: "barber-1",
    serviceId: "srv-1",
    date: today,
    time: "10:30",
    durationMinutes: 45,
    totalPrice: 9500,
    status: "confirmada",
    notes: "Degradado medio en V, no tocar mucho el flequillo.",
    createdAt: new Date().toISOString(),
    source: "web"
  },
  {
    id: "apt-102",
    clientName: "Federico Rossi",
    clientPhone: "+54 9 11 9988-7766",
    barberId: "barber-2",
    serviceId: "srv-3",
    date: today,
    time: "16:00",
    durationMinutes: 75,
    totalPrice: 15500,
    status: "confirmada",
    notes: "Cliente recurrente, barba larga perfilada.",
    createdAt: new Date().toISOString(),
    source: "whatsapp"
  },
  {
    id: "apt-103",
    clientName: "Agustín Cabrera",
    clientPhone: "+54 9 11 3322-1100",
    barberId: "barber-3",
    serviceId: "srv-4",
    date: tomorrow,
    time: "11:00",
    durationMinutes: 40,
    totalPrice: 8500,
    status: "pendiente",
    notes: "Skin fade a shaver con cero arriba.",
    createdAt: new Date().toISOString(),
    source: "web"
  },
  {
    id: "apt-100",
    clientName: "Rodrigo Paz",
    clientPhone: "+54 9 11 7766-5544",
    barberId: "barber-1",
    serviceId: "srv-1",
    date: today,
    time: "09:00",
    durationMinutes: 45,
    totalPrice: 9500,
    status: "completada",
    notes: "Cobrado en efectivo.",
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    source: "web"
  }
];

export const INITIAL_PROMOS: PushPromo[] = [
  {
    id: "promo-1",
    title: "⚡ Promo Martes de Caballeros",
    message: "20% de descuento en Combo VIP de Corte + Ritual de Barba los días martes reservando online.",
    date: "Válido este mes",
    active: true,
    linkText: "Aprovechar Turno"
  },
  {
    id: "promo-2",
    title: "💈 Nuevo Barbero en el Equipo",
    message: "Conoce a Joaquín Méndez, especialista en estilos urbanos y colorimetría.",
    date: "Novedad",
    active: true
  }
];
